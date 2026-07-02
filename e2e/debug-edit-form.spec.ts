import { test } from '@playwright/test';

test('check page content and errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`);
  });

  await page.goto('http://localhost:5173/policyManage/insuranceapplicationEdit/5');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Print any errors
  if (errors.length > 0) {
    console.log('=== ERRORS ===');
    errors.forEach(e => console.log(e));
  } else {
    console.log('No page errors');
  }

  // Check body content
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('\nBody HTML length:', bodyHTML.length);
  console.log('Body HTML first 1000 chars:');
  console.log(bodyHTML.substring(0, 1000));

  // Check for input elements
  const allInputs = page.locator('input');
  const allCount = await allInputs.count();
  console.log(`\nTotal inputs (including hidden): ${allCount}`);

  const visibleInputs = page.locator('input:visible');
  const vCount = await visibleInputs.count();
  console.log(`Visible inputs: ${vCount}`);

  // Check for ant-form
  const formEl = page.locator('.ant-form');
  const formCount = await formEl.count();
  console.log(`.ant-form elements: ${formCount}`);

  // Check for ant-card
  const cardEl = page.locator('.ant-card');
  const cardCount = await cardEl.count();
  console.log(`.ant-card elements: ${cardCount}`);
});
