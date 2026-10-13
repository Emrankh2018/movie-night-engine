import type { Availability, Input, Movie, TradeOff } from '../catalog/schema';
import { currentAvailability } from './eligibility';
import type { AvailabilityState, Reason } from './types';

// Template prerequisites are audited by evidence tests; only fixture editorial tags are approved here.
export function explain(movie: Movie, input: Input): { reasons: Reason[]; tradeOffKey: TradeOff | 'none' } {
  const reasons: Reason[] = [];
  if (movie.reviewState !== 'fixture-reviewed') return { reasons, tradeOffKey: 'none' };
  if (movie.runtimeMinutes !== null && movie.runtimeMinutes <= input.maxRuntimeMinutes + (input.allowOverrun ? 10 : 0)) {
    reasons.push({ key: 'runtime', evidence: { minutes: movie.runtimeMinutes, limit: input.maxRuntimeMinutes + (input.allowOverrun ? 10 : 0) } });
  }
  const moodScore = movie.moodScores[input.mood];
  const matchedGenre = input.preferredGenres.find(genre => movie.genres.includes(genre));
  if (moodScore >= .7) reasons.push({ key: 'mood', evidence: { mood: input.mood, score: moodScore } });
  else if (matchedGenre) reasons.push({ key: 'genre', evidence: { genre: matchedGenre } });
  else if (movie.contextScores[input.watchingMode] >= .7) {
    reasons.push({ key: 'context', evidence: { context: input.watchingMode, score: movie.contextScores[input.watchingMode] } });
  } else if (1 - Math.abs(movie.adventureScore - input.adventurousness) >= .7) {
    reasons.push({ key: 'adventure', evidence: { preference: input.adventurousness, score: movie.adventureScore } });
  }
  if (reasons.length < 2 && !reasons.some(reason => reason.key === 'context')) {
    // A weaker context match is disclosed as weaker, never claimed to be a good fit.
    reasons.push({ key: 'context', evidence: { context: input.watchingMode, score: movie.contextScores[input.watchingMode] } });
  }
  return { reasons: reasons.slice(0, 2), tradeOffKey: movie.tradeOff ?? 'none' };
}

export function explainAvailability(movie: Movie, input: Input, records: readonly Availability[], now: Date): AvailabilityState {
  const record = currentAvailability(movie.id, input, records, now);
  return record ? { kind: 'simulated', record } : { kind: 'unknown' };
}
