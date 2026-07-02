import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, InputNumber, Upload, Button, Space, message, Row, Col } from 'antd';
import { UploadOutlined, SwapOutlined } from '@ant-design/icons';
import { mockApplications, mockHistoryVersions, mockApprovalHistory, mockChangeLogs } from '../../mock/data';
import { sections } from './fields';
import type { HistoryVersion } from '../../types';
import SectionHead from '../../components/SectionHead';
import HistoryPanel from '../../components/HistoryPanel';

const { TextArea } = Input;

const selectOptions: Record<string, { value: string; label: string }[]> = {
  insuranceCategory: [{ value: '非保入库', label: '非保入库' }, { value: '保税返库', label: '保税返库' }, { value: '进境申报入库', label: '进境申报入库' }, { value: '实物出库', label: '实物出库' }],
  insuredAddressCountryCode: [{ value: '国内(Domestic)', label: '国内(Domestic)' }, { value: '国际(International)', label: '国际(International)' }],
  insuredAddressCountry: [{ value: '中国', label: '中国' }, { value: '美国', label: '美国' }, { value: '日本', label: '日本' }],
  insuranceProductType: [{ value: '进口运输险', label: '进口运输险' }, { value: '国内运输险', label: '国内运输险' }],
  transportMode: [{ value: '航空运输', label: '航空运输' }, { value: '水路运输', label: '水路运输' }, { value: '公路运输', label: '公路运输' }],
  isContainer: [{ value: '是', label: '是' }, { value: '否', label: '否' }],
  carriageType: [{ value: '普通集装箱', label: '普通集装箱' }, { value: '其他', label: '其他' }],
  specialTransportRequirement: [{ value: '无', label: '无' }],
  originCountryCode: [{ value: '国际(International)', label: '国际(International)' }, { value: '国内(Domestic)', label: '国内(Domestic)' }],
  originCountry: [{ value: '美国', label: '美国' }, { value: '中国', label: '中国' }],
  destCountryCode: [{ value: '国际(International)', label: '国际(International)' }, { value: '国内(Domestic)', label: '国内(Domestic)' }],
  destCountry: [{ value: '中国', label: '中国' }],
  packageType: [{ value: '木制或竹藤等植物性材料制盒/箱', label: '木制或竹藤等植物性材料制盒/箱' }, { value: '纸制或纤维板制盒/箱', label: '纸制或纤维板制盒/箱' }, { value: '天然木托', label: '天然木托' }, { value: '球状罐类', label: '球状罐类' }, { value: '普通集装箱', label: '普通集装箱' }, { value: '其他', label: '其他' }],
  goodsNature: [{ value: '新货', label: '新货' }, { value: '旧货', label: '旧货' }],
  currencyName: [{ value: '人民币', label: '人民币' }, { value: '美元', label: '美元' }, { value: '欧元', label: '欧元' }, { value: '日元', label: '日元' }, { value: '港元', label: '港元' }, { value: '英镑', label: '英镑' }, { value: '马来西亚林吉特', label: '马来西亚林吉特' }],
  markupRatio: [{ value: '发票金额原值100%', label: '发票金额原值100%' }, { value: '发票金额原值110%', label: '发票金额原值110%' }],
  compensationCountryCode: [{ value: '国际(International)', label: '国际(International)' }, { value: '国内(Domestic)', label: '国内(Domestic)' }],
  compensationCountry: [{ value: '中国', label: '中国' }],
};

const editSections = sections.filter((s) => s.title !== '保单回填信息' && s.title !== '批改信息');

const fieldLabelMap: Record<string, string> = {};
sections.forEach((s) => s.fields.forEach((f) => { fieldLabelMap[f.key] = f.label; }));

function DiffWrapper({ changed, oldValue, children, value, onChange }: { changed: boolean; oldValue: string; children: React.ReactNode; value?: unknown; onChange?: (...args: unknown[]) => void }) {
  // Form.Item 通过 React.cloneElement 将 value/onChange 注入 DiffWrapper，
  // DiffWrapper 必须将这些 props 转发给真正的表单控件。
  // 当 !changed 时直接返回 children（不包 Fragment），让 cloneElement 穿透到控件。
  if (!changed) {
    if (React.isValidElement(children)) {
      return React.cloneElement(children, { value, onChange } as Record<string, unknown>);
    }
    return children as React.ReactElement;
  }

  const child = React.isValidElement(children)
    ? React.cloneElement(children, { value, onChange } as Record<string, unknown>)
    : children;

  return (
    <div style={{ border: '2px solid #faad14', borderRadius: 6, background: '#fffbe6', overflow: 'hidden' }}>
      {child}
      <div style={{ fontSize: 11, color: '#d48806', padding: '2px 8px 6px', lineHeight: 1.4 }}>
        📋 原值：{oldValue}
      </div>
    </div>
  );
}

export default function InsuranceApplicationEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const record = mockApplications.find((a) => a.id === Number(id));
  const [form] = Form.useForm();
  const [showChanges, setShowChanges] = useState(false);

  if (!record) return <Card title="编辑投保单"><p>未找到投保单记录</p></Card>;

  // 剔除版本管理字段，避免 Form initialValues 包含非表单字段
  const { isLatest: _lv, version: _ver, previousId: _pid, ...formInit } = record as unknown as Record<string, unknown>;

  const versions = mockHistoryVersions[record.id] || [];
  const approvalHistory = mockApprovalHistory[record.id] || [];
  const changeLogs = mockChangeLogs[record.id] || [];
  const compareVersion: HistoryVersion | null = versions.length > 0 ? versions[versions.length - 1] : null;

  const isFieldChanged = (key: string): boolean => {
    if (!showChanges || !compareVersion) return false;
    const prev = (compareVersion.data as unknown as Record<string, unknown>)[key];
    const curr = (record as unknown as Record<string, unknown>)[key];
    return JSON.stringify(prev) !== JSON.stringify(curr);
  };

  const getOldValue = (key: string): string => {
    if (!compareVersion) return '';
    const val = (compareVersion.data as unknown as Record<string, unknown>)[key];
    if (val === undefined || val === null || val === '') return '（空）';
    return String(val);
  };

  const changedCount = compareVersion
    ? Object.keys(compareVersion.data).filter((k) => {
        const prev = (compareVersion.data as unknown as Record<string, unknown>)[k];
        const curr = (record as unknown as Record<string, unknown>)[k];
        return JSON.stringify(prev) !== JSON.stringify(curr);
      }).length
    : 0;

  const handleSubmit = async () => {
    await form.validateFields();
    message.success('保存成功');
    navigate(-1);
  };

  const renderInput = (field: { key: string; type?: string }) => {
    const { key, type } = field;
    const changed = isFieldChanged(key);
    const oldValue = getOldValue(key);
    const wrap = (el: React.ReactNode) => <DiffWrapper changed={changed} oldValue={oldValue}>{el}</DiffWrapper>;

    if (type === 'upload') return wrap(<Upload><Button icon={<UploadOutlined />}>选择附件</Button></Upload>);
    if (type === 'select') {
      const opts = selectOptions[key];
      return wrap(<Select placeholder="请选择">{opts ? opts.map((o) => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>) : null}</Select>);
    }
    if (type === 'date') return wrap(<DatePicker style={{ width: '100%' }} />);
    if (type === 'number') return wrap(<InputNumber style={{ width: '100%' }} min={0} />);
    if (type === 'textarea') return wrap(<TextArea rows={2} />);
    return wrap(<Input />);
  };

  return (
    <Card
      title={<span style={{ fontSize: 16, fontWeight: 600 }}>编辑投保单 — {record.businessRefNo}</span>}
      extra={
        <Space>
          {compareVersion && (
            <Button icon={<SwapOutlined />} type={showChanges ? 'primary' : 'default'}
              onClick={() => setShowChanges(!showChanges)}
              style={showChanges ? { background: '#faad14', borderColor: '#faad14' } : undefined}>
              {showChanges ? '隐藏变更' : '显示变更'}
              {!showChanges && changedCount > 0 && <span style={{ marginLeft: 4, fontSize: 11, color: '#faad14' }}>（{changedCount}）</span>}
            </Button>
          )}
          <Button onClick={() => navigate(-1)}>返回</Button>
        </Space>
      }
    >
      {showChanges && compareVersion && (
        <div style={{ marginBottom: 16, padding: '8px 14px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6, fontSize: 13, color: '#ad6800', display: 'flex', alignItems: 'center', gap: 8 }}>
          <SwapOutlined /> 正在对比 <strong>V{compareVersion.version}</strong>，共 <strong>{changedCount}</strong> 处变更
        </div>
      )}

      <Form form={form} layout="vertical" initialValues={formInit}>
        {editSections.map((section) => (
          <div key={section.title} style={{ marginBottom: 24 }}>
            <SectionHead title={section.title} />
            <Card size="small" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
              <Row gutter={[24, 8]}>
                {section.fields.map((field) => {
                  const colSpan = field.span === 2 ? 24 : 8;
                  const changed = isFieldChanged(field.key);
                  return (
                    <Col key={field.key} xs={24} sm={12} md={8} lg={colSpan}>
                      <Form.Item
                        name={field.key}
                        label={<span style={{ fontSize: 13, color: changed && showChanges ? '#d48806' : '#595959', fontWeight: changed && showChanges ? 600 : 400 }}>{changed && showChanges ? '● ' : ''}{field.label}</span>}
                        rules={[{ required: false }]}
                        style={{ marginBottom: 16 }}
                        valuePropName={field.type === 'upload' ? 'fileList' : undefined}
                      >
                        {renderInput(field)}
                      </Form.Item>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </div>
        ))}

        <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
          <Space size="large">
            <Button type="primary" size="large" onClick={handleSubmit}>保存</Button>
            <Button size="large" onClick={() => navigate(-1)}>取消</Button>
          </Space>
        </div>
      </Form>

      <Card title={<span style={{ fontSize: 15, fontWeight: 600 }}>历史记录</span>} style={{ marginTop: 24, borderTop: '2px solid #1677ff' }} styles={{ body: { paddingTop: 8 } }}>
        <HistoryPanel
          versions={versions}
          approvalHistory={approvalHistory}
          changeLogs={changeLogs}
          fieldLabelMap={fieldLabelMap}
          defaultActiveKey="logs"
        />
      </Card>
    </Card>
  );
}
