'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Search, RotateCcw, Pencil } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import type { InsuranceRate } from '@/lib/types';

const emptyForm: Omit<InsuranceRate, 'id'> = { insuranceCompany: '中国人保', rate: 0, effectiveDate: '', expiryDate: '', cargoType: '', status: '启用', cargoValueRMB: 0, agreementNo: '', minCharge: 0, packageType: '', oldNewType: '', remark: '', creator: '管理员', createTime: '' };

export default function InsuranceRateConfigPage() {
  const { insuranceRates, dispatch, loading } = useApp();
  const [searchCompany, setSearchCompany] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => insuranceRates.filter((r) => !searchCompany || searchCompany === 'all' || r.insuranceCompany === searchCompany), [insuranceRates, searchCompany]);

  function openCreate() { setEditingId(null); setForm({ ...emptyForm, createTime: '' }); setDialogOpen(true); }
  function openEdit(r: InsuranceRate) { setEditingId(r.id); setForm(r); setDialogOpen(true); }

  async function handleSave() {
    if (!form.insuranceCompany || !form.rate) { toast.error('请填写必填项'); return; }
    setSaving(true);
    try {
      const payload = { ...form, createTime: editingId ? form.createTime : new Date().toISOString().replace('T', ' ').slice(0, 19) };
      const res = await fetch('/api/insurance-rates', { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload) });
      const data = await res.json();
      if (data.success) {
        const item = { ...payload, id: data.data?.id || editingId! } as InsuranceRate;
        dispatch({ type: editingId ? 'UPDATE_INSURANCE_RATE' : 'ADD_INSURANCE_RATE', insuranceRate: item } as never);
        toast.success(editingId ? '修改成功' : '新增成功'); setDialogOpen(false);
      }
    } catch { toast.error('操作失败'); } finally { setSaving(false); }
  }

  async function batchToggle(status: string) {
    if (selectedIds.size === 0) { toast.error('请先选择'); return; }
    await fetch('/api/insurance-rates', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: Array.from(selectedIds), status }) });
    selectedIds.forEach((id) => { const r = insuranceRates.find((x) => x.id === id); if (r) dispatch({ type: 'UPDATE_INSURANCE_RATE', insuranceRate: { ...r, status } }); });
    toast.success(`已${status}`); setSelectedIds(new Set());
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-lg font-bold">保费费率配置</h1></div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">查询条件</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap items-center">
            <Select value={searchCompany} onValueChange={setSearchCompany}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="保险公司" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="中国人保">中国人保</SelectItem><SelectItem value="中国平安">中国平安</SelectItem><SelectItem value="人保财险">人保财险</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm"><Search className="w-4 h-4 mr-1" />搜索</Button>
            <Button size="sm" variant="outline" onClick={() => setSearchCompany('')}><RotateCcw className="w-4 h-4 mr-1" />重置</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <div className="p-3 border-b border-light flex items-center gap-2">
            <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />新增</Button>
            <Button size="sm" variant="outline" onClick={() => batchToggle('启用')}>批量启用</Button>
            <Button size="sm" variant="outline" onClick={() => batchToggle('禁用')}>批量禁用</Button>
          </div>
          {selectedIds.size > 0 && <div className="px-4 py-2 bg-muted text-sm">已选 {selectedIds.size} 项</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={selectedIds.size > 0 && selectedIds.size === filtered.length} onCheckedChange={(c) => setSelectedIds(c ? new Set(filtered.map((r) => r.id)) : new Set())} /></TableHead>
                <TableHead className="w-[60px] text-center">序号</TableHead>
                <TableHead>保险公司</TableHead><TableHead>费率</TableHead><TableHead>生效日期</TableHead><TableHead>失效日期</TableHead><TableHead>货物类型</TableHead><TableHead>状态</TableHead><TableHead>创建人</TableHead><TableHead>创建时间</TableHead><TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell><Checkbox checked={selectedIds.has(r.id)} onCheckedChange={(c) => { const s = new Set(selectedIds); c ? s.add(r.id) : s.delete(r.id); setSelectedIds(s); }} /></TableCell>
                  <TableCell className="text-center">{i + 1}</TableCell>
                  <TableCell>{r.insuranceCompany}</TableCell>
                  <TableCell className="tabular-nums">{r.rate?.toFixed(6)}</TableCell>
                  <TableCell>{r.effectiveDate}</TableCell>
                  <TableCell>{r.expiryDate}</TableCell>
                  <TableCell className="max-w-[280px] truncate">{r.cargoType}</TableCell>
                  <TableCell><span className={r.status === '启用' ? 'text-green-600' : 'text-red-600'}>{r.status}</span></TableCell>
                  <TableCell>{r.creator}</TableCell>
                  <TableCell>{r.createTime}</TableCell>
                  <TableCell><Button variant="link" size="sm" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={11} className="text-center text-tertiary py-8">暂无数据</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? '修改' : '新增'}费率配置</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm">保险公司 *</label><Select value={form.insuranceCompany} onValueChange={(v) => setForm({ ...form, insuranceCompany: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="中国人保">中国人保</SelectItem><SelectItem value="中国平安">中国平安</SelectItem><SelectItem value="人保财险">人保财险</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm">费率 *</label><Input type="number" step="0.000001" value={form.rate || ''} onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })} /></div>
            <div><label className="text-sm">货物类型</label><Input value={form.cargoType} onChange={(e) => setForm({ ...form, cargoType: e.target.value })} /></div>
            <div><label className="text-sm">协议号</label><Input value={form.agreementNo || ''} onChange={(e) => setForm({ ...form, agreementNo: e.target.value })} /></div>
            <div><label className="text-sm">货值(RMB)</label><Input type="number" step="0.01" value={form.cargoValueRMB || ''} onChange={(e) => setForm({ ...form, cargoValueRMB: Number(e.target.value) })} /></div>
            <div><label className="text-sm">最低收费</label><Input type="number" step="0.01" value={form.minCharge || ''} onChange={(e) => setForm({ ...form, minCharge: Number(e.target.value) })} /></div>
            <div><label className="text-sm">包装类型</label><Select value={form.packageType || ''} onValueChange={(v) => setForm({ ...form, packageType: v })}><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent>{['木制或竹藤等植物性材料制盒/箱','纸制或纤维板制盒/箱','天然木托','球状罐类','普通集装箱','其他'].map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-sm">新旧类型</label><Select value={form.oldNewType || ''} onValueChange={(v) => setForm({ ...form, oldNewType: v })}><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent><SelectItem value="新货">新货</SelectItem><SelectItem value="旧货">旧货</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm">生效日期</label><Input type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} /></div>
            <div><label className="text-sm">失效日期</label><Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
            <div className="col-span-2"><label className="text-sm">备注</label><Textarea value={form.remark || ''} onChange={(e) => setForm({ ...form, remark: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button><Button onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
