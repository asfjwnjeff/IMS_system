import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Button, Space, Row, Col, Tabs, Table, Timeline, Descriptions, Empty } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { mockApplications, mockHistoryVersions, mockApprovalHistory, mockChangeLogs } from '../../mock/data';
import { sections } from './fields';
import type { HistoryVersion, ApprovalHistoryEntry, ChangeLogEntry } from '../../mock/data';

const SectionHead = ({ title }: { title: string }) => (
  <div className="section-head">
    <span className="section-head-line" />
    <span className="section-head-title">{title}</span>
  </div>
);

const statusTags: Record<string, string> = {
  '已承保': 'green', '已批改': 'blue', '待承保': 'default', '待发起': 'default',
  '已确认': 'blue', '审批通过': 'green', '审批拒绝': 'red', '生效': 'green',
  '待审核': 'processing', '草稿': 'default',
};

/** 从 sections 中提取字段标签映射 */
const fieldLabelMap: Record<string, string> = {};
sections.forEach((s) => s.fields.forEach((f) => { fieldLabelMap[f.key] = f.label; }));

/** 格式化值 */
function formatVal(v: unknown, key: string): string {
  if (v === undefined || v === null || v === '') return '-';
  if (typeof v === 'number') {
    if (['estimatedPremium', 'actualPremium', 'correctionActualPremium'].includes(key)) return v.toFixed(2);
    return v.toLocaleString();
  }
  if (Array.isArray(v)) return v.length > 0 ? v.join(', ') : '-';
  return String(v);
}

const isStatusKey = (key: string) => key === 'insurancePolicyStatus' || key === 'insuranceCorrectionStatus' || key === 'approvalStatus' || key === 'documentStatus' || key === 'effectiveStatus';
const isFileKey = (key: string) => key === 'insuranceFiles' || key === 'policyFiles' || key === 'correctionFiles';

// ===== 主组件 =====

export default function InsuranceApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const record = mockApplications.find((a) => a.id === Number(id));
  const [showChanges, setShowChanges] = useState(false);

  if (!record) return <Card title="投保单详情"><p>未找到投保单记录</p></Card>;

  const rec = record as unknown as Record<string, unknown>;
  const canEdit = record.approvalStatus === '待发起' || record.approvalStatus === '审批拒绝';

  // ----- 历史数据 -----
  const versions: HistoryVersion[] = mockHistoryVersions[record.id] || [];
  const approvalHistory: ApprovalHistoryEntry[] = mockApprovalHistory[record.id] || [];
  const changeLogs: ChangeLogEntry[] = mockChangeLogs[record.id] || [];

  // 用于对比的上一版本
  const compareVersion: HistoryVersion | null = versions.length > 0 ? versions[versions.length - 1] : null;

  /** 判断字段值是否与上一版本不同 */
  const isFieldChanged = (key: string): boolean => {
    if (!showChanges || !compareVersion) return false;
    const prev = (compareVersion.data as unknown as Record<string, unknown>)[key];
    const curr = rec[key];
    return JSON.stringify(prev) !== JSON.stringify(curr);
  };

  /** 获取上一版本中某字段的原始值 */
  const getOldValue = (key: string): string => {
    if (!compareVersion) return '';
    const val = (compareVersion.data as unknown as Record<string, unknown>)[key];
    if (val === undefined || val === null || val === '') return '（空）';
    return String(val);
  };

  // 变更统计
  const changedCount = compareVersion
    ? Object.keys(compareVersion.data).filter((k) => {
        const prev = (compareVersion.data as unknown as Record<string, unknown>)[k];
        const curr = rec[k];
        return JSON.stringify(prev) !== JSON.stringify(curr);
      }).length
    : 0;

  // ===== 历史版本 Tab =====
  const versionTab = (
    <div>
      {versions.length === 0 ? (
        <Empty description="暂无历史版本" />
      ) : (
        <Timeline
          items={versions.map((v) => ({
            color: v.version === versions[0].version ? 'green' : 'blue',
            children: (
              <div key={v.version}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  V{v.version} — {v.label}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>{v.timestamp}</div>
                <Descriptions size="small" bordered column={2}>
                  {Object.entries(v.data).filter(([, val]) => val !== undefined && val !== '').slice(0, 10).map(([k, val]) => (
                    <Descriptions.Item key={k} label={fieldLabelMap[k] || k}>{String(val)}</Descriptions.Item>
                  ))}
                </Descriptions>
                {Object.keys(v.data).length > 10 && (
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>…共 {Object.keys(v.data).length} 个字段</div>
                )}
              </div>
            ),
          }))}
        />
      )}
    </div>
  );

  // ===== 审批历史 Tab =====
  const approvalTab = (
    <div>
      {approvalHistory.length === 0 ? (
        <Empty description="暂无审批记录" />
      ) : (
        <Timeline
          items={approvalHistory.map((a) => ({
            color: a.action === '审批通过' ? 'green' : a.action === '审批拒绝' ? 'red' : 'blue',
            children: (
              <div key={a.id}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>
                  <Tag color={a.action === '审批通过' ? 'success' : a.action === '审批拒绝' ? 'error' : 'processing'}>{a.action}</Tag>
                  {a.approver}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>{a.timestamp}</div>
                {a.comment && <div style={{ fontSize: 13, color: '#595959' }}>{a.comment}</div>}
              </div>
            ),
          }))}
        />
      )}
    </div>
  );

  // ===== 修改日志 Tab =====
  const logColumns = [
    { title: '时间', dataIndex: 'timestamp', key: 'timestamp', width: 160, render: (v: string) => <span style={{ fontSize: 12 }}>{v}</span> },
    { title: '操作人', dataIndex: 'user', key: 'user', width: 80 },
    { title: '字段', dataIndex: 'fieldLabel', key: 'fieldLabel', width: 140 },
    {
      title: '变更', key: 'change', width: 280,
      render: (_: unknown, r: ChangeLogEntry) => (
        <span style={{ fontSize: 12 }}>
          <span style={{ color: '#ff4d4f', textDecoration: 'line-through' }}>{r.oldValue}</span>
          <span style={{ margin: '0 6px', color: '#bfbfbf' }}>→</span>
          <span style={{ color: '#52c41a', fontWeight: 500 }}>{r.newValue}</span>
        </span>
      ),
    },
  ];

  const logTab = (
    <Table
      dataSource={changeLogs}
      columns={logColumns}
      rowKey="id"
      size="small"
      pagination={false}
      locale={{ emptyText: <Empty description="暂无修改记录" /> }}
    />
  );

  return (
    <Card
      title={<span style={{ fontSize: 16, fontWeight: 600 }}>投保单详情 — {record.businessRefNo}</span>}
      extra={
        <Space>
          {compareVersion && (
            <Button
              icon={<SwapOutlined />}
              type={showChanges ? 'primary' : 'default'}
              onClick={() => setShowChanges(!showChanges)}
              style={showChanges ? { background: '#faad14', borderColor: '#faad14' } : undefined}
            >
              {showChanges ? '隐藏变更' : '显示变更'}
              {!showChanges && changedCount > 0 && (
                <span style={{ marginLeft: 4, fontSize: 11, color: '#faad14' }}>（{changedCount}）</span>
              )}
            </Button>
          )}
          {canEdit && (
            <Button type="primary" onClick={() => navigate(`/policyManage/insuranceapplicationEdit/${record.id}`)}>编辑</Button>
          )}
          <Button onClick={() => navigate(-1)}>返回</Button>
        </Space>
      }
    >
      {/* ===== 变更对比提示条 ===== */}
      {showChanges && compareVersion && (
        <div style={{
          marginBottom: 16, padding: '8px 14px',
          background: '#fffbe6', border: '1px solid #ffe58f',
          borderRadius: 6, fontSize: 13, color: '#ad6800',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <SwapOutlined />
          正在对比当前版本与 <strong>V{compareVersion.version}（{compareVersion.label}）</strong>，
          共 <strong>{changedCount}</strong> 处变更，黄色高亮字段为已变更项
        </div>
      )}

      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: 24 }}>
          <SectionHead title={section.title} />
          <Card size="small" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
            <Row gutter={[24, 8]}>
              {section.fields.map((field) => {
                const key = field.key;
                const val = formatVal(rec[key], key);
                const showStatus = isStatusKey(key);
                const showFile = isFileKey(key);
                const changed = isFieldChanged(key);
                const oldValue = getOldValue(key);
                const colSpan = field.span === 2 ? 24 : 8;

                return (
                  <Col key={key} xs={24} sm={12} md={8} lg={colSpan}>
                    <div
                      style={{
                        marginBottom: 12,
                        padding: changed ? '6px 8px' : undefined,
                        background: changed ? '#fffbe6' : undefined,
                        border: changed ? '2px solid #faad14' : undefined,
                        borderRadius: changed ? 6 : undefined,
                      }}
                    >
                      <div style={{
                        fontSize: 12,
                        color: changed ? '#d48806' : '#8c8c8c',
                        fontWeight: changed ? 600 : 400,
                        marginBottom: 4,
                      }}>
                        {changed ? '● ' : ''}{field.label}
                      </div>
                      <div style={{ fontSize: 14, color: '#262626', minHeight: 22, wordBreak: 'break-all' }}>
                        {showStatus ? (
                          val !== '-' ? <Tag color={statusTags[val] || 'default'}>{val}</Tag> : '-'
                        ) : showFile ? (
                          val !== '-' ? val : <span style={{ color: '#bfbfbf' }}>暂无附件</span>
                        ) : (
                          val
                        )}
                      </div>
                      {changed && (
                        <div style={{ fontSize: 11, color: '#d48806', marginTop: 4, lineHeight: 1.4 }}>
                          📋 原值：{formatVal(oldValue, key)}
                        </div>
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </div>
      ))}

      {/* ===== 历史记录面板 ===== */}
      <Card
        title={<span style={{ fontSize: 15, fontWeight: 600 }}>历史记录</span>}
        style={{ marginTop: 24, borderTop: '2px solid #1677ff' }}
        styles={{ body: { paddingTop: 8 } }}
      >
        <Tabs
          defaultActiveKey="logs"
          items={[
            {
              key: 'versions',
              label: <span>历史版本 {versions.length > 0 && <Tag style={{ marginLeft: 4 }}>{versions.length}</Tag>}</span>,
              children: versionTab,
            },
            {
              key: 'approvals',
              label: <span>审批历史 {approvalHistory.length > 0 && <Tag style={{ marginLeft: 4 }}>{approvalHistory.length}</Tag>}</span>,
              children: approvalTab,
            },
            {
              key: 'logs',
              label: <span>修改日志 {changeLogs.length > 0 && <Tag style={{ marginLeft: 4 }}>{changeLogs.length}</Tag>}</span>,
              children: logTab,
            },
          ]}
        />
      </Card>
    </Card>
  );
}
