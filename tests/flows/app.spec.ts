import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { freshState, STORAGE_KEY } from '../../src/storage';

async function begin(page: Page) {
  await page.goto('/'); await page.getByRole('button', { name: 'Find tonight’s picks', exact: true }).click();
}
async function complete(page: Page) {
  await begin(page);
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Show my picks', exact: true }).click();
}
async function stored(page: Page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)!),STORAGE_KEY); }
async function seed(page: Page, state: unknown) {
  await page.addInitScript(({ key,state }) => { localStorage.setItem(key,JSON.stringify(state)); },{ key: STORAGE_KEY,state });
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*',route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
});

test('320px landing artwork stays inside the viewport',async ({ page }) => {
  await page.setViewportSize({ width: 320,height: 740 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('button',{ name: 'Find tonight’s picks',exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('complete flow: choose, replace, seen, reload and clear history',async ({ page },info) => {
  const failures: string[] = []; const external: string[] = [];
  page.on('pageerror',error => failures.push(error.message));
  page.on('request',request => { if (new URL(request.url()).hostname !== '127.0.0.1') external.push(request.url()); });
  await complete(page);
  const cards = page.locator('.movie-card');
  await expect(cards).toHaveCount(3);
  await expect(page.getByText('Synthetic demo catalog — these are fictional movies',{ exact: true })).toBeVisible();
  const initialIds = await cards.evaluateAll(elements => elements.map(element => element.getAttribute('data-movie-id')));
  expect(new Set(initialIds).size).toBe(3);
  await cards.nth(0).getByRole('button',{ name: 'Choose this',exact: true }).click();
  expect((await stored(page)).selectedIds).toContain(initialIds[0]);
  expect((await stored(page)).watchedIds).toEqual([]);
  await cards.nth(1).getByRole('button',{ name: 'Replace',exact: true }).click();
  const replacedIds = await cards.evaluateAll(elements => elements.map(element => element.getAttribute('data-movie-id')));
  expect(replacedIds[0]).toBe(initialIds[0]); expect(replacedIds[2]).toBe(initialIds[2]); expect(replacedIds[1]).not.toBe(initialIds[1]);
  await expect(cards.nth(1).getByRole('button',{ name: 'Replacement used' })).toBeDisabled();
  await cards.nth(0).getByRole('button',{ name: 'Mark seen',exact: true }).click();
  await expect(cards).toHaveCount(2);
  expect((await stored(page)).watchedIds).toContain(initialIds[0]);
  await page.reload();
  await complete(page);
  const reloadIds = await cards.evaluateAll(elements => elements.map(element => element.getAttribute('data-movie-id')));
  expect(reloadIds).not.toContain(initialIds[0]); expect(reloadIds).not.toContain(initialIds[1]);
  await page.screenshot({ path: info.outputPath('english-results.png'),fullPage: true });
  await page.getByRole('button',{ name: 'Clear history',exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button',{ name: 'Yes, clear history' }).click();
  const cleared = await stored(page); expect(cleared.watchedIds).toEqual([]); expect(cleared.selectedIds).toEqual([]); expect(cleared.rejectedIds).toEqual([]); expect(cleared.preferences.maxRuntimeMinutes).toBe(120);
  expect(external).toEqual([]); expect(failures).toEqual([]);
});

test('back preserves answers, genre choices are bounded and overrun defaults off', async ({ page }) => {
  await begin(page); await page.getByRole('radio',{ name: 'Solo',exact: true }).check();
  await page.getByRole('button',{ name: 'Continue',exact: true }).click();
  for (const genre of ['Comedy','Drama','Mystery']) await page.getByRole('checkbox',{ name: genre,exact: true }).check();
  await expect(page.getByRole('checkbox',{ name: 'Adventure',exact: true })).toBeDisabled();
  await page.getByRole('button',{ name: 'Back',exact: true }).click();
  await expect(page.getByRole('radio',{ name: 'Solo',exact: true })).toBeChecked();
  await page.getByRole('button',{ name: 'Continue',exact: true }).click();
  await expect(page.getByRole('checkbox',{ name: 'Mystery',exact: true })).toBeChecked();
  await page.getByRole('button',{ name: 'Continue',exact: true }).click();
  await expect(page.getByRole('checkbox',{ name: 'Allow up to 10 extra minutes' })).not.toBeChecked();
});

test('unsupported availability gives zero picks until explicit self-check consent', async ({ page }) => {
  await begin(page); for (let i = 0; i < 3; i++) await page.getByRole('button',{ name: 'Continue',exact: true }).click();
  await page.getByRole('radio',{ name: 'Require current service evidence' }).check();
  await expect(page.getByRole('button',{ name: 'Continue',exact: true })).toBeDisabled();
  await page.getByRole('checkbox',{ name: 'Netflix — unsupported' }).check();
  for (let i = 0; i < 2; i++) await page.getByRole('button',{ name: 'Continue',exact: true }).click();
  await page.getByRole('button',{ name: 'Show my picks' }).click();
  await expect(page.locator('.movie-card')).toHaveCount(0);
  await expect(page.getByRole('heading',{ name: 'No honest match tonight.' })).toBeVisible();
  expect((await stored(page)).preferences.availabilityMode).toBe('strict');
  await page.getByRole('button',{ name: 'Continue without availability filtering' }).click();
  await expect(page.locator('.movie-card')).toHaveCount(3);
  expect((await stored(page)).preferences.availabilityMode).toBe('self-check');
});

test('impossible runtime is kept until user applies suggested adjustment',async ({ page }) => {
  const state = freshState(); state.preferences.maxRuntimeMinutes = 30;
  await seed(page,state); await complete(page);
  await expect(page.locator('.movie-card')).toHaveCount(0);
  expect((await stored(page)).preferences.maxRuntimeMinutes).toBe(30);
  await page.getByRole('button',{ name: 'Set the runtime limit to 72 minutes' }).click();
  await expect(page.locator('.movie-card')).toHaveCount(1);
  await expect(page.getByText('Fewer than three picks remain under your filters and history. We have kept your boundaries.',{ exact: true })).toBeVisible();
});

test('Arabic flow, RTL layout and long titles work without horizontal overflow',async ({ page },info) => {
  const state = freshState(); state.preferences.locale = 'ar'; state.preferences.mood = 'wonder'; state.preferences.adventurousness = .9;
  await seed(page,state); await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','ar'); await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await page.getByRole('button',{ name: 'اعثر على اقتراحات الليلة',exact: true }).click();
  for (let i = 0; i < 5; i++) await page.getByRole('button',{ name: 'متابعة',exact: true }).click();
  await page.getByRole('button',{ name: 'عرض اقتراحاتي',exact: true }).click();
  await expect(page.locator('.movie-card')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('heading',{ name: 'قائمة قصيرة لليلتك.' })).toBeVisible();
  await page.screenshot({ path: info.outputPath('arabic-results.png'),fullPage: true });
});

test('corrupt storage recovers and blocked writes remain usable',async ({ page }) => {
  await page.addInitScript(key => { localStorage.setItem(key,'broken'); Object.defineProperty(Storage.prototype,'setItem',{ value: () => { throw new Error('Storage blocked'); } }); },STORAGE_KEY);
  await page.goto('/'); await expect(page.getByText('Unreadable local data was reset. You can continue.',{ exact: true })).toBeVisible();
  await complete(page);
  await page.locator('.movie-card').first().getByRole('button',{ name: 'Choose this',exact: true }).click();
  await expect(page.getByText('Local storage is unavailable. This session works, but changes may not survive a reload.',{ exact: true })).toBeVisible();
  await expect(page.getByRole('button',{ name: 'Chosen for tonight' })).toBeVisible();
});

test('future storage stays untouched',async ({ page }) => {
  await seed(page,{ schemaVersion: 3, sentinel: 'preserve me' }); await complete(page);
  await page.locator('.movie-card').first().getByRole('button',{ name: 'Choose this',exact: true }).click();
  expect(await stored(page)).toEqual({ schemaVersion: 3,sentinel: 'preserve me' });
});

test('keyboard navigation, modal focus and availability disclaimer',async ({ page }) => {
  await page.goto('/'); await expect(page.getByRole('heading',{ name: 'Less searching. More movie night.' })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.getByRole('button',{ name: 'Find tonight’s picks',exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  for (let i = 0; i < 5; i++) { await page.getByRole('button',{ name: 'Continue',exact: true }).focus(); await page.keyboard.press('Enter'); }
  await page.getByRole('button',{ name: 'Show my picks',exact: true }).focus(); await page.keyboard.press('Enter');
  const trigger = page.locator('.movie-card').first().getByRole('button',{ name: 'How to check availability' });
  await trigger.focus(); await page.keyboard.press('Enter'); await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button',{ name: 'Close',exact: true })).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible(); await expect(trigger).toBeFocused();
});

test('loaded app completes recommendations with all networking offline',async ({ page,context }) => {
  await page.goto('/'); await expect(page.getByRole('button',{ name: 'Find tonight’s picks',exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.getByRole('button',{ name: 'Find tonight’s picks',exact: true }).click();
  for (let i = 0; i < 5; i++) await page.getByRole('button',{ name: 'Continue',exact: true }).click();
  await page.getByRole('button',{ name: 'Show my picks',exact: true }).click();
  await expect(page.locator('.movie-card')).toHaveCount(3);
});

test('strict simulated evidence expires while the page stays open',async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-19T23:00:00Z') });
  const state = freshState(); state.preferences.availabilityMode = 'strict'; state.preferences.providerIds = ['demo-lantern'];
  await seed(page,state); await complete(page);
  await expect(page.locator('.movie-card')).toHaveCount(3);
  await expect(page.getByText('Simulated availability only',{ exact: true })).toHaveCount(3);
  await page.clock.fastForward(60 * 60 * 1000);
  await expect(page.locator('.movie-card')).toHaveCount(0);
  expect((await stored(page)).preferences.availabilityMode).toBe('strict');
});

test('explicitly permitting watched titles keeps seen card visible',async ({ page }) => {
  const state = freshState(); state.preferences.excludeWatched = false;
  await seed(page,state); await complete(page);
  await page.locator('.movie-card').first().getByRole('button',{ name: 'Mark seen',exact: true }).click();
  await expect(page.locator('.movie-card')).toHaveCount(3);
  await expect(page.getByRole('button',{ name: 'Marked seen',exact: true })).toBeDisabled();
});

test('replacement exhaustion preserves original and others',async ({ page }) => {
  const state = freshState(); state.preferences.maxRuntimeMinutes = 72;
  await seed(page,state); await complete(page);
  const card = page.locator('.movie-card'); const id = await card.getAttribute('data-movie-id');
  await card.getByRole('button',{ name: 'Replace',exact: true }).click();
  await expect(card).toHaveAttribute('data-movie-id',id!);
  await expect(page.getByText('No eligible replacement remains. Your other picks are kept.',{ exact: true })).toBeVisible();
  expect((await stored(page)).rejectedIds).toEqual([]);
});

test('content and title exclusions are respected in the browser',async ({ page }) => {
  const state = freshState(); state.preferences.excludedContentFlags = ['violence']; state.preferences.excludedMovieIds = ['fixture-rooftop-radio'];
  await seed(page,state); await complete(page);
  const ids = await page.locator('.movie-card').evaluateAll(elements => elements.map(element => element.getAttribute('data-movie-id')));
  for (const id of ['fixture-rooftop-radio','fixture-night-map','fixture-glass-bridge','fixture-second-window','fixture-echo-vault']) expect(ids).not.toContain(id);
});
