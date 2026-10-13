import type { Input, Movie } from '../catalog/schema';
import type { FitComponents, RankedMovie } from './types';

function hash(value: string): number {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return result >>> 0;
}

export function fit(movie: Movie, input: Input): { score: number; fitComponents: FitComponents } {
  const components: FitComponents = {
    mood: movie.moodScores[input.mood],
    genre: input.preferredGenres.length ? input.preferredGenres.filter(genre => movie.genres.includes(genre)).length / input.preferredGenres.length : null,
    context: movie.contextScores[input.watchingMode],
    adventure: 1 - Math.abs(movie.adventureScore - input.adventurousness),
    confidence: movie.editorialConfidence,
  };
  const weighted = components.mood * .35 + (components.genre ?? 0) * .2 + components.context * .2
    + components.adventure * .15 + components.confidence * .1;
  return { score: weighted / (components.genre === null ? .8 : 1), fitComponents: components };
}

export function rank(movies: readonly Movie[], input: Input, seed: string): RankedMovie[] {
  return movies.map(movie => ({ movie, ...fit(movie, input), tie: hash(`${seed}:${movie.id}`) }))
    .sort((a,b) => b.score - a.score || a.tie - b.tie || a.movie.id.localeCompare(b.movie.id));
}
