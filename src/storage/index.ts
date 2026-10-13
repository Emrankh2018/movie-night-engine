import { z } from 'zod';
import { DEFAULT_INPUT, inputSchema } from '../catalog/schema';
import type { Input } from '../catalog/schema';

export const STORAGE_KEY = 'movie-night-engine:local';
const ids = z.array(z.string().regex(/^fixture-[a-z0-9-]+$/)).max(500);
const legacySchema = z.object({
  schemaVersion: z.literal(1), preferences: inputSchema,
  watchedIds: ids, selectedIds: ids, rejectedIds: ids,
});
const guestDateSchema = z.object({ movieId: z.string(), chosenAt: z.iso.datetime().nullable(), watchedOn: z.iso.date().nullable() });
export const stateSchema = legacySchema.extend({
  schemaVersion: z.literal(2), guestDeviceId: z.uuid(), guestDates: z.array(guestDateSchema).max(500),
});
export type LocalState = z.infer<typeof stateSchema>;
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export type StorageStatus = 'ok' | 'recovered' | 'unavailable' | 'future';

export function freshState(): LocalState {
  return { schemaVersion: 2, guestDeviceId: crypto.randomUUID(), guestDates: [], preferences: { ...DEFAULT_INPUT, preferredGenres: [], providerIds: [], excludedMovieIds: [], excludedContentFlags: [] }, watchedIds: [], selectedIds: [], rejectedIds: [] };
}

// Future releases add explicit supported migrations here; unknown versions are never overwritten.
export function decodeState(raw: string | null): { state: LocalState; status: StorageStatus } {
  if (raw === null) return { state: freshState(), status: 'ok' };
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value === 'object' && value !== null && 'schemaVersion' in value
      && typeof value.schemaVersion === 'number' && value.schemaVersion > 2) return { state: freshState(), status: 'future' };
    const legacy = legacySchema.safeParse(value);
    if (legacy.success) return { state: { ...freshState(),...legacy.data,schemaVersion: 2 },status: 'ok' };
    const parsed = stateSchema.safeParse(value);
    return parsed.success ? { state: parsed.data, status: 'ok' } : { state: freshState(), status: 'recovered' };
  } catch { return { state: freshState(), status: 'recovered' }; }
}

export function readState(storage?: StoragePort): { state: LocalState; status: StorageStatus } {
  try { return decodeState((storage ?? window.localStorage).getItem(STORAGE_KEY)); }
  catch { return { state: freshState(), status: 'unavailable' }; }
}
export function saveState(state: LocalState, storage?: StoragePort): boolean {
  try { (storage ?? window.localStorage).setItem(STORAGE_KEY, JSON.stringify(stateSchema.parse(state))); return true; }
  catch { return false; }
}
export function withPreferences(state: LocalState, preferences: Input): LocalState { return { ...state, preferences }; }
export function addId(ids: readonly string[], id: string): string[] { return [...new Set([...ids,id])].slice(-500); }
export function clearHistory(state: LocalState): LocalState { return { ...state, watchedIds: [], selectedIds: [], rejectedIds: [],guestDates: [] }; }
export function chooseGuest(state: LocalState, id: string, at = new Date().toISOString()): LocalState {
  const existing = state.guestDates.find(entry => entry.movieId === id);
  const date = { movieId: id,chosenAt: state.selectedIds.includes(id) ? existing?.chosenAt ?? null : at,watchedOn: existing?.watchedOn ?? null };
  return { ...state,selectedIds: addId(state.selectedIds,id),guestDates: [...state.guestDates.filter(entry => entry.movieId !== id),date].slice(-500) };
}
export function seenGuest(state: LocalState, id: string, on: string): LocalState {
  const existing = state.guestDates.find(entry => entry.movieId === id);
  const date = { movieId: id,chosenAt: existing?.chosenAt ?? null,watchedOn: state.watchedIds.includes(id) ? existing?.watchedOn ?? null : on };
  return { ...state,watchedIds: addId(state.watchedIds,id),guestDates: [...state.guestDates.filter(entry => entry.movieId !== id),date].slice(-500) };
}
