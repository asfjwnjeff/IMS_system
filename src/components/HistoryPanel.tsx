'use client';

import { useState, useEffect, Fragment } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { HistoryVersion, ApprovalHistoryEntry, ChangeLogEntry } from '@/lib/types';
import { SECTION_JSON_MAP } from '@/lib/field-defs';

interface HistoryPanelProps { applicationId: string; }

export function HistoryPanel({ applicationId }: HistoryPanelProps) {
  const [activeTab, setActiveTab] = useState('logs'); // default: 修改日志
  const [versions, setVersions] = useState<HistoryVersion[]>([]);
  const [approvals, setApprovals] = useState<ApprovalHistoryEntry[]>([]);
  const [logs, setLogs] = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [vRes, aRes, lRes] = await Promise.all([
          fetch(`/api/history?type=versions&applicationId=${applicationId}`),
          fetch(`/api/history?type=approvals&applicationId=${applicationId}`),
          fetch(`/api/history?type=logs&applicationId=${applicationId}`),
        ]);
        const [vData, aData, lData] = await Promise.all([vRes.json(), aRes.json(), lRes.json()]);
        if (vData.success) setVersions(vData.data);
        if (aData.success) setApprovals(aData.data);
        if (lData.success) setLogs(lData.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, [applicationId]);

  // 字段标签映射
  const fieldLabelMap: Record<string, string> = {};
  for (const [k, v] of Object.entries(SECTION_JSON_MAP)) {
    // 简单用 key 作为 label（实际由 field-defs 提供完整映射）
    fieldLabelMap[k] = k;
  }

  if (loading) return <div className="animate-pulse h-32 rounded-md bg-muted/50" />;

  return (
    <div className="bg-surface rounded-lg border border-light">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4 pt-3">
          <TabsList>
            <TabsTrigger value="versions">
              历史版本 {versions.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px]">{versions.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="approvals">
              审批历史 {approvals.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px]">{approvals.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="logs">
              修改日志 {logs.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px]">{logs.length}</Badge>}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          {/* ===== 历史版本 Tab ===== */}
          <TabsContent value="versions">
            {versions.length === 0 ? (
              <p className="text-sm text-tertiary py-4 text-center">暂无历史版本</p>
            ) : (
              <div className="space-y-6">
                {[...versions].reverse().map((v, vi) => {
                  let data: Record<string, unknown> = {};
                  try { data = typeof v.data === 'string' ? JSON.parse(v.data) : (v.data as Record<string, unknown>); } catch { /* ignore */ }
                  const entries = Object.entries(data).filter(([, val]) => val !== undefined && val !== '' && val !== null);
                  const preview = entries.slice(0, 10);
                  const isNewest = vi === versions.length - 1;

                  return (
                    <div key={v.id} className="flex gap-4">
                      {/* 时间线 */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${isNewest ? 'bg-green-500' : 'bg-blue-500'}`} />
                        {vi < versions.length - 1 && <div className="w-px flex-1 min-h-[24px] bg-blue-500/30" />}
                      </div>
                      {/* 内容 */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">V{v.version}</span>
                          <span className="text-sm">— {v.label}</span>
                        </div>
                        <p className="text-xs text-tertiary mb-3">{v.timestamp}</p>
                        {/* 字段预览表格 */}
                        {preview.length > 0 && (
                          <div className="rounded-md border border-light overflow-hidden">
                            <Table>
                              <TableBody>
                                {preview.map(([k, val]) => (
                                  <TableRow key={k}>
                                    <TableCell className="w-[140px] text-xs text-tertiary py-1.5 bg-muted/30">{k}</TableCell>
                                    <TableCell className="text-sm py-1.5">{String(val)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                        {entries.length > 10 && (
                          <p className="text-xs text-tertiary mt-2">…共 {entries.length} 个字段</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== 审批历史 Tab ===== */}
          <TabsContent value="approvals">
            {approvals.length === 0 ? (
              <p className="text-sm text-tertiary py-4 text-center">暂无审批记录</p>
            ) : (
              <div className="space-y-0">
                {approvals.map((a, i) => {
                  const colorMap: Record<string, string> = { '审批通过': 'bg-green-500', '审批拒绝': 'bg-red-500', '待审批': 'bg-blue-500' };
                  const tagVariant: Record<string, 'success' | 'destructive' | 'secondary'> = { '审批通过': 'success', '审批拒绝': 'destructive' };
                  return (
                    <div key={a.id} className="flex gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${colorMap[a.action] || 'bg-blue-500'}`} />
                        {i < approvals.length - 1 && <div className="w-px flex-1 min-h-[24px] bg-blue-500/30" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          {tagVariant[a.action] && <Badge variant={tagVariant[a.action]} className="text-[10px]">{a.action}</Badge>}
                          <span className="font-semibold text-sm">{a.approver}</span>
                        </div>
                        <p className="text-xs text-tertiary mb-1">{a.timestamp}</p>
                        {a.comment && <p className="text-sm text-secondary">{a.comment}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== 修改日志 Tab ===== */}
          <TabsContent value="logs">
            {logs.length === 0 ? (
              <p className="text-sm text-tertiary py-4 text-center">暂无修改记录</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">时间</TableHead>
                    <TableHead className="w-[70px]">操作人</TableHead>
                    <TableHead className="w-[100px]">字段</TableHead>
                    <TableHead>变更</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-tertiary">{log.timestamp}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[11px]">{log.fieldLabel}</Badge></TableCell>
                      <TableCell className="text-xs">
                        <span className="text-destructive line-through mr-1.5">{log.oldValue}</span>
                        <span className="text-muted-foreground mx-1">→</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">{log.newValue}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
