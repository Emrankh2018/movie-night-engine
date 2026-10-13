import { availabilitySchema, movieSchema } from '../catalog/schema';
import type { Availability, Input, Movie } from '../catalog/schema';
import type { EngineContext, Rejection } from './types';

export function currentAvailability(movieId: string, input: Input, records: readonly Availability[], now: Date): Availability | undefined {
  return records.filter(record => availabilitySchema.safeParse(record).success)
    .filter(record => record.movieId === movieId && record.countryCode === input.countryCode
      && input.providerIds.includes(record.providerId) && record.accessType === 'subscription'
      && record.reviewState === 'fixture-reviewed'
      && Date.parse(record.verifiedAt) <= now.getTime() && now.getTime() < Date.parse(record.expiresAt))
    .sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt) || a.providerId.localeCompare(b.providerId))[0];
}

export function eligibility(movie: Movie, input: Input, records: readonly Availability[], context: EngineContext): Rejection[] {
  if (!movieSchema.safeParse(movie).success) return ['invalid'];
  const reasons: Rejection[] = [];
  if (movie.reviewState !== 'fixture-reviewed') reasons.push('unreviewed');
  if (Date.parse(`${movie.releaseDate}T00:00:00Z`) > context.now.getTime()) reasons.push('unreleased');
  if (movie.runtimeMinutes === null) reasons.push('runtime-unknown');
  else if (movie.runtimeMinutes > input.maxRuntimeMinutes + (input.allowOverrun ? 10 : 0)) reasons.push('runtime');
  if (input.excludedMovieIds.includes(movie.id)) reasons.push('excluded');
  if (input.excludeWatched && context.watchedIds.includes(movie.id)) reasons.push('watched');
  if (context.rejectedIds.includes(movie.id)) reasons.push('rejected');
  if (input.excludedContentFlags.some(flag => movie.contentFlags[flag] !== 'no')) reasons.push('content');
  if (input.availabilityMode === 'strict' && !currentAvailability(movie.id, input, records, context.now)) reasons.push('availability');
  return reasons;
}
