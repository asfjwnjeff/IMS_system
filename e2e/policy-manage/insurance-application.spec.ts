import { test, expect } from '@playwright/test';

test.describe('投保申请表 — 列表页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/policyManage/insuranceapplication');
  });

  test('页面标题和核心元素渲染', async ({ page }) => {
    await expect(page.getByText('投保申请表').first()).toBeVisible();
    // 搜索区域
    await expect(page.getByText('业务参考号').first()).toBeVisible();
    // 表格存在
    await expect(page.locator('table')).toBeVisible();
    // Segmented 版本切换
    await expect(page.getByText('当前有效')).toBeVisible();
    await expect(page.getByText('全部记录')).toBeVisible();
  });

  test('"当前有效" Tab：只显示最新版本', async ({ page }) => {
    // 默认在"当前有效"
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    // 当前有效应 ≤ 总记录数
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(7);

    // 不应出现"历史版本"标签
    await expect(page.getByText('历史版本')).toHaveCount(0);
  });

  test('"全部记录" Tab：显示历史版本标签', async ({ page }) => {
    await page.getByText('全部记录').click();
    // 历史版本记录应该有灰色标签
    await expect(page.getByText('历史版本').first()).toBeVisible();
  });

  test('"更多"操作按钮对每条记录可用', async ({ page }) => {
    const moreButtons = page.getByText('更多').first();
    await expect(moreButtons).toBeVisible();
    await moreButtons.click();
    // 下拉菜单应出现
    await expect(page.locator('.ant-dropdown')).toBeVisible();
  });

  test('点击业务参考号跳转详情页', async ({ page }) => {
    // 取第一条记录的业务参考号链接
    const firstLink = page.locator('table tbody tr a').first();
    await expect(firstLink).toBeVisible();
    await firstLink.click();
    await expect(page).toHaveURL(/insuranceapplicationDetail\/\d/);
  });
});
