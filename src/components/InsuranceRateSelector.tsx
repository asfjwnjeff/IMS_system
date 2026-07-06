'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Calculator, AlertCircle, ShieldCheck } from 'lucide-react';
import { MARKUP_RATIO_MAP } from '@/lib/types';
import type { InsuranceRate } from '@/lib/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceAmount: number;
  currency: string;
  markupRatio: string;
  onConfirm: (result: RateSelectionResult) => void;
}

export interface RateSelectionResult {
  rateId: string;
  productName: string;
  rateDisplay: string;
  rateMin: number;
  rateMax: number | null;
  rateType: string;
  estimatedInsuranceAmount: number;
  estimatedPremiumMin: number;
  estimatedPremiumMax: number;
  manualRate?: number;
  remark?: string;
}

export function InsuranceRateSelector({
  open, onOpenChange, invoiceAmount, currency, markupRatio, onConfirm,
}: Props) {
  const { insuranceRates, exchangeRates } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [manualRate, setManualRate] = useState('');
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 只显示启用的产品
  const products = useMemo(() => insuranceRates.filter((r) => r.status === '启用'), [insuranceRates]);

  // 自动选中默认产品（响应式）
  useEffect(() => {
    if (open) {
      const def = products.find((p) => !!p.isDefault);
      setSelectedId(def ? def.id : (products.length > 0 ? products[0].id : null));
      setManualRate('');
      setRemark('');
      setErrors({});
    }
  }, [open, products]);

  const selectedProduct = products.find((p) => p.id === selectedId) || null;

  // 获取汇率
  const exRate = useMemo(() => {
    const safeCurrency = currency || '人民币';
    if (safeCurrency === '人民币') return 1;
    const er = exchangeRates.find((e) => e.currency === safeCurrency);
    return er && er.exchangeRate != null ? Number(er.exchangeRate) : 1;
  }, [currency, exchangeRates]);

  // 加成系数
  const markupVal = MARKUP_RATIO_MAP[markupRatio] || 1;

  // 预计保险金额
  const estimatedInsuranceAmount = (Number(invoiceAmount) || 0) * markupVal;

  // 费率显示
  function formatRateDisplay(r: InsuranceRate): string {
    if (!r || r.rateType === '手工填写') return '单独核定';
    const rMin = Number(r.rateMin);
    if (isNaN(rMin)) return '—';
    if (r.rateType === '区间费率') {
      const rMax = Number(r.rateMax);
      if (!isNaN(rMax) && rMax > rMin) return `${(rMin * 100).toFixed(3)}%–${(rMax * 100).toFixed(3)}%`;
    }
    return `${(rMin * 100).toFixed(3)}%`;
  }

  // 预计保费计算
  function calcPremium(r: InsuranceRate): { min: number; max: number; display: string } | null {
    if (!r) return null;
    const amount = Number(estimatedInsuranceAmount) || 0;
    const er = Number(exRate) || 1;
    const rMin = Number(r.rateMin);
    if (isNaN(rMin) || amount <= 0) return null;

    if (r.rateType === '手工填写') {
      const mr = parseFloat(manualRate);
      if (!mr || mr <= 0 || isNaN(mr)) return null;
      const premium = amount * er * (mr / 100);
      if (isNaN(premium)) return null;
      return { min: premium, max: premium, display: `¥${premium.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` };
    }
    const min = amount * er * rMin;
    if (isNaN(min)) return null;
    const rMax = Number(r.rateMax);
    if (!isNaN(rMax) && rMax > rMin) {
      const max = amount * er * rMax;
      if (isNaN(max)) return null;
      return { min, max, display: `¥${min.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} – ¥${max.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` };
    }
    return { min, max: min, display: `¥${min.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` };
  }

  const premium = selectedProduct ? calcPremium(selectedProduct) : null;

  function handleConfirm() {
    if (!selectedProduct) { toast.error('请选择保险产品'); return; }
    const errs: Record<string, string> = {};
    if (selectedProduct.rateType === '手工填写') {
      const mr = parseFloat(manualRate);
      if (!mr || mr <= 0 || isNaN(mr)) errs.manualRate = '请输入有效的费率（大于0的数字）';
      if (!remark || remark.trim().length < 10) errs.remark = '请填写沟通备注（至少10个字）';
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    const p = premium!;
    const result: RateSelectionResult = {
      rateId: selectedProduct.id,
      productName: selectedProduct.productName || '',
      rateDisplay: formatRateDisplay(selectedProduct),
      rateMin: Number(selectedProduct.rateMin) || 0,
      rateMax: selectedProduct.rateMax != null ? Number(selectedProduct.rateMax) : null,
      rateType: selectedProduct.rateType || '固定费率',
      estimatedInsuranceAmount,
      estimatedPremiumMin: p.min,
      estimatedPremiumMax: p.max,
    };
    if (selectedProduct.rateType === '手工填写') {
      result.manualRate = parseFloat(manualRate);
      result.remark = remark.trim();
    }
    onConfirm(result);
    onOpenChange(false);
  }

  function handleClose() {
    setErrors({});
    setManualRate('');
    setRemark('');
    onOpenChange(false);
  }

  const safeAmount = Number(invoiceAmount) || 0;
  const safeExRate = Number(exRate) || 1;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[700px] max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            选择保险产品与费率
          </DialogTitle>
        </DialogHeader>

        {/* 投保信息条 */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 px-4 py-2.5 bg-muted/50 rounded-md text-sm">
          <span><span className="text-tertiary">货运价值：</span><span className="font-medium">{safeAmount.toLocaleString()} {currency || '人民币'}</span></span>
          <span><span className="text-tertiary">加成：</span><span className="font-medium">{markupRatio || '发票金额原值100%'}</span></span>
          <span><span className="text-tertiary">保险金额：</span><span className="font-medium">¥{estimatedInsuranceAmount.toLocaleString()}</span></span>
          <span><span className="text-tertiary">币种汇率：</span><span className="font-medium">{currency || '人民币'} · {safeExRate.toFixed(4)}</span></span>
        </div>

        {/* 提示 */}
        <div className="flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-700">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>系统默认选择"通用"方案。如选"单独报价"，需提前与保险团队沟通并在备注中说明。</span>
        </div>

        {/* 产品列表 */}
        {products.length === 0 ? (
          <div className="text-center py-10 text-tertiary">
            <p className="text-lg mb-2">暂无可用保险产品</p>
            <p className="text-xs">请在「基础信息 → 保费费率配置」中添加启用状态的保险产品</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {products.map((r) => {
              const isSelected = r.id === selectedId;
              const p = calcPremium(r);
              return (
                <Card
                  key={r.id}
                  className={`p-3.5 cursor-pointer transition-all hover:border-foreground/20 ${isSelected ? 'border-foreground bg-muted/30 ring-1 ring-foreground/10' : 'border-border'}`}
                  onClick={() => { setSelectedId(r.id); setErrors({}); }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* 货物类型 — 先展示，突出 */}
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {(r.cargoType || '').split(/[,，、]/).filter(Boolean).map((t, j) => (
                          <span key={j} className="inline-flex text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{t.trim()}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-foreground bg-foreground' : 'border-muted-foreground/25'}`}>
                          {isSelected && <span className="w-1.5 h-1.5 bg-background rounded-full" />}
                        </span>
                        <span className="font-semibold text-sm">{r.productName || '—'}</span>
                        {!!r.isDefault && <Badge variant="default" className="text-[10px] h-4">默认</Badge>}
                        {r.rateType === '手工填写' && <Badge variant="outline" className="text-[10px] h-4 text-amber-600 border-amber-300">需沟通</Badge>}
                        {r.rateType === '固定费率' && <Badge variant="outline" className="text-[10px] h-4 text-green-600 border-green-300">专属优惠</Badge>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 min-w-[120px]">
                      <div className={`text-base font-bold tabular-nums ${r.rateType === '手工填写' ? 'text-amber-600' : ''}`}>
                        {formatRateDisplay(r)}
                      </div>
                      {p && <div className="text-[11px] text-tertiary mt-0.5">≈ {p.display}</div>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* 单独报价手工填写区 */}
        {selectedProduct?.rateType === '手工填写' && (
          <div className="space-y-3 p-4 bg-amber-50/50 border border-amber-200 rounded-md">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              <AlertCircle className="w-4 h-4" />单独报价信息
            </div>
            <div>
              <label className="text-sm font-medium">单独报价费率（%）<span className="text-red-500 ml-0.5">*</span></label>
              <Input type="text" placeholder="例如：0.035" value={manualRate}
                onChange={(e) => { setManualRate(e.target.value); setErrors((prev) => ({ ...prev, manualRate: '' })); }}
                className={errors.manualRate ? 'border-red-500' : ''} />
              {errors.manualRate && <p className="text-xs text-red-500 mt-1">{errors.manualRate}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">沟通备注<span className="text-red-500 ml-0.5">*</span></label>
              <Textarea rows={3} placeholder="请说明与保险团队的沟通情况（沟通时间、对象、确认方案等）"
                value={remark}
                onChange={(e) => { setRemark(e.target.value); setErrors((prev) => ({ ...prev, remark: '' })); }}
                className={errors.remark ? 'border-red-500' : ''} />
              {errors.remark && <p className="text-xs text-red-500 mt-1">{errors.remark}</p>}
              <p className="text-xs text-tertiary mt-1">单独报价需提前与保险团队沟通确认后再填写费率</p>
            </div>
          </div>
        )}

        {/* 预计保费试算公式栏 — 始终展示 */}
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 rounded-md border">
          <Calculator className="w-4 h-4 text-tertiary flex-shrink-0" />
          <span className="text-sm font-medium text-tertiary flex-shrink-0">预计保费</span>
          <span className="text-sm text-tertiary truncate">
            {safeAmount.toLocaleString()} {currency || '人民币'}
            <span className="mx-1.5 opacity-40">×</span>
            汇率 {safeExRate.toFixed(4)}
            <span className="mx-1.5 opacity-40">×</span>
            {selectedProduct ? formatRateDisplay(selectedProduct) : '—'}
          </span>
          <Separator orientation="vertical" className="h-4 flex-shrink-0" />
          <span className="text-lg font-bold tabular-nums flex-shrink-0">
            {premium ? premium.display : '—'}
          </span>
        </div>
        <p className="text-[11px] text-tertiary -mt-2 mb-1">* 以上为参考试算，实际保费以保险公司核保结果为准。通用方案为区间费率，最终费率由货物类型决定。</p>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>取消</Button>
          <Button onClick={handleConfirm}>确认选择</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
