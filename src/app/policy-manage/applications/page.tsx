'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnSettings } from '@/components/ColumnSettings';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePersistedConfig } from '@/hooks/usePersistedConfig';
import { toast } from 'sonner';
import { Plus, Eye, Pencil, MoreHorizontal, Download, Trash2 } from 'lucide-react';
import type { InsuranceApplication } from '@/lib/types';

// 默认列定义
const DEFAULT_COLUMNS = [
  { key: 'businessRefNo', label: '业务参考号', visible: true },
  { key: 'insuranceCategory', label: '投保类别', visible: true },
  { key: 'applicationType', label: '申请类型', visible: true },
  { key: 'applicantCompany', label: '投保人企业', visible: true },
  { key: 'customerName', label: '客户名称', visible: true },
  { key: 'insuredCompany', label: '被保人企业', visible: true },
  { key: 'approvalStatus', label: '审批状态', visible: true },
  { key: 'applicationNo', label: '申请编号', visible: false },
  { key: 'applicationTime', label: '申请时间', visible: true },
  { key: 'applicantName', label: '申请人', visible: false },
  { key: 'effectiveStatus', label: '生效状态', visible: false },
  { key: 'isBackfill', label: '回填状态', visible: false },
  { key: 'dataSource', label: '数据来源', visible: false },
];

const statusColor: Record<string, 'success' | 'warning' | 'secondary' | 'destructive'> = {
  '审批通过': 'success', '审批拒绝': 'destructive', '审批中': 'warning', '已确认': 'success',
};

export default function InsuranceApplicationPage() {
  const router = useRouter();
  const { applications, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'latest' | 'all'>('latest');

  const { config: columns, toggle, reorder, moveToTop, reset } = usePersistedConfig('ims_table_columns', DEFAULT_COLUMNS);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (viewMode === 'latest' && !a.isLatest) return false;
      if (statusFilter && statusFilter !== '全部' && a.approvalStatus !== statusFilter) return false;
      if (typeFilter && typeFilter !== '全部' && a.applicationType !== typeFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          a.businessRefNo?.toLowerCase().includes(s) ||
          a.customerName?.toLowerCase().includes(s) ||
          a.applicantCompany?.toLowerCase().includes(s) ||
          a.applicationNo?.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [applications, search, statusFilter, typeFilter, viewMode]);

  const visibleColumns = columns.filter((c) => c.visible);

  async function handleDelete(id: string) {
    if (!confirm('确定删除？')) return;
    await fetch(`/api/applications?id=${id}`, { method: 'DELETE' });
    dispatch({ type: 'DELETE_APPLICATION', id });
    toast.success('已删除');
  }

  function renderCell(app: InsuranceApplication, colKey: string) {
    const val = app[colKey as keyof InsuranceApplication];
    if (colKey === 'approvalStatus') return <Badge variant={statusColor[app.approvalStatus] || 'secondary'}>{app.approvalStatus}</Badge>;
    if (colKey === 'applicationType') return <Badge variant="outline">{app.applicationType}</Badge>;
    if (colKey === 'isBackfill') return <Badge variant={app.isBackfill === '已经回填' ? 'success' : 'secondary'}>{app.isBackfill || '-'}</Badge>;
    return <span className="text-sm">{String(val ?? '-')}</span>;
  }

  async function handleExport() {
    const res = await fetch('/api/export?type=applications');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'applications.xlsx'; a.click();
    URL.revokeObjectURL(url);
    toast.success('导出成功');
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">投保申请表</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-1" />导出</Button>
          <ColumnSettings columns={columns} onToggle={toggle} onReorder={reorder} onMoveToTop={moveToTop} onReset={reset} />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">查询条件</CardTitle>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
              <button className={`px-3 py-1 text-xs rounded-md transition-colors ${viewMode === 'latest' ? 'bg-background shadow-sm' : ''}`} onClick={() => setViewMode('latest')}>当前有效</button>
              <button className={`px-3 py-1 text-xs rounded-md transition-colors ${viewMode === 'all' ? 'bg-background shadow-sm' : ''}`} onClick={() => setViewMode('all')}>全部记录</button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="审批状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部</SelectItem>
                <SelectItem value="审批通过">审批通过</SelectItem>
                <SelectItem value="审批中">审批中</SelectItem>
                <SelectItem value="审批拒绝">审批拒绝</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="申请类型" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部</SelectItem>
                <SelectItem value="新增投保单">新增投保单</SelectItem>
                <SelectItem value="批改申请">批改申请</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="搜索业务参考号/客户/投保人/申请编号" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((c) => (
                    <TableHead key={c.key} className="whitespace-nowrap">{c.label}</TableHead>
                  ))}
                  <TableHead className="w-[60px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((app) => (
                  <TableRow key={app.id}>
                    {visibleColumns.map((c) => (
                      <TableCell key={c.key}>{renderCell(app, c.key)}</TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/policy-manage/applications/${app.id}`)}><Eye className="w-4 h-4 mr-2" />查看详情</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/policy-manage/applications/${app.id}/edit`)}><Pencil className="w-4 h-4 mr-2" />编辑</DropdownMenuItem>
                          {app.approvalStatus === '审批中' && (
                            <DropdownMenuItem onClick={() => handleDelete(app.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />删除</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 1} className="text-center text-tertiary py-12">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
