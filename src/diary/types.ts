import { z } from 'zod';

export const snapshotSchema = z.object({
  movie_id: z.string().regex(/^[a-z][a-z0-9:-]{1,120}$/),
  title_en: z.string().max(240).nullable(), title_ar: z.string().max(240).nullable(),
  runtime_minutes: z.number().int().positive().max(600).nullable(),
  catalog_version: z.string().min(1).max(100), is_synthetic: z.boolean(),
});
export const nightSchema = snapshotSchema.extend({
  id: z.uuid(), user_id: z.uuid(), status: z.enum(['chosen','watched']),
  chosen_at: z.iso.datetime({ offset: true }).nullable(), watched_on: z.iso.date().nullable(),
  source: z.enum(['app','guest-import']), client_event_id: z.string(),
  created_at: z.iso.datetime({ offset: true }),
});
export type MovieSnapshot = z.infer<typeof snapshotSchema>;
export type Night = z.infer<typeof nightSchema>;
export type GuestImport = MovieSnapshot & { status: Night['status']; chosen_at: string | null; watched_on: string | null; client_event_id: string };
export type ImportResult = { inserted: number; skipped: number };
export type Identity = { id: string; email: string | null };
export type DiaryError = 'unconfigured' | 'authFailed' | 'cancelled' | 'historyFailed' | 'writeFailed' | 'duplicateNight' | 'signedOut' | 'signOutOffline';
export interface DiaryGateway {
  list(owner: string, signal: AbortSignal): Promise<Night[]>;
  choose(movie: MovieSnapshot, event: string, signal: AbortSignal): Promise<void>;
  seen(movie: MovieSnapshot, event: string, on: string, signal: AbortSignal): Promise<void>;
  watched(owner: string, id: string, on: string, signal: AbortSignal): Promise<void>;
  undo(owner: string, id: string, signal: AbortSignal): Promise<void>;
  delete(owner: string, id: string, signal: AbortSignal): Promise<void>;
  clear(owner: string, signal: AbortSignal): Promise<void>;
  import(entries: GuestImport[], signal: AbortSignal): Promise<ImportResult>;
}
export interface AuthGateway {
  configured: boolean;
  restore(): Promise<Identity | null>;
  subscribe(callback: (identity: Identity | null) => void): () => void;
  googleEnabled(): Promise<boolean>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  callbackCancelled: boolean;
}
