import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, buildDbData } from '@/db';
import { insuranceApplications } from '@/db/schema';
import { eq, and, like, or } from 'drizzle-orm';

const JSON_COLUMNS = ['applicantInfo', 'transportInfo', 'cargoInfo', 'insuranceInfo', 'backfillInfo', 'correctionInfo'];

// GET /api/applications
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || '';
    const approvalStatus = searchParams.get('approvalStatus') || '';
    const applicationType = searchParams.get('applicationType') || '';
    const viewMode = searchParams.get('viewMode') || 'latest'; // 'latest' | 'all'

    let conditions = [];
    if (viewMode === 'latest') {
      conditions.push(eq(insuranceApplications.isLatest, true));
    }
    if (search) {
      conditions.push(
        or(
          like(insuranceApplications.businessRefNo, `%${search}%`),
          like(insuranceApplications.customerName, `%${search}%`),
          like(insuranceApplications.applicantCompany, `%${search}%`)
        )
      );
    }
    if (approvalStatus) {
      conditions.push(eq(insuranceApplications.approvalStatus, approvalStatus));
    }
    if (applicationType) {
      conditions.push(eq(insuranceApplications.applicationType, applicationType));
    }

    const rows = conditions.length > 0
      ? db.select().from(insuranceApplications).where(and(...conditions)).all()
      : db.select().from(insuranceApplications).all();

    // 解析 JSON 列
    const data = rows.map((row) => {
      const parsed = { ...row };
      for (const col of JSON_COLUMNS) {
        if (typeof parsed[col as keyof typeof parsed] === 'string') {
          try {
            (parsed as Record<string, unknown>)[col] = JSON.parse(parsed[col as keyof typeof parsed] as string);
          } catch { /* keep original */ }
        } else {
          (parsed as Record<string, unknown>)[col] = {};
        }
      }
      return parsed;
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] GET /applications error:', error);
    return NextResponse.json({ success: false, error: '获取投保申请列表失败' }, { status: 500 });
  }
}

// POST /api/applications
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const data = buildDbData(body, true);

    db.insert(insuranceApplications).values(data as typeof insuranceApplications.$inferInsert).run();
    saveDb();

    // 解析返回的 JSON 列
    const result = { ...data };
    for (const col of JSON_COLUMNS) {
      if (typeof result[col] === 'string') {
        try { (result as Record<string, unknown>)[col] = JSON.parse(result[col] as string); } catch {}
      }
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /applications error:', error);
    return NextResponse.json({ success: false, error: '创建投保申请失败' }, { status: 500 });
  }
}

// PUT /api/applications
export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });
    }

    const { id, ...rest } = body;
    const data = buildDbData(rest, false);

    db.update(insuranceApplications).set(data as typeof insuranceApplications.$inferInsert).where(eq(insuranceApplications.id, id)).run();
    saveDb();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[API] PUT /applications error:', error);
    return NextResponse.json({ success: false, error: '更新投保申请失败' }, { status: 500 });
  }
}

// DELETE /api/applications
export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });
    }

    db.delete(insuranceApplications).where(eq(insuranceApplications.id, id)).run();
    saveDb();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /applications error:', error);
    return NextResponse.json({ success: false, error: '删除投保申请失败' }, { status: 500 });
  }
}
