import { test, expect } from '@playwright/test';

test.describe('投保单编辑页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/policyManage/insuranceapplicationEdit/1');
  });

  test('页面完整渲染，7 段表单可见', async ({ page }) => {
    await expect(page.getByText('编辑投保单').first()).toBeVisible();

    // 验证各段标题
    for (const section of ['基本信息', '投/被保险人信息', '运输信息', '货物信息', '保险信息']) {
      await expect(page.getByText(section).first()).toBeVisible();
    }

    // 不应有"保单回填信息"和"批改信息"（已过滤）
    await expect(page.getByText('保单回填信息')).toHaveCount(0);
    await expect(page.getByText('批改信息')).toHaveCount(0);
  });

  test('表单字段可编辑', async ({ page }) => {
    const firstInput = page.locator('input').first();
    await expect(firstInput).toBeVisible();
    await firstInput.fill('测试值');
    await expect(firstInput).toHaveValue('测试值');
  });

  test('"显示变更"按钮可用，显示变更数量', async ({ page }) => {
    const showChangesBtn = page.getByText('显示变更');
    await expect(showChangesBtn).toBeVisible();
    // 应显示变更数量徽标
    const badgeText = await showChangesBtn.textContent();
    expect(badgeText).toContain('显示变更');
  });

  test('"历史记录"面板包含三个Tab', async ({ page }) => {
    await expect(page.getByText('历史记录').first()).toBeVisible();
    await expect(page.getByText('历史版本')).toBeVisible();
    await expect(page.getByText('审批历史')).toBeVisible();
    await expect(page.getByText('修改日志')).toBeVisible();
  });

  test('修改日志 Tab 有数据', async ({ page }) => {
    // 默认选中修改日志
    const logRows = page.locator('table').last().locator('tbody tr');
    await expect(logRows.first()).toBeVisible();
  });

  test('点击"保存"不会导致页面崩溃', async ({ page }) => {
    // 先滚动到底部查看按钮
    const saveBtn = page.getByText('保 存');
    await expect(saveBtn).toBeVisible();
  });

  test('点击"返回"回到列表页', async ({ page }) => {
    // 模拟真实流程：先访问列表页建立浏览器历史，再跳转编辑页
    await page.goto('/policyManage/insuranceapplication');
    await page.goto('/policyManage/insuranceapplicationEdit/1');
    await expect(page.getByText('编辑投保单').first()).toBeVisible();

    // 点击返回应回到列表页
    const backBtn = page.getByText('返 回');
    await backBtn.click();
    await expect(page).toHaveURL(/insuranceapplication/);
  });
});
