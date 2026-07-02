'use client';

import { use, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionHead } from '@/components/SectionHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HistoryPanel } from '@/components/HistoryPanel';
import { sections, SECTION_JSON_MAP, type SectionDef, type FieldDef } from '@/lib/field-defs';
import { ArrowLeft, Pencil, ArrowLeftRight } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import type { InsuranceApplication, HistoryVersion } from '@/lib/types';

const statusTags: Record<string, 'success' | 'warning' | 'secondary' | 'destructive' | 'default' | 'outline'> = {
  '已承保': 'success', '已批改': 'default', '待承保': 'secondary', '待发起': 'secondary',
  '已确认': 'default', '审批通过': 'success', '审批拒绝': 'destructive', '生效': 'success',
  '待审核': 'warning', '草稿': 'secondary', '审批中': 'warning',
};

const statusKeys = ['insurancePolicyStatus', 'insuranceCorrectionStatus', 'approvalStatus', 'documentStatus', 'effectiveStatus'];
const fileKeys = ['insuranceFiles', 'policyFiles', 'correctionFiles'];

function formatVal(v: unknown, key: string): string {
  if (v === undefined || v === null || v === '') return '-';
  if (typeof v === 'number') {
    if (['estimatedPremium', 'actualPremium', 'correctionActualPremium'].includes(key)) return v.toFixed(2);
    return v.toLocaleString();
  }
  if (Array.isArray(v)) return v.length > 0 ? v.join(', ') : '-';
  return String(v);
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { applications, loading } = useApp();
  const [showChanges, setShowChanges] = useState(false);
  const [versions, setVersions] = useState<HistoryVersion[]>([]);

  const app = useMemo(() => applications.find((a) => a.id === id), [applications, id]);

  // 加载历史版本用于对比
  useEffect(() => {
    fetch(`/api/history?type=versions&applicationId=${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data.length > 0) setVersions(d.data); })
      .catch(() => {});
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto py-8"><SkeletonCard /></div>;

  if (!app) {
    return <div className="max-w-4xl mx-auto py-12 text-center text-tertiary">投保申请未找到</div>;
  }

  const rec = app as unknown as Record<string, unknown>;
  const canEdit = app.approvalStatus === '待发起' || app.approvalStatus === '审批拒绝';
  const compareVersion: HistoryVersion | null = versions.length > 0 ? versions[versions.length - 1] : null;

  const isFieldChanged = (key: string): boolean => {
    if (!showChanges || !compareVersion) return false;
    let prev: unknown, curr: unknown;
    try {
      const prevData = typeof compareVersion.data === 'string' ? JSON.parse(compareVersion.data) : compareVersion.data;
      prev = (prevData as Record<string, unknown>)[key];
      curr = getFieldValue(app!, key);
    } catch { return false; }
    return JSON.stringify(prev) !== JSON.stringify(curr);
  };

  const getOldValue = (key: string): string => {
    if (!compareVersion) return '';
    try {
      const prevData = typeof compareVersion.data === 'string' ? JSON.parse(compareVersion.data) : compareVersion.data;
      const val = (prevData as Record<string, unknown>)[key];
      return formatVal(val, key);
    } catch { return ''; }
  };

  const changedCount = compareVersion ? sections.reduce((count, s) => count + s.fields.filter((f) => isFieldChanged(f.key)).length, 0) : 0;

  function renderFieldValue(field: FieldDef) {
    const key = field.key;
    const val = getFieldValue(app!, key);
    const isStatus = statusKeys.includes(key);
    const isFile = fileKeys.includes(key);
    const changed = isFieldChanged(key);

    let display: React.ReactNode;
    if (val === undefined || val === null || val === '') {
      display = <span className="text-tertiary">-</span>;
    } else if (isStatus) {
      display = <Badge variant={statusTags[String(val)] || 'secondary'}>{String(val)}</Badge>;
    } else if (isFile) {
      const files = Array.isArray(val) ? val : [];
      display = files.length > 0 ? <span className="text-sm text-blue-600">{files.join(', ')}</span> : <span className="text-tertiary">暂无附件</span>;
    } else if (typeof val === 'number') {
      if (['estimatedPremium', 'actualPremium', 'correctionActualPremium'].includes(key)) {
        display = <span className="tabular-nums">{val.toFixed(2)}</span>;
      } else {
        display = <span className="tabular-nums">{val.toLocaleString()}</span>;
      }
    } else {
      display = <span>{String(val)}</span>;
    }

    return (
      <div key={key} className={field.span === 2 ? 'col-span-3' : 'col-span-1'}>
        <div className={`mb-2 ${changed ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-md p-1.5' : ''}`}>
          <div className={`text-xs mb-1 ${changed ? 'text-yellow-700 dark:text-yellow-400 font-semibold' : 'text-tertiary'}`}>
            {changed ? '● ' : ''}{field.label}
          </div>
          <div className="text-sm min-h-[22px] break-all">{display}</div>
          {changed && (
            <div className="text-[11px] text-yellow-700 dark:text-yellow-400 mt-1">
              📋 原值：{getOldValue(key)}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderSection(section: SectionDef) {
    return (
      <div key={section.title} className="mb-6">
        <SectionHead title={section.title} />
        <Card className="bg-muted/30 border border-light">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-0">
              {section.fields.map(renderFieldValue)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* 顶栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-lg font-bold">投保单详情 — {app.businessRefNo}</h1>
            <p className="text-sm text-secondary">V{app.version} {!app.isLatest && '(历史版本)'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {compareVersion && (
            <Button variant={showChanges ? 'default' : 'outline'} size="sm"
              onClick={() => setShowChanges(!showChanges)}
              className={showChanges ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-500' : ''}
            >
              <ArrowLeftRight className="w-4 h-4 mr-1" />
              {showChanges ? '隐藏变更' : '显示变更'}
              {!showChanges && changedCount > 0 && (
                <span className="ml-1 text-[11px]">（{changedCount}）</span>
              )}
            </Button>
          )}
          {canEdit && (
            <Button size="sm" onClick={() => router.push(`/policy-manage/applications/${app.id}/edit`)}>
              <Pencil className="w-4 h-4 mr-1" />编辑
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.back()}>返回</Button>
        </div>
      </div>

      {/* 变更提示条 */}
      {showChanges && compareVersion && (
        <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4" />
          正在对比当前版本与 <strong>V{compareVersion.version}（{compareVersion.label}）</strong>，共 <strong>{changedCount}</strong> 处变更，黄色高亮字段为已变更项
        </div>
      )}

      {/* 7个段落 */}
      {sections.map(renderSection)}

      {/* 历史记录面板 */}
      <HistoryPanel applicationId={app.id} />
    </div>
  );
}

// 获取字段值
function getFieldValue(app: InsuranceApplication, key: string): unknown {
  const section = SECTION_JSON_MAP[key];
  if (!section || section === 'root') return (app as unknown as Record<string, unknown>)[key];
  const sectionData = (app as unknown as Record<string, unknown>)[section] as Record<string, unknown> | undefined;
  return sectionData?.[key];
}
