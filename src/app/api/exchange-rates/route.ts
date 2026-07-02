import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, buildDbData } from '@/db';
import { exchangeRates } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();
    const rows = db.select().from(exchangeRates).all();
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('[API] GET /exchange-rates error:', error);
    return NextResponse.json({ success: false, error: '获取汇率配置失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const data = buildDbData(body, true);
    db.insert(exchangeRates).values(data as typeof exchangeRates.$inferInsert).run();
    saveDb();
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /exchange-rates error:', error);
    return NextResponse.json({ success: false, error: '创建汇率配置失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });
    const { id, ...rest } = body;
    const data = buildDbData(rest, false);
    db.update(exchangeRates).set(data as typeof exchangeRates.$inferInsert).where(eq(exchangeRates.id, id)).run();
    saveDb();
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[API] PUT /exchange-rates error:', error);
    return NextResponse.json({ success: false, error: '更新汇率配置失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });
    db.delete(exchangeRates).where(eq(exchangeRates.id, id)).run();
    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /exchange-rates error:', error);
    return NextResponse.json({ success: false, error: '删除汇率配置失败' }, { status: 500 });
  }
}
