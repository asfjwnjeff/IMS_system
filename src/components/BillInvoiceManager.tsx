'use client';

// 缴费账单 / 发票 管理弹窗 — 复用同一组件，根据 mode 切换
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, FileText, Receipt } from 'lucide-react';

// ===== 类型 =====

interface BillRecord {
  id: string; applicationId: string; billNo: string; billAmount: number;
  billStatus: string; paymentDate: string; remark: string; createdAt: string; updatedAt: string;
}

interface InvoiceRecord {
  id: string; applicationId: string; invoiceNo: string; invoiceAmount: number;
  invoiceType: string; invoiceDate: string; invoiceStatus: string; remark: string; createdAt: string; updatedAt: string;
}

type Mode = 'bill' | 'invoice';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  mode: Mode;
}

// ===== 状态颜色 =====

const billStatusColors: Record<string, 'success' | 'warning' | 'secondary'> = {
  '已缴费': 'success', '已开票': 'success', '待缴费': 'warning',
};

const invoiceStatusColors: Record<string, 'success' | 'destructive'> = {
  '已开具': 'success', '已作废': 'destructive',
};

const invoiceTypeColors: Record<string, 'default' | 'secondary'> = {
  '增值税专用发票': 'default', '增值税普通发票': 'secondary',
};

// ===== 表单空值 =====

const emptyBill = (appId: string): BillRecord => ({
  id: '', applicationId: appId, billNo: '', billAmount: 0,
  billStatus: '待缴费', paymentDate: '', remark: '', createdAt: '', updatedAt: '',
});

const emptyInvoice = (appId: string): InvoiceRecord => ({
  id: '', applicationId: appId, invoiceNo: '', invoiceAmount: 0,
  invoiceType: '增值税普通发票', invoiceDate: '', invoiceStatus: '已开具',
  remark: '', createdAt: '', updatedAt: '',
});

export function BillInvoiceManager({ open, onOpenChange, applicationId, mode }: Props) {
  const isBill = mode === 'bill';
  const apiPath = isBill ? '/api/bills' : '/api/invoices';
  const title = isBill ? '缴费账单管理' : '发票管理';
  const icon = isBill ? <Receipt className="w-5 h-5" /> : <FileText className="w-5 h-5" />;

  const [records, setRecords] = useState<(BillRecord | InvoiceRecord)[]>([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<BillRecord | InvoiceRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiPath}?applicationId=${applicationId}`);
      const d = await res.json();
      if (d.success) setRecords(d.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [apiPath, applicationId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  function openCreate() {
    setEditing(isBill ? emptyBill(applicationId) : emptyInvoice(applicationId));
    setEditOpen(true);
  }

  function openEdit(rec: BillRecord | InvoiceRecord) {
    setEditing({ ...rec });
    setEditOpen(true);
  }

  async function handleSave() {
    if (!editing) return;
    const noField = isBill ? (editing as BillRecord).billNo : (editing as InvoiceRecord).invoiceNo;
    if (!noField) { toast.error('请填写编号'); return; }
    setSaving(true);
    try {
      const res = await fetch(apiPath, {
        method: editing.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(editing.id ? '修改成功' : '新增成功');
        setEditOpen(false);
        load();
      } else {
        toast.error(d.error || '操作失败');
      }
    } catch { toast.error('操作失败'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除？')) return;
    try {
      const res = await fetch(`${apiPath}?id=${id}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) { toast.success('已删除'); load(); }
      else toast.error(d.error || '删除失败');
    } catch { toast.error('删除失败'); }
  }

  function updateField(field: string, value: unknown) {
    if (!editing) return;
    setEditing({ ...editing, [field]: value } as BillRecord | InvoiceRecord);
  }

  // ===== 渲染 =====

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {icon}{title}
              <span className="text-sm font-normal text-[var(--text-tertiary)]">
                — {applicationId}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">
              共 {records.length} 条记录
            </span>
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" />
              {isBill ? '新增账单' : '新增发票'}
            </Button>
          </div>

          {records.length === 0 && !loading ? (
            <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">
              {isBill ? '暂无缴费账单' : '暂无发票记录'}
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto border border-[var(--border-light)] rounded-[var(--radius)]">
              <Table size="sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center">序号</TableHead>
                    <TableHead>{isBill ? '账单编号' : '发票编号'}</TableHead>
                    <TableHead className="text-right">金额</TableHead>
                    {isBill ? (
                      <>
                        <TableHead>账单状态</TableHead>
                        <TableHead>缴费日期</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>发票类型</TableHead>
                        <TableHead>发票状态</TableHead>
                        <TableHead>开票日期</TableHead>
                      </>
                    )}
                    <TableHead>备注</TableHead>
                    <TableHead className="w-[100px] text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((rec, i) => (
                    <TableRow key={rec.id}>
                      <TableCell className="text-center text-[var(--text-tertiary)]">{i + 1}</TableCell>
                      <TableCell className="font-medium">
                        {isBill ? (rec as BillRecord).billNo : (rec as InvoiceRecord).invoiceNo}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {isBill
                          ? (rec as BillRecord).billAmount.toFixed(2)
                          : (rec as InvoiceRecord).invoiceAmount.toFixed(2)}
                      </TableCell>
                      {isBill ? (
                        <>
                          <TableCell>
                            <Badge variant={billStatusColors[(rec as BillRecord).billStatus] || 'secondary'}>
                              {(rec as BillRecord).billStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{(rec as BillRecord).paymentDate || '-'}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>
                            <Badge variant={invoiceTypeColors[(rec as InvoiceRecord).invoiceType] || 'secondary'}>
                              {(rec as InvoiceRecord).invoiceType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={invoiceStatusColors[(rec as InvoiceRecord).invoiceStatus] || 'secondary'}>
                              {(rec as InvoiceRecord).invoiceStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{(rec as InvoiceRecord).invoiceDate || '-'}</TableCell>
                        </>
                      )}
                      <TableCell className="max-w-[150px] truncate text-[var(--text-tertiary)]">
                        {rec.remark || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0 justify-center">
                          <Button variant="link" size="sm" onClick={() => openEdit(rec)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="link" size="sm" className="text-destructive" onClick={() => handleDelete(rec.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 新增/编辑弹窗 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? '编辑' : '新增'}{isBill ? '账单' : '发票'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isBill ? (
              <>
                <div>
                  <label className="text-sm font-medium">账单编号 *</label>
                  <Input
                    value={(editing as BillRecord)?.billNo || ''}
                    onChange={(e) => updateField('billNo', e.target.value)}
                    placeholder="请输入账单编号"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">账单金额</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(editing as BillRecord)?.billAmount || ''}
                    onChange={(e) => updateField('billAmount', Number(e.target.value))}
                    placeholder="请输入金额"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">账单状态</label>
                  <Select
                    value={(editing as BillRecord)?.billStatus || '待缴费'}
                    onValueChange={(v) => updateField('billStatus', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="待缴费">待缴费</SelectItem>
                      <SelectItem value="已缴费">已缴费</SelectItem>
                      <SelectItem value="已开票">已开票</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">缴费日期</label>
                  <Input
                    type="date"
                    value={(editing as BillRecord)?.paymentDate || ''}
                    onChange={(e) => updateField('paymentDate', e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium">发票编号 *</label>
                  <Input
                    value={(editing as InvoiceRecord)?.invoiceNo || ''}
                    onChange={(e) => updateField('invoiceNo', e.target.value)}
                    placeholder="请输入发票编号"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">发票金额</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(editing as InvoiceRecord)?.invoiceAmount || ''}
                    onChange={(e) => updateField('invoiceAmount', Number(e.target.value))}
                    placeholder="请输入金额"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">发票类型</label>
                    <Select
                      value={(editing as InvoiceRecord)?.invoiceType || '增值税普通发票'}
                      onValueChange={(v) => updateField('invoiceType', v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="增值税普通发票">增值税普通发票</SelectItem>
                        <SelectItem value="增值税专用发票">增值税专用发票</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">发票状态</label>
                    <Select
                      value={(editing as InvoiceRecord)?.invoiceStatus || '已开具'}
                      onValueChange={(v) => updateField('invoiceStatus', v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="已开具">已开具</SelectItem>
                        <SelectItem value="已作废">已作废</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">开票日期</label>
                  <Input
                    type="date"
                    value={(editing as InvoiceRecord)?.invoiceDate || ''}
                    onChange={(e) => updateField('invoiceDate', e.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium">备注</label>
              <Input
                value={editing?.remark || ''}
                onChange={(e) => updateField('remark', e.target.value)}
                placeholder="可选备注"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
