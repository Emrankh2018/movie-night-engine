import { inputSchema } from '../catalog/schema';
import type { Availability, Input, Movie } from '../catalog/schema';
import { eligibility } from './eligibility';
import { rank } from './ranking';
import { diversify } from './diversification';
import { explain, explainAvailability } from './explanation';
import { ENGINE_VERSION } from './types';
import type { EngineContext, RankedMovie, Result } from './types';

export type EngineCatalog = { version: string; movies: readonly Movie[]; availability: readonly Availability[] };

function result(item: RankedMovie, input: Input, catalog: EngineCatalog, context: EngineContext, index: number): Result {
  return { movieId: item.movie.id, rank: index + 1, score: item.score, fitComponents: item.fitComponents,
    ...explain(item.movie, input),
    availabilityState: explainAvailability(item.movie, input, catalog.availability, context.now),
    catalogVersion: catalog.version, engineVersion: ENGINE_VERSION };
}

export function eligibleMovies(catalog: EngineCatalog, input: Input, context: EngineContext): Movie[] {
  return catalog.movies.filter(movie => eligibility(movie, input, catalog.availability, context).length === 0);
}

export function recommend(catalog: EngineCatalog, input: Input, context: EngineContext): { picks: Result[]; eligibleCount: number } {
  inputSchema.parse(input);
  const eligible = eligibleMovies(catalog, input, context);
  return { picks: diversify(rank(eligible, input, context.seed)).map((item,index) => result(item,input,catalog,context,index)), eligibleCount: eligible.length };
}

export function replacement(catalog: EngineCatalog, input: Input, context: EngineContext, currentIds: readonly string[]): Result | null {
  const anchors = catalog.movies.filter(movie => currentIds.includes(movie.id));
  const candidates = eligibleMovies(catalog,input,context).filter(movie => !currentIds.includes(movie.id));
  const picked = diversify(rank(candidates,input,context.seed),1,anchors)[0];
  return picked ? result(picked,input,catalog,context,0) : null;
}

export type Adjustment = { kind: 'availability' } | { kind: 'runtime'; minutes: number } | { kind: 'review' };
export function suggestAdjustment(catalog: EngineCatalog, input: Input, context: EngineContext): Adjustment {
  if (input.availabilityMode === 'strict' && eligibleMovies(catalog, { ...input, availabilityMode: 'self-check' },context).length) return { kind: 'availability' };
  const longer = eligibleMovies(catalog, { ...input, maxRuntimeMinutes: 240 },context)
    .map(movie => movie.runtimeMinutes!).sort((a,b) => a-b)[0];
  const needed = longer === undefined ? undefined : Math.max(30, longer - (input.allowOverrun ? 10 : 0));
  if (needed && needed > input.maxRuntimeMinutes) return { kind: 'runtime', minutes: needed };
  return { kind: 'review' };
}
