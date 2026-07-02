import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { insuranceApplications } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/export?type=applications
export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type') || 'applications';

    if (type === 'applications') {
      const db = await getDb();
      const rows = db.select().from(insuranceApplications).where(
        // 只导出最新版本
        eq(insuranceApplications.isLatest, true)
      ).all();

      // 转换为扁平格式（展开 JSON 列）
      const flatData = rows.map((row) => {
        const flat: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(row)) {
          if (['applicantInfo', 'transportInfo', 'cargoInfo', 'insuranceInfo', 'backfillInfo', 'correctionInfo'].includes(key)) {
            try {
              const parsed = typeof value === 'string' ? JSON.parse(value) : value;
              Object.assign(flat, parsed);
            } catch { /* skip */ }
          } else {
            flat[key] = value;
          }
        }
        return flat;
      });

      // 动态 import xlsx
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(flatData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '投保申请');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="applications.xlsx"',
        },
      });
    }

    return NextResponse.json({ success: false, error: '不支持的导出类型' }, { status: 400 });
  } catch (error) {
    console.error('[API] GET /export error:', error);
    return NextResponse.json({ success: false, error: '导出失败' }, { status: 500 });
  }
}
