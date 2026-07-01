import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './layouts/MainLayout';
import ExchangeRateConfig from './pages/basic-info/ExchangeRateConfig';
import RateConfig from './pages/basic-info/RateConfig';
import InsuranceApplication from './pages/policy-manage/InsuranceApplication';
import InsuranceApplicationDetail from './pages/policy-manage/InsuranceApplicationDetail';
import InsuranceApplicationEdit from './pages/policy-manage/InsuranceApplicationEdit';
import ReportClaims from './pages/claims/ReportClaims';
import ClaimAdd from './pages/claims/ClaimAdd';
import ClaimDetail from './pages/claims/ClaimDetail';

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/policyManage/insuranceapplication" replace />} />
            <Route path="index" element={<InsuranceApplication />} />
            <Route path="base/premiumexchangerateallocation" element={<ExchangeRateConfig />} />
            <Route path="base/detailsoftheinsurancerateconfiguration" element={<RateConfig />} />
            <Route path="policyManage/insuranceapplication" element={<InsuranceApplication />} />
            <Route path="policyManage/insuranceapplicationDetail/:id" element={<InsuranceApplicationDetail />} />
            <Route path="policyManage/insuranceapplicationEdit/:id" element={<InsuranceApplicationEdit />} />
            <Route path="claimsManage/reportClaims" element={<ReportClaims />} />
            <Route path="claimsManage/reportClaimsAdd" element={<ClaimAdd />} />
            <Route path="claimsManage/reportClaimsDetail/:id" element={<ClaimDetail />} />
            <Route path="*" element={<Navigate to="/policyManage/insuranceapplication" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
