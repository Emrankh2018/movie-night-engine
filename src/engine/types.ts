import type { Availability, Input, Movie, TradeOff } from '../catalog/schema';

export const ENGINE_VERSION = '1.0.0';
export type Rejection = 'invalid' | 'unreviewed' | 'unreleased' | 'runtime-unknown' | 'runtime' | 'excluded' | 'watched' | 'rejected' | 'content' | 'availability';
export type EngineContext = { now: Date; watchedIds: readonly string[]; rejectedIds: readonly string[]; seed: string };
export type FitComponents = { mood: number; genre: number | null; context: number; adventure: number; confidence: number };
export type Reason =
  | { key: 'runtime'; evidence: { minutes: number; limit: number } }
  | { key: 'mood'; evidence: { mood: Input['mood']; score: number } }
  | { key: 'genre'; evidence: { genre: Movie['genres'][number] } }
  | { key: 'context'; evidence: { context: Input['watchingMode']; score: number } }
  | { key: 'adventure'; evidence: { preference: number; score: number } };
export type AvailabilityState = { kind: 'unknown' | 'simulated'; record?: Availability };
export type Result = {
  movieId: string; rank: number; score: number; fitComponents: FitComponents;
  reasons: Reason[]; tradeOffKey: TradeOff | 'none'; availabilityState: AvailabilityState;
  catalogVersion: string; engineVersion: string;
};
export type RankedMovie = { movie: Movie; score: number; fitComponents: FitComponents; tie: number };
