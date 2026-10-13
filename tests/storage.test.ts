import { describe, expect, it } from 'vitest';
import { addId, clearHistory, decodeState, freshState, readState, saveState, STORAGE_KEY } from '../src/storage';
import type { StoragePort } from '../src/storage';

describe('versioned local storage', () => {
  it('round-trips preferences and distinct histories', () => {
    const values = new Map<string,string>();
    const port: StoragePort = { getItem: key => values.get(key) ?? null, setItem: (key,value) => { values.set(key,value); } };
    const state = { ...freshState(), watchedIds: ['fixture-rooftop-radio'], selectedIds: ['fixture-last-tram'], rejectedIds: ['fixture-little-detour'] };
    state.preferences.locale = 'ar';
    expect(saveState(state,port)).toBe(true);
    expect(values.has(STORAGE_KEY)).toBe(true);
    expect(readState(port)).toEqual({ state,status: 'ok' });
  });
  it('clear history preserves all preferences and schema version', () => {
    const state = freshState(); state.preferences.locale = 'ar'; state.preferences.maxRuntimeMinutes = 90;
    state.watchedIds = state.selectedIds = state.rejectedIds = ['fixture-rooftop-radio'];
    expect(clearHistory(state)).toEqual({ ...state,watchedIds: [],selectedIds: [],rejectedIds: [],guestDates: [] });
  });
  it.each(['{broken', '{}', 'null', '{"schemaVersion":0}', '{"schemaVersion":1,"watchedIds":["bad"]}'])('corruption recovers safely: %s', raw => {
    expect(decodeState(raw)).toEqual({ state: { ...freshState(),guestDeviceId: expect.any(String) },status: 'recovered' });
  });
  it('missing state starts with documented defaults', () => { expect(decodeState(null)).toEqual({ state: { ...freshState(),guestDeviceId: expect.any(String) },status: 'ok' }); });
  it('blocked storage keeps the app usable', () => {
    const port: StoragePort = { getItem: () => { throw new Error('blocked'); },setItem: () => { throw new Error('blocked'); } };
    expect(readState(port).status).toBe('unavailable'); expect(saveState(freshState(),port)).toBe(false);
  });
  it('future storage is recognized instead of downgraded', () => { expect(decodeState('{"schemaVersion":3}').status).toBe('future'); });
  it('selection does not imply watched history', () => { const state = freshState(); state.selectedIds = addId(state.selectedIds,'fixture-rooftop-radio'); expect(state.watchedIds).toEqual([]); });
  it('history IDs are deduplicated and bounded', () => {
    expect(addId(['fixture-rooftop-radio'],'fixture-rooftop-radio')).toEqual(['fixture-rooftop-radio']);
    expect(addId(Array.from({ length: 500 },(_,i) => `fixture-${i}`),'fixture-new')).toHaveLength(500);
  });
});
