import { useState, useMemo } from 'react';
import { Table, Button, Form, Input, Select, DatePicker, Space, Card, Dropdown, Modal, message, Segmented, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined, MoreOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import type { InsuranceApplication } from '../../types';
import { mockApplications, approvalStatuses, insurancePolicyStatuses } from '../../mock/data';
import { usePersistedConfig, type FieldConfig } from '../../hooks/usePersistedConfig';
import ColumnSettings from '../../components/ColumnSettings';

const { RangePicker } = DatePicker;

// ===== 搜索字段定义 =====
interface SearchFieldDef {
  key: string;
  label: string;
  type: 'input' | 'select' | 'dateRange';
  options?: string[];
  width?: number;
}

const searchFieldDefs: SearchFieldDef[] = [
  { key: 'applicationNo', label: '投保单号', type: 'input', width: 150 },
  { key: 'businessRefNo', label: '业务参考号', type: 'input', width: 150 },
  { key: 'applicationTime', label: '投保时间', type: 'dateRange', width: 240 },
  { key: 'approvalStatus', label: '审批状态', type: 'select', options: approvalStatuses, width: 130 },
  { key: 'insurancePolicyStatus', label: '保险公司保单状态', type: 'select', options: insurancePolicyStatuses, width: 150 },
  { key: 'policyNo', label: '保单单号', type: 'input', width: 150 },
  { key: 'applicantCompany', label: '投保人企业名称', type: 'input', width: 180 },
  { key: 'insuredCompany', label: '被保人企业名称', type: 'input', width: 180 },
  { key: 'goodsNameCN', label: '中文商品名称', type: 'input', width: 180 },
  { key: 'insuranceCompany', label: '保险公司名称', type: 'input', width: 150 },
  { key: 'dataSource', label: '数据来源', type: 'select', options: ['fms', 'cos'], width: 100 },
];

const searchFieldMap = Object.fromEntries(searchFieldDefs.map((d) => [d.key, d]));

const defaultSearchFields: FieldConfig[] = [
  { key: 'applicationNo', visible: true, order: 0 },
  { key: 'businessRefNo', visible: true, order: 1 },
  { key: 'applicationTime', visible: true, order: 2 },
  { key: 'approvalStatus', visible: false, order: 3 },
  { key: 'insurancePolicyStatus', visible: false, order: 4 },
  { key: 'policyNo', visible: false, order: 5 },
  { key: 'applicantCompany', visible: false, order: 6 },
  { key: 'insuredCompany', visible: true, order: 7 },
  { key: 'goodsNameCN', visible: false, order: 8 },
  { key: 'insuranceCompany', visible: false, order: 9 },
  { key: 'dataSource', visible: false, order: 10 },
];

// ===== 表格列定义 =====
const allColumns = [
  { key: 'id', title: '序号', width: 50, align: 'center' as const, fixed: 'left' as const },
  { key: 'businessRefNo', title: '业务参考号', width: 180, fixed: 'left' as const },
  { key: 'applicationType', title: '申请类型', width: 100 },
  { key: 'approvalStatus', title: '审核状态', width: 90 },
  { key: 'documentStatus', title: '文档状态', width: 80 },
  { key: 'approvalRemark', title: '审批备注', width: 150, ellipsis: true },
  { key: 'insurancePolicyStatus', title: '保险公司保单状态', width: 120 },
  { key: 'insuranceCorrectionStatus', title: '保险公司批改状态', width: 120 },
  { key: 'applicationNo', title: '投保单号', width: 150 },
  { key: 'applicationTime', title: '投保时间', width: 160 },
  { key: 'applicantCompany', title: '投保人企业名称', width: 200, ellipsis: true },
  { key: 'goodsNameCN', title: '中文商品名称', width: 200, ellipsis: true },
  { key: 'currencyName', title: '币制中文名称', width: 100 },
  { key: 'invoiceAmount', title: '发票金额', width: 110, align: 'right' as const },
  { key: 'estimatedInsuranceAmount', title: '预计保险金额', width: 120, align: 'right' as const },
  { key: 'markupRatio', title: '加成比例', width: 140 },
  { key: 'estimatedPremium', title: '预计保费', width: 100, align: 'right' as const },
  { key: 'actualPremium', title: '实际保费', width: 100, align: 'right' as const },
  { key: 'applicantName', title: '投保申请人姓名', width: 110 },
  { key: 'insuranceCompany', title: '保险公司名称', width: 100 },
  { key: 'cosOrderStatus', title: 'COS订单状态', width: 100 },
  { key: 'insuranceCategory', title: '投保类别', width: 90 },
  { key: 'transitPort', title: '途径港', width: 180, ellipsis: true },
  { key: 'carriageType', title: '车厢类型', width: 80 },
  { key: 'packageType', title: '包装种类', width: 200, ellipsis: true },
  { key: 'quantity', title: '件数', width: 60, align: 'right' as const },
  { key: 'insuredCompany', title: '被保人企业名称', width: 200, ellipsis: true },
  { key: 'policyNo', title: '保单单号', width: 200 },
  { key: 'customerName', title: '客户名称', width: 200, ellipsis: true },
  { key: 'effectiveStatus', title: '生效状态', width: 80 },
  { key: 'isBackfill', title: '是否回填', width: 90 },
  { key: 'dataSource', title: '数据来源', width: 70 },
  { key: 'correctionActualPremium', title: '批改实际保费', width: 110, align: 'right' as const },
];

const columnLabelMap: Record<string, string> = Object.fromEntries(allColumns.map((c) => [c.key, c.title]));

const defaultColumnFields: FieldConfig[] = allColumns.map((c, i) => ({
  key: c.key,
  visible: true,
  order: i,
}));

// ===== 审批状态 Tag 颜色 =====
const statusColorMap: Record<string, string> = {
  '待发起': 'default',
  '待审核': 'processing',
  '审批通过': 'success',
  '审批拒绝': 'error',
};

// ===== 页面组件 =====
export default function InsuranceApplication() {
  const navigate = useNavigate();
  const [data] = useState<InsuranceApplication[]>(mockApplications);
  const [backfillModalOpen, setBackfillModalOpen] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<InsuranceApplication | null>(null);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState<'latest' | 'all'>('latest');

  // 搜索字段配置
  const searchConfig = usePersistedConfig('ims_search_fields', defaultSearchFields);
  // 表格列配置
  const columnConfig = usePersistedConfig('ims_table_columns', defaultColumnFields);

  // ===== 搜索面板开关 =====
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);

  // ===== 按版本视图过滤 =====
  const filteredData = useMemo(() => {
    if (viewMode === 'latest') return data.filter((r) => r.isLatest);
    return data;
  }, [data, viewMode]);

  // ===== 搜索栏渲染 =====
  const renderSearchField = (f: FieldConfig) => {
    const def = searchFieldMap[f.key];
    if (!def) return null;
    return (
      <Form.Item key={f.key} name={f.key} style={{ margin: 0 }} noStyle>
        {def.type === 'input' && (
          <Input placeholder={def.label} style={{ width: 160, borderRadius: 6, fontSize: 13 }} allowClear />
        )}
        {def.type === 'select' && def.options && (
          <Select placeholder={def.label} style={{ width: 160, borderRadius: 6, fontSize: 13 }} allowClear options={def.options.map((o) => ({ value: o, label: o }))} />
        )}
        {def.type === 'dateRange' && (
          <RangePicker placeholder={[def.label, '结束']} style={{ width: 260, borderRadius: 6, fontSize: 13 }} allowClear />
        )}
      </Form.Item>
    );
  };

  // ===== 动态更多操作菜单 =====
  const getMoreActions = (record: InsuranceApplication): MenuProps['items'] => {
    // 历史版本：仅可查看
    if (!record.isLatest) {
      return [
        {
          key: 'view',
          label: '详情查看',
          onClick: () => navigate(`/policyManage/insuranceapplicationDetail/${record.id}`),
        },
      ];
    }

    const { approvalStatus: s, applicationType: t } = record;
    const isCorrection = t === '批改申请';
    const items: MenuProps['items'] = [];

    // 编辑：待发起 / 审批拒绝
    if (s === '待发起' || s === '审批拒绝') {
      items.push({
        key: 'edit',
        label: '编辑',
        onClick: () => navigate(`/policyManage/insuranceapplicationEdit/${record.id}`),
      });
    }

    // 删除：仅待发起
    if (s === '待发起') {
      items.push({
        key: 'delete',
        label: '删除',
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: '确认删除',
            content: `确定要删除投保单 ${record.businessRefNo} 吗？`,
            okText: '确认删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => message.success('已删除'),
          });
        },
      });
    }

    // 保险费率选择：仅待发起
    if (s === '待发起') {
      items.push({
        key: 'rate',
        label: '保险费率选择',
        onClick: () => message.info('保险费率选择 — 待开发'),
      });
    }

    // 发起审批：待发起 / 审批拒绝
    if (s === '待发起' || s === '审批拒绝') {
      items.push({
        key: 'approval',
        label: '发起审批',
        onClick: () => message.success('已发起审批'),
      });
    }

    // 撤销审核：仅待审核
    if (s === '待审核') {
      items.push({
        key: 'cancel',
        label: '撤销审核',
        onClick: () => message.success('已撤销审核，已通知所有审批人'),
      });
    }

    // ——— 审批通过专属 ———
    if (s === '审批通过') {
      // 保单信息回填 / 批改信息回填（二选一）
      if (isCorrection) {
        items.push({
          key: 'correction',
          label: '批改信息回填',
          onClick: () => { setCurrentRecord(record); setCorrectionModalOpen(true); },
        });
      } else {
        items.push({
          key: 'backfill',
          label: '保单信息回填',
          onClick: () => { setCurrentRecord(record); setBackfillModalOpen(true); },
        });
      }

      items.push({
        key: 'bill',
        label: '缴费账单',
        onClick: () => message.info('缴费账单 — 待开发'),
      });

      items.push({
        key: 'invoice',
        label: '发票',
        onClick: () => message.info('发票 — 待开发'),
      });

      // 发起批改：仅非批改申请
      if (!isCorrection) {
        items.push({
          key: 'change',
          label: '发起批改',
          onClick: () => message.info('发起批改 — 待开发'),
        });
      }
    }

    return items;
  };

  // ===== 表格列构建 =====
  const tableColumns: ColumnsType<InsuranceApplication> = useMemo(() => {
    const cols: ColumnsType<InsuranceApplication> = columnConfig.visibleFields.map((f) => {
      const col = allColumns.find((c) => c.key === f.key);
      if (!col) return null as unknown as NonNullable<ColumnsType<InsuranceApplication>[number]>;

      const base: ColumnsType<InsuranceApplication>[number] = {
        title: col.title,
        dataIndex: col.key,
        key: col.key,
        width: col.width,
        align: col.align,
      } as ColumnsType<InsuranceApplication>[number];

      if ('ellipsis' in col) (base as { ellipsis?: boolean }).ellipsis = col.ellipsis;
      if ('fixed' in col) (base as { fixed?: string }).fixed = col.fixed;

      // 业务参考号：可点击 + 版本标识
      if (col.key === 'businessRefNo') {
        (base as { render?: (t: string, r: InsuranceApplication) => React.ReactNode }).render =
          (_text: string, record: InsuranceApplication) => (
            <span>
              <a onClick={() => navigate(`/policyManage/insuranceapplicationDetail/${record.id}`)}>
                {record.businessRefNo}
              </a>
              {!record.isLatest && (
                <Tag color="default" style={{ marginLeft: 6, fontSize: 11, opacity: 0.6 }}>历史版本</Tag>
              )}
            </span>
          );
      }

      // 申请类型：批改申请用橙色 Tag
      if (col.key === 'applicationType') {
        (base as { render?: (v: string) => React.ReactNode }).render =
          (v: string) => v === '批改申请'
            ? <Tag color="orange">{v}</Tag>
            : <Tag color="blue">{v}</Tag>;
      }

      // 审核状态：彩色 Tag
      if (col.key === 'approvalStatus') {
        (base as { render?: (v: string) => React.ReactNode }).render =
          (v: string) => <Tag color={statusColorMap[v] || 'default'}>{v}</Tag>;
      }

      // 金额类
      if (['invoiceAmount', 'estimatedInsuranceAmount'].includes(col.key)) {
        (base as { render?: (v: number) => string }).render = (v: number) => v?.toLocaleString();
      }
      if (['estimatedPremium', 'actualPremium'].includes(col.key)) {
        (base as { render?: (v: number) => string }).render = (v: number) => v?.toFixed(2);
      }
      if (col.key === 'correctionActualPremium') {
        (base as { render?: (v: number) => string }).render = (v: number) => (v ? v.toFixed(2) : '');
      }

      return base;
    }).filter(Boolean);

    // 操作列
    const actionCol: ColumnsType<InsuranceApplication>[number] = {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: unknown, record: InsuranceApplication) => {
        // 历史版本：仅查看
        if (!record.isLatest) {
          return (
            <Button type="link" size="small" onClick={() => navigate(`/policyManage/insuranceapplicationDetail/${record.id}`)}>
              查看
            </Button>
          );
        }

        const { approvalStatus: s } = record;
        const canEdit = s === '待发起' || s === '审批拒绝';

        return (
          <div style={{ whiteSpace: 'nowrap', display: 'flex', gap: 4, overflow: 'visible' }}>
            {canEdit && (
              <Button type="link" size="small" onClick={() => navigate(`/policyManage/insuranceapplicationEdit/${record.id}`)}>
                编辑
              </Button>
            )}
            {s === '待发起' && (
              <Button type="link" size="small" danger>删除</Button>
            )}
            <Dropdown menu={{ items: getMoreActions(record) }} trigger={['click']} getPopupContainer={(t) => t.ownerDocument.body} destroyPopupOnHide>
              <Button type="link" size="small">更多<MoreOutlined /></Button>
            </Dropdown>
          </div>
        );
      },
    };
    cols.push(actionCol);
    return cols;
  }, [columnConfig.visibleFields, navigate]);

  const exportItems: MenuProps['items'] = [
    { key: 'list', label: '列表导出' },
    { key: 'pingan', label: '平安导出' },
    { key: 'picc1', label: 'PICC进出口货运' },
    { key: 'picc2', label: 'PICC国内运输' },
  ];

  return (
    <Card
      title="投保申请表"
      extra={
        <Segmented
          value={viewMode}
          onChange={(v) => setViewMode(v as 'latest' | 'all')}
          options={[
            { label: '当前有效', value: 'latest' },
            { label: '全部记录', value: 'all' },
          ]}
        />
      }
    >
      {/* ===== 搜索字段行 ===== */}
      <Form form={form} layout="inline" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        {searchConfig.visibleFields.map(renderSearchField)}
      </Form>

      {/* ===== 搜索栏 + 工具栏 ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Space size={8}>
          <Button type="primary" icon={<SearchOutlined />}>搜索</Button>
          <Button icon={<ReloadOutlined />} onClick={() => form.resetFields()}>重置</Button>
          <Dropdown menu={{ items: exportItems }} getPopupContainer={(t) => t.ownerDocument.body}>
            <Button icon={<ExportOutlined />}>导出</Button>
          </Dropdown>
        </Space>
        <Space size={8}>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setSearchPanelOpen(!searchPanelOpen)}
            type={searchPanelOpen ? 'primary' : 'default'}
          >
            自定义查询
          </Button>
          <ColumnSettings
            fields={columnConfig.fields}
            labelMap={columnLabelMap}
            onToggle={columnConfig.toggle}
            onReorder={columnConfig.reorder}
            onReset={columnConfig.reset}
          />
        </Space>
      </div>

      {/* ===== 方案 C: 自定义查询弹出面板 ===== */}
      {searchPanelOpen && (
        <div style={{
          marginBottom: 12, padding: '12px 16px',
          background: '#fff', border: '1px solid #1677ff',
          borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>自定义查询字段</span>
            <Space size={6}>
              <Button size="small" type="primary" onClick={() => setSearchPanelOpen(false)}>确定</Button>
              <Button size="small" onClick={searchConfig.reset}>重置默认</Button>
            </Space>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[...searchConfig.fields].sort((a, b) => a.order - b.order).map((f) => {
              const label = searchFieldMap[f.key]?.label || f.key;
              return (
                <span
                  key={f.key}
                  onClick={() => searchConfig.toggle(f.key)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 4, fontSize: 12,
                    cursor: 'pointer', userSelect: 'none',
                    border: f.visible ? '1px solid #91caff' : '1px solid #f0f0f0',
                    background: f.visible ? '#e6f4ff' : '#fff',
                    color: f.visible ? '#1677ff' : '#595959',
                    transition: 'all 0.15s',
                  }}
                >
                  {f.visible ? '✓' : '+'} {label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 表格 ===== */}
      <Table
        columns={tableColumns}
        dataSource={filteredData}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        pagination={{ total: filteredData.length, pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
        rowClassName={(record) => record.isLatest ? '' : 'history-row'}
      />

      {/* 保单信息回填 */}
      <Modal title="保单信息回填" open={backfillModalOpen}
        onOk={() => { message.success('回填成功'); setBackfillModalOpen(false); }}
        onCancel={() => setBackfillModalOpen(false)} width={600}
      >
        <Form layout="vertical" style={{ marginTop: 16 }} initialValues={{ policyNo: currentRecord?.policyNo, actualPremium: currentRecord?.actualPremium }}>
          <Form.Item label="保险公司名称" name="insuranceCompany" required rules={[{ required: true }]}>
            <Select placeholder="请选择" style={{ width: '100%' }} showSearch
              options={[{ value: 'CO00056870 - 中国人保', label: 'CO00056870 - 中国人保' }, { value: '中国平安', label: '中国平安' }, { value: '人保财险', label: '人保财险' }]}
            />
          </Form.Item>
          <Form.Item label="保单单号" name="policyNo"><Input placeholder="请输入保单单号" maxLength={100} /></Form.Item>
          <Form.Item label="实际保费" name="actualPremium"><Input placeholder="请输入保费" /></Form.Item>
          <Form.Item label="保单附件" name="policyFiles"><Input placeholder="请上传 大小不超过 5MB 格式为 doc/docx/pdf/xls/xlsx/jpg/png/jpeg 的文件" /></Form.Item>
        </Form>
      </Modal>

      {/* 批改信息回填 */}
      <Modal title="批改信息回填" open={correctionModalOpen}
        onOk={() => { message.success('回填成功'); setCorrectionModalOpen(false); }}
        onCancel={() => setCorrectionModalOpen(false)} width={600}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}
          initialValues={{
            insuranceCorrectionStatus: currentRecord?.insuranceCorrectionStatus,
            correctionCompanyNo: currentRecord?.insuranceCorrectionStatus === '已批改' ? `EYII202631010000000${currentRecord?.id}99` : undefined,
            correctionActualPremium: currentRecord?.correctionActualPremium,
          }}
        >
          <Form.Item label="保险公司批改状态" name="insuranceCorrectionStatus">
            <Select placeholder="请选择" style={{ width: '100%' }} options={[{ value: '已批改', label: '已批改' }, { value: '待批改', label: '待批改' }]} />
          </Form.Item>
          <Form.Item label="保险公司批改编号" name="correctionCompanyNo"><Input placeholder="请输入批改编号" /></Form.Item>
          <Form.Item label="批改后实际保费" name="correctionActualPremium"><Input placeholder="请输入批改后实际保费" /></Form.Item>
          <Form.Item label="附件" name="correctionFiles"><Input placeholder="请上传 大小不超过 5MB 格式为 doc/docx/pdf/xls/xlsx/jpg/png/jpeg 的文件" /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
