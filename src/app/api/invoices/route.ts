import { NextRequest, NextResponse } from 'next/server';
import { getDb, getRawDb, saveDb } from '@/db';

const FIELD_MAP: Record<string, string> = {
  applicationId: 'application_id', policyNumber: 'policy_number',
  insuranceCompanyName: 'insurance_company_name',
  invoiceNo: 'invoice_no', invoiceAmount: 'invoice_amount',
  taxRate: 'tax_rate', taxAmount: 'tax_amount',
  policyHolderName: 'policy_holder_name', insuredCompanyName: 'insured_company_name',
  invoiceType: 'invoice_type', invoiceDate: 'invoice_date', invoiceStatus: 'invoice_status',
  invoiceFiles: 'invoice_files',
  createdAt: 'created_at', updatedAt: 'updated_at',
};

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
      const stmt = rawDb.prepare('SELECT * FROM invoices WHERE application_id = ? ORDER BY created_at DESC');
      stmt.bind([applicationId]);
      rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
    } else {
      rows = [];
      const stmt = rawDb.prepare('SELECT * FROM invoices ORDER BY created_at DESC');
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
    }

    return NextResponse.json({ success: true, data: rows.map(fromRow) });
  } catch (error) {
    console.error('[API] GET /invoices error:', error);
    return NextResponse.json({ success: false, error: '获取发票列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await getDb();
    const rawDb = getRawDb();
    const body = await request.json();
    const now = new Date().toISOString();
    const id = `inv-${Date.now()}`;

    rawDb.run(
      `INSERT INTO invoices (id, application_id, invoice_no, invoice_amount, invoice_type, invoice_date, invoice_status, remark, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, body.applicationId || '', body.invoiceNo || '', Number(body.invoiceAmount) || 0,
       body.invoiceType || '增值税普通发票', body.invoiceDate || '', body.invoiceStatus || '已开具',
       body.remark || '', now, now]
    );
    saveDb();

    return NextResponse.json({ success: true, data: { id, ...body, createdAt: now, updatedAt: now } }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /invoices error:', error);
    return NextResponse.json({ success: false, error: '创建发票失败' }, { status: 500 });
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
      `UPDATE invoices SET invoice_no=?, invoice_amount=?, invoice_type=?, invoice_date=?, invoice_status=?, remark=?, updated_at=? WHERE id=?`,
      [body.invoiceNo || '', Number(body.invoiceAmount) || 0, body.invoiceType || '增值税普通发票',
       body.invoiceDate || '', body.invoiceStatus || '已开具', body.remark || '', now, body.id]
    );
    saveDb();

    return NextResponse.json({ success: true, id: body.id });
  } catch (error) {
    console.error('[API] PUT /invoices error:', error);
    return NextResponse.json({ success: false, error: '更新发票失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await getDb();
    const rawDb = getRawDb();
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });

    rawDb.run('DELETE FROM invoices WHERE id=?', [id]);
    saveDb();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /invoices error:', error);
    return NextResponse.json({ success: false, error: '删除发票失败' }, { status: 500 });
  }
}
