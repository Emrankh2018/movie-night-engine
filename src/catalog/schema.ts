import { z } from 'zod';

export const locales = ['en', 'ar'] as const;
export const countries = ['QA', 'AE', 'GB'] as const;
export const moods = ['light', 'thoughtful', 'tense', 'wonder'] as const;
export const genres = ['comedy', 'drama', 'mystery', 'adventure', 'romance', 'scifi'] as const;
export const contexts = ['solo', 'couple', 'friends'] as const;
export const contentFlags = ['violence', 'sexualContent', 'strongLanguage', 'horror'] as const;
export const tradeOffs = ['dialogue', 'slow', 'intense', 'subtitles'] as const;
export const providers = ['demo-lantern', 'demo-orbit', 'netflix', 'prime'] as const;

const localized = z.object({ en: z.string().min(1), ar: z.string().min(1) });
const score = z.number().min(0).max(1);
const evidence = z.object({
  kind: z.literal('synthetic'),
  sourceUrls: z.array(z.url()).length(0),
  license: z.literal('original-synthetic'),
  retrievedAt: z.iso.date(),
  reviewer: z.literal('Codex fixture audit'),
});

export const movieSchema = z.object({
  id: z.string().regex(/^fixture-[a-z0-9-]+$/),
  dataKind: z.literal('synthetic'),
  titles: localized, year: z.number().int().min(1900).max(2200),
  releaseDate: z.iso.date(), runtimeMinutes: z.number().int().positive().nullable(),
  genres: z.array(z.enum(genres)).min(1), originalLanguage: z.enum(locales),
  originalHooks: localized,
  moodScores: z.object({ light: score, thoughtful: score, tense: score, wonder: score }),
  contextScores: z.object({ solo: score, couple: score, friends: score }),
  adventureScore: score, editorialConfidence: score,
  contentFlags: z.object({
    violence: z.enum(['yes', 'no', 'unknown']), sexualContent: z.enum(['yes', 'no', 'unknown']),
    strongLanguage: z.enum(['yes', 'no', 'unknown']), horror: z.enum(['yes', 'no', 'unknown']),
  }),
  tradeOff: z.enum(tradeOffs).nullable(), franchiseId: z.string().nullable(),
  reviewState: z.enum(['fixture-reviewed', 'draft']), provenance: evidence,
});

export const availabilitySchema = z.object({
  movieId: z.string(), countryCode: z.enum(countries), providerId: z.enum(providers),
  accessType: z.enum(['subscription', 'rent', 'buy']),
  verifiedAt: z.iso.datetime(), expiresAt: z.iso.datetime(),
  sourceUrl: z.url().nullable(), destinationUrl: z.url().nullable(),
  reviewer: z.literal('Codex fixture audit'),
  reviewState: z.enum(['fixture-reviewed', 'draft']), dataKind: z.literal('synthetic'),
}).superRefine((record, ctx) => {
  const duration = Date.parse(record.expiresAt) - Date.parse(record.verifiedAt);
  if (duration <= 0 || duration > 7 * 24 * 60 * 60 * 1000) {
    ctx.addIssue({ code: 'custom', message: 'Evidence expiry must be within seven days of verification.' });
  }
  if (!record.providerId.startsWith('demo-') || record.sourceUrl || record.destinationUrl) {
    ctx.addIssue({ code: 'custom', message: 'Synthetic availability may only describe imaginary providers, without links.' });
  }
});

export const inputSchema = z.object({
  locale: z.enum(locales), countryCode: z.enum(countries), watchingMode: z.enum(contexts),
  mood: z.enum(moods), preferredGenres: z.array(z.enum(genres)).max(3),
  maxRuntimeMinutes: z.number().int().min(30).max(240), allowOverrun: z.boolean(),
  providerIds: z.array(z.enum(providers)), availabilityMode: z.enum(['self-check', 'strict']),
  adventurousness: score, excludeWatched: z.boolean(),
  excludedMovieIds: z.array(z.string()), excludedContentFlags: z.array(z.enum(contentFlags)),
});

export type Locale = typeof locales[number];
export type Movie = z.infer<typeof movieSchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type Input = z.infer<typeof inputSchema>;
export type ContentFlag = typeof contentFlags[number];
export type TradeOff = typeof tradeOffs[number];
export const DEFAULT_INPUT: Input = {
  locale: 'en', countryCode: 'QA', watchingMode: 'couple', mood: 'light', preferredGenres: [],
  maxRuntimeMinutes: 120, allowOverrun: false, providerIds: [], availabilityMode: 'self-check',
  adventurousness: 0.25, excludeWatched: true, excludedMovieIds: [], excludedContentFlags: [],
};

export const catalogSchema = z.object({
  version: z.string(), movies: z.array(movieSchema).min(1), availability: z.array(availabilitySchema),
}).superRefine((catalog, ctx) => {
  const ids = new Set(catalog.movies.map(movie => movie.id));
  if (ids.size !== catalog.movies.length) ctx.addIssue({ code: 'custom', message: 'Duplicate movie IDs.' });
  for (const record of catalog.availability) {
    if (!ids.has(record.movieId)) ctx.addIssue({ code: 'custom', message: 'Availability references unknown movie.' });
  }
});
