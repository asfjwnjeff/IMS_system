'use client';

// 三标签历史面板 — 历史版本 / 审批历史 / 修改日志
// 替代 Ant Design 的 Tabs + Timeline + Table 组合
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timeline, type TimelineItem } from '@/components/ui/timeline';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { HistoryVersion, ApprovalHistoryEntry, ChangeLogEntry } from '@/lib/types';

const statusColors: Record<string, 'blue' | 'green' | 'red' | 'orange' | 'gray'> = {
  '审批通过': 'green',
  '审批拒绝': 'red',
  '审批中': 'blue',
  '已确认': 'green',
};

interface HistoryPanelProps {
  applicationId: string;
}

export function HistoryPanel({ applicationId }: HistoryPanelProps) {
  const [activeTab, setActiveTab] = useState('versions');
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
      } catch (e) {
        console.error('Failed to load history:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [applicationId]);

  if (loading) {
    return <div className="animate-shimmer h-32 rounded-md bg-hover" />;
  }

  const versionTimeline: TimelineItem[] = versions.map((v) => ({
    label: `V${v.version}`,
    content: v.label,
    time: v.timestamp,
    color: v.version === Math.max(...versions.map(x => x.version)) ? 'blue' as const : 'gray' as const,
  }));

  const approvalTimeline: TimelineItem[] = approvals.map((a) => ({
    label: a.action,
    content: `${a.approver} - ${a.comment || '无备注'}`,
    time: a.timestamp,
    color: statusColors[a.action] || 'blue',
  }));

  return (
    <div className="bg-surface rounded-lg border border-light">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4 pt-3">
          <TabsList>
            <TabsTrigger value="versions">
              历史版本 ({versions.length})
            </TabsTrigger>
            <TabsTrigger value="approvals">
              审批历史 ({approvals.length})
            </TabsTrigger>
            <TabsTrigger value="logs">
              修改日志 ({logs.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          <TabsContent value="versions">
            {versionTimeline.length > 0 ? (
              <Timeline items={versionTimeline} />
            ) : (
              <p className="text-sm text-tertiary py-4 text-center">暂无历史版本</p>
            )}
          </TabsContent>

          <TabsContent value="approvals">
            {approvalTimeline.length > 0 ? (
              <Timeline items={approvalTimeline} />
            ) : (
              <p className="text-sm text-tertiary py-4 text-center">暂无审批记录</p>
            )}
          </TabsContent>

          <TabsContent value="logs">
            {logs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">时间</TableHead>
                    <TableHead className="w-[80px]">操作人</TableHead>
                    <TableHead className="w-[100px]">字段</TableHead>
                    <TableHead>原值</TableHead>
                    <TableHead>新值</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-tertiary">{log.timestamp}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.fieldLabel}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-tertiary line-through">{log.oldValue}</TableCell>
                      <TableCell className="text-xs font-medium" style={{ color: 'var(--blue)' }}>{log.newValue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-tertiary py-4 text-center">暂无修改记录</p>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
