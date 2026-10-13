import type { Movie } from '../catalog/schema';
import type { RankedMovie } from './types';

export function diversityPenalty(movie: Movie, chosen: readonly Movie[]): number {
  return chosen.reduce((penalty, other) => penalty
    + (movie.genres[0] === other.genres[0] ? .08 : 0)
    + (movie.franchiseId && movie.franchiseId === other.franchiseId ? .15 : 0), 0);
}

export function diversify(ranked: readonly RankedMovie[], count = 3, anchors: readonly Movie[] = []): RankedMovie[] {
  const picked: RankedMovie[] = [];
  const used = new Set(anchors.map(movie => movie.id));
  while (picked.length < count) {
    const chosen = [...anchors, ...picked.map(item => item.movie)];
    const pool = ranked.filter(item => !used.has(item.movie.id)).sort((a,b) =>
      (b.score - diversityPenalty(b.movie, chosen)) - (a.score - diversityPenalty(a.movie, chosen))
      || a.tie - b.tie || a.movie.id.localeCompare(b.movie.id));
    if (!pool.length) break;
    picked.push(pool[0]);
    used.add(pool[0].movie.id);
  }
  return picked;
}
