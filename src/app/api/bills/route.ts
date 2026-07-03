import { NextRequest, NextResponse } from 'next/server';
import { getDb, getRawDb, saveDb } from '@/db';

// 辅助：驼峰 → 下划线映射
const FIELD_MAP: Record<string, string> = {
  applicationId: 'application_id', billNo: 'bill_no', billAmount: 'bill_amount',
  billStatus: 'bill_status', paymentDeadline: 'payment_deadline', billFiles: 'bill_files',
  paymentDate: 'payment_date', createdAt: 'created_at', updatedAt: 'updated_at',
};

function toRow(obj: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    row[FIELD_MAP[k] || k] = v;
  }
  return row;
}

function fromRow(row: Record<string, unknown>): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  const reverse = Object.fromEntries(Object.entries(FIELD_MAP).map(([k, v]) => [v, k]));
  for (const [k, v] of Object.entries(row)) {
    obj[reverse[k] || k] = v;
  }
  return obj;
}

export async function GET(request: NextRequest) {
  try {
    await getDb();
    const rawDb = getRawDb();
    const { searchParams } = request.nextUrl;
    const applicationId = searchParams.get('applicationId');

    let rows: Array<Record<string, unknown>>;
    if (applicationId) {
      const stmt = rawDb.prepare('SELECT * FROM bills WHERE application_id = ? ORDER BY created_at DESC');
      stmt.bind([applicationId]);
      rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
    } else {
      rows = [];
      const stmt = rawDb.prepare('SELECT * FROM bills ORDER BY created_at DESC');
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
    }

    return NextResponse.json({ success: true, data: rows.map(fromRow) });
  } catch (error) {
    console.error('[API] GET /bills error:', error);
    return NextResponse.json({ success: false, error: '获取账单列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await getDb();
    const rawDb = getRawDb();
    const body = await request.json();
    const now = new Date().toISOString();
    const id = `bill-${Date.now()}`;

    const vals = [
      id,
      body.applicationId || '',
      body.billNo || '',
      Number(body.billAmount) || 0,
      body.billStatus || '待缴费',
      body.paymentDate || '',
      body.remark || '',
      now,
      now,
    ];

    rawDb.run(
      `INSERT INTO bills (id, application_id, bill_no, bill_amount, bill_status, payment_date, remark, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      vals
    );
    saveDb();

    return NextResponse.json({ success: true, data: { id, ...body, createdAt: now, updatedAt: now } }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /bills error:', error);
    return NextResponse.json({ success: false, error: '创建账单失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await getDb();
    const rawDb = getRawDb();
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });

    const now = new Date().toISOString();
    rawDb.run(
      `UPDATE bills SET bill_no=?, bill_amount=?, bill_status=?, payment_date=?, remark=?, updated_at=?
       WHERE id=?`,
      [body.billNo || '', Number(body.billAmount) || 0, body.billStatus || '待缴费', body.paymentDate || '', body.remark || '', now, body.id]
    );
    saveDb();

    return NextResponse.json({ success: true, id: body.id });
  } catch (error) {
    console.error('[API] PUT /bills error:', error);
    return NextResponse.json({ success: false, error: '更新账单失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await getDb();
    const rawDb = getRawDb();
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });

    rawDb.run('DELETE FROM bills WHERE id=?', [id]);
    saveDb();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /bills error:', error);
    return NextResponse.json({ success: false, error: '删除账单失败' }, { status: 500 });
  }
}
