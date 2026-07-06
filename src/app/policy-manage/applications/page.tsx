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
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnSettings } from '@/components/ColumnSettings';
import { BillInvoiceManager } from '@/components/BillInvoiceManager';
import { InsuranceRateSelector } from '@/components/InsuranceRateSelector';
import type { RateSelectionResult } from '@/components/InsuranceRateSelector';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { usePersistedConfig } from '@/hooks/usePersistedConfig';
import { cn } from '@/lib/utils';
import { SECTION_JSON_MAP } from '@/lib/field-defs';
import { toast } from 'sonner';
import { Search, RotateCcw, Download, MoreHorizontal, Eye, Pencil, Trash2, Settings2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import type { InsuranceApplication } from '@/lib/types';

// 审批状态
const WORKFLOW_LABELS: Record<string, string> = {
  'Draft': '草稿', 'WaitStart': '待发起', 'Approving': '待审批',
  'Approved': '审批通过', 'Reject': '审批拒绝',
};
const statusColorMap: Record<string, 'success' | 'warning' | 'secondary' | 'destructive' | 'default'> = {
  'Approved': 'success', 'Reject': 'destructive', 'Approving': 'warning', 'WaitStart': 'secondary', 'Draft': 'secondary',
};

// ===== 搜索字段定义 =====
interface SearchFieldDef { key: string; label: string; type: 'input' | 'select' | 'dateRange'; options?: string[]; width?: number }
const searchFieldDefs: SearchFieldDef[] = [
  { key: 'policyNo', label: '投保单号', type: 'input', width: 150 },
  { key: 'jobidref', label: '业务参考号', type: 'input', width: 150 },
  { key: 'applicationTime', label: '投保时间', type: 'dateRange', width: 240 },
  { key: 'workflowStatus', label: '审批状态', type: 'select', options: Object.keys(WORKFLOW_LABELS), width: 130 },
  { key: 'insuranceCompanyPolicyStatus', label: '保险公司保单状态', type: 'select', options: ['已承保', '已批改', '待承保'], width: 150 },
  { key: 'policyNumber', label: '保单单号', type: 'input', width: 150 },
  { key: 'policyHolderNameDesc', label: '投保人企业名称', type: 'input', width: 180 },
  { key: 'insuredCompanyName', label: '被保人企业名称', type: 'input', width: 180 },
  { key: 'productNameCn', label: '中文商品名称', type: 'input', width: 180 },
  { key: 'insuranceCompanyName', label: '保险公司名称', type: 'input', width: 150 },
  { key: 'dataSources', label: '数据来源', type: 'select', options: ['fms', 'cos'], width: 100 },
];

// ===== 默认搜索字段 =====
const defaultSearchFields = [
  { key: 'policyNo', visible: true, order: 0 },
  { key: 'jobidref', visible: true, order: 1 },
  { key: 'applicationTime', visible: true, order: 2 },
  { key: 'workflowStatus', visible: false, order: 3 },
  { key: 'insuranceCompanyPolicyStatus', visible: false, order: 4 },
  { key: 'policyNumber', visible: false, order: 5 },
  { key: 'policyHolderNameDesc', visible: false, order: 6 },
  { key: 'insuredCompanyName', visible: true, order: 7 },
  { key: 'productNameCn', visible: false, order: 8 },
  { key: 'insuranceCompanyName', visible: false, order: 9 },
  { key: 'dataSources', visible: false, order: 10 },
];

// ===== 所有表格列 33列 =====
const allColumns = [
  { key: 'id', title: '序号', width: 50, align: 'center' as const },
  { key: 'jobidref', title: '业务参考号', width: 180, isLink: true },
  { key: 'submitTypeDesc', title: '申请类型', width: 100, isTypeTag: true },
  { key: 'workflowStatus', title: '审核状态', width: 90, isStatusTag: true },
  { key: 'documentStatusDesc', title: '文档状态', width: 80 },
  { key: 'auditReason', title: '审批备注', width: 150, ellipsis: true },
  { key: 'insuranceCompanyPolicyStatus', title: '保险公司保单状态', width: 120 },
  { key: 'insuranceCompanyCorrectionStatus', title: '保险公司批改状态', width: 120 },
  { key: 'policyNo', title: '投保单号', width: 150 },
  { key: 'applicationTime', title: '投保时间', width: 160 },
  { key: 'policyHolderNameDesc', title: '投保人企业名称', width: 200, ellipsis: true },
  { key: 'productNameCn', title: '中文商品名称', width: 200, ellipsis: true },
  { key: 'currencyCodeIdDesc', title: '币制中文名称', width: 100 },
  { key: 'invoiceAmount', title: '发票金额', width: 110, align: 'right' as const, isAmount: true },
  { key: 'estimatedInsuranceAmount', title: '预计保险金额', width: 120, align: 'right' as const, isAmount: true },
  { key: 'markupPercentageDesc', title: '加成比例', width: 140 },
  { key: 'estimatedPremium', title: '预计保费', width: 100, align: 'right' as const, isPremium: true },
  { key: 'insuranceCompanyPremium', title: '实际保费', width: 100, align: 'right' as const, isPremium: true },
  { key: 'applicantName', title: '投保申请人姓名', width: 110 },
  { key: 'insuranceCompanyName', title: '保险公司名称', width: 100 },
  { key: 'cosOrderStatus', title: 'COS订单状态', width: 100 },
  { key: 'insuranceCategoryDesc', title: '投保类别', width: 90 },
  { key: 'transitPort', title: '途径港', width: 180, ellipsis: true },
  { key: 'containerTypeDesc', title: '车厢类型', width: 80 },
  { key: 'packageTypeDesc', title: '包装种类', width: 200, ellipsis: true },
  { key: 'packageQuantity', title: '件数', width: 60, align: 'right' as const },
  { key: 'insuredCompanyName', title: '被保人企业名称', width: 200, ellipsis: true },
  { key: 'policyNumber', title: '保单单号', width: 200 },
  { key: 'insuredCompanyDesc', title: '客户名称', width: 200, ellipsis: true },
  { key: 'effectiveStatusDesc', title: '生效状态', width: 80 },
  { key: 'isBackfill', title: '是否回填', width: 90 },
  { key: 'dataSources', title: '数据来源', width: 70 },
  { key: 'correctionOfPremiums', title: '批改实际保费', width: 110, align: 'right' as const, isPremium: true },
];

const columnLabelMap: Record<string, string> = Object.fromEntries(allColumns.map((c) => [c.key, c.title]));

const defaultColumnFields = allColumns.map((c, i) => ({ key: c.key, label: c.title, visible: true, order: i }));

export default function InsuranceApplicationPage() {
  const router = useRouter();
  const { applications, dispatch, loading } = useApp();
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 搜索字段配置
  const searchConfig = usePersistedConfig('ims_search_fields_v2', defaultSearchFields);
  // 表格列配置
  const columnConfig = usePersistedConfig('ims_table_columns_v2', defaultColumnFields);

  // 回填弹窗
  const [backfillOpen, setBackfillOpen] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<InsuranceApplication | null>(null);

  // 账单/发票弹窗
  const [billAppId, setBillAppId] = useState<string | null>(null);
  const [invoiceAppId, setInvoiceAppId] = useState<string | null>(null);

  // 费率选择弹窗
  const [rateSelectorOpen, setRateSelectorOpen] = useState(false);
  const [rateSelectorApp, setRateSelectorApp] = useState<InsuranceApplication | null>(null);

  // 过滤
  const filtered = useMemo(() => {
    return applications.filter((a) => {
      for (const [key, val] of Object.entries(searchValues)) {
        if (!val) continue;
        const v = String(val).toLowerCase();
        const fieldVal = getFieldString(a, key);
        if (!fieldVal.toLowerCase().includes(v)) return false;
      }
      return true;
    });
  }, [applications, searchValues]);

  const visibleColumns = columnConfig.config.filter((c) => c.visible);

  // 分页
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // ===== 渲染表格单元格 =====
  function renderCell(app: InsuranceApplication, colKey: string, rowIndex?: number) {
    // 序号列：显示分页后的 1-based 序号
    if (colKey === 'id') {
      const seq = (rowIndex ?? 0) + 1 + (page - 1) * pageSize;
      return <span className="text-sm text-center w-full inline-block">{seq}</span>;
    }

    // 获取 JSON 段落内的字段值
    const val = getFieldString(app, colKey);
    const appAny = app as unknown as Record<string, unknown>;

    // 业务参考号 — 可点击
    if (colKey === 'jobidref') {
      return (
        <span>
          <button className="text-blue-600 hover:underline text-sm" onClick={() => router.push(`/policy-manage/applications/${app.id}`)}>
            {app.jobidref}
          </button>
          {!app.isLatest && <Badge variant="secondary" className="ml-1.5 text-[10px] opacity-60">历史版本</Badge>}
        </span>
      );
    }
    // 申请类型
    if (colKey === 'submitTypeDesc') {
      return <Badge variant={app.submitTypeDesc === '批改申请' ? 'warning' : 'default'}>{app.submitTypeDesc || '-'}</Badge>;
    }
    // 审核状态
    if (colKey === 'workflowStatus') {
      return <Badge variant={statusColorMap[app.workflowStatus] || 'secondary'}>{WORKFLOW_LABELS[app.workflowStatus] || app.workflowStatus || '-'}</Badge>;
    }
    // 金额类
    if (colKey === 'invoiceAmount' || colKey === 'estimatedInsuranceAmount') {
      const n = parseFloat(val);
      return <span className="text-sm tabular-nums">{isNaN(n) ? '-' : n.toLocaleString()}</span>;
    }
    if (colKey === 'estimatedPremium' || colKey === 'insuranceCompanyPremium' || colKey === 'correctionOfPremiums') {
      const n = parseFloat(val);
      return <span className="text-sm tabular-nums">{isNaN(n) ? (colKey === 'correctionOfPremiums' ? '' : '-') : n.toFixed(2)}</span>;
    }
    // 回填状态
    if (colKey === 'isBackfill') {
      return <Badge variant={val === '已经回填' ? 'success' : 'secondary'}>{val || '-'}</Badge>;
    }

    return <span className={cn('text-sm', colKey === 'id' ? '' : '')}>{val || '-'}</span>;
  }

  // ===== 更多操作菜单项 =====
  interface ActionItem { label: string; onClick: () => void; danger?: boolean }
  type ActionItems = (ActionItem | 'separator')[];

  function getMoreActions(app: InsuranceApplication): ActionItems {
    const s = app.workflowStatus;
    const t = app.submitTypeDesc;
    const isCorrection = t === '批改申请';
    const items: ActionItems = [];

    if (!app.isLatest) {
      return [{ label: '详情查看', onClick: () => router.push(`/policy-manage/applications/${app.id}`) }];
    }

    if (s === 'WaitStart' || s === 'Reject') {
      items.push({ label: '编辑', onClick: () => router.push(`/policy-manage/applications/${app.id}/edit`) });
    }
    if (s === 'WaitStart') {
      items.push({ label: '删除', onClick: () => { if (confirm('确定要删除投保单 ' + app.jobidref + ' 吗？')) { fetch('/api/applications?id=' + app.id, { method: 'DELETE' }); dispatch({ type: 'DELETE_APPLICATION', id: app.id }); toast.success('已删除'); } }, danger: true });
      items.push({ label: '保险费率选择', onClick: () => { setRateSelectorApp(app); setRateSelectorOpen(true); } });
    }
    if (s === 'WaitStart' || s === 'Reject') {
      items.push({ label: '发起审批', onClick: () => toast.success('已发起审批') });
    }
    if (s === '审批中' || s === '待审核') {
      items.push({ label: '撤销审核', onClick: () => toast.success('已撤销审核，已通知所有审批人') });
    }
    if (s === 'Approved') {
      if (isCorrection) {
        items.push({ label: '批改信息回填', onClick: () => { setCurrentRecord(app); setCorrectionOpen(true); } });
      } else {
        items.push({ label: '保单信息回填', onClick: () => { setCurrentRecord(app); setBackfillOpen(true); } });
      }
      items.push({ label: '缴费账单', onClick: () => setBillAppId(app.id) });
      items.push({ label: '发票', onClick: () => setInvoiceAppId(app.id) });
      if (!isCorrection) items.push({ label: '发起批改', onClick: () => toast.info('发起批改 — 待开发') });
    }

    return items;
  }

  // ===== 搜索字段渲染 =====
  const visibleSearchFields = searchConfig.config.filter((f) => f.visible);

  function renderSearchField(fkey: string) {
    const def = searchFieldDefs.find((d) => d.key === fkey);
    if (!def) return null;
    const value = searchValues[fkey] || '';

    if (def.type === 'input') {
      return (
        <Input
          key={fkey}
          placeholder={def.label}
          value={value}
          onChange={(e) => setSearchValues((prev) => ({ ...prev, [fkey]: e.target.value }))}
          className="w-[160px]"
        />
      );
    }
    if (def.type === 'select' && def.options) {
      return (
        <Select key={fkey} value={value || 'all'} onValueChange={(v) => setSearchValues((prev) => ({ ...prev, [fkey]: v === 'all' ? '' : v }))}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder={def.label} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            {def.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }
    return null;
  }

  function handleExport(type: string) {
    toast.info(`${type} — 导出功能`);
    if (type === 'list') {
      fetch('/api/export?type=applications').then((r) => r.blob()).then((b) => {
        const url = URL.createObjectURL(b);
        const a = document.createElement('a'); a.href = url; a.download = 'applications.xlsx'; a.click();
        URL.revokeObjectURL(url); toast.success('导出成功');
      }).catch(() => toast.error('导出失败'));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">投保申请表</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">查询条件</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 搜索字段行 */}
          <div className="flex flex-wrap gap-2 items-center mb-3">
            {visibleSearchFields.map((f) => renderSearchField(f.key))}
          </div>

          {/* 工具栏 */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { /* search already live-filtered */ }}><Search className="w-4 h-4 mr-1" />搜索</Button>
              <Button size="sm" variant="outline" onClick={() => setSearchValues({})}><RotateCcw className="w-4 h-4 mr-1" />重置</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1" />导出</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('list')}>列表导出</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pingan')}>平安导出</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('picc1')}>PICC进出口货运</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('picc2')}>PICC国内运输</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={searchPanelOpen ? 'default' : 'outline'} onClick={() => setSearchPanelOpen(!searchPanelOpen)}>
                <Settings2 className="w-4 h-4 mr-1" />自定义查询
              </Button>
              <ColumnSettings columns={columnConfig.config} onToggle={columnConfig.toggle} onReorder={columnConfig.reorder} onMoveToTop={columnConfig.moveToTop} onReset={columnConfig.reset} />
            </div>
          </div>

          {/* 自定义查询面板 */}
          {searchPanelOpen && (
            <div className="mt-3 p-3 border-2 border-blue-500 rounded-md bg-background">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">自定义查询字段</span>
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => setSearchPanelOpen(false)}>确定</Button>
                  <Button size="sm" variant="outline" onClick={searchConfig.reset}>重置默认</Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...searchConfig.config].sort((a, b) => a.order - b.order).map((f) => {
                  const label = searchFieldDefs.find((d) => d.key === f.key)?.label || f.key;
                  return (
                    <span key={f.key} onClick={() => searchConfig.toggle(f.key)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs cursor-pointer select-none transition-colors ${
                        f.visible ? 'border border-blue-300 bg-blue-50 text-blue-600' : 'border border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      {f.visible ? '✓' : '+'} {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 表格 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <SkeletonTable rows={5} cols={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="暂无投保申请"
              description="当前筛选条件下没有投保申请记录"
            />
          ) : (
            <div className="overflow-x-auto">
            <Table className="min-w-max">
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((c) => (
                    <TableHead key={c.key} className={`whitespace-nowrap ${c.key === 'id' ? 'text-center' : ''}`}
                      style={{ width: allColumns.find((x) => x.key === c.key)?.width || 'auto', textAlign: allColumns.find((x) => x.key === c.key)?.align || 'left' }}
                    >{columnLabelMap[c.key]}</TableHead>
                  ))}
                  <TableHead className="w-[80px] text-center sticky right-0 z-20 bg-[var(--bg-subtle)] shadow-[-4px_0_8px_rgba(0,0,0,0.06)]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((app, idx) => (
                  <TableRow key={app.id} className={!app.isLatest ? 'opacity-50' : ''}>
                    {visibleColumns.map((c) => (
                      <TableCell key={c.key} style={{ textAlign: allColumns.find((x) => x.key === c.key)?.align || 'left' }}>
                        {renderCell(app, c.key, idx)}
                      </TableCell>
                    ))}
                    <TableCell className="sticky right-0 z-10 bg-[var(--bg-surface)] shadow-[-4px_0_8px_rgba(0,0,0,0.06)]">
                      {!app.isLatest ? (
                        <Button variant="link" size="sm" onClick={() => router.push(`/policy-manage/applications/${app.id}`)}>查看</Button>
                      ) : (
                        <div className="flex items-center gap-0">
                          {(app.workflowStatus === 'WaitStart' || app.workflowStatus === 'Reject') && (
                            <Button variant="link" size="sm" onClick={() => router.push(`/policy-manage/applications/${app.id}/edit`)}>编辑</Button>
                          )}
                          {app.workflowStatus === 'WaitStart' && (
                            <Button variant="link" size="sm" className="text-destructive" onClick={() => { if (confirm('删除？')) { fetch('/api/applications?id=' + app.id, { method: 'DELETE' }); dispatch({ type: 'DELETE_APPLICATION', id: app.id }); toast.success('已删除'); } }}>删除</Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="link" size="sm">更多<MoreHorizontal className="w-3.5 h-3.5 ml-0.5" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {getMoreActions(app).map((item, i) =>
                                item === 'separator' ? (
                                  <DropdownMenuSeparator key={i} />
                                ) : (
                                  <DropdownMenuItem key={i} onClick={item.onClick} className={item.danger ? 'text-destructive' : ''}>
                                    {item.label}
                                  </DropdownMenuItem>
                                )
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
          {/* 分页 */}
          {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-light">
            <div className="flex items-center gap-2 text-sm text-secondary">
              共 {filtered.length} 条
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger size="sm" className="w-[80px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 条</SelectItem>
                  <SelectItem value="20">20 条</SelectItem>
                  <SelectItem value="50">50 条</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(1)}><ChevronsLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm px-2 min-w-[60px] text-center">{page} / {totalPages || 1}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(totalPages)}><ChevronsRight className="w-4 h-4" /></Button>
            </div>
          </div>
          )}
        </CardContent>
      </Card>

      {/* 保单信息回填弹窗 */}
      <Dialog open={backfillOpen} onOpenChange={setBackfillOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>保单信息回填</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm">保险公司名称 *</label>
              <Select defaultValue={currentRecord?.backfillInfo?.insuranceCompanyCode || ''}>
                <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="中国人保">CO00056870 - 中国人保</SelectItem>
                  <SelectItem value="中国平安">中国平安</SelectItem>
                  <SelectItem value="人保财险">人保财险</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-sm">保单单号</label><Input placeholder="请输入保单单号" maxLength={100} /></div>
            <div><label className="text-sm">实际保费</label><Input placeholder="请输入保费" /></div>
            <div><label className="text-sm">保单附件</label><Input placeholder="请上传 大小不超过 5MB 格式为 doc/docx/pdf/xls/xlsx/jpg/png/jpeg 的文件" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackfillOpen(false)}>取消</Button>
            <Button onClick={() => { toast.success('回填成功'); setBackfillOpen(false); }}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批改信息回填弹窗 */}
      <Dialog open={correctionOpen} onOpenChange={setCorrectionOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>批改信息回填</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm">保险公司批改状态</label>
              <Select defaultValue={currentRecord?.correctionInfo?.insuranceCompanyCorrectionStatus || ''}>
                <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="已批改">已批改</SelectItem>
                  <SelectItem value="待批改">待批改</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-sm">保险公司批改编号</label><Input placeholder="请输入批改编号" /></div>
            <div><label className="text-sm">批改后实际保费</label><Input placeholder="请输入批改后实际保费" /></div>
            <div><label className="text-sm">附件</label><Input placeholder="请上传 大小不超过 5MB 格式为 doc/docx/pdf/xls/xlsx/jpg/png/jpeg 的文件" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCorrectionOpen(false)}>取消</Button>
            <Button onClick={() => { toast.success('回填成功'); setCorrectionOpen(false); }}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 费率选择弹窗 */}
      {rateSelectorApp && (
        <InsuranceRateSelector
          open={rateSelectorOpen}
          onOpenChange={setRateSelectorOpen}
          invoiceAmount={Number((rateSelectorApp.insuranceInfo as unknown as Record<string, unknown> | null)?.invoiceAmount) || 0}
          currency={String((rateSelectorApp.insuranceInfo as unknown as Record<string, unknown> | null)?.currencyCodeIdDesc || '人民币')}
          markupRatio={String((rateSelectorApp.insuranceInfo as unknown as Record<string, unknown> | null)?.markupPercentageDesc || '发票金额原值100%')}
          onConfirm={(result) => {
            toast.success(`已为投保单 ${rateSelectorApp.jobidref} 选择「${result.productName}」`);
            setRateSelectorOpen(false);
          }}
        />
      )}

      {/* 缴费账单弹窗 */}
      {billAppId && (
        <BillInvoiceManager
          open={!!billAppId}
          onOpenChange={(open) => { if (!open) setBillAppId(null); }}
          applicationId={billAppId}
          mode="bill"
        />
      )}

      {/* 发票弹窗 */}
      {invoiceAppId && (
        <BillInvoiceManager
          open={!!invoiceAppId}
          onOpenChange={(open) => { if (!open) setInvoiceAppId(null); }}
          applicationId={invoiceAppId}
          mode="invoice"
        />
      )}
    </div>
  );
}

// ===== 工具函数 =====

function getFieldString(app: InsuranceApplication, key: string): string {
  const sectionKey = SECTION_JSON_MAP[key];
  if (!sectionKey || sectionKey === 'root') {
    const val = (app as unknown as Record<string, unknown>)[key];
    return val == null ? '' : String(val);
  }
  const sectionData = (app as unknown as Record<string, unknown>)[sectionKey] as Record<string, unknown> | undefined;
  if (!sectionData) return '';
  const val = sectionData[key];
  return val == null ? '' : String(val);
}
