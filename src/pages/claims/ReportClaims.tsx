import { useState } from 'react';
import { Table, Button, Form, Input, Select, DatePicker, Modal, InputNumber, Upload, Space, Card, message } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { ClaimReport } from '../../types';
import { mockClaims, claimStatuses } from '../../mock/data';

const { RangePicker } = DatePicker;

export default function ReportClaims() {
  const navigate = useNavigate();
  const [data] = useState<ClaimReport[]>(mockClaims);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleConfirm = (_record: ClaimReport) => {
    form.resetFields();
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    await form.validateFields();
    message.success('理赔确认成功');
    setConfirmModalOpen(false);
  };

  const columns: ColumnsType<ClaimReport> = [
    { title: '序号', dataIndex: 'id', width: 60, align: 'center' },
    { title: '报案编号', dataIndex: 'reportNo', width: 150 },
    {
      title: '报案状态', dataIndex: 'reportStatus', width: 100,
      render: (v: string) => {
        const colorMap: Record<string, string> = { '审批通过': '#52c41a', '审批拒绝': '#ff4d4f', '已确认': '#1677ff' };
        return <span style={{ color: colorMap[v] || '#333' }}>{v}</span>;
      },
    },
    { title: '报案时间', dataIndex: 'reportTime', width: 170 },
    { title: '投保申请人姓名', dataIndex: 'applicantName', width: 120 },
    { title: '保单单号', dataIndex: 'policyNo', width: 220 },
    { title: '保险公司名称', dataIndex: 'insuranceCompany', width: 100 },
    { title: '被保险人企业名称', dataIndex: 'insuredCompany', width: 220, ellipsis: true },
    { title: '保险公司理赔结果', dataIndex: 'claimResult', width: 130 },
    {
      title: '操作', key: 'action', width: 220, fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" onClick={() => navigate(`/claimsManage/reportClaimsDetail/${record.id}`)}>查看</Button>
          <Button type="link" size="small" danger>删除</Button>
          <Button type="link" size="small">发起审批</Button>
          {record.reportStatus === '审批通过' && (
            <Button type="link" size="small" onClick={() => handleConfirm(record)}>理赔确认</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card title="报案理赔管理">
      <Form layout="inline" className="search-form">
        <Form.Item label="报案时间">
          <RangePicker />
        </Form.Item>
        <Form.Item label="报案编号">
          <Input placeholder="请输入" style={{ width: 160 }} />
        </Form.Item>
        <Form.Item label="报案状态">
          <Select placeholder="请选择" allowClear style={{ width: 140 }}>
            {claimStatuses.map((s) => <Select.Option key={s} value={s}>{s}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />}>搜索</Button>
            <Button icon={<ReloadOutlined />}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <div className="table-toolbar">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/claimsManage/reportClaimsAdd')}>新增</Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" scroll={{ x: 1500 }}
        pagination={{ total: data.length, pageSize: 10, showSizeChanger: false, showTotal: (t) => `共 ${t} 条` }}
      />

      {/* 理赔确认弹窗 */}
      <Modal title="理赔确认" open={confirmModalOpen}
        onOk={handleConfirmSubmit}
        onCancel={() => setConfirmModalOpen(false)} width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="claimResult" label="保险公司理赔结果" rules={[{ required: true, message: '请选择' }]}>
            <Select placeholder="请选择">
              <Select.Option value="赔付">赔付</Select.Option>
              <Select.Option value="拒赔">拒赔</Select.Option>
              <Select.Option value="部分赔付">部分赔付</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="claimAmount" label="保险公司理赔金额">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="请输入理赔金额" />
          </Form.Item>
          <Form.Item name="files" label="上传附件">
            <Upload>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
              支持 pdf/word/excel/zip/jpg/png，单文件 ≤5MB
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
