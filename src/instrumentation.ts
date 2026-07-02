/**
 * Next.js 服务启动钩子 — 自动初始化数据库
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { autoMigrate } = await import('@/db/seed');
    const { startAutoSave } = await import('@/db/index');
    await autoMigrate();
    startAutoSave(5000);
    console.log('[IMS DB] Database initialized and auto-save started');
  }
}
