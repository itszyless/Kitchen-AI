import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.COOK_PREVIEW_URL || 'http://localhost:8081';
const evidence = path.resolve('../../work/redesign-qa');
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const go = async route => {
  await page.goto(base + '/' + route);
  await page.getByText('Getting your kitchen ready…', { exact: true }).waitFor({ state: 'hidden' });
  await page.evaluate(() => document.fonts.ready);
};
try {
  await go('onboarding');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Continue', exact: true }).isEnabled(), false);
  await page.getByRole('checkbox').click();
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Explore recipes', exact: true }).click();
  await go('review');
  await page.getByLabel('Amount for Cherry tomatoes').fill('300');
  await page.getByRole('button', { name: 'Add 3 items to pantry' }).click();
  await page.getByRole('button', { name: 'Edit Cherry tomatoes' }).click();
  await page.getByRole('button', { name: 'Increase Cherry tomatoes' }).click();
  assert.equal(await page.getByText('325 g', { exact: true }).isVisible(), true);
  await page.getByRole('button', { name: 'Remove Cherry tomatoes' }).click();
  await page.getByRole('button', { name: 'Undo removing Cherry tomatoes' }).click();
  await go('discover');
  await page.getByLabel('Search recipes').fill('pasta');
  assert.equal(await page.getByRole('button', { name: 'Recipe A little sunshine pasta', exact: true }).isVisible(), true);
  await go('recipe/sunshine-pasta');
  await page.getByRole('button', { name: 'Save recipe', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Unsave recipe', exact: true }).isVisible(), true);
  await page.getByRole('button', { name: 'More servings' }).click();
  assert.equal(await page.getByText('3 servings', { exact: true }).isVisible(), true);
  await page.getByRole('button', { name: 'Add missing ingredients to list' }).click();
  await go('shopping');
  await page.getByRole('checkbox').first().click();
  assert.equal(await page.getByRole('checkbox').first().getAttribute('aria-checked'), 'true');
  await go('cook/sunshine-pasta');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByRole('button', { name: /Start .* timer/ }).click();
  assert.equal(await page.getByRole('button', { name: 'Cancel timer' }).isVisible(), true);
  await page.getByRole('button', { name: 'Cancel timer' }).click();
  await page.getByRole('button', { name: 'Previous step', exact: true }).click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByRole('button', { name: 'I’m done — let’s eat', exact: true }).click();
  assert.equal(await page.getByText('You made something good.', { exact: true }).isVisible(), true);
  const routes = ['', 'discover', 'recipe/sunshine-pasta', 'onboarding', 'scan', 'review', 'pantry', 'cook/sunshine-pasta', 'shopping', 'profile', 'add', 'barcode'];
  let checked = 0;
  for (const theme of ['Light', 'Dark']) {
    await go('profile');
    await page.getByRole('button', { name: theme, exact: true }).click();
    for (const viewport of [{ width: 360, height: 780 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
      await page.setViewportSize(viewport);
      for (const route of routes) {
        await go(route);
        await page.waitForTimeout(750);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${theme} ${viewport.width} ${route} overflows`);
        assert.ok((await page.locator('body').innerText()).trim().length > 10, `${route} blank`);
        await page.screenshot({ path: path.join(evidence, `${theme}-${viewport.width}-${(route || 'home').replaceAll('/', '-')}.png`), animations: 'disabled' });
        checked++;
      }
      console.log(`PASS: ${theme} ${viewport.width}px, 12 screens`);
    }
  }
  assert.deepEqual(errors, []);
  console.log(`PASS: core interactions, ${checked} screen/theme/viewport checks, no page errors.`);
} finally { await browser.close(); }
