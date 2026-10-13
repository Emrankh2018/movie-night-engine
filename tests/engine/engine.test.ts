import { describe, expect, it } from 'vitest';
import { catalogSchema, DEFAULT_INPUT } from '../../src/catalog/schema';
import type { Availability, Input, Movie } from '../../src/catalog/schema';
import { catalog } from '../../src/catalog';
import { eligibility } from '../../src/engine/eligibility';
import { recommend, replacement, suggestAdjustment } from '../../src/engine';
import { fit, rank } from '../../src/engine/ranking';
import { diversify, diversityPenalty } from '../../src/engine/diversification';
import { explain } from '../../src/engine/explanation';
import type { EngineContext, Rejection } from '../../src/engine/types';
import { ar, en, reasonText } from '../../src/i18n';

const now = new Date('2026-10-13T12:00:00Z');
const ctx: EngineContext = { now, watchedIds: [], rejectedIds: [], seed: 'test-seed' };
const input: Input = { ...DEFAULT_INPUT };
function movie(patch: Partial<Movie> = {}): Movie { return { ...catalog.movies[0], id: 'fixture-test', runtimeMinutes: 100,...patch }; }
function availability(patch: Partial<Availability> = {}): Availability {
  return { ...catalog.availability[0], movieId: 'fixture-test',...patch };
}
const strict: Partial<Input> = { availabilityMode: 'strict', providerIds: ['demo-lantern'] };
type Scenario = { name: string; movie?: Partial<Movie>; input?: Partial<Input>; context?: Partial<EngineContext>; records?: Availability[]; reject?: Rejection[] };
const cases: Scenario[] = [
  { name: 'short comedy fits 100 minutes', input: { maxRuntimeMinutes: 100, preferredGenres: ['comedy'] } },
  { name: 'one minute below cap fails', input: { maxRuntimeMinutes: 99 }, reject: ['runtime'] },
  { name: 'zero overrun is the default', movie: { runtimeMinutes: 121 }, reject: ['runtime'] },
  { name: 'explicit ten minute allowance fits', movie: { runtimeMinutes: 130 }, input: { allowOverrun: true } },
  { name: 'eleven minute overrun fails', movie: { runtimeMinutes: 131 }, input: { allowOverrun: true }, reject: ['runtime'] },
  { name: 'unknown runtime fails', movie: { runtimeMinutes: null }, reject: ['runtime-unknown'] },
  { name: 'negative runtime is invalid', movie: { runtimeMinutes: -1 }, reject: ['invalid'] },
  { name: 'draft editorial record fails', movie: { reviewState: 'draft' }, reject: ['unreviewed'] },
  { name: 'unreleased title fails', movie: { releaseDate: '2026-10-14' }, reject: ['unreleased'] },
  { name: 'release day passes', movie: { releaseDate: '2026-10-13' } },
  { name: 'explicit ID exclusion fails', input: { excludedMovieIds: ['fixture-test'] }, reject: ['excluded'] },
  { name: 'watched title fails by default', context: { watchedIds: ['fixture-test'] }, reject: ['watched'] },
  { name: 'user explicitly allows watched title', context: { watchedIds: ['fixture-test'] }, input: { excludeWatched: false } },
  { name: 'locally rejected choice fails', context: { rejectedIds: ['fixture-test'] }, reject: ['rejected'] },
  { name: 'unrelated watched IDs do not filter title', context: { watchedIds: ['fixture-other'] } },
  { name: 'reviewed no violence passes veto', input: { excludedContentFlags: ['violence'] } },
  { name: 'verified violence fails veto', movie: { contentFlags: { ...movie().contentFlags, violence: 'yes' } }, input: { excludedContentFlags: ['violence'] }, reject: ['content'] },
  { name: 'unknown violence fails veto', movie: { contentFlags: { ...movie().contentFlags, violence: 'unknown' } }, input: { excludedContentFlags: ['violence'] }, reject: ['content'] },
  { name: 'unknown horror fails veto', movie: { contentFlags: { ...movie().contentFlags, horror: 'unknown' } }, input: { excludedContentFlags: ['horror'] }, reject: ['content'] },
  { name: 'unknown unrequested content does not claim safety', movie: { contentFlags: { ...movie().contentFlags, violence: 'unknown' } } },
  { name: 'multiple reviewed no flags pass', input: { excludedContentFlags: ['sexualContent', 'strongLanguage', 'horror'] } },
  { name: 'one yes among multiple vetoes fails', movie: { contentFlags: { ...movie().contentFlags, strongLanguage: 'yes' } }, input: { excludedContentFlags: ['sexualContent', 'strongLanguage'] }, reject: ['content'] },
  { name: 'self check accepts unknown availability' },
  { name: 'strict unknown availability fails', input: strict, reject: ['availability'] },
  { name: 'current matching subscription passes', input: strict, records: [availability()] },
  { name: 'wrong country fails', input: strict, records: [availability({ countryCode: 'AE' })], reject: ['availability'] },
  { name: 'matching different selected country passes', input: { ...strict, countryCode: 'AE' }, records: [availability({ countryCode: 'AE' })] },
  { name: 'wrong provider fails', input: strict, records: [availability({ providerId: 'demo-orbit' })], reject: ['availability'] },
  { name: 'multiple providers permit matching evidence', input: { ...strict, providerIds: ['demo-lantern','demo-orbit'] }, records: [availability({ providerId: 'demo-orbit' })] },
  { name: 'rental fails subscription filter', input: strict, records: [availability({ accessType: 'rent' })], reject: ['availability'] },
  { name: 'purchase fails subscription filter', input: strict, records: [availability({ accessType: 'buy' })], reject: ['availability'] },
  { name: 'expired evidence fails', input: strict, records: [availability({ verifiedAt: '2026-10-01T00:00:00Z', expiresAt: '2026-10-08T00:00:00Z' })], reject: ['availability'] },
  { name: 'expiry instant fails', input: strict, records: [availability({ verifiedAt: '2026-10-06T12:00:00Z', expiresAt: '2026-10-13T12:00:00Z' })], reject: ['availability'] },
  { name: 'one second before expiry passes', input: strict, records: [availability()], context: { now: new Date('2026-10-19T23:59:59Z') } },
  { name: 'future verification fails', input: strict, records: [availability({ verifiedAt: '2026-10-14T00:00:00Z', expiresAt: '2026-10-20T00:00:00Z' })], reject: ['availability'] },
  { name: 'unreviewed availability fails', input: strict, records: [availability({ reviewState: 'draft' })], reject: ['availability'] },
  { name: 'wrong movie evidence fails', input: strict, records: [availability({ movieId: 'fixture-other' })], reject: ['availability'] },
  { name: 'unsupported real service fails', input: { ...strict, providerIds: ['netflix'] }, records: [availability()], reject: ['availability'] },
  { name: 'synthetic source link cannot imply real evidence', input: strict, records: [availability({ sourceUrl: 'https://example.com' })], reject: ['availability'] },
  { name: 'evidence older than seven day policy fails', input: strict, records: [availability({ expiresAt: '2026-11-01T00:00:00Z' })], reject: ['availability'] },
  { name: 'empty selected services fail strict filtering', input: { availabilityMode: 'strict', providerIds: [] }, records: [availability()], reject: ['availability'] },
  { name: 'solo surprise never overrides hard limits', input: { watchingMode: 'solo', adventurousness: .9, maxRuntimeMinutes: 90 }, reject: ['runtime'] },
  { name: 'conflicting genre tastes are soft preferences', input: { preferredGenres: ['mystery','scifi','drama'] } },
  { name: 'all hard failures are reported', input: { ...strict, maxRuntimeMinutes: 60, excludedMovieIds: ['fixture-test'] }, context: { watchedIds: ['fixture-test'] }, reject: ['runtime','excluded','watched','availability'] },
  { name: 'long thriller passes explicitly longer runtime', movie: { runtimeMinutes: 180, genres: ['mystery'] }, input: { maxRuntimeMinutes: 180, mood: 'tense' } },
];

describe('representative eligibility cases', () => {
  it.each(cases)('$name', scenario => {
    expect(eligibility(movie(scenario.movie), { ...input,...scenario.input },scenario.records ?? [],{ ...ctx,...scenario.context })).toEqual(scenario.reject ?? []);
  });
});

describe('ranked picks, diversity and replacement', () => {
  it.each([0,1,2,3])('honestly returns %i when that many titles are eligible', count => {
    const tiny = { version: 'test', movies: catalog.movies.slice(0,count), availability: [] };
    const answer = recommend(tiny,input,ctx);
    expect(answer.picks).toHaveLength(count);
    expect(answer.eligibleCount).toBe(count);
    expect(new Set(answer.picks.map(pick => pick.movieId)).size).toBe(count);
  });
  it('many watched titles produce two remaining picks', () => {
    const watchedIds = catalog.movies.slice(0,22).map(movie => movie.id);
    expect(recommend(catalog,input,{ ...ctx,watchedIds }).picks.map(pick => pick.movieId).sort()).toEqual(catalog.movies.slice(22).map(movie => movie.id).sort());
  });
  it('repeatable ties are independent of catalog order', () => {
    const movies = ['a','b','c','d','e'].map(id => movie({ id: `fixture-${id}` }));
    expect(rank(movies,input,ctx.seed).map(item => item.movie.id)).toEqual(rank([...movies].reverse(),input,ctx.seed).map(item => item.movie.id));
    expect(rank(movies,input,'different-seed').map(item => item.movie.id)).not.toEqual(rank(movies,input,ctx.seed).map(item => item.movie.id));
  });
  it('known weight arithmetic matches the report', () => {
    const subject = movie({ moodScores: { light: 1, thoughtful: 0, tense: 0, wonder: 0 }, contextScores: { solo: 0, couple: .5, friends: 0 }, adventureScore: .25, editorialConfidence: .8 });
    expect(fit(subject,{ ...input,preferredGenres: ['comedy','mystery'] }).score).toBeCloseTo(.35 + .1 + .1 + .15 + .08);
    expect(fit(subject,input).score).toBeCloseTo((.35 + .1 + .15 + .08)/.8);
  });
  it('diversity prefers a similarly fitting different genre and franchise', () => {
    const a = movie({ id: 'fixture-a', franchiseId: 'series' });
    const b = movie({ id: 'fixture-b', franchiseId: 'series' });
    const c = movie({ id: 'fixture-c', genres: ['drama'], franchiseId: null });
    const ranked = rank([a,b,c],input,ctx.seed).map((item,index) => ({ ...item, score: item.movie.id === a.id ? 1 : .95, tie: index }));
    expect(diversify(ranked,2).map(item => item.movie.id)).toEqual([a.id,c.id]);
    expect(diversityPenalty(b,[a])).toBeCloseTo(.23);
  });
  it('replacement excludes current, seen and previously rejected IDs', () => {
    const first = recommend(catalog,input,ctx).picks.map(pick => pick.movieId);
    const pool = catalog.movies.filter(movie => !first.includes(movie.id));
    const context = { ...ctx, watchedIds: pool.slice(0,3).map(movie => movie.id), rejectedIds: pool.slice(3,6).map(movie => movie.id) };
    const next = replacement(catalog,input,context,first)!;
    expect([...first,...context.watchedIds,...context.rejectedIds]).not.toContain(next.movieId);
  });
  it('exhausted replacement has no fallback to an excluded title', () => {
    expect(replacement({ version: 'tiny', movies: [movie()], availability: [] },input,ctx,['fixture-test'])).toBeNull();
  });
  it('never relaxes a constraint to produce diversity', () => {
    const tiny = { version: 'tiny', movies: [movie(),movie({ id: 'fixture-b',runtimeMinutes: 130,genres: ['drama'] })], availability: [] };
    expect(recommend(tiny,input,ctx).picks.map(pick => pick.movieId)).toEqual(['fixture-test']);
  });
  it('proposes only explicit actionable adjustments', () => {
    expect(suggestAdjustment(catalog,{ ...input,...strict,providerIds: ['netflix'] },ctx)).toEqual({ kind: 'availability' });
    expect(suggestAdjustment(catalog,{ ...input,maxRuntimeMinutes: 30 },ctx)).toEqual({ kind: 'runtime',minutes: 72 });
    expect(suggestAdjustment(catalog,{ ...input,excludedMovieIds: catalog.movies.map(movie => movie.id) },ctx)).toEqual({ kind: 'review' });
  });
});

describe('evidence and rights boundaries', () => {
  it('all representative tastes get truthful reasons and valid eligibility', () => {
    for (const mood of ['light','thoughtful','tense','wonder'] as const) {
      for (const watchingMode of ['solo','couple','friends'] as const) {
        for (const adventurousness of [.25,.5,.9]) {
          const preferences = { ...input,mood,watchingMode,adventurousness };
          const answer = recommend(catalog,preferences,ctx);
          for (const pick of answer.picks) {
            const subject = catalog.movies.find(movie => movie.id === pick.movieId)!;
            expect(eligibility(subject,preferences,catalog.availability,ctx)).toEqual([]);
            expect(pick.reasons).toHaveLength(2);
            expect(pick.catalogVersion).toBe(catalog.version);
            for (const reason of pick.reasons) {
              if (reason.key === 'runtime') expect(reason.evidence.minutes).toBe(subject.runtimeMinutes);
              if (reason.key === 'mood') { expect(reason.evidence.score).toBe(subject.moodScores[mood]); expect(reason.evidence.score).toBeGreaterThanOrEqual(.7); }
              if (reason.key === 'genre') expect(subject.genres).toContain(reason.evidence.genre);
              if (reason.key === 'context') expect(reason.evidence.score).toBe(subject.contextScores[watchingMode]);
              for (const locale of ['en','ar'] as const) expect(reasonText(reason,locale)).not.toMatch(/\{|undefined|Netflix|نتفليكس/);
            }
          }
        }
      }
    }
  });
  it('low mood score cannot produce a positive mood claim', () => {
    const subject = movie({ moodScores: { light: .1, thoughtful: .1, tense: .1, wonder: .1 }, contextScores: { solo: .2,couple: .2,friends: .2 }, adventureScore: 1,tradeOff: null });
    const explanation = explain(subject,input);
    expect(explanation.reasons.map(reason => reason.key)).toEqual(['runtime','context']);
    expect(reasonText(explanation.reasons[1],'en')).toContain('weaker fit');
    expect(explanation.tradeOffKey).toBe('none');
  });
  it('unreviewed record has no editorial explanation', () => { expect(explain(movie({ reviewState: 'draft' }),input)).toEqual({ reasons: [],tradeOffKey: 'none' }); });
  it('expired or wrong-country evidence never appears as current', () => {
    const answer = recommend(catalog,input,{ ...ctx,now: new Date('2026-11-01T00:00:00Z') });
    expect(answer.picks.every(pick => pick.availabilityState.kind === 'unknown')).toBe(true);
  });
  it('current availability is always labelled simulated and has no provider link', () => {
    for (const pick of recommend(catalog,{ ...input,...strict },ctx).picks) {
      expect(pick.availabilityState.kind).toBe('simulated');
      expect(pick.availabilityState.record?.destinationUrl).toBeNull();
    }
  });
  it('catalog rejects duplicates and orphan evidence', () => {
    expect(catalogSchema.safeParse({ ...catalog,movies: [...catalog.movies,catalog.movies[0]] }).success).toBe(false);
    expect(catalogSchema.safeParse({ ...catalog,availability: [availability({ movieId: 'fixture-missing' })] }).success).toBe(false);
  });
  it('bilingual dictionaries have identical keys', () => { expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort()); });
});
