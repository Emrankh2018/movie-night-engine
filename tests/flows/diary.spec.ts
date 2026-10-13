import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { DiaryBackend, seedMockSession, USER_A, USER_B } from './diary-mock';
import { AUTH_STORAGE_KEY } from '../../src/diary/supabase';
import { STORAGE_KEY, freshState } from '../../src/storage';

async function complete(page: Page) {
  await page.getByRole('button',{ name: 'Find tonight’s picks',exact: true }).click();
  for (let i = 0; i < 5; i++) await page.getByRole('button',{ name: 'Continue',exact: true }).click();
  await page.getByRole('button',{ name: 'Show my picks',exact: true }).click();
}
async function openDiary(page: Page) { await page.getByRole('button',{ name: 'My Movie Nights',exact: true }).click(); }

test('accounts stay optional; unavailable Google is honestly disabled',async ({ page,context }) => {
  const backend = new DiaryBackend(); backend.google = false; await backend.install(context);
  await page.goto('/'); await openDiary(page);
  await expect(page.getByRole('button',{ name: 'Sign in with Google',exact: true })).toBeDisabled();
  await expect(page.getByText('Google sign-in is not configured yet. You can keep using the picker as a guest.',{ exact: true })).toBeVisible();
  await page.getByRole('button',{ name: 'Back to picks' }).click(); await complete(page);
  await expect(page.locator('.movie-card')).toHaveCount(3);
});

test('Google cancellation returns to guest mode and removes callback parameters',async ({ page,context }) => {
  const backend = new DiaryBackend(); backend.cancelGoogle = true; await backend.install(context);
  await page.goto('/'); await openDiary(page);
  await expect(page.getByRole('button',{ name: 'Sign in with Google',exact: true })).toBeEnabled();
  await page.getByRole('button',{ name: 'Sign in with Google',exact: true }).click();
  await expect(page.getByText('Sign-in was cancelled. You can continue as a guest.',{ exact: true })).toBeVisible();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  expect(backend.rows).toEqual([]);
});

test('diary choose, watch date, undo, delete, guest separation and sign-out',async ({ page,context },info) => {
  const backend = new DiaryBackend(); await backend.install(context); await seedMockSession(context,USER_A);
  await page.goto('/'); await openDiary(page); await expect(page.getByText('user-a@example.invalid',{ exact: true })).toBeVisible();
  await page.getByRole('button',{ name: 'Back to picks' }).click(); await complete(page);
  await page.locator('.movie-card').first().getByRole('button',{ name: 'Choose this',exact: true }).click();
  await expect(page.getByText('Saved as Chosen. It has not been marked watched.',{ exact: true })).toBeVisible();
  expect(backend.rows).toHaveLength(1); expect(backend.rows[0].status).toBe('chosen'); expect(backend.rows[0].watched_on).toBeNull();
  await page.locator('.movie-card').first().getByRole('button',{ name: 'Chosen for tonight',exact: true }).click();
  expect(backend.rows).toHaveLength(1);
  const guest = await page.evaluate(key => localStorage.getItem(key),STORAGE_KEY);
  expect(guest).toBeNull();
  await openDiary(page); await expect(page.locator('.diary-row')).toHaveCount(1);
  await page.getByLabel('Viewing date',{ exact: true }).fill('2026-10-12');
  await page.getByRole('button',{ name: 'Mark watched',exact: true }).click();
  await expect(page.getByRole('button',{ name: 'Undo watched',exact: true })).toBeEnabled();
  expect(backend.rows[0].watched_on).toBe('2026-10-12'); expect(backend.rows[0].chosen_at).not.toBeNull();
  await page.getByRole('button',{ name: 'Undo watched',exact: true }).click();
  await expect(page.getByRole('button',{ name: 'Mark watched',exact: true })).toBeEnabled(); expect(backend.rows[0].watched_on).toBeNull();
  await page.screenshot({ path: info.outputPath('private-diary.png'),fullPage: true });
  await page.getByRole('button',{ name: 'Delete entry',exact: true }).click(); await page.getByRole('button',{ name: 'Yes, delete entry',exact: true }).click();
  await expect(page.locator('.diary-row')).toHaveCount(0);
  await page.getByRole('button',{ name: 'Sign out',exact: true }).click();
  await expect(page.getByRole('button',{ name: 'Sign in with Google',exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key),AUTH_STORAGE_KEY)).toBeNull();
  await page.reload(); await openDiary(page); await expect(page.getByRole('button',{ name: 'Sign in with Google',exact: true })).toBeVisible();
  await expect(page.getByText('user-a@example.invalid',{ exact: true })).toHaveCount(0);
});

test('explicit legacy import preserves unknown dates and is duplicate-safe',async ({ page,context }) => {
  const backend = new DiaryBackend(); await backend.install(context); await seedMockSession(context,USER_A);
  const legacy = { schemaVersion: 1,preferences: freshState().preferences,watchedIds: ['fixture-rooftop-radio'],selectedIds: ['fixture-rooftop-radio','fixture-last-tram'],rejectedIds: ['fixture-echo-vault'] };
  await context.addInitScript(({ key,state }) => { if (!localStorage.getItem(key)) localStorage.setItem(key,JSON.stringify(state)); },{ key: STORAGE_KEY,state: legacy });
  await page.goto('/'); await openDiary(page); expect(backend.rows).toHaveLength(0);
  await page.getByRole('button',{ name: 'Import guest history',exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible(); expect(backend.rows).toHaveLength(0);
  await page.getByRole('button',{ name: 'Yes, import guest history',exact: true }).click();
  await expect(page.locator('.diary-row')).toHaveCount(2); expect(backend.rows.every(row => row.chosen_at === null && row.watched_on === null)).toBe(true);
  await page.getByRole('button',{ name: 'Import guest history',exact: true }).click(); await page.getByRole('button',{ name: 'Yes, import guest history',exact: true }).click();
  await expect(page.getByText('0 imported; 2 already recorded.',{ exact: true })).toBeVisible(); expect(backend.rows).toHaveLength(2);
  await page.getByRole('button',{ name: 'Clear private diary',exact: true }).last().click(); await page.getByRole('button',{ name: 'Yes, clear private diary',exact: true }).click();
  await expect(page.locator('.diary-row')).toHaveCount(0);
  const state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!),STORAGE_KEY);
  expect(state.watchedIds).toEqual(legacy.watchedIds); expect(state.selectedIds).toEqual(legacy.selectedIds);
});

test('refresh, cross-device persistence and two-user isolation using synthetic API contracts',async ({ page,context,browser }) => {
  const backend = new DiaryBackend(); await backend.install(context); await seedMockSession(context,USER_A);
  await page.goto('/'); await openDiary(page); await expect(page.getByText('user-a@example.invalid',{ exact: true })).toBeVisible();
  await page.getByRole('button',{ name: 'Back to picks' }).click(); await complete(page);
  await page.locator('.movie-card').first().getByRole('button',{ name: 'Choose this',exact: true }).click();
  await expect(page.getByText('Saved as Chosen. It has not been marked watched.',{ exact: true })).toBeVisible();
  await page.reload(); await openDiary(page); await expect(page.locator('.diary-row')).toHaveCount(1);
  for (const [owner,expected] of [[USER_A,1],[USER_B,0]] as const) {
    const device = await browser.newContext();
    try { await backend.install(device); await seedMockSession(device,owner); const other = await device.newPage(); await other.goto('http://127.0.0.1:4173/'); await openDiary(other); await expect(other.locator('.diary-row')).toHaveCount(expected); }
    finally { await device.close(); }
  }
});

test('Arabic private diary preserves mobile layout',async ({ page,context },info) => {
  const backend = new DiaryBackend(); await backend.install(context); await seedMockSession(context,USER_A);
  await page.goto('/'); await openDiary(page); await expect(page.getByText('user-a@example.invalid',{ exact: true })).toBeVisible();
  await page.getByRole('button',{ name: 'العربية',exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.getByRole('heading',{ name: 'سهرات أفلامي',exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('arabic-private-diary.png'),fullPage: true });
});

test('watched exclusion defaults on; explicit rewatch keeps the original night',async ({ page,context }) => {
  const backend = new DiaryBackend(); await backend.install(context); await seedMockSession(context,USER_A);
  await page.goto('/'); await openDiary(page);
  await expect(page.getByText('user-a@example.invalid',{ exact: true })).toBeVisible();
  await page.getByRole('button',{ name: 'Back to picks',exact: true }).click(); await complete(page);
  const title = await page.locator('.movie-card').first().getByRole('heading').innerText();
  await page.locator('.movie-card').first().getByRole('button',{ name: 'Choose this',exact: true }).click();
  await expect(page.getByText('Saved as Chosen. It has not been marked watched.',{ exact: true })).toBeVisible();
  await openDiary(page);
  await page.getByRole('button',{ name: 'Mark watched',exact: true }).click();
  await expect(page.getByRole('button',{ name: 'Undo watched',exact: true })).toBeEnabled();
  const watched = { ...backend.rows[0] };
  await page.getByRole('button',{ name: 'Back to picks',exact: true }).click();
  await expect(page.getByRole('checkbox',{ name: 'Allow rewatches',exact: true })).not.toBeChecked();
  await expect(page.locator('.movie-card').getByRole('heading',{ name: title,exact: true })).toHaveCount(0);
  await page.getByRole('checkbox',{ name: 'Allow rewatches',exact: true }).check();
  const rewatch = page.locator('.movie-card').filter({ has: page.getByRole('heading',{ name: title,exact: true }) });
  await rewatch.getByRole('button',{ name: 'Choose this',exact: true }).click();
  await expect(page.getByText('Saved as Chosen. It has not been marked watched.',{ exact: true })).toBeVisible();
  expect(backend.rows).toHaveLength(2);
  expect(backend.rows.find(row => row.id === watched.id)).toEqual(watched);
  expect(backend.rows.filter(row => row.status === 'chosen')).toHaveLength(1);
  await page.reload(); await openDiary(page);
  await expect(page.locator('.diary-row')).toHaveCount(2);
  await page.getByRole('button',{ name: 'Back to picks',exact: true }).click(); await complete(page);
  await expect(page.getByRole('checkbox',{ name: 'Allow rewatches',exact: true })).not.toBeChecked();
  await expect(page.locator('.movie-card').getByRole('heading',{ name: title,exact: true })).toHaveCount(0);
});
