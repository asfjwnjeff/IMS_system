import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, buildDbData } from '@/db';
import { insuranceRates } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();
    const rows = db.select().from(insuranceRates).all();
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('[API] GET /insurance-rates error:', error);
    return NextResponse.json({ success: false, error: '获取费率配置失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const data = buildDbData(body, true);
    db.insert(insuranceRates).values(data as typeof insuranceRates.$inferInsert).run();
    saveDb();
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /insurance-rates error:', error);
    return NextResponse.json({ success: false, error: '创建费率配置失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();

    // 批量更新状态
    if (body.ids && body.status) {
      db.update(insuranceRates)
        .set({ status: body.status })
        .where(inArray(insuranceRates.id, body.ids))
        .run();
      saveDb();
      return NextResponse.json({ success: true });
    }

    // 单条更新
    if (!body.id) return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });
    const { id, ...rest } = body;
    const data = buildDbData(rest, false);
    db.update(insuranceRates).set(data as typeof insuranceRates.$inferInsert).where(eq(insuranceRates.id, id)).run();
    saveDb();
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[API] PUT /insurance-rates error:', error);
    return NextResponse.json({ success: false, error: '更新费率配置失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });
    db.delete(insuranceRates).where(eq(insuranceRates.id, id)).run();
    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /insurance-rates error:', error);
    return NextResponse.json({ success: false, error: '删除费率配置失败' }, { status: 500 });
  }
}
