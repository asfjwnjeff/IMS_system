import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/', expectedHeading: 'IMS保险管理系统' },
  { path: '/policyManage/insuranceapplication', expectedText: '投保申请表' },
  { path: '/policyManage/insuranceapplicationDetail/1', expectedText: '投保单详情' },
  { path: '/policyManage/insuranceapplicationEdit/1', expectedText: '编辑投保单' },
  { path: '/base/premiumexchangerateallocation', expectedText: '保费汇率配置' },
  { path: '/base/detailsoftheinsurancerateconfiguration', expectedText: '保费费率配置' },
  { path: '/claimsManage/reportClaims', expectedText: '报案理赔管理' },
];

for (const { path, expectedHeading, expectedText } of PAGES) {
  test(`${path} → 页面正常加载`, async ({ page }) => {
    await page.goto(path);

    if (expectedHeading) {
      await expect(page.locator('h1')).toBeVisible();
    }
    if (expectedText) {
      await expect(page.getByText(expectedText).first()).toBeVisible({ timeout: 10_000 });
    }

    // 无控制台错误
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });
}
