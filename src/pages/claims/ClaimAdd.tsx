import { Card, Form, Input, Select, DatePicker, InputNumber, Upload, Button, Space, message, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { countries, packageTypes } from '../../mock/data';

const { TextArea } = Input;

const SectionHead = ({ title }: { title: string }) => (
  <div className="section-head">
    <span className="section-head-line" />
    <span className="section-head-title">{title}</span>
  </div>
);

const halfCol = { xs: 24, sm: 12, md: 8 } as const;

export default function ClaimAdd() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    await form.validateFields();
    message.success('报案提交成功');
    navigate('/claimsManage/reportClaims');
  };

  return (
    <Card
      title="新增报案"
      extra={<Button onClick={() => navigate(-1)}>返回</Button>}
    >
      <Form form={form} layout="vertical">
        {/* 保单信息 */}
        <SectionHead title="保单信息" />
        <Card size="small" style={{ background: '#fafafa', border: '1px solid #f0f0f0', marginBottom: 24 }}>
          <Row gutter={[24, 8]}>
            <Col {...halfCol}><Form.Item name="businessRefNo" label="业务参考号"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="applicantDept" label="投保申请人部门"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="policyNo" label="保单单号"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="insuranceCompany" label="保险公司名称"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="billNo" label="提运单号"><Input /></Form.Item></Col>
          </Row>
        </Card>

        {/* 客户信息 */}
        <SectionHead title="客户信息" />
        <Card size="small" style={{ background: '#fafafa', border: '1px solid #f0f0f0', marginBottom: 24 }}>
          <Row gutter={[24, 8]}>
            <Col {...halfCol}><Form.Item name="insuredCompany" label="被保人企业名称"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="originCountryCode" label="起运地国家标识"><Select placeholder="请选择">{countries.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}</Select></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="originCountry" label="起运地国家"><Select placeholder="请选择">{countries.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}</Select></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="originProvince" label="起运地省"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="originCity" label="起运地市"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="originDistrict" label="起运地区/县"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="originAddress" label="起运地详细地址"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="consigneeName" label="收货方名称"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="destCountryCode" label="目的地国家标识"><Select placeholder="请选择">{countries.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}</Select></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="destCountry" label="目的地国家"><Select placeholder="请选择">{countries.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}</Select></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="destProvince" label="目的地省"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="destCity" label="目的地市"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="destDistrict" label="目的地区/县"><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="destAddress" label="目的地详细地址"><Input /></Form.Item></Col>
          </Row>
        </Card>

        {/* 货物运输信息 */}
        <SectionHead title="货物运输信息" />
        <Card size="small" style={{ background: '#fafafa', border: '1px solid #f0f0f0', marginBottom: 24 }}>
          <Row gutter={[24, 8]}>
            <Col {...halfCol}><Form.Item name="goodsName" label="中文商品名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="cargoQuantity" label="货物数量"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="packageType" label="包装种类"><Select placeholder="由选择关联带出">{packageTypes.map((p) => <Select.Option key={p} value={p}>{p}</Select.Option>)}</Select></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="estimatedLossAmount" label="预计货损金额"><InputNumber style={{ width: '100%' }} min={0} precision={2} /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="lossCurrency" label="货损金额币种"><Select placeholder="请选择"><Select.Option value="人民币">人民币</Select.Option><Select.Option value="美元">美元</Select.Option></Select></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="accidentTime" label="具体出险时间" rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="accidentCountryCode" label="出险地国家标识"><Select placeholder="请选择">{countries.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}</Select></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="accidentCountry" label="出险地国家"><Select placeholder="请选择">{countries.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}</Select></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="accidentProvince" label="出险地省"><Select placeholder="请选择" /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="accidentCity" label="出险地市"><Select placeholder="请选择" /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="accidentDistrict" label="出险地区/县"><Select placeholder="请选择" /></Form.Item></Col>
            <Col {...halfCol}><Form.Item name="accidentAddress" label="出险地详细地址"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="accidentDescription" label="出险经过与原因">
            <TextArea rows={4} maxLength={500} showCount />
          </Form.Item>
          <Form.Item name="accidentFiles" label="出险附件">
            <Upload><Button icon={<UploadOutlined />}>点击上传</Button></Upload>
          </Form.Item>
        </Card>

        <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
          <Space size="large">
            <Button type="primary" size="large" onClick={handleSubmit}>提 交</Button>
            <Button size="large" onClick={() => navigate(-1)}>取 消</Button>
          </Space>
        </div>
      </Form>
    </Card>
  );
}
