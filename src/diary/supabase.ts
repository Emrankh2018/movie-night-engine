import type { SupabaseClient, User } from '@supabase/supabase-js';
import { z } from 'zod';
import { nightSchema } from './types';
import type { AuthGateway, DiaryGateway, Identity, MovieSnapshot } from './types';

export const PROJECT_URL = 'https://vvwzqehzamkflrokrcqs.supabase.co';
export const AUTH_STORAGE_KEY = 'movie-night-engine:auth';
export function publicConfig(url: unknown,key: unknown): { url: string; key: string } | null {
  if (url !== PROJECT_URL || typeof key !== 'string' || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return null;
  return { url,key };
}
function identity(user: User | null): Identity | null { return user ? { id: user.id,email: user.email ?? null } : null; }
function checked(error: unknown) { if (error) throw error; }
function rpcSnapshot(movie: MovieSnapshot,event: string) {
  return { p_movie_id: movie.movie_id,p_title_en: movie.title_en,p_title_ar: movie.title_ar,p_runtime_minutes: movie.runtime_minutes,
    p_catalog_version: movie.catalog_version,p_is_synthetic: movie.is_synthetic,p_event_id: event };
}
function cleanCallback() {
  if (window.location.pathname === '/auth/callback' || new URLSearchParams(location.search).has('error')) window.history.replaceState(null,'','/');
}
export function gateways(config: ReturnType<typeof publicConfig>): { auth: AuthGateway; diary: DiaryGateway } {
  const cancelled = new URLSearchParams(window.location.search).get('error') === 'access_denied' || new URLSearchParams(window.location.hash.slice(1)).get('error') === 'access_denied';
  let clientPromise: Promise<SupabaseClient> | null = null;
  let unsubscribeClient: (() => void) | null = null;
  const subscribers = new Set<(identity: Identity | null) => void>();
  let ignoringEvents = false;
  function requireClient(): Promise<SupabaseClient> {
    if (!config) return Promise.reject(new Error('Unconfigured'));
    if (!clientPromise) clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      const client = createClient(config.url,config.key,{
        auth: { storageKey: AUTH_STORAGE_KEY,flowType: 'pkce',persistSession: true,autoRefreshToken: true,detectSessionInUrl: true },
        global: { fetch: (url,options) => fetch(url,{ ...options,signal: options?.signal ?? AbortSignal.timeout(15000) }) },
      });
      const { data } = client.auth.onAuthStateChange((event,session) => {
        if (ignoringEvents || event === 'INITIAL_SESSION') return;
        queueMicrotask(() => { if (!ignoringEvents) subscribers.forEach(callback => callback(identity(session?.user ?? null))); });
      });
      unsubscribeClient = () => data.subscription.unsubscribe();
      return client;
    });
    return clientPromise;
  }
  const auth: AuthGateway = {
    configured: !!config,callbackCancelled: cancelled,
    async restore() {
      try {
        if (!config) return null;
        let saved = false;
        try { saved = !!localStorage.getItem(AUTH_STORAGE_KEY); } catch { /* Guest mode remains available. */ }
        if (!saved && !new URLSearchParams(location.search).has('code')) return null;
        const client = await requireClient();
        const { data,error } = await client.auth.getSession(); checked(error);
        if (!data.session) return null;
        const verified = await client.auth.getUser(); checked(verified.error);
        return identity(verified.data.user);
      } finally { cleanCallback(); }
    },
    subscribe(callback) {
      subscribers.add(callback);
      const changed = (event: StorageEvent) => {
        if (event.key !== AUTH_STORAGE_KEY) return;
        if (!event.newValue) callback(null);
        else if (!ignoringEvents) void auth.restore().then(callback).catch(() => callback(null));
      };
      window.addEventListener('storage',changed);
      return () => { subscribers.delete(callback); window.removeEventListener('storage',changed); };
    },
    async googleEnabled() {
      if (!config) return false;
      const response = await fetch(`${config.url}/auth/v1/settings`,{ headers: { apikey: config.key },signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Provider settings unavailable');
      const settings: unknown = await response.json();
      return z.object({ external: z.object({ google: z.boolean() }) }).parse(settings).external.google;
    },
    async signIn() {
      const client = await requireClient();
      ignoringEvents = false;
      const { data,error } = await client.auth.signInWithOAuth({ provider: 'google',options: {
        redirectTo: new URL('/auth/callback',window.location.origin).href,skipBrowserRedirect: true,queryParams: { prompt: 'select_account' },
      } }); checked(error);
      if (!data.url || new URL(data.url).origin !== PROJECT_URL) throw new Error('Unexpected auth destination');
      window.location.assign(data.url);
    },
    async signOut() {
      ignoringEvents = true;
      const client = clientPromise ? await clientPromise : null;
      // Local credentials are removed even if the remote revocation request fails offline.
      try { const result = await client?.auth.signOut({ scope: 'local' }); checked(result?.error); }
      finally {
        await client?.auth.stopAutoRefresh();
        unsubscribeClient?.(); unsubscribeClient = null; clientPromise = null;
        try { localStorage.removeItem(AUTH_STORAGE_KEY); localStorage.removeItem(`${AUTH_STORAGE_KEY}-code-verifier`); } catch { /* denied storage is already session-only */ }
      }
    },
  };
  const diary: DiaryGateway = {
    async list(owner,signal) {
      const entries = [];
      for (let offset = 0; ; offset += 200) {
        const { data,error } = await (await requireClient()).from('movie_nights').select('*').eq('user_id',owner)
          .order('chosen_at',{ ascending: false,nullsFirst: false }).order('created_at',{ ascending: false }).order('id',{ ascending: false })
          .range(offset,offset + 199).abortSignal(signal); checked(error);
        const page = z.array(nightSchema).parse(data); entries.push(...page);
        if (page.length < 200) return entries;
      }
    },
    async choose(movie,event,signal) { const { error } = await (await requireClient()).rpc('choose_movie',rpcSnapshot(movie,event)).abortSignal(signal); checked(error); },
    async seen(movie,event,on,signal) { const { error } = await (await requireClient()).rpc('record_movie_watched',{ ...rpcSnapshot(movie,event),p_watched_on: on }).abortSignal(signal); checked(error); },
    async watched(owner,id,on,signal) {
      const { data,error } = await (await requireClient()).from('movie_nights').update({ status: 'watched',watched_on: on }).eq('user_id',owner).eq('id',id).select('id').abortSignal(signal);
      checked(error); if (!data?.length) throw new Error('No owned row updated');
    },
    async undo(owner,id,signal) {
      const { data,error } = await (await requireClient()).from('movie_nights').update({ status: 'chosen',watched_on: null }).eq('user_id',owner).eq('id',id).select('id').abortSignal(signal);
      checked(error); if (!data?.length) throw new Error('No owned row updated');
    },
    async delete(owner,id,signal) { const { error } = await (await requireClient()).from('movie_nights').delete().eq('user_id',owner).eq('id',id).abortSignal(signal); checked(error); },
    async clear(owner,signal) { const { error } = await (await requireClient()).from('movie_nights').delete().eq('user_id',owner).abortSignal(signal); checked(error); },
    async import(entries,signal) {
      const total = { inserted: 0,skipped: 0 };
      for (let offset = 0; offset < entries.length; offset += 500) {
        signal.throwIfAborted();
        const { data,error } = await (await requireClient()).rpc('import_guest_movie_nights',{ p_entries: entries.slice(offset,offset + 500) }).abortSignal(signal); checked(error);
        const result = z.object({ inserted: z.number().int().nonnegative(),skipped: z.number().int().nonnegative() }).parse(data);
        total.inserted += result.inserted; total.skipped += result.skipped;
      }
      return total;
    },
  };
  return { auth,diary };
}
