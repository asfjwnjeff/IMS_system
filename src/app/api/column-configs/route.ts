import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/db';
import { columnConfigs } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/column-configs?key=ims_table_columns
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const key = request.nextUrl.searchParams.get('key');
    if (!key) return NextResponse.json({ success: false, error: '缺少 key' }, { status: 400 });

    const rows = db.select().from(columnConfigs).where(eq(columnConfigs.configKey, key)).all();
    return NextResponse.json({
      success: true,
      data: rows.length > 0 ? JSON.parse(rows[0].configData) : null,
    });
  } catch (error) {
    console.error('[API] GET /column-configs error:', error);
    return NextResponse.json({ success: false, error: '获取列配置失败' }, { status: 500 });
  }
}

// POST /api/column-configs
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { configKey, configData } = body;

    // upsert
    const existing = db.select().from(columnConfigs).where(eq(columnConfigs.configKey, configKey)).all();
    if (existing.length > 0) {
      db.update(columnConfigs)
        .set({ configData: JSON.stringify(configData), updatedAt: new Date().toISOString() })
        .where(eq(columnConfigs.id, existing[0].id))
        .run();
    } else {
      db.insert(columnConfigs).values({
        id: `colcfg-${Date.now()}`,
        configKey,
        configData: JSON.stringify(configData),
        updatedAt: new Date().toISOString(),
      }).run();
    }

    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] POST /column-configs error:', error);
    return NextResponse.json({ success: false, error: '保存列配置失败' }, { status: 500 });
  }
}
