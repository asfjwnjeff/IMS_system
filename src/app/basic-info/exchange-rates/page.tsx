'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import type { ExchangeRate } from '@/lib/types';

const emptyForm: Omit<ExchangeRate, 'id'> = { insuranceCompany: '中国人保', exchangeRate: 0, effectiveDate: '', expiryDate: '', currency: '美元', creator: '管理员', createTime: '' };

export default function ExchangeRateConfigPage() {
  const { exchangeRates, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return exchangeRates.filter((r) => {
      if (companyFilter && r.insuranceCompany !== companyFilter) return false;
      if (search && !r.currency?.includes(search) && !r.insuranceCompany?.includes(search)) return false;
      return true;
    });
  }, [exchangeRates, search, companyFilter]);

  function openCreate() { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }
  function openEdit(r: ExchangeRate) { setEditingId(r.id); setForm(r); setDialogOpen(true); }

  async function handleSave() {
    if (!form.exchangeRate || !form.effectiveDate || !form.expiryDate) {
      toast.error('请填写完整信息'); return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch('/api/exchange-rates', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, id: editingId }) });
        const data = await res.json();
        if (data.success) { dispatch({ type: 'UPDATE_EXCHANGE_RATE', exchangeRate: { ...form, id: editingId, createTime: form.createTime } as ExchangeRate }); toast.success('更新成功'); }
      } else {
        const res = await fetch('/api/exchange-rates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, createTime: new Date().toISOString() }) });
        const data = await res.json();
        if (data.success) { dispatch({ type: 'ADD_EXCHANGE_RATE', exchangeRate: data.data as ExchangeRate }); toast.success('创建成功'); }
      }
      setDialogOpen(false);
    } catch { toast.error('操作失败'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除？')) return;
    await fetch(`/api/exchange-rates?id=${id}`, { method: 'DELETE' });
    dispatch({ type: 'DELETE_EXCHANGE_RATE', id });
    toast.success('已删除');
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">保费汇率配置</h1>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" />新增</Button>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">查询条件</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="保险公司" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部</SelectItem>
                <SelectItem value="中国人保">中国人保</SelectItem>
                <SelectItem value="中国平安">中国平安</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
              <Input placeholder="搜索币种/公司" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>保险公司</TableHead><TableHead>币种</TableHead><TableHead>汇率</TableHead><TableHead>生效日期</TableHead><TableHead>失效日期</TableHead><TableHead>创建人</TableHead><TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.insuranceCompany}</TableCell>
                  <TableCell>{r.currency}</TableCell>
                  <TableCell className="tabular-nums">{r.exchangeRate}</TableCell>
                  <TableCell>{r.effectiveDate}</TableCell>
                  <TableCell>{r.expiryDate}</TableCell>
                  <TableCell>{r.creator}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-tertiary py-8">暂无数据</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? '编辑' : '新增'}汇率配置</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm">保险公司</label><Select value={form.insuranceCompany} onValueChange={(v) => setForm({ ...form, insuranceCompany: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="中国人保">中国人保</SelectItem><SelectItem value="中国平安">中国平安</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm">币种</label><Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="美元">美元</SelectItem><SelectItem value="日元">日元</SelectItem><SelectItem value="欧元">欧元</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm">汇率</label><Input type="number" step="0.0001" value={form.exchangeRate} onChange={(e) => setForm({ ...form, exchangeRate: Number(e.target.value) })} /></div>
            <div><label className="text-sm">创建人</label><Input value={form.creator} onChange={(e) => setForm({ ...form, creator: e.target.value })} /></div>
            <div><label className="text-sm">生效日期</label><Input type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} /></div>
            <div><label className="text-sm">失效日期</label><Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button><Button onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
