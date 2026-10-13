import type { AuthGateway, DiaryError, DiaryGateway, GuestImport, Identity, ImportResult, MovieSnapshot, Night } from './types';

export type AccountState = {
  phase: 'disabled' | 'restoring' | 'guest' | 'authenticated' | 'signing-out';
  identity: Identity | null; entries: readonly Night[]; historyReady: boolean; loading: boolean;
  busy: boolean; google: 'unchecked' | 'checking' | 'ready' | 'disabled' | 'unavailable'; error: DiaryError | null;
};

// No account diary cache in localStorage. Epochs discard all results from a previous owner.
export class AccountController {
  private state: AccountState;
  private listeners = new Set<() => void>();
  private epoch = 0;
  private request = new AbortController();
  private restorePromise: Promise<void> | null = null;
  private stopAuth: (() => void) | null = null;
  private loadNumber = 0;
  private acceptAuthEvents = true;
  private choices = new Map<string,Promise<boolean>>();
  constructor(private auth: AuthGateway, private diary: DiaryGateway) {
    this.state = { phase: auth.configured ? 'restoring' : 'disabled',identity: null,entries: [],historyReady: false,loading: false,busy: false,google: 'unchecked',error: null };
  }
  getSnapshot = (): AccountState => this.state;
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(patch: Partial<AccountState>) { this.state = { ...this.state,...patch }; this.listeners.forEach(listener => listener()); }
  initialize(): Promise<void> {
    if (this.restorePromise) return this.restorePromise;
    if (!this.auth.configured) return Promise.resolve();
    this.stopAuth = this.auth.subscribe(identity => { if (this.acceptAuthEvents) this.changeIdentity(identity); });
    const epoch = this.epoch;
    this.restorePromise = this.auth.restore().then(identity => {
      if (this.epoch === epoch) this.changeIdentity(identity);
      if (this.auth.callbackCancelled) this.publish({ error: 'cancelled' });
    }).catch(() => { if (this.epoch === epoch) { this.changeIdentity(null); this.publish({ error: this.auth.callbackCancelled ? 'cancelled' : 'authFailed' }); } });
    return this.restorePromise;
  }
  private changeIdentity(identity: Identity | null) {
    if (identity?.id && this.state.identity?.id === identity.id) return;
    this.epoch += 1; this.request.abort(); this.request = new AbortController(); this.choices.clear();
    this.publish({ identity,entries: [],historyReady: false,loading: !!identity,busy: false,error: null,phase: identity ? 'authenticated' : 'guest' });
    if (identity) void this.reload();
  }
  async reload(): Promise<void> {
    const identity = this.state.identity;
    if (!identity) return;
    const epoch = this.epoch; const load = ++this.loadNumber;
    this.publish({ loading: true,error: null });
    try {
      const entries = await this.diary.list(identity.id,this.request.signal);
      if (epoch === this.epoch && load === this.loadNumber) {
        if (entries.some(entry => entry.user_id !== identity.id)) throw new Error('Owner mismatch');
        this.publish({ entries,historyReady: true,loading: false });
      }
    } catch {
      if (epoch === this.epoch && load === this.loadNumber) this.publish({ entries: [],historyReady: false,loading: false,error: 'historyFailed' });
    }
  }
  async checkGoogle(): Promise<void> {
    if (!this.auth.configured) { this.publish({ google: 'disabled' }); return; }
    this.publish({ google: 'checking' });
    try { this.publish({ google: await this.auth.googleEnabled() ? 'ready' : 'disabled' }); }
    catch { this.publish({ google: 'unavailable' }); }
  }
  async signIn(): Promise<void> {
    if (this.state.google !== 'ready') return;
    this.acceptAuthEvents = true; this.publish({ busy: true,error: null });
    try { await this.auth.signIn(); }
    catch { this.publish({ busy: false,error: 'authFailed' }); }
  }
  async signOut(): Promise<void> {
    this.acceptAuthEvents = false; this.changeIdentity(null); this.publish({ phase: 'signing-out' });
    try { await this.auth.signOut(); this.publish({ phase: 'guest',error: null }); }
    catch { this.publish({ phase: 'guest',error: 'signOutOffline' }); }
  }
  private async mutate<T>(operation: (owner: string,signal: AbortSignal) => Promise<T>): Promise<{ ok: true; value: T } | { ok: false }> {
    const identity = this.state.identity;
    if (!identity || !this.state.historyReady || this.state.busy) return { ok: false };
    const epoch = this.epoch;
    this.publish({ busy: true,error: null });
    try {
      const value = await operation(identity.id,this.request.signal);
      if (epoch !== this.epoch) return { ok: false };
      await this.reload();
      return this.state.historyReady ? { ok: true,value } : { ok: false };
    } catch (error) {
      if (epoch === this.epoch) this.publish({ error: typeof error === 'object' && error !== null && 'code' in error && error.code === '23505' ? 'duplicateNight' : 'writeFailed' });
      return { ok: false };
    } finally { if (epoch === this.epoch) this.publish({ busy: false }); }
  }
  choose(movie: MovieSnapshot): Promise<boolean> {
    const key = `${this.state.identity?.id}:${movie.movie_id}`;
    const pending = this.choices.get(key);
    if (pending) return pending;
    const work = this.mutate((_,signal) => this.diary.choose(movie,crypto.randomUUID(),signal)).then(result => result.ok).finally(() => this.choices.delete(key));
    this.choices.set(key,work); return work;
  }
  async seen(movie: MovieSnapshot,on: string): Promise<boolean> { return (await this.mutate((_,signal) => this.diary.seen(movie,crypto.randomUUID(),on,signal))).ok; }
  async watched(id: string,on: string): Promise<boolean> { return (await this.mutate((owner,signal) => this.diary.watched(owner,id,on,signal))).ok; }
  async undo(id: string): Promise<boolean> { return (await this.mutate((owner,signal) => this.diary.undo(owner,id,signal))).ok; }
  async delete(id: string): Promise<boolean> { return (await this.mutate((owner,signal) => this.diary.delete(owner,id,signal))).ok; }
  async clear(): Promise<boolean> { return (await this.mutate((owner,signal) => this.diary.clear(owner,signal))).ok; }
  async import(entries: GuestImport[]): Promise<ImportResult | null> { const result = await this.mutate((_,signal) => this.diary.import(entries,signal)); return result.ok ? result.value : null; }
  dispose() { this.stopAuth?.(); this.request.abort(); this.listeners.clear(); }
}
