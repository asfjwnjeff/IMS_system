'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionHead } from '@/components/SectionHead';
import { toast } from 'sonner';
import { useApp } from '@/lib/store';
import type { ClaimReport, ClaimDetail } from '@/lib/types';
import { COUNTRIES, PACKAGE_TYPES } from '@/lib/types';

const emptyDetail: ClaimDetail = {
  applicantDept: '', billNo: '', businessRefNo: '',
  originCountryCode: '', originCountry: '', originProvince: '', originCity: '', originDistrict: '', originAddress: '',
  consigneeName: '', destCountryCode: '', destCountry: '', destProvince: '', destCity: '', destDistrict: '', destAddress: '',
  goodsName: '', cargoQuantity: 0, packageType2: '', estimatedLossAmount: 0, lossCurrency: '',
  accidentTime: '', accidentCountryCode: '', accidentCountry: '', accidentProvince: '', accidentCity: '', accidentDistrict: '', accidentAddress: '',
  accidentDescription: '', accidentFiles: [], claimResultDetail: '', claimAmount: 0, claimFiles: [],
};

const countries = [...COUNTRIES] as string[];
const halfCol = 'col-span-1';

export default function ClaimAddPage() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [form, setForm] = useState({ reportNo: '', policyNo: '', insuranceCompany: '中国人保', insuredCompany: '', reportTime: new Date().toISOString().slice(0, 16), applicantName: '', claimDetail: emptyDetail });
  const [saving, setSaving] = useState(false);

  function u(field: keyof ClaimDetail, value: unknown) { setForm({ ...form, claimDetail: { ...form.claimDetail, [field]: value } }); }

  async function handleSubmit() {
    if (!form.claimDetail.goodsName || !form.claimDetail.accidentTime) { toast.error('请填写必填项'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/claims', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, reportStatus: '待审批', claimResult: '' }) });
      const data = await res.json();
      if (data.success) {
        dispatch({ type: 'ADD_CLAIM', claim: { ...form, id: data.data.id, reportStatus: '待审批', claimResult: '', createdAt: '', updatedAt: '' } as ClaimReport });
        toast.success('报案提交成功'); router.push('/claims/reports');
      }
    } catch { toast.error('提交失败'); } finally { setSaving(false); }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-lg font-bold">新增报案</h1><Button variant="outline" onClick={() => router.back()}>返回</Button></div>

      {/* 保单信息 */}
      <Card><CardHeader><SectionHead title="保单信息" /></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className={halfCol}><label className="text-sm">业务参考号</label><Input value={(form.claimDetail as ClaimDetail).businessRefNo || ''} onChange={(e) => u('businessRefNo', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">投保申请人部门</label><Input value={(form.claimDetail as ClaimDetail).applicantDept || ''} onChange={(e) => u('applicantDept', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">保单单号</label><Input value={form.policyNo} onChange={(e) => setForm({ ...form, policyNo: e.target.value })} /></div>
            <div className={halfCol}><label className="text-sm">保险公司名称</label><Input value={form.insuranceCompany} onChange={(e) => setForm({ ...form, insuranceCompany: e.target.value })} /></div>
            <div className={halfCol}><label className="text-sm">提运单号</label><Input value={(form.claimDetail as ClaimDetail).billNo || ''} onChange={(e) => u('billNo', e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* 客户信息 */}
      <Card><CardHeader><SectionHead title="客户信息" /></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className={halfCol}><label className="text-sm">被保人企业名称</label><Input value={form.insuredCompany} onChange={(e) => setForm({ ...form, insuredCompany: e.target.value })} /></div>
            <div className={halfCol}><label className="text-sm">起运地国家标识</label><Select value={(form.claimDetail as ClaimDetail).originCountryCode || ''} onValueChange={(v) => u('originCountryCode', v)}><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent>{countries.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className={halfCol}><label className="text-sm">起运地国家</label><Select value={(form.claimDetail as ClaimDetail).originCountry || ''} onValueChange={(v) => u('originCountry', v)}><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent>{countries.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className={halfCol}><label className="text-sm">起运地省</label><Input value={(form.claimDetail as ClaimDetail).originProvince || ''} onChange={(e) => u('originProvince', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">起运地市</label><Input value={(form.claimDetail as ClaimDetail).originCity || ''} onChange={(e) => u('originCity', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">起运地区/县</label><Input value={(form.claimDetail as ClaimDetail).originDistrict || ''} onChange={(e) => u('originDistrict', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">起运地详细地址</label><Input value={(form.claimDetail as ClaimDetail).originAddress || ''} onChange={(e) => u('originAddress', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">收货方名称</label><Input value={(form.claimDetail as ClaimDetail).consigneeName || ''} onChange={(e) => u('consigneeName', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">目的地国家标识</label><Select value={(form.claimDetail as ClaimDetail).destCountryCode || ''} onValueChange={(v) => u('destCountryCode', v)}><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent>{countries.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className={halfCol}><label className="text-sm">目的地国家</label><Select value={(form.claimDetail as ClaimDetail).destCountry || ''} onValueChange={(v) => u('destCountry', v)}><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent>{countries.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className={halfCol}><label className="text-sm">目的地省</label><Input value={(form.claimDetail as ClaimDetail).destProvince || ''} onChange={(e) => u('destProvince', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">目的地市</label><Input value={(form.claimDetail as ClaimDetail).destCity || ''} onChange={(e) => u('destCity', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">目的地区/县</label><Input value={(form.claimDetail as ClaimDetail).destDistrict || ''} onChange={(e) => u('destDistrict', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">目的地详细地址</label><Input value={(form.claimDetail as ClaimDetail).destAddress || ''} onChange={(e) => u('destAddress', e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* 货物运输信息 */}
      <Card><CardHeader><SectionHead title="货物运输信息" /></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className={halfCol}><label className="text-sm">中文商品名称 *</label><Input value={(form.claimDetail as ClaimDetail).goodsName || ''} onChange={(e) => u('goodsName', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">货物数量</label><Input type="number" value={(form.claimDetail as ClaimDetail).cargoQuantity || ''} onChange={(e) => u('cargoQuantity', Number(e.target.value))} /></div>
            <div className={halfCol}><label className="text-sm">包装种类</label><Select value={(form.claimDetail as ClaimDetail).packageType2 || ''} onValueChange={(v) => u('packageType2', v)}><SelectTrigger><SelectValue placeholder="由选择关联带出" /></SelectTrigger><SelectContent>{[...PACKAGE_TYPES].map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
            <div className={halfCol}><label className="text-sm">预计货损金额</label><Input type="number" step="0.01" value={(form.claimDetail as ClaimDetail).estimatedLossAmount || ''} onChange={(e) => u('estimatedLossAmount', Number(e.target.value))} /></div>
            <div className={halfCol}><label className="text-sm">货损金额币种</label><Select value={(form.claimDetail as ClaimDetail).lossCurrency || ''} onValueChange={(v) => u('lossCurrency', v)}><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent><SelectItem value="人民币">人民币</SelectItem><SelectItem value="美元">美元</SelectItem></SelectContent></Select></div>
            <div className={halfCol}><label className="text-sm">具体出险时间 *</label><Input type="datetime-local" value={(form.claimDetail as ClaimDetail).accidentTime || ''} onChange={(e) => u('accidentTime', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">出险地国家标识</label><Select value={(form.claimDetail as ClaimDetail).accidentCountryCode || ''} onValueChange={(v) => u('accidentCountryCode', v)}><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent>{countries.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className={halfCol}><label className="text-sm">出险地国家</label><Select value={(form.claimDetail as ClaimDetail).accidentCountry || ''} onValueChange={(v) => u('accidentCountry', v)}><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent>{countries.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className={halfCol}><label className="text-sm">出险地省</label><Input value={(form.claimDetail as ClaimDetail).accidentProvince || ''} onChange={(e) => u('accidentProvince', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">出险地市</label><Input value={(form.claimDetail as ClaimDetail).accidentCity || ''} onChange={(e) => u('accidentCity', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">出险地区/县</label><Input value={(form.claimDetail as ClaimDetail).accidentDistrict || ''} onChange={(e) => u('accidentDistrict', e.target.value)} /></div>
            <div className={halfCol}><label className="text-sm">出险地详细地址</label><Input value={(form.claimDetail as ClaimDetail).accidentAddress || ''} onChange={(e) => u('accidentAddress', e.target.value)} /></div>
          </div>
          <div className="mt-4"><label className="text-sm">出险经过与原因</label><Textarea value={(form.claimDetail as ClaimDetail).accidentDescription || ''} onChange={(e) => u('accidentDescription', e.target.value)} rows={4} maxLength={500} /><span className="text-xs text-tertiary">{((form.claimDetail as ClaimDetail).accidentDescription || '').length}/500</span></div>
          <div className="mt-4"><label className="text-sm">出险附件</label><Input placeholder="点击上传 大小不超过 5MB" /></div>
        </CardContent>
      </Card>

      <div className="text-center pt-6 border-t border-light">
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={handleSubmit} disabled={saving}>{saving ? '提交中...' : '提 交'}</Button>
          <Button size="lg" variant="outline" onClick={() => router.back()}>取 消</Button>
        </div>
      </div>
    </div>
  );
}
