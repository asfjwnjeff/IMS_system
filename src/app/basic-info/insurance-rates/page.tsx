'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { InsuranceRate } from '@/lib/types';

const emptyForm: Omit<InsuranceRate, 'id'> = { insuranceCompany: '中国人保', rate: 0, effectiveDate: '', expiryDate: '', cargoType: '', status: '启用', cargoValueRMB: 0, agreementNo: '', minCharge: 0, packageType: '', oldNewType: '', remark: '', creator: '管理员', createTime: '' };

export default function InsuranceRateConfigPage() {
  const { insuranceRates, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return insuranceRates.filter((r) => {
      if (!search) return true;
      return r.insuranceCompany?.includes(search) || r.cargoType?.includes(search) || r.agreementNo?.includes(search);
    });
  }, [insuranceRates, search]);

  function openCreate() { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }
  function openEdit(r: InsuranceRate) { setEditingId(r.id); setForm(r); setDialogOpen(true); }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch('/api/insurance-rates', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, id: editingId }) });
        const data = await res.json();
        if (data.success) { dispatch({ type: 'UPDATE_INSURANCE_RATE', insuranceRate: { ...form, id: editingId, createTime: form.createTime } as InsuranceRate }); toast.success('更新成功'); }
      } else {
        const res = await fetch('/api/insurance-rates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, createTime: new Date().toISOString() }) });
        const data = await res.json();
        if (data.success) { dispatch({ type: 'ADD_INSURANCE_RATE', insuranceRate: data.data as InsuranceRate }); toast.success('创建成功'); }
      }
      setDialogOpen(false);
    } catch { toast.error('操作失败'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除？')) return;
    await fetch(`/api/insurance-rates?id=${id}`, { method: 'DELETE' });
    dispatch({ type: 'DELETE_INSURANCE_RATE', id }); toast.success('已删除');
  }

  async function batchToggle(status: string) {
    if (selectedIds.size === 0) { toast.error('请先选择'); return; }
    await fetch('/api/insurance-rates', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: Array.from(selectedIds), status }) });
    selectedIds.forEach((id) => { const r = insuranceRates.find((x) => x.id === id); if (r) dispatch({ type: 'UPDATE_INSURANCE_RATE', insuranceRate: { ...r, status } }); });
    toast.success(`已${status}`);
    setSelectedIds(new Set());
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">保费费率配置</h1>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" />新增</Button>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">查询条件</CardTitle></CardHeader>
        <CardContent>
          <Input placeholder="搜索保险公司/货物类型/协议号" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          {selectedIds.size > 0 && (
            <div className="px-4 py-2 bg-hover border-b border-light flex gap-2 items-center text-sm">
              已选 {selectedIds.size} 项
              <Button size="sm" variant="outline" onClick={() => batchToggle('启用')}>批量启用</Button>
              <Button size="sm" variant="outline" onClick={() => batchToggle('禁用')}>批量禁用</Button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={selectedIds.size > 0 && selectedIds.size === filtered.length} onCheckedChange={(c) => setSelectedIds(c ? new Set(filtered.map(r => r.id)) : new Set())} /></TableHead>
                <TableHead>保险公司</TableHead><TableHead>费率</TableHead><TableHead>货物类型</TableHead><TableHead>协议号</TableHead><TableHead>状态</TableHead><TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell><Checkbox checked={selectedIds.has(r.id)} onCheckedChange={(c) => { const s = new Set(selectedIds); c ? s.add(r.id) : s.delete(r.id); setSelectedIds(s); }} /></TableCell>
                  <TableCell>{r.insuranceCompany}</TableCell>
                  <TableCell className="tabular-nums">{r.rate}</TableCell>
                  <TableCell>{r.cargoType}</TableCell>
                  <TableCell>{r.agreementNo}</TableCell>
                  <TableCell><Badge variant={r.status === '启用' ? 'success' : 'secondary'}>{r.status}</Badge></TableCell>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? '编辑' : '新增'}费率配置</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm">保险公司</label><Input value={form.insuranceCompany} onChange={(e) => setForm({ ...form, insuranceCompany: e.target.value })} /></div>
            <div><label className="text-sm">费率</label><Input type="number" step="0.0001" value={form.rate} onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })} /></div>
            <div><label className="text-sm">货物类型</label><Input value={form.cargoType} onChange={(e) => setForm({ ...form, cargoType: e.target.value })} /></div>
            <div><label className="text-sm">协议号</label><Input value={form.agreementNo} onChange={(e) => setForm({ ...form, agreementNo: e.target.value })} /></div>
            <div><label className="text-sm">最低收费</label><Input type="number" value={form.minCharge} onChange={(e) => setForm({ ...form, minCharge: Number(e.target.value) })} /></div>
            <div><label className="text-sm">包装类型</label><Input value={form.packageType} onChange={(e) => setForm({ ...form, packageType: e.target.value })} /></div>
            <div><label className="text-sm">新旧类型</label><Input value={form.oldNewType} onChange={(e) => setForm({ ...form, oldNewType: e.target.value })} /></div>
            <div><label className="text-sm">货物价值(RMB)</label><Input type="number" value={form.cargoValueRMB} onChange={(e) => setForm({ ...form, cargoValueRMB: Number(e.target.value) })} /></div>
            <div><label className="text-sm">生效日期</label><Input type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} /></div>
            <div><label className="text-sm">失效日期</label><Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
            <div className="col-span-2"><label className="text-sm">备注</label><Input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button><Button onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
