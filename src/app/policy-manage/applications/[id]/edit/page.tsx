'use client';

import { use, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionHead } from '@/components/SectionHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HistoryPanel } from '@/components/HistoryPanel';
import { sections, SECTION_JSON_MAP, type SectionDef, type FieldDef } from '@/lib/field-defs';
import { toast } from 'sonner';
import { ArrowLeft, Save, ArrowLeftRight } from 'lucide-react';
import type { InsuranceApplication, HistoryVersion } from '@/lib/types';
import { cn } from '@/lib/utils';

// 5段编辑（排除保单回填和批改信息）
const editSections = sections.filter((s) => s.title !== '保单回填信息' && s.title !== '批改信息');

// ===== Select 下拉选项 =====
const selectOptions: Record<string, string[]> = {
  insuranceCategory: ['非保入库', '保税返库', '进境申报入库', '实物出库'],
  insuredAddressCountryCode: ['国内(Domestic)', '国际(International)'],
  insuredAddressCountry: ['中国', '美国', '日本'],
  insuredAddressProvince: ['上海市', '广东省', '辽宁省', '安徽省', '北京市', '江苏省', '浙江省'],
  insuranceProductType: ['进口运输险', '国内运输险'],
  transportMode: ['航空运输', '水路运输', '公路运输'],
  isContainer: ['是', '否'],
  carriageType: ['普通集装箱', '其他'],
  specialTransportRequirement: ['无'],
  transitPort: ['广州白云国际机场（中国）', '上海浦东国际机场（中国）', '深圳宝安国际机场（中国）'],
  originCountryCode: ['国际(International)', '国内(Domestic)'],
  originCountry: ['美国', '中国'],
  originProvince: ['加利福尼亚州', '德克萨斯州', '辽宁省', '上海市'],
  destCountryCode: ['国际(International)', '国内(Domestic)'],
  destCountry: ['中国'],
  destProvince: ['上海市', '广东省', '辽宁省', '北京市'],
  packageType: ['木制或竹藤等植物性材料制盒/箱', '纸制或纤维板制盒/箱', '天然木托', '球状罐类', '普通集装箱', '其他'],
  goodsNature: ['新货', '旧货'],
  currencyName: ['人民币', '美元', '欧元', '日元', '港元', '英镑', '马来西亚林吉特'],
  markupRatio: ['发票金额原值100%', '发票金额原值110%'],
  compensationCountryCode: ['国际(International)', '国内(Domestic)'],
  compensationCountry: ['中国'],
  compensationProvince: ['广东省', '上海市', '辽宁省', '安徽省'],
};

type SectionValues = Record<string, Record<string, unknown>>;

export default function ApplicationEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { applications, dispatch } = useApp();
  const app = useMemo(() => applications.find((a) => a.id === id), [applications, id]);
  const [showChanges, setShowChanges] = useState(false);
  const [editValues, setEditValues] = useState<SectionValues>({});
  const [rootValues, setRootValues] = useState<Record<string, unknown>>({});
  const [versions, setVersions] = useState<HistoryVersion[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [dictOptions, setDictOptions] = useState<Record<string, string[]>>({});

  // 加载历史版本
  useEffect(() => {
    fetch(`/api/history?type=versions&applicationId=${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setVersions(d.data); })
      .catch(() => {});
  }, [id]);

  // 加载字典选项
  useEffect(() => {
    const types = new Set<string>();
    for (const s of sections) for (const f of s.fields) if (f.dictType) types.add(f.dictType);
    types.forEach((type) => {
      fetch(`/api/dict?type=${type}`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setDictOptions((prev) => ({ ...prev, [type]: d.data })); })
        .catch(() => {});
    });
  }, []);

  // 初始化编辑值
  useEffect(() => {
    if (!app) return;
    setRootValues({
      businessRefNo: app.businessRefNo,
      insuranceCategory: app.insuranceCategory,
    });
    const sv: SectionValues = {};
    for (const sec of ['applicantInfo', 'transportInfo', 'cargoInfo', 'insuranceInfo', 'backfillInfo', 'correctionInfo']) {
      sv[sec] = (app as unknown as Record<string, unknown>)[sec] as Record<string, unknown> || {};
    }
    setEditValues(sv);
  }, [app]);

  if (!app) return <div className="max-w-4xl mx-auto py-12 text-center text-tertiary">投保申请未找到</div>;

  const compareVersion: HistoryVersion | null = versions.length > 0 ? versions[versions.length - 1] : null;

  function getSectionKey(fieldKey: string): string { return SECTION_JSON_MAP[fieldKey] || 'root'; }
  function getFieldValue(sk: string, key: string): unknown { return sk === 'root' ? rootValues[key] : editValues[sk]?.[key]; }
  function setFieldValue(sk: string, key: string, value: unknown) {
    if (sk === 'root') setRootValues((prev) => ({ ...prev, [key]: value }));
    else setEditValues((prev) => ({ ...prev, [sk]: { ...(prev[sk] || {}), [key]: value } }));
    setDirty(true);
  }

  function getPrevVal(sk: string, key: string): string {
    if (!compareVersion) return '';
    try {
      const data = typeof compareVersion.data === 'string' ? JSON.parse(compareVersion.data) : compareVersion.data;
      const val = (data as Record<string, unknown>)[key];
      return val == null || val === '' ? '（空）' : String(val);
    } catch { return ''; }
  }

  function isChanged(sk: string, key: string): boolean {
    if (!showChanges || !compareVersion) return false;
    try {
      const data = typeof compareVersion.data === 'string' ? JSON.parse(compareVersion.data) : compareVersion.data;
      const prev = (data as Record<string, unknown>)[key];
      const curr = getFieldValue(sk, key);
      return JSON.stringify(prev) !== JSON.stringify(curr);
    } catch { return false; }
  }

  const changedCount = compareVersion ? editSections.reduce((c, s) => c + s.fields.filter((f) => isChanged(getSectionKey(f.key), f.key)).length, 0) : 0;

  async function handleSave() {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { id: app!.id, ...rootValues };
      for (const [sec, vals] of Object.entries(editValues)) body[sec] = vals;
      const res = await fetch('/api/applications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        const updated = { ...app!, ...rootValues } as unknown as InsuranceApplication;
        for (const [sec, vals] of Object.entries(editValues)) (updated as unknown as Record<string, unknown>)[sec] = vals;
        dispatch({ type: 'UPDATE_APPLICATION', application: updated });
        toast.success('保存成功'); setDirty(false); router.push(`/policy-manage/applications/${id}`);
      }
    } catch { toast.error('保存失败'); }
    finally { setSaving(false); }
  }

  function renderEditField(f: FieldDef, sk: string) {
    const value = getFieldValue(sk, f.key);
    const changed = isChanged(sk, f.key);
    const opts = f.dictType ? dictOptions[f.dictType] : selectOptions[f.key];

    let control: React.ReactNode;
    if (f.type === 'select') {
      control = (
        <Select value={String(value ?? '')} onValueChange={(v) => setFieldValue(sk, f.key, v)}>
          <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
          <SelectContent>
            {opts?.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    } else if (f.type === 'number') {
      control = <Input type="number" value={value == null ? '' : String(value)} onChange={(e) => setFieldValue(sk, f.key, e.target.value === '' ? undefined : Number(e.target.value))} />;
    } else if (f.type === 'date') {
      control = <Input type="date" value={value == null ? '' : String(value)} onChange={(e) => setFieldValue(sk, f.key, e.target.value)} />;
    } else if (f.type === 'textarea') {
      control = <Textarea value={value == null ? '' : String(value)} onChange={(e) => setFieldValue(sk, f.key, e.target.value)} rows={2} />;
    } else if (f.type === 'upload') {
      control = <Input placeholder="点击选择附件" readOnly className="cursor-pointer" onClick={() => toast.info('文件上传 — 待实现')} />;
    } else {
      control = <Input value={value == null ? '' : String(value)} onChange={(e) => setFieldValue(sk, f.key, e.target.value)} />;
    }

    return (
      <div key={f.key} className={cn(f.span === 2 ? 'col-span-2' : 'col-span-1')}>
        <div className={`mb-1 ${changed ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-md -m-1.5 p-1.5' : ''}`}>
          <label className={`text-sm font-medium block mb-1.5 ${changed ? 'text-yellow-700 dark:text-yellow-400' : ''}`}>
            {changed ? '● ' : ''}{f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}
          </label>
          {control}
          {changed && (
            <div className="text-[11px] text-yellow-700 dark:text-yellow-400 mt-1.5">📋 原值：{getPrevVal(sk, f.key)}</div>
          )}
        </div>
      </div>
    );
  }

  function renderEditSection(section: SectionDef) {
    const sk = getSectionKey(section.fields[0].key);
    return (
      <div key={section.title} className="mb-6">
        <SectionHead title={section.title} />
        <Card className="bg-muted/30 border border-light">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              {section.fields.map((f) => renderEditField(f, sk))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => { if (dirty && !confirm('有未保存的修改，确定离开？')) return; router.back(); }}><ArrowLeft className="w-5 h-5" /></Button>
          <div><h1 className="text-lg font-bold">编辑投保单 — {app.businessRefNo}</h1><p className="text-sm text-secondary">V{app.version}</p></div>
        </div>
        <div className="flex gap-2">
          {compareVersion && (
            <Button variant={showChanges ? 'default' : 'outline'} size="sm"
              onClick={() => setShowChanges(!showChanges)}
              className={showChanges ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-500' : ''}
            >
              <ArrowLeftRight className="w-4 h-4 mr-1" />
              {showChanges ? '隐藏变更' : '显示变更'}
              {!showChanges && changedCount > 0 && <span className="ml-1 text-[11px]">（{changedCount}）</span>}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.back()}>返回</Button>
        </div>
      </div>

      {showChanges && compareVersion && (
        <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 rounded-md text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4" /> 正在对比 <strong>V{compareVersion.version}</strong>，共 <strong>{changedCount}</strong> 处变更
        </div>
      )}

      {editSections.map(renderEditSection)}

      {/* 底部保存/取消 */}
      <div className="text-center pt-6 border-t border-light">
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={handleSave} disabled={saving}><Save className="w-5 h-5 mr-1" />{saving ? '保存中...' : '保存'}</Button>
          <Button size="lg" variant="outline" onClick={() => { if (dirty && !confirm('有未保存的修改，确定离开？')) return; router.back(); }}>取消</Button>
        </div>
      </div>

      <HistoryPanel applicationId={app.id} />
    </div>
  );
}
