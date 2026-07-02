import { Tabs, Tag, Timeline, Descriptions, Table, Empty } from 'antd';
import type { HistoryVersion, ApprovalHistoryEntry, ChangeLogEntry } from '../types';

interface HistoryPanelProps {
  versions: HistoryVersion[];
  approvalHistory: ApprovalHistoryEntry[];
  changeLogs: ChangeLogEntry[];
  fieldLabelMap: Record<string, string>;
  defaultActiveKey?: string;
}

export default function HistoryPanel({
  versions,
  approvalHistory,
  changeLogs,
  fieldLabelMap,
  defaultActiveKey = 'logs',
}: HistoryPanelProps) {
  // ===== 历史版本 Tab =====
  const versionTab = versions.length === 0 ? (
    <Empty description="暂无历史版本" />
  ) : (
    <Timeline
      items={versions.map((v) => ({
        color: v.version === versions[0].version ? 'green' : 'blue',
        children: (
          <div key={v.version}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>V{v.version} — {v.label}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>{v.timestamp}</div>
            <Descriptions size="small" bordered column={2}>
              {Object.entries(v.data)
                .filter(([, val]) => val !== undefined && val !== '')
                .slice(0, 10)
                .map(([k, val]) => (
                  <Descriptions.Item key={k} label={fieldLabelMap[k] || k}>
                    {String(val)}
                  </Descriptions.Item>
                ))}
            </Descriptions>
            {Object.keys(v.data).length > 10 && (
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                …共 {Object.keys(v.data).length} 个字段
              </div>
            )}
          </div>
        ),
      }))}
    />
  );

  // ===== 审批历史 Tab =====
  const approvalTab = approvalHistory.length === 0 ? (
    <Empty description="暂无审批记录" />
  ) : (
    <Timeline
      items={approvalHistory.map((a) => ({
        color: a.action === '审批通过' ? 'green' : a.action === '审批拒绝' ? 'red' : 'blue',
        children: (
          <div key={a.id}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              <Tag
                color={
                  a.action === '审批通过' ? 'success' : a.action === '审批拒绝' ? 'error' : 'processing'
                }
              >
                {a.action}
              </Tag>
              {a.approver}
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>{a.timestamp}</div>
            {a.comment && <div style={{ fontSize: 13, color: '#595959' }}>{a.comment}</div>}
          </div>
        ),
      }))}
    />
  );

  // ===== 修改日志 Tab =====
  const logTab = (
    <Table
      dataSource={changeLogs}
      rowKey="id"
      size="small"
      pagination={false}
      locale={{ emptyText: <Empty description="暂无修改记录" /> }}
      columns={[
        { title: '时间', dataIndex: 'timestamp', key: 'timestamp', width: 160,
          render: (v: string) => <span style={{ fontSize: 12 }}>{v}</span> },
        { title: '操作人', dataIndex: 'user', key: 'user', width: 80 },
        { title: '字段', dataIndex: 'fieldLabel', key: 'fieldLabel', width: 140 },
        { title: '变更', key: 'change', width: 280,
          render: (_: unknown, r: ChangeLogEntry) => (
            <span style={{ fontSize: 12 }}>
              <span style={{ color: '#ff4d4f', textDecoration: 'line-through' }}>{r.oldValue}</span>
              <span style={{ margin: '0 6px', color: '#bfbfbf' }}>→</span>
              <span style={{ color: '#52c41a', fontWeight: 500 }}>{r.newValue}</span>
            </span>
          ),
        },
      ]}
    />
  );

  return (
    <Tabs
      defaultActiveKey={defaultActiveKey}
      items={[
        {
          key: 'versions',
          label: (
            <span>
              历史版本
              {versions.length > 0 && <Tag style={{ marginLeft: 4 }}>{versions.length}</Tag>}
            </span>
          ),
          children: versionTab,
        },
        {
          key: 'approvals',
          label: (
            <span>
              审批历史
              {approvalHistory.length > 0 && <Tag style={{ marginLeft: 4 }}>{approvalHistory.length}</Tag>}
            </span>
          ),
          children: approvalTab,
        },
        {
          key: 'logs',
          label: (
            <span>
              修改日志
              {changeLogs.length > 0 && <Tag style={{ marginLeft: 4 }}>{changeLogs.length}</Tag>}
            </span>
          ),
          children: logTab,
        },
      ]}
    />
  );
}
