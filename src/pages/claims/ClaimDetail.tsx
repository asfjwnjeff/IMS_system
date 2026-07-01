import { Card, Descriptions, Tag, Button, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { mockClaims } from '../../mock/data';

const statusColorMap: Record<string, string> = {
  '审批通过': 'green', '审批拒绝': 'red', '已确认': 'blue', '待审批': 'default',
};

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const record = mockClaims.find((c) => c.id === Number(id));

  if (!record) return <Card title="报案详情"><p>未找到报案记录</p></Card>;

  return (
    <Card
      title={`报案详情 — ${record.reportNo}`}
      extra={
        <Space>
          <Button onClick={() => navigate('/claimsManage/reportClaims')}>返回列表</Button>
        </Space>
      }
    >
      <div className="section-head">
        <span className="section-head-line" />
        <span className="section-head-title">基本信息</span>
      </div>
      <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 2, lg: 3 }} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="报案编号">{record.reportNo}</Descriptions.Item>
        <Descriptions.Item label="报案状态">
          <Tag color={statusColorMap[record.reportStatus] || 'default'}>{record.reportStatus}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="报案时间">{record.reportTime}</Descriptions.Item>
        <Descriptions.Item label="投保申请人姓名">{record.applicantName}</Descriptions.Item>
        <Descriptions.Item label="保单单号">{record.policyNo}</Descriptions.Item>
        <Descriptions.Item label="保险公司名称">{record.insuranceCompany}</Descriptions.Item>
        <Descriptions.Item label="被保险人企业名称" span={3}>{record.insuredCompany}</Descriptions.Item>
        <Descriptions.Item label="保险公司理赔结果">{record.claimResult}</Descriptions.Item>
        <Descriptions.Item label="保险公司理赔金额">
          {record.claimAmount ? `¥${record.claimAmount.toLocaleString()}` : '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
