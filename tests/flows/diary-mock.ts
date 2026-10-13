import type { BrowserContext, Route } from '@playwright/test';
import type { Night } from '../../src/diary/types';
import { AUTH_STORAGE_KEY, PROJECT_URL } from '../../src/diary/supabase';

// Synthetic auth/API contract fixture. Never uses a real session, account or credential.
export const USER_A = 'f2c60c1b-6849-46e2-a8d2-bd389ca13b11';
export const USER_B = 'f2c60c1b-6849-46e2-a8d2-bd389ca13b22';
function user(id: string) { return { id,aud: 'authenticated',role: 'authenticated',email: id === USER_A ? 'user-a@example.invalid' : 'user-b@example.invalid',app_metadata: { provider: 'google',providers: ['google'] },user_metadata: {},identities: [],created_at: '2026-10-13T12:00:00Z' }; }
function session(id: string) {
  const jwt = [Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'),Buffer.from(JSON.stringify({ sub: id,aud: 'authenticated',exp: 4102444800,iat: 1791892800 })).toString('base64url'),'synthetic-signature-never-valid-on-supabase'].join('.');
  return { access_token: jwt,refresh_token: `synthetic-refresh-${id}`,token_type: 'bearer',expires_at: 4102444800,expires_in: 3600,user: user(id) };
}
export async function seedMockSession(context: BrowserContext,id: string) {
  await context.addInitScript(({ key,value }) => {
    if (!sessionStorage.getItem('mne-test-session-seeded')) { localStorage.setItem(key,JSON.stringify(value)); sessionStorage.setItem('mne-test-session-seeded','true'); }
  },{ key: AUTH_STORAGE_KEY,value: session(id) });
}
export class DiaryBackend {
  rows: Night[] = [];
  google = true;
  cancelGoogle = false;
  writes = 0;
  async install(context: BrowserContext) {
    await context.route('**/*',async route => {
      const url = new URL(route.request().url());
      if (url.origin === PROJECT_URL) return this.handle(route,url);
      if (url.hostname === '127.0.0.1') return route.continue();
      return route.abort();
    });
  }
  private async handle(route: Route,url: URL) {
    const request = route.request(); const method = request.method();
    const reply = (data: unknown,status = 200) => route.fulfill({ status,contentType: 'application/json',body: JSON.stringify(data),headers: { 'access-control-allow-origin': '*','access-control-allow-headers': '*','access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS' } });
    if (method === 'OPTIONS') return reply({});
    if (url.pathname === '/auth/v1/settings') return reply({ external: { google: this.google } });
    if (url.pathname === '/auth/v1/authorize') return route.fulfill({ status: 302,headers: { location: `http://127.0.0.1:4173/auth/callback?${this.cancelGoogle ? 'error=access_denied' : 'code=synthetic-test-code'}` } });
    if (url.pathname === '/auth/v1/token') return reply(session(USER_A));
    let owner: string | null = null;
    try { owner = JSON.parse(Buffer.from(request.headers().authorization.split(' ')[1].split('.')[1],'base64url').toString()).sub; } catch { /* Missing/invalid synthetic token. */ }
    if (!owner) return reply({ message: 'Synthetic auth required' },401);
    if (url.pathname === '/auth/v1/user') return reply(user(owner));
    if (url.pathname === '/auth/v1/logout') return reply({});
    const match = (row: Night) => row.user_id === owner && (!url.searchParams.get('user_id') || url.searchParams.get('user_id') === `eq.${owner}`)
      && (!url.searchParams.get('id') || url.searchParams.get('id') === `eq.${row.id}`);
    if (url.pathname === '/rest/v1/movie_nights') {
      if (method === 'GET') {
        const rows = this.rows.filter(match).sort((a,b) => (b.chosen_at ?? '').localeCompare(a.chosen_at ?? '') || b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id));
        const offset = Number(url.searchParams.get('offset') ?? 0); const limit = Number(url.searchParams.get('limit') ?? 200);
        return reply(rows.slice(offset,offset + limit));
      }
      this.writes++;
      if (method === 'PATCH') { const patch = request.postDataJSON(); this.rows.filter(match).forEach(row => Object.assign(row,patch)); return reply(this.rows.filter(match).map(row => ({ id: row.id }))); }
      if (method === 'DELETE') { this.rows = this.rows.filter(row => !match(row)); return reply([]); }
    }
    if (url.pathname.startsWith('/rest/v1/rpc/')) {
      this.writes++; const args = request.postDataJSON(); const rpc = url.pathname.split('/').pop();
      if (rpc === 'import_guest_movie_nights') {
        let inserted = 0,skipped = 0;
        for (const entry of args.p_entries) {
          if (this.rows.some(row => row.user_id === owner && row.movie_id === entry.movie_id && (entry.status === 'chosen' || row.status === 'watched'))) { skipped++; continue; }
          this.rows.push({ ...entry,id: crypto.randomUUID(),user_id: owner,source: 'guest-import',created_at: new Date().toISOString() }); inserted++;
        }
        return reply({ inserted,skipped });
      }
      const existing = this.rows.find(row => row.user_id === owner && row.movie_id === args.p_movie_id && row.status === 'chosen');
      if (rpc === 'choose_movie' && existing) return reply([existing]);
      if (rpc === 'record_movie_watched' && existing) { existing.status = 'watched'; existing.watched_on = args.p_watched_on; return reply([existing]); }
      const row: Night = { id: crypto.randomUUID(),user_id: owner,movie_id: args.p_movie_id,title_en: args.p_title_en,title_ar: args.p_title_ar,
        runtime_minutes: args.p_runtime_minutes,catalog_version: args.p_catalog_version,is_synthetic: args.p_is_synthetic,
        status: rpc === 'choose_movie' ? 'chosen' : 'watched',chosen_at: rpc === 'choose_movie' ? new Date().toISOString() : null,
        watched_on: rpc === 'choose_movie' ? null : args.p_watched_on,source: 'app',client_event_id: args.p_event_id,created_at: new Date().toISOString() };
      this.rows.push(row); return reply([row]);
    }
    return reply({ message: 'Unimplemented synthetic endpoint' },404);
  }
}
