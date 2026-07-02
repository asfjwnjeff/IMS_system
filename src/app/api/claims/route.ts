import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, buildDbData } from '@/db';
import { claimReports } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || '';
    const reportStatus = searchParams.get('reportStatus') || '';

    let rows;
    if (search) {
      rows = db.all(
        sql`SELECT * FROM claim_reports WHERE
          (report_no LIKE ${'%' + search + '%'} OR policy_no LIKE ${'%' + search + '%'} OR insured_company LIKE ${'%' + search + '%'})
          ${reportStatus ? sql` AND report_status = ${reportStatus}` : sql``}
        `
      );
    } else if (reportStatus) {
      rows = db.select().from(claimReports).where(eq(claimReports.reportStatus, reportStatus)).all();
    } else {
      rows = db.select().from(claimReports).all();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (rows as Array<any>).map((row: any) => {
      const parsed = { ...row };
      if (typeof parsed.claim_detail === 'string') {
        try { parsed.claimDetail = JSON.parse(parsed.claim_detail as string); } catch { parsed.claimDetail = {}; }
      } else {
        parsed.claimDetail = (parsed as Record<string, unknown>).claimDetail || {};
      }
      // Map snake_case to camelCase
      return {
        ...parsed,
        reportNo: parsed.report_no,
        reportStatus: parsed.report_status,
        reportTime: parsed.report_time,
        applicantName: parsed.applicant_name,
        policyNo: parsed.policy_no,
        insuranceCompany: parsed.insurance_company,
        insuredCompany: parsed.insured_company,
        claimResult: parsed.claim_result,
        createdAt: parsed.created_at,
        updatedAt: parsed.updated_at,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] GET /claims error:', error);
    return NextResponse.json({ success: false, error: '获取报案列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const data = buildDbData(body, true);
    db.insert(claimReports).values(data as typeof claimReports.$inferInsert).run();
    saveDb();

    if (typeof data.claimDetail === 'string') {
      try { (data as Record<string, unknown>).claimDetail = JSON.parse(data.claimDetail as string); } catch {}
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /claims error:', error);
    return NextResponse.json({ success: false, error: '创建报案记录失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });
    const { id, ...rest } = body;
    const data = buildDbData(rest, false);
    db.update(claimReports).set(data as typeof claimReports.$inferInsert).where(eq(claimReports.id, id)).run();
    saveDb();
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[API] PUT /claims error:', error);
    return NextResponse.json({ success: false, error: '更新报案记录失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });
    db.delete(claimReports).where(eq(claimReports.id, id)).run();
    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /claims error:', error);
    return NextResponse.json({ success: false, error: '删除报案记录失败' }, { status: 500 });
  }
}
