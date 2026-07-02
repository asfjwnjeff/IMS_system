'use client';

import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionHead } from '@/components/SectionHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Descriptions } from '@/components/ui/descriptions';
import { HistoryPanel } from '@/components/HistoryPanel';
import { sections, SECTION_JSON_MAP, type SectionDef } from '@/lib/field-defs';
import { renderReadonlyField } from '@/lib/field-registry';
import type { DescItem } from '@/components/ui/descriptions';
import { ArrowLeft, Pencil } from 'lucide-react';
import type { InsuranceApplication } from '@/lib/types';

const statusColor: Record<string, 'success' | 'warning' | 'secondary' | 'destructive'> = {
  '审批通过': 'success', '审批拒绝': 'destructive', '审批中': 'warning', '已确认': 'success',
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { applications } = useApp();
  const app = useMemo(() => applications.find((a) => a.id === id), [applications, id]);

  if (!app) {
    return <div className="max-w-4xl mx-auto py-12 text-center text-tertiary">投保申请未找到</div>;
  }

  // 版本对比：找到上一个版本
  const prevVersion = app.previousId ? applications.find((a) => a.id === app.previousId) : null;

  function getFieldValue(appData: InsuranceApplication, key: string): unknown {
    const section = SECTION_JSON_MAP[key];
    if (!section || section === 'root') return (appData as unknown as Record<string, unknown>)[key];
    const sectionData = (appData as unknown as Record<string, unknown>)[section] as Record<string, unknown> | undefined;
    return sectionData?.[key];
  }

  function isFieldChanged(key: string): boolean {
    if (!prevVersion) return false;
    return JSON.stringify(getFieldValue(app!, key)) !== JSON.stringify(getFieldValue(prevVersion, key));
  }

  function renderSection(section: SectionDef) {
    const items: DescItem[] = section.fields.map((f) => ({
      label: f.label,
      value: renderReadonlyField(f, getFieldValue(app!, f.key)),
      span: f.span as 1 | 2 | undefined,
    }));
    return (
      <Card key={section.title}>
        <CardHeader><SectionHead title={section.title} /></CardHeader>
        <CardContent>
          <Descriptions items={items} bordered />
        </CardContent>
      </Card>
    );
  }

  // 基本信息单独渲染（包含版本标签）
  const basicInfo = [
    { label: '业务参考号', value: app.businessRefNo },
    { label: '投保类别', value: <Badge variant="outline">{app.insuranceCategory}</Badge> },
    { label: '申请类型', value: <Badge variant="outline">{app.applicationType}</Badge> },
    { label: '审批状态', value: <Badge variant={statusColor[app.approvalStatus] || 'secondary'}>{app.approvalStatus}</Badge> },
    { label: '申请编号', value: app.applicationNo },
    { label: '申请时间', value: app.applicationTime },
    { label: '申请人', value: app.applicantName },
    { label: '生效状态', value: app.effectiveStatus || '-' },
    { label: '回填状态', value: <Badge variant={app.isBackfill === '已经回填' ? 'success' : 'secondary'}>{app.isBackfill || '-'}</Badge> },
    { label: '数据来源', value: app.dataSource },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-lg font-bold">投保单详情</h1>
            <p className="text-sm text-secondary">{app.businessRefNo} · V{app.version} {!app.isLatest && '(历史版本)'}</p>
          </div>
        </div>
        <Button size="sm" onClick={() => router.push(`/policy-manage/applications/${app.id}/edit`)}>
          <Pencil className="w-4 h-4 mr-1" />编辑
        </Button>
      </div>

      {prevVersion && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-warning-light border border-warning/30 rounded-lg text-sm">
          <span className="font-medium text-warning">变更提示：</span>
          以下黄色高亮字段相比 V{prevVersion.version} 有变更
        </div>
      )}

      <Card>
        <CardHeader><SectionHead title="基本信息" /></CardHeader>
        <CardContent><Descriptions items={basicInfo} bordered /></CardContent>
      </Card>

      {sections.slice(1).map(renderSection)}

      <HistoryPanel applicationId={app.id} />
    </div>
  );
}
