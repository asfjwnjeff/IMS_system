'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Search, RotateCcw, Pencil } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import type { ExchangeRate } from '@/lib/types';

const emptyForm = { insuranceCompany: '中国人保', exchangeRate: 0, effectiveDate: '', expiryDate: '', currency: '美元', creator: '管理员', createTime: '' };

export default function ExchangeRateConfigPage() {
  const { exchangeRates, dispatch, loading } = useApp();
  const [searchCompany, setSearchCompany] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => exchangeRates.filter((r) => {
    if (searchCompany && searchCompany !== 'all' && r.insuranceCompany !== searchCompany) return false;
    if (dateFrom && r.effectiveDate < dateFrom) return false;
    if (dateTo && r.effectiveDate > dateTo) return false;
    return true;
  }), [exchangeRates, searchCompany, dateFrom, dateTo]);

  function openCreate() { setEditingId(null); setForm({ ...emptyForm, createTime: '' }); setDialogOpen(true); }
  function openEdit(r: ExchangeRate) { setEditingId(r.id); setForm(r); setDialogOpen(true); }

  async function handleSave() {
    if (!form.insuranceCompany || !form.exchangeRate || !form.effectiveDate || !form.expiryDate) { toast.error('请填写完整'); return; }
    setSaving(true);
    try {
      const payload = { ...form, createTime: editingId ? form.createTime : new Date().toISOString().replace('T', ' ').slice(0, 19) };
      const res = await fetch('/api/exchange-rates', { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload) });
      const data = await res.json();
      if (data.success) {
        const item = { ...payload, id: data.data?.id || editingId! } as ExchangeRate;
        dispatch({ type: editingId ? 'UPDATE_EXCHANGE_RATE' : 'ADD_EXCHANGE_RATE', exchangeRate: item } as never);
        toast.success(editingId ? '修改成功' : '新增成功'); setDialogOpen(false);
      }
    } catch { toast.error('操作失败'); } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-lg font-bold">保费汇率配置</h1></div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">查询条件</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap items-center">
            <Select value={searchCompany} onValueChange={setSearchCompany}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="保险公司" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="中国人保">中国人保</SelectItem>
                <SelectItem value="中国平安">中国平安</SelectItem>
                <SelectItem value="人保财险">人保财险</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" placeholder="生效日期起" />
            <span className="text-tertiary">-</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" placeholder="生效日期止" />
            <Button size="sm"><Search className="w-4 h-4 mr-1" />搜索</Button>
            <Button size="sm" variant="outline" onClick={() => { setSearchCompany(''); setDateFrom(''); setDateTo(''); }}><RotateCcw className="w-4 h-4 mr-1" />重置</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <div className="p-3 border-b border-light"><Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />新增</Button></div>
          {loading ? <SkeletonTable rows={3} cols={8} /> : filtered.length === 0 ? <EmptyState title="暂无汇率配置" description="点击「新增」创建第一条汇率记录" action={{ label: '新增', onClick: openCreate }} /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">序号</TableHead>
                <TableHead>保险公司</TableHead><TableHead>汇率</TableHead><TableHead>生效日期</TableHead><TableHead>失效日期</TableHead><TableHead>币制</TableHead><TableHead>创建人</TableHead><TableHead>创建时间</TableHead><TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell className="text-center">{i + 1}</TableCell>
                  <TableCell>{r.insuranceCompany}</TableCell>
                  <TableCell className="tabular-nums">{r.exchangeRate?.toFixed(6)}</TableCell>
                  <TableCell>{r.effectiveDate}</TableCell>
                  <TableCell>{r.expiryDate}</TableCell>
                  <TableCell>{r.currency}</TableCell>
                  <TableCell>{r.creator}</TableCell>
                  <TableCell>{r.createTime}</TableCell>
                  <TableCell><Button variant="link" size="sm" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? '修改' : '新增'}汇率配置</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm">保险公司 *</label><Select value={form.insuranceCompany} onValueChange={(v) => setForm({ ...form, insuranceCompany: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="中国人保">中国人保</SelectItem><SelectItem value="中国平安">中国平安</SelectItem><SelectItem value="人保财险">人保财险</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm">币制 *</label><Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="美元">美元</SelectItem><SelectItem value="日元">日元</SelectItem><SelectItem value="欧元">欧元</SelectItem><SelectItem value="人民币">人民币</SelectItem><SelectItem value="港元">港元</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm">汇率 *</label><Input type="number" step="0.000001" value={form.exchangeRate || ''} onChange={(e) => setForm({ ...form, exchangeRate: Number(e.target.value) })} /></div>
            <div><label className="text-sm">创建人</label><Input value={form.creator} onChange={(e) => setForm({ ...form, creator: e.target.value })} /></div>
            <div><label className="text-sm">生效日期 *</label><Input type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} /></div>
            <div><label className="text-sm">失效日期 *</label><Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
            <div className="col-span-2"><label className="text-sm">最低收费标准</label><Input type="number" step="0.01" value={(form as unknown as Record<string,unknown>).minCharge as number || ''} onChange={(e) => setForm({ ...form, minCharge: Number(e.target.value) } as unknown as typeof emptyForm)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button><Button onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
