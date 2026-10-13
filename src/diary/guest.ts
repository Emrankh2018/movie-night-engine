import type { Movie } from '../catalog/schema';
import type { LocalState } from '../storage';
import type { GuestImport, MovieSnapshot } from './types';

export function snapshot(movie: Movie, version: string): MovieSnapshot {
  return { movie_id: movie.id, title_en: movie.titles.en, title_ar: movie.titles.ar,
    runtime_minutes: movie.runtimeMinutes, catalog_version: version, is_synthetic: movie.dataKind === 'synthetic' };
}
export function guestImport(state: LocalState, movies: readonly Movie[], version: string): GuestImport[] {
  return [...new Set([...state.selectedIds,...state.watchedIds])].map(id => {
    const movie = movies.find(movie => movie.id === id);
    const dates = state.guestDates.find(entry => entry.movieId === id);
    const watched = state.watchedIds.includes(id);
    return { ...(movie ? snapshot(movie,version) : { movie_id: id,title_en: null,title_ar: null,runtime_minutes: null,catalog_version: 'unknown',is_synthetic: id.startsWith('fixture-') }),
      status: watched ? 'watched' : 'chosen', chosen_at: dates?.chosenAt ?? null,
      watched_on: watched ? dates?.watchedOn ?? null : null, client_event_id: `guest:${state.guestDeviceId}:${id}` };
  });
}
export function today(): string {
  const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
