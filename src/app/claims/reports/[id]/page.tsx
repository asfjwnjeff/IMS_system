'use client';
import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionHead } from '@/components/SectionHead';
import { Badge } from '@/components/ui/badge';
import { Descriptions } from '@/components/ui/descriptions';
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

  if (!claim) return <div className="max-w-4xl mx-auto py-12 text-center text-tertiary">报案记录未找到</div>;

  const d = (claim.claimDetail || {}) as unknown as Record<string, unknown>;
  const v = (key: string): string => String(d[key] ?? '-');

  const items: DescItem[] = [
    { label: '报案编号', value: claim.reportNo },
    { label: '报案状态', value: <Badge variant={statusColor[claim.reportStatus] || 'secondary'}>{claim.reportStatus}</Badge> },
    { label: '报案时间', value: claim.reportTime },
    { label: '投保申请人姓名', value: claim.applicantName },
    { label: '保单单号', value: claim.policyNo },
    { label: '保险公司名称', value: claim.insuranceCompany },
    { label: '被保险人企业名称', value: claim.insuredCompany, span: 2 },
    { label: '保险公司理赔结果', value: claim.claimResult || '-' },
    { label: '保险公司理赔金额', value: d.claimAmount ? `¥${Number(d.claimAmount).toLocaleString()}` : '-' },
    { label: '业务参考号', value: v('businessRefNo') },
    { label: '投保申请人部门', value: v('applicantDept') },
    { label: '提运单号', value: v('billNo') },
    { label: '起运地国家', value: v('originCountry') },
    { label: '起运地省', value: v('originProvince') },
    { label: '起运地市', value: v('originCity') },
    { label: '起运地详细地址', value: v('originAddress'), span: 2 },
    { label: '收货方名称', value: v('consigneeName') },
    { label: '目的地国家', value: v('destCountry') },
    { label: '目的地省', value: v('destProvince') },
    { label: '目的地市', value: v('destCity') },
    { label: '目的地详细地址', value: v('destAddress'), span: 2 },
    { label: '中文商品名称', value: v('goodsName') },
    { label: '货物数量', value: v('cargoQuantity') },
    { label: '包装种类', value: v('packageType2') },
    { label: '预计货损金额', value: v('estimatedLossAmount') },
    { label: '货损金额币种', value: v('lossCurrency') },
    { label: '具体出险时间', value: v('accidentTime') },
    { label: '出险地国家', value: v('accidentCountry') },
    { label: '出险地省', value: v('accidentProvince') },
    { label: '出险地市', value: v('accidentCity') },
    { label: '出险地详细地址', value: v('accidentAddress'), span: 2 },
    { label: '出险经过与原因', value: v('accidentDescription'), span: 2 },
    { label: '理赔明细', value: v('claimResultDetail'), span: 2 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
        <h1 className="text-lg font-bold">报案详情 — {claim.reportNo}</h1>
      </div>
      <Card><CardHeader><SectionHead title="基本信息" /></CardHeader><CardContent><Descriptions items={items.slice(0, 9)} bordered /></CardContent></Card>
      <Card><CardHeader><SectionHead title="客户与运输信息" /></CardHeader><CardContent><Descriptions items={items.slice(9)} bordered /></CardContent></Card>
    </div>
  );
}
