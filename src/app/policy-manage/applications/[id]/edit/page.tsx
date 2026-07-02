'use client';

import { use, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionHead } from '@/components/SectionHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HistoryPanel } from '@/components/HistoryPanel';
import { sections, SECTION_JSON_MAP, type SectionDef, type FieldDef } from '@/lib/field-defs';
import { renderReadonlyField, renderEditField } from '@/lib/field-registry';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import type { InsuranceApplication } from '@/lib/types';
import { cn } from '@/lib/utils';

type SectionValueMap = Record<string, Record<string, unknown>>;

export default function ApplicationEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { applications, dispatch } = useApp();
  const app = useMemo(() => applications.find((a) => a.id === id), [applications, id]);

  // 编辑状态: 按 JSON 段落组织
  const [editValues, setEditValues] = useState<SectionValueMap>({});
  const [rootValues, setRootValues] = useState<Record<string, unknown>>({});
  const [dictOptions, setDictOptions] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const prevVersion = app?.previousId ? applications.find((a) => a.id === app.previousId) : null;

  // 初始化编辑值
  useEffect(() => {
    if (!app) return;
    setRootValues({
      businessRefNo: app.businessRefNo,
      insuranceCategory: app.insuranceCategory,
    });
    const sectionValues: SectionValueMap = {};
    const jsonSections = ['applicantInfo', 'transportInfo', 'cargoInfo', 'insuranceInfo', 'backfillInfo', 'correctionInfo'];
    for (const sec of jsonSections) {
      sectionValues[sec] = (app as unknown as Record<string, unknown>)[sec] as Record<string, unknown> || {};
    }
    setEditValues(sectionValues);
  }, [app]);

  // 加载字典选项
  useEffect(() => {
    const dictTypes = new Set<string>();
    for (const s of sections) {
      for (const f of s.fields) {
        if (f.dictType) dictTypes.add(f.dictType);
      }
    }
    dictTypes.forEach(async (type) => {
      try {
        const res = await fetch(`/api/dict?type=${type}`);
        const data = await res.json();
        if (data.success) {
          setDictOptions((prev) => ({ ...prev, [type]: data.data as string[] }));
        }
      } catch { /* ignore */ }
    });
  }, []);

  function getFieldValue(sectionKey: string, key: string): unknown {
    if (sectionKey === 'root') return rootValues[key];
    return editValues[sectionKey]?.[key];
  }

  function setFieldValue(sectionKey: string, key: string, value: unknown) {
    if (sectionKey === 'root') {
      setRootValues((prev) => ({ ...prev, [key]: value }));
    } else {
      setEditValues((prev) => ({
        ...prev,
        [sectionKey]: { ...(prev[sectionKey] || {}), [key]: value },
      }));
    }
    setDirty(true);
  }

  function getPrevValue(sectionKey: string, key: string): unknown {
    if (!prevVersion) return undefined;
    if (sectionKey === 'root') return (prevVersion as unknown as Record<string, unknown>)[key];
    const sectionData = (prevVersion as unknown as Record<string, unknown>)[sectionKey] as Record<string, unknown> | undefined;
    return sectionData?.[key];
  }

  function isChanged(sectionKey: string, key: string): boolean {
    if (!prevVersion) return false;
    const current = JSON.stringify(getFieldValue(sectionKey, key));
    const prev = JSON.stringify(getPrevValue(sectionKey, key));
    return current !== prev;
  }

  async function handleSave() {
    setSaving(true);
    try {
      // 组装完整数据
      const body: Record<string, unknown> = {
        id: app!.id,
        ...rootValues,
      };
      for (const [sec, vals] of Object.entries(editValues)) {
        body[sec] = vals;
      }

      const res = await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        // 重建 application 对象
        const updated: InsuranceApplication = { ...app!, ...rootValues } as unknown as InsuranceApplication;
        for (const [sec, vals] of Object.entries(editValues)) {
          (updated as unknown as Record<string, unknown>)[sec] = vals;
        }
        dispatch({ type: 'UPDATE_APPLICATION', application: updated });
        toast.success('保存成功');
        setDirty(false);
        router.push(`/policy-manage/applications/${id}`);
      }
    } catch {
      toast.error('保存失败');
    }
    finally { setSaving(false); }
  }

  function renderField(f: FieldDef, sectionKey: string) {
    const value = getFieldValue(sectionKey, f.key);
    const changed = isChanged(sectionKey, f.key);
    const prevVal = changed ? getPrevValue(sectionKey, f.key) : undefined;

    return (
      <div key={f.key} className={cn(f.span === 2 && 'col-span-2')}>
        <label className="text-sm font-medium block mb-1.5">{f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}</label>
        {renderEditField(f, {
          value,
          onChange: (v) => setFieldValue(sectionKey, f.key, v),
          disabled: false,
          options: f.dictType ? dictOptions[f.dictType] : (f.options as string[] | undefined),
          label: f.label,
        })}
        {changed && prevVal !== undefined && (
          <div className="mt-1 text-xs text-warning bg-warning-light px-2 py-0.5 rounded">原值: {String(prevVal)}</div>
        )}
      </div>
    );
  }

  function renderEditSection(section: SectionDef) {
    // 确定此 section 对应的 JSON 段落
    const sampleField = section.fields[0];
    const sectionKey = SECTION_JSON_MAP[sampleField.key] || 'root';

    return (
      <Card key={section.title}>
        <CardHeader><SectionHead title={section.title} /></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {section.fields.map((f) => renderField(f, sectionKey))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!app) {
    return <div className="max-w-4xl mx-auto py-12 text-center text-tertiary">投保申请未找到</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => {
            if (dirty && !confirm('有未保存的修改，确定离开？')) return;
            router.back();
          }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">编辑投保单</h1>
            <p className="text-sm text-secondary">{app.businessRefNo} · V{app.version}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-1" />{saving ? '保存中...' : '保存'}
        </Button>
      </div>

      {prevVersion && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-warning-light border border-warning/30 rounded-lg text-sm">
          <span className="font-medium text-warning">变更对比：</span>
          黄色高亮字段相比 V{prevVersion.version} 有变更，每个字段下方显示原值
        </div>
      )}

      {sections.map(renderEditSection)}

      <HistoryPanel applicationId={app.id} />
    </div>
  );
}
