'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHead } from '@/components/SectionHead';
import { toast } from 'sonner';
import { useApp } from '@/lib/store';
import type { ClaimReport, ClaimDetail } from '@/lib/types';

const emptyDetail: ClaimDetail = {
  applicantDept: '', billNo: '', businessRefNo: '',
  originCountryCode: '', originCountry: '', originProvince: '', originCity: '', originDistrict: '', originAddress: '',
  consigneeName: '', destCountryCode: '', destCountry: '', destProvince: '', destCity: '', destDistrict: '', destAddress: '',
  goodsName: '', cargoQuantity: 0, packageType2: '', estimatedLossAmount: 0, lossCurrency: '',
  accidentTime: '', accidentCountryCode: '', accidentCountry: '', accidentProvince: '', accidentCity: '', accidentDistrict: '', accidentAddress: '',
  accidentDescription: '', accidentFiles: [], claimResultDetail: '', claimAmount: 0, claimFiles: [],
};

export default function ClaimAddPage() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [form, setForm] = useState({ reportNo: '', policyNo: '', insuranceCompany: '中国人保', insuredCompany: '', reportTime: new Date().toISOString().slice(0, 16), applicantName: '', claimDetail: emptyDetail });
  const [saving, setSaving] = useState(false);

  function updateDetail(field: keyof ClaimDetail, value: unknown) {
    setForm({ ...form, claimDetail: { ...form.claimDetail, [field]: value } });
  }

  async function handleSubmit() {
    if (!form.reportNo || !form.policyNo || !form.insuredCompany) { toast.error('请填写必填信息'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/claims', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, reportStatus: '待审批', claimResult: '' }) });
      const data = await res.json();
      if (data.success) {
        dispatch({ type: 'ADD_CLAIM', claim: { ...form, id: data.data.id, reportStatus: '待审批', claimResult: '', createdAt: '', updatedAt: '' } as ClaimReport });
        toast.success('报案提交成功');
        router.push('/claims/reports');
      }
    } catch { toast.error('提交失败'); }
    finally { setSaving(false); }
  }

  const detailFields: Array<{ key: keyof ClaimDetail; label: string; span?: number }> = [
    { key: 'businessRefNo', label: '业务参考号' }, { key: 'applicantDept', label: '申请部门' }, { key: 'billNo', label: '提运单号' },
    { key: 'originCountry', label: '起运国家' }, { key: 'originProvince', label: '起运省' }, { key: 'originCity', label: '起运市' }, { key: 'originAddress', label: '起运地址', span: 2 },
    { key: 'consigneeName', label: '收货人' },
    { key: 'destCountry', label: '目的地国家' }, { key: 'destProvince', label: '目的地省' }, { key: 'destCity', label: '目的地市' }, { key: 'destAddress', label: '目的地地址', span: 2 },
    { key: 'goodsName', label: '货物名称' }, { key: 'cargoQuantity', label: '货物数量' }, { key: 'packageType2', label: '包装类型' },
    { key: 'estimatedLossAmount', label: '预估损失金额' }, { key: 'lossCurrency', label: '损失币种' },
    { key: 'accidentTime', label: '事故时间' },
    { key: 'accidentCountry', label: '事故国家' }, { key: 'accidentProvince', label: '事故省' }, { key: 'accidentCity', label: '事故市' }, { key: 'accidentAddress', label: '事故地址', span: 2 },
    { key: 'accidentDescription', label: '事故描述', span: 2 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">新增报案</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>取消</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? '提交中...' : '提交报案'}</Button>
        </div>
      </div>

      <Card><CardHeader><SectionHead title="基本信息" /></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div><label className="text-sm">报案号 *</label><Input value={form.reportNo} onChange={(e) => setForm({ ...form, reportNo: e.target.value })} /></div>
          <div><label className="text-sm">保单号 *</label><Input value={form.policyNo} onChange={(e) => setForm({ ...form, policyNo: e.target.value })} /></div>
          <div><label className="text-sm">保险公司</label><Input value={form.insuranceCompany} onChange={(e) => setForm({ ...form, insuranceCompany: e.target.value })} /></div>
          <div><label className="text-sm">被保人企业 *</label><Input value={form.insuredCompany} onChange={(e) => setForm({ ...form, insuredCompany: e.target.value })} /></div>
          <div><label className="text-sm">报案时间</label><Input type="datetime-local" value={form.reportTime} onChange={(e) => setForm({ ...form, reportTime: e.target.value })} /></div>
          <div><label className="text-sm">报案人</label><Input value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card><CardHeader><SectionHead title="货物运输信息" /></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {detailFields.map((f) => (
              <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                <label className="text-sm">{f.label}</label>
                {f.key === 'accidentDescription' ? (
                  <Textarea value={String(form.claimDetail[f.key] ?? '')} onChange={(e) => updateDetail(f.key, e.target.value)} rows={3} />
                ) : (
                  <Input value={String(form.claimDetail[f.key] ?? '')} onChange={(e) => updateDetail(f.key, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
