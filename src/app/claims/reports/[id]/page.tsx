'use client';

import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionHead } from '@/components/SectionHead';
import { Descriptions } from '@/components/ui/descriptions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { DescItem } from '@/components/ui/descriptions';

const statusColor: Record<string, 'success' | 'warning' | 'secondary' | 'destructive'> = {
  '审批通过': 'success', '审批拒绝': 'destructive', '已确认': 'success', '待审批': 'warning',
};

export default function ClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { claims } = useApp();
  const claim = useMemo(() => claims.find((c) => c.id === id), [claims, id]);

  if (!claim) {
    return <div className="max-w-4xl mx-auto py-12 text-center text-tertiary">报案记录未找到</div>;
  }

  const d = (claim.claimDetail || {}) as unknown as Record<string, unknown>;
  const v = (key: string): React.ReactNode => String(d[key] ?? '-');
  const basicItems: DescItem[] = [
    { label: '报案号', value: claim.reportNo }, { label: '保单号', value: claim.policyNo },
    { label: '保险公司', value: claim.insuranceCompany }, { label: '被保人企业', value: claim.insuredCompany },
    { label: '报案时间', value: claim.reportTime }, { label: '报案人', value: claim.applicantName },
    { label: '报案状态', value: <Badge variant={statusColor[claim.reportStatus] || 'secondary'}>{claim.reportStatus}</Badge> },
    { label: '理赔结果', value: claim.claimResult || '-' },
  ];

  const cargoItems: DescItem[] = [
    { label: '业务参考号', value: v('businessRefNo') }, { label: '申请部门', value: v('applicantDept') },
    { label: '提运单号', value: v('billNo') },
    { label: '起运国家', value: v('originCountry') }, { label: '起运省', value: v('originProvince') },
    { label: '起运市', value: v('originCity') }, { label: '起运地址', value: v('originAddress') },
    { label: '收货人', value: v('consigneeName') },
    { label: '目的地国家', value: v('destCountry') }, { label: '目的地省', value: v('destProvince') },
    { label: '目的地市', value: v('destCity') }, { label: '目的地地址', value: v('destAddress') },
    { label: '货物名称', value: v('goodsName') }, { label: '货物数量', value: v('cargoQuantity') },
    { label: '包装类型', value: v('packageType2') },
    { label: '预估损失金额', value: v('estimatedLossAmount') }, { label: '损失币种', value: v('lossCurrency') },
  ];

  const accidentItems: DescItem[] = [
    { label: '事故时间', value: v('accidentTime') },
    { label: '事故国家', value: v('accidentCountry') }, { label: '事故省', value: v('accidentProvince') },
    { label: '事故市', value: v('accidentCity') }, { label: '事故地址', value: v('accidentAddress') },
    { label: '事故描述', value: v('accidentDescription'), span: 2 },
    { label: '理赔金额', value: v('claimAmount') }, { label: '理赔明细', value: v('claimResultDetail'), span: 2 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
        <h1 className="text-lg font-bold">报案详情 — {claim.reportNo}</h1>
      </div>
      <Card><CardHeader><SectionHead title="基本信息" /></CardHeader><CardContent><Descriptions items={basicItems} bordered /></CardContent></Card>
      <Card><CardHeader><SectionHead title="货物运输信息" /></CardHeader><CardContent><Descriptions items={cargoItems} bordered /></CardContent></Card>
      <Card><CardHeader><SectionHead title="事故与理赔信息" /></CardHeader><CardContent><Descriptions items={accidentItems} bordered /></CardContent></Card>
    </div>
  );
}
