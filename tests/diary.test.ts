import { describe, expect, it } from 'vitest';
import { AccountController } from '../src/diary/controller';
import type { AuthGateway, DiaryGateway, Identity, Night } from '../src/diary/types';
import { freshState, decodeState, chooseGuest, seenGuest } from '../src/storage';
import { guestImport, snapshot } from '../src/diary/guest';
import { catalog } from '../src/catalog';
import { publicConfig, PROJECT_URL } from '../src/diary/supabase';

const A = 'f2c60c1b-6849-46e2-a8d2-bd389ca13b11'; const B = 'f2c60c1b-6849-46e2-a8d2-bd389ca13b22';
const tick = () => new Promise<void>(resolve => setTimeout(resolve,0));
function night(owner = A): Night { return { ...snapshot(catalog.movies[0],catalog.version),id: crypto.randomUUID(),user_id: owner,status: 'chosen',chosen_at: '2026-10-13T12:00:00Z',watched_on: null,source: 'app',client_event_id: 'test',created_at: '2026-10-13T12:00:00Z' }; }
function harness(options: { restore?: Identity | null; configured?: boolean; cancellation?: boolean } = {}) {
  let listener: (identity: Identity | null) => void = () => {};
  let rows: Night[] = options.restore ? [night(options.restore.id)] : [];
  let chooseCalls = 0;
  const auth: AuthGateway = {
    configured: options.configured ?? true,callbackCancelled: options.cancellation ?? false,
    restore: async () => options.restore ?? null,subscribe: callback => { listener = callback; return () => {}; },
    googleEnabled: async () => false,signIn: async () => {},signOut: async () => {},
  };
  const diary: DiaryGateway = {
    list: async owner => rows.filter(row => row.user_id === owner),
    choose: async () => { chooseCalls += 1; rows = [night()]; },seen: async () => {},watched: async () => {},
    undo: async () => {},delete: async () => {},clear: async () => { rows = []; },import: async entries => ({ inserted: entries.length,skipped: 0 }),
  };
  const controller = new AccountController(auth,diary);
  return { controller,auth,diary,emit: (id: string | null) => listener(id ? { id,email: null } : null),calls: () => chooseCalls };
}

describe('private account coordinator', () => {
  it('restores a signed-in owner and their diary', async () => {
    const { controller } = harness({ restore: { id: A,email: null } }); await controller.initialize(); await tick();
    expect(controller.getSnapshot().identity?.id).toBe(A); expect(controller.getSnapshot().entries).toHaveLength(1); expect(controller.getSnapshot().historyReady).toBe(true);
  });
  it('guest and unconfigured accounts do not fetch a diary', async () => {
    const { controller,diary } = harness({ configured: false }); diary.list = async () => { throw new Error('Must not request'); };
    await controller.initialize(); expect(controller.getSnapshot().phase).toBe('disabled'); expect(controller.getSnapshot().entries).toEqual([]);
  });
  it('real sign-in stays disabled until provider readiness is known', async () => {
    const { controller,auth } = harness(); let signIns = 0; auth.signIn = async () => { signIns++; };
    await controller.initialize(); await controller.signIn(); expect(signIns).toBe(0);
    await controller.checkGoogle(); expect(controller.getSnapshot().google).toBe('disabled');
    auth.googleEnabled = async () => true; await controller.checkGoogle(); await controller.signIn(); expect(signIns).toBe(1);
  });
  it('cancellation preserves guest mode', async () => {
    const { controller } = harness({ cancellation: true }); await controller.initialize();
    expect(controller.getSnapshot().phase).toBe('guest'); expect(controller.getSnapshot().error).toBe('cancelled');
  });
  it('a rejected cancellation is still identified as cancellation', async () => {
    const { controller,auth } = harness({ cancellation: true }); auth.restore = async () => { throw new Error('OAuth denied'); };
    await controller.initialize(); expect(controller.getSnapshot().error).toBe('cancelled');
  });
  it('sign-out clears caches before remote revocation completes', async () => {
    const { controller,auth } = harness({ restore: { id: A,email: null } }); await controller.initialize(); await tick();
    let resolve!: () => void; auth.signOut = () => new Promise<void>(done => { resolve = done; });
    const pending = controller.signOut(); expect(controller.getSnapshot().entries).toEqual([]); expect(controller.getSnapshot().identity).toBeNull();
    resolve(); await pending; expect(controller.getSnapshot().phase).toBe('guest');
  });
  it('failed sign-out never restores private cached rows', async () => {
    const { controller,auth,emit } = harness({ restore: { id: A,email: null } }); await controller.initialize(); await tick();
    auth.signOut = async () => { throw new Error('offline'); }; await controller.signOut(); emit(A);
    expect(controller.getSnapshot().entries).toEqual([]); expect(controller.getSnapshot().identity).toBeNull(); expect(controller.getSnapshot().error).toBe('signOutOffline');
  });
  it('switching owners immediately discards all previous rows', async () => {
    const { controller,emit } = harness({ restore: { id: A,email: null } }); await controller.initialize(); await tick();
    emit(B); expect(controller.getSnapshot().entries).toEqual([]); expect(controller.getSnapshot().identity?.id).toBe(B);
    await tick(); expect(controller.getSnapshot().entries).toEqual([]);
  });
  it('late history responses cannot repopulate a signed-out cache', async () => {
    const { controller,diary,emit } = harness(); await controller.initialize();
    let resolve!: (rows: Night[]) => void; diary.list = () => new Promise(done => { resolve = done; });
    emit(A); await controller.signOut(); resolve([night(A)]); await tick();
    expect(controller.getSnapshot().entries).toEqual([]); expect(controller.getSnapshot().identity).toBeNull();
  });
  it('late A response cannot appear under B', async () => {
    const { controller,diary,emit } = harness(); await controller.initialize();
    let resolve!: (rows: Night[]) => void; diary.list = owner => owner === A ? new Promise(done => { resolve = done; }) : Promise.resolve([night(B)]);
    emit(A); emit(B); await tick(); resolve([night(A)]); await tick();
    expect(controller.getSnapshot().entries.every(row => row.user_id === B)).toBe(true);
  });
  it('a response containing another owner fails closed', async () => {
    const { controller,diary,emit } = harness(); await controller.initialize(); diary.list = async () => [night(B)]; emit(A); await tick();
    expect(controller.getSnapshot().entries).toEqual([]); expect(controller.getSnapshot().error).toBe('historyFailed');
  });
  it('history load failure never becomes a successful empty diary', async () => {
    const { controller,diary,emit } = harness(); await controller.initialize(); diary.list = async () => { throw new Error('offline'); }; emit(A); await tick();
    expect(controller.getSnapshot().historyReady).toBe(false); expect(controller.getSnapshot().error).toBe('historyFailed');
  });
  it('concurrent choose actions share one write', async () => {
    const { controller,calls } = harness({ restore: { id: A,email: null } }); await controller.initialize(); await tick();
    await Promise.all([controller.choose(snapshot(catalog.movies[0],catalog.version)),controller.choose(snapshot(catalog.movies[0],catalog.version))]);
    expect(calls()).toBe(1); expect(controller.getSnapshot().entries[0].status).toBe('chosen');
  });
});

describe('guest upgrade and explicit import', () => {
  it('v1 histories migrate without inventing any dates', () => {
    const legacy = { schemaVersion: 1,preferences: freshState().preferences,watchedIds: [catalog.movies[0].id],selectedIds: [catalog.movies[0].id,catalog.movies[1].id],rejectedIds: [catalog.movies[2].id] };
    const decoded = decodeState(JSON.stringify(legacy)); expect(decoded.status).toBe('ok'); expect(decoded.state.schemaVersion).toBe(2);
    const entries = guestImport(decoded.state,catalog.movies,catalog.version); expect(entries).toHaveLength(2);
    expect(entries.every(entry => entry.chosen_at === null && entry.watched_on === null)).toBe(true);
    expect(entries[0].status).toBe('watched'); expect(entries[1].status).toBe('chosen');
  });
  it('guest choose stores a date and does not imply watched', () => {
    const chosen = chooseGuest(freshState(),catalog.movies[0].id,'2026-10-13T12:00:00Z');
    const entries = guestImport(chosen,catalog.movies,catalog.version); expect(entries[0].chosen_at).toBe('2026-10-13T12:00:00Z'); expect(entries[0].status).toBe('chosen'); expect(entries[0].watched_on).toBeNull();
  });
  it('viewing date is separate and repeated actions preserve the original dates', () => {
    let state = chooseGuest(freshState(),catalog.movies[0].id,'2026-10-13T12:00:00Z'); state = chooseGuest(state,catalog.movies[0].id,'2026-10-14T12:00:00Z');
    state = seenGuest(state,catalog.movies[0].id,'2026-10-15'); state = seenGuest(state,catalog.movies[0].id,'2026-10-16');
    const entry = guestImport(state,catalog.movies,catalog.version)[0]; expect(entry.chosen_at).toBe('2026-10-13T12:00:00Z'); expect(entry.watched_on).toBe('2026-10-15');
  });
  it('legacy unknown dates survive later repeated guest actions', () => {
    const state = freshState(); state.selectedIds = state.watchedIds = [catalog.movies[0].id];
    const next = seenGuest(chooseGuest(state,catalog.movies[0].id),catalog.movies[0].id,'2026-10-13');
    expect(guestImport(next,catalog.movies,catalog.version)[0]).toMatchObject({ chosen_at: null,watched_on: null });
  });
  it('unknown titles have no invented snapshot metadata', () => {
    const state = freshState(); state.selectedIds = ['fixture-retired']; const entry = guestImport(state,catalog.movies,catalog.version)[0];
    expect(entry).toMatchObject({ title_en: null,title_ar: null,runtime_minutes: null,chosen_at: null });
  });
  it('repeated import has stable idempotency keys', () => {
    const state = chooseGuest(freshState(),catalog.movies[0].id); expect(guestImport(state,catalog.movies,catalog.version)).toEqual(guestImport(state,catalog.movies,catalog.version));
  });
  it('public browser configuration rejects privileged keys and unrelated projects', () => {
    expect(publicConfig(PROJECT_URL,'sb_publishable_test')).not.toBeNull();
    for (const key of ['sb_secret_test','eyJlegacy-service-role','']) expect(publicConfig(PROJECT_URL,key)).toBeNull();
    expect(publicConfig('https://other.supabase.co','sb_publishable_test')).toBeNull();
  });
});
