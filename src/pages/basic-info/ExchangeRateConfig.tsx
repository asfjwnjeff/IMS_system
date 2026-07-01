import { useState } from 'react';
import { Table, Button, Form, Select, DatePicker, Modal, InputNumber, Space, Card, message } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ExchangeRate } from '../../types';
import { mockExchangeRates, insuranceCompanies, currencies } from '../../mock/data';

const { RangePicker } = DatePicker;

export default function ExchangeRateConfig() {
  const [data] = useState<ExchangeRate[]>(mockExchangeRates);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExchangeRate | null>(null);
  const [form] = Form.useForm();

  const columns: ColumnsType<ExchangeRate> = [
    { title: '序号', dataIndex: 'id', width: 60, align: 'center' },
    { title: '保险公司', dataIndex: 'insuranceCompany', width: 120 },
    { title: '汇率', dataIndex: 'exchangeRate', width: 100 },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 110 },
    { title: '失效日期', dataIndex: 'expiryDate', width: 110 },
    { title: '币制', dataIndex: 'currency', width: 130 },
    { title: '创建人', dataIndex: 'creator', width: 100 },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作', key: 'action', width: 80, fixed: 'right',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleEdit(record)}>编辑</Button>
      ),
    },
  ];

  const handleEdit = (record: ExchangeRate) => {
    setEditingRecord(record);
    form.setFieldsValue({ ...record, effectiveDate: undefined, expiryDate: undefined });
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
    <Card title="保费汇率配置">
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" scroll={{ x: 1200 }}
        pagination={{ total: data.length, pageSize: 10, showSizeChanger: false, showTotal: (t) => `共 ${t} 条` }}
      />

      <Modal
        title={editingRecord ? '修改汇率配置' : '新增汇率配置'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="insuranceCompany" label="保险公司" rules={[{ required: true, message: '请选择保险公司' }]}>
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
          <Form.Item name="currency" label="币制" rules={[{ required: true, message: '请选择币制' }]}>
            <Select placeholder="请选择币制">
              {currencies.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="exchangeRate" label="汇率" rules={[{ required: true, message: '请输入汇率' }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.0001} precision={6} placeholder="请输入汇率" />
          </Form.Item>
          <Form.Item name="minCharge" label="最低收费标准">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="请输入最低收费标准" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
