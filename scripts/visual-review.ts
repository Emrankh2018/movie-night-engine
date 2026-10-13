import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const output = '.tmp/ui-review';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  for (const sample of [
    { name: 'desktop', width: 1440, height: 1000, locale: 'en' },
    { name: 'mobile', width: 390, height: 844, locale: 'en' },
    { name: 'narrow', width: 320, height: 740, locale: 'en' },
    { name: 'arabic-mobile', width: 390, height: 844, locale: 'ar' },
  ]) {
    const page = await browser.newPage({ viewport: { width: sample.width, height: sample.height } });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await page.goto('http://127.0.0.1:5173/');
    if (sample.locale === 'ar') await page.getByRole('button', { name: 'العربية', exact: true }).click();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${output}/${sample.name}-landing.png`, fullPage: true });
    const overflows: string[] = [];
    async function checkWidth(screen: string) {
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) overflows.push(screen);
    }
    await checkWidth('landing');
    await page.getByRole('button', { name: sample.locale === 'ar' ? 'اعثر على اقتراحات الليلة' : 'Find tonight’s picks', exact: true }).click();
    await page.screenshot({ path: `${output}/${sample.name}-inputs.png`, fullPage: true });
    for (let i = 0; i < 5; i++) {
      await checkWidth(`step-${i + 1}`);
      await page.getByRole('button', { name: sample.locale === 'ar' ? 'متابعة' : 'Continue', exact: true }).click();
    }
    await checkWidth('step-6');
    await page.getByRole('button', { name: sample.locale === 'ar' ? 'عرض اقتراحاتي' : 'Show my picks', exact: true }).click();
    await checkWidth('results');
    await page.screenshot({ path: `${output}/${sample.name}-results.png`, fullPage: true });
    console.log(JSON.stringify({ sample: sample.name, overflows, errors, cards: await page.locator('.movie-card').count() }));
    if (overflows.length || errors.length) process.exitCode = 1;
    await page.close();
  }
} finally { await browser.close(); }
