'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Search, RotateCcw, Eye, Pencil, Trash2 } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function ReportClaimsPage() {
  const router = useRouter();
  const { claims, dispatch, loading: claimsLoading } = useApp();
  const [searchNo, setSearchNo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState('');
  const [claimAmount, setClaimAmount] = useState('');

  const filtered = useMemo(() => claims.filter((c) => {
    if (statusFilter && statusFilter !== 'all' && c.reportStatus !== statusFilter) return false;
    if (searchNo && !c.reportNo?.includes(searchNo) && !c.policyNumber?.includes(searchNo)) return false;
    if (dateFrom && c.reportTime < dateFrom) return false;
    if (dateTo && c.reportTime > dateTo) return false;
    return true;
  }), [claims, searchNo, statusFilter, dateFrom, dateTo]);

  async function handleConfirm() {
    if (!confirmId || !claimResult) { toast.error('请选择理赔结果'); return; }
    const claim = claims.find((c) => c.id === confirmId);
    if (claim) dispatch({ type: 'UPDATE_CLAIM', claim: { ...claim, reportStatus: '已确认', claimResult, claimDetail: { ...(claim.claimDetail || {}), claimAmount: Number(claimAmount) || 0 } as unknown as typeof claim.claimDetail } });
    await fetch('/api/claims', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: confirmId, reportStatus: '已确认', claimResult, claimAmount: Number(claimAmount) || 0 }) });
    toast.success('理赔确认成功'); setConfirmOpen(false); setConfirmId(null);
  }

  const statusColor: Record<string, string> = { '审批通过': '#52c41a', '审批拒绝': '#ff4d4f', '已确认': '#1677ff', '待审批': '#333' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-lg font-bold">报案理赔管理</h1></div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">查询条件</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="报案状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="待审批">待审批</SelectItem><SelectItem value="审批通过">审批通过</SelectItem>
                <SelectItem value="审批拒绝">审批拒绝</SelectItem><SelectItem value="已确认">已确认</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="报案编号/保单号" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="w-[200px]" />
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" />
            <span className="text-tertiary">-</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
            <Button size="sm"><Search className="w-4 h-4 mr-1" />搜索</Button>
            <Button size="sm" variant="outline" onClick={() => { setSearchNo(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); }}><RotateCcw className="w-4 h-4 mr-1" />重置</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <div className="p-3 border-b border-light"><Button size="sm" onClick={() => router.push('/claims/reports/new')}><Plus className="w-4 h-4 mr-1" />新增</Button></div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">序号</TableHead><TableHead>报案编号</TableHead><TableHead>报案状态</TableHead><TableHead>报案时间</TableHead><TableHead>投保申请人</TableHead><TableHead>保单单号</TableHead><TableHead>保险公司</TableHead><TableHead>被保人企业</TableHead><TableHead>理赔结果</TableHead><TableHead className="w-[220px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell className="text-center">{i + 1}</TableCell>
                  <TableCell>{c.reportNo}</TableCell>
                  <TableCell><span style={{ color: statusColor[c.reportStatus] || '#333' }}>{c.reportStatus}</span></TableCell>
                  <TableCell>{c.reportTime}</TableCell>
                  <TableCell>{c.applicantName}</TableCell>
                  <TableCell>{c.policyNumber}</TableCell>
                  <TableCell>{c.insuranceCompanyName}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{c.insuredCompanyName}</TableCell>
                  <TableCell>{c.claimResult || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-0">
                      <Button variant="link" size="sm"><Pencil className="w-3.5 h-3.5 mr-0.5" />编辑</Button>
                      <Button variant="link" size="sm" onClick={() => router.push(`/claims/reports/${c.id}`)}><Eye className="w-3.5 h-3.5 mr-0.5" />查看</Button>
                      <Button variant="link" size="sm" className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-0.5" />删除</Button>
                      <Button variant="link" size="sm">发起审批</Button>
                      {c.reportStatus === '审批通过' && (
                        <Button variant="link" size="sm" onClick={() => { setConfirmId(c.id); setConfirmOpen(true); setClaimResult(''); setClaimAmount(''); }}>理赔确认</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-tertiary py-8">暂无数据</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>理赔确认</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm">理赔结果 *</label><Select value={claimResult} onValueChange={setClaimResult}><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent><SelectItem value="赔付">赔付</SelectItem><SelectItem value="拒赔">拒赔</SelectItem><SelectItem value="部分赔付">部分赔付</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm">理赔金额</label><Input type="number" step="0.01" value={claimAmount} onChange={(e) => setClaimAmount(e.target.value)} placeholder="请输入理赔金额" /></div>
            <div><label className="text-sm">上传附件</label><Input placeholder="支持 pdf/word/excel/zip/jpg/png，单文件 ≤5MB" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)}>取消</Button><Button onClick={handleConfirm}>确认理赔</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
