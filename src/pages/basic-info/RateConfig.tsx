import { useState } from 'react';
import { Table, Button, Form, Select, DatePicker, Modal, Input, InputNumber, Space, Card, message } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { InsuranceRate } from '../../types';
import { mockInsuranceRates, insuranceCompanies, packageTypes, oldNewTypes } from '../../mock/data';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function RateConfig() {
  const [data] = useState<InsuranceRate[]>(mockInsuranceRates);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InsuranceRate | null>(null);
  const [form] = Form.useForm();

  const columns: ColumnsType<InsuranceRate> = [
    { title: '序号', dataIndex: 'id', width: 60, align: 'center' },
    { title: '保险公司', dataIndex: 'insuranceCompany', width: 100 },
    { title: '费率', dataIndex: 'rate', width: 100, render: (v: number) => v?.toFixed(6) },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 110 },
    { title: '失效日期', dataIndex: 'expiryDate', width: 110 },
    { title: '货物类型', dataIndex: 'cargoType', width: 280, ellipsis: true },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (v: string) => <span style={{ color: v === '启用' ? '#52c41a' : '#ff4d4f' }}>{v}</span>,
    },
    { title: '创建人', dataIndex: 'creator', width: 80 },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作', key: 'action', width: 80, fixed: 'right',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleEdit(record)}>编辑</Button>
      ),
    },
  ];

  const handleEdit = (record: InsuranceRate) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    await form.validateFields();
    message.success(editingRecord ? '修改成功' : '新增成功');
    setModalOpen(false);
  };

  return (
    <Card title="保费费率配置">
      <Form layout="inline" className="search-form">
        <Form.Item label="保险公司">
          <Select placeholder="请选择保险公司" allowClear style={{ width: 200 }}>
            {insuranceCompanies.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item label="生效日期">
          <RangePicker />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />}>搜索</Button>
            <Button icon={<ReloadOutlined />}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <div className="table-toolbar">
        <div className="left">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
          <Button>批量启用</Button>
          <Button>批量禁用</Button>
        </div>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" scroll={{ x: 1300 }}
        pagination={{ total: data.length, pageSize: 10, showSizeChanger: false, showTotal: (t) => `共 ${t} 条` }}
      />

      <Modal
        title={editingRecord ? '修改保费费率配置' : '新增保费费率配置'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="insuranceCompany" label="保险公司" rules={[{ required: true, message: '请选择' }]}>
            <Select placeholder="请选择保险公司">
              {insuranceCompanies.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true, message: '请选择' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expiryDate" label="失效日期" rules={[{ required: true, message: '请选择' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cargoType" label="货物类型" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入货物类型" />
          </Form.Item>
          <Form.Item name="rate" label="费率" rules={[{ required: true, message: '请输入费率' }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.00001} precision={6} placeholder="请输入费率" />
          </Form.Item>
          <Form.Item name="cargoValueRMB" label="货值(RMB)">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="请输入货值" />
          </Form.Item>
          <Form.Item name="agreementNo" label="协议号">
            <Input placeholder="请输入协议号" />
          </Form.Item>
          <Form.Item name="minCharge" label="最低收费">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="请输入最低收费" />
          </Form.Item>
          <Form.Item name="packageType" label="包装类型">
            <Select placeholder="请选择包装类型">
              {packageTypes.map((p) => <Select.Option key={p} value={p}>{p}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="oldNewType" label="新旧类型">
            <Select placeholder="请选择新旧类型">
              {oldNewTypes.map((t) => <Select.Option key={t} value={t}>{t}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
