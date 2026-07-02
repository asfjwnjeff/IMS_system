import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/db';
import { historyVersions, approvalHistory, changeLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/history?type=versions|approvals|logs&applicationId=xxx
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') || 'versions';
    const applicationId = searchParams.get('applicationId');

    let rows;
    switch (type) {
      case 'versions':
        rows = applicationId
          ? db.select().from(historyVersions).where(eq(historyVersions.applicationId, applicationId)).all()
          : db.select().from(historyVersions).all();
        break;
      case 'approvals':
        rows = applicationId
          ? db.select().from(approvalHistory).where(eq(approvalHistory.applicationId, applicationId)).all()
          : db.select().from(approvalHistory).all();
        break;
      case 'logs':
        rows = applicationId
          ? db.select().from(changeLogs).where(eq(changeLogs.applicationId, applicationId)).all()
          : db.select().from(changeLogs).all();
        break;
      default:
        return NextResponse.json({ success: false, error: '未知的历史类型' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('[API] GET /history error:', error);
    return NextResponse.json({ success: false, error: '获取历史记录失败' }, { status: 500 });
  }
}

// POST /api/history?type=versions|approvals|logs
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') || 'versions';
    const body = await request.json();

    const id = `hist-${Date.now()}`;
    switch (type) {
      case 'versions':
        db.insert(historyVersions).values({ id, ...body }).run();
        break;
      case 'approvals':
        db.insert(approvalHistory).values({ id, ...body }).run();
        break;
      case 'logs':
        db.insert(changeLogs).values({ id, ...body }).run();
        break;
      default:
        return NextResponse.json({ success: false, error: '未知的历史类型' }, { status: 400 });
    }

    saveDb();
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('[API] POST /history error:', error);
    return NextResponse.json({ success: false, error: '保存历史记录失败' }, { status: 500 });
  }
}
