'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Eye, CheckCircle } from 'lucide-react';
import type { ClaimReport } from '@/lib/types';

const statusColor: Record<string, 'success' | 'warning' | 'secondary' | 'destructive'> = {
  '审批通过': 'success', '审批拒绝': 'destructive', '已确认': 'success', '待审批': 'warning',
};

export default function ReportClaimsPage() {
  const router = useRouter();
  const { claims, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return claims.filter((c) => {
      if (statusFilter && statusFilter !== '全部' && c.reportStatus !== statusFilter) return false;
      if (search && !c.reportNo?.includes(search) && !c.policyNo?.includes(search) && !c.insuredCompany?.includes(search)) return false;
      return true;
    });
  }, [claims, search, statusFilter]);

  async function handleConfirm() {
    if (!confirmId) return;
    await fetch('/api/claims', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: confirmId, reportStatus: '已确认' }) });
    const claim = claims.find((c) => c.id === confirmId);
    if (claim) dispatch({ type: 'UPDATE_CLAIM', claim: { ...claim, reportStatus: '已确认' } });
    toast.success('理赔确认成功');
    setConfirmOpen(false); setConfirmId(null);
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">报案理赔管理</h1>
        <Button onClick={() => router.push('/claims/reports/new')} size="sm"><Plus className="w-4 h-4 mr-1" />新增报案</Button>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">查询条件</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="报案状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部</SelectItem>
                <SelectItem value="待审批">待审批</SelectItem>
                <SelectItem value="审批通过">审批通过</SelectItem>
                <SelectItem value="审批拒绝">审批拒绝</SelectItem>
                <SelectItem value="已确认">已确认</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="搜索报案号/保单号/被保人" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>报案号</TableHead><TableHead>保单号</TableHead><TableHead>被保人企业</TableHead><TableHead>保险公司</TableHead><TableHead>报案时间</TableHead><TableHead>状态</TableHead><TableHead className="w-[140px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.reportNo}</TableCell>
                  <TableCell>{c.policyNo}</TableCell>
                  <TableCell>{c.insuredCompany}</TableCell>
                  <TableCell>{c.insuranceCompany}</TableCell>
                  <TableCell>{c.reportTime}</TableCell>
                  <TableCell><Badge variant={statusColor[c.reportStatus] || 'secondary'}>{c.reportStatus}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/claims/reports/${c.id}`)}><Eye className="w-4 h-4" /></Button>
                      {c.reportStatus === '审批通过' && (
                        <Button variant="ghost" size="icon" onClick={() => { setConfirmId(c.id); setConfirmOpen(true); }} title="理赔确认"><CheckCircle className="w-4 h-4 text-success" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-tertiary py-8">暂无数据</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>理赔确认</DialogTitle></DialogHeader>
          <p className="text-sm text-secondary">确认该报案理赔处理完成？</p>
          <DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)}>取消</Button><Button onClick={handleConfirm}>确认理赔</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
