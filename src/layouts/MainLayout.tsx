import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Breadcrumb, Dropdown, Avatar } from 'antd';
import {
  HomeOutlined,
  SettingOutlined,
  MonitorOutlined,
  DatabaseOutlined,
  FileProtectOutlined,
  AlertOutlined,
  UserOutlined,
  LogoutOutlined,
  LayoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  { key: '/index', icon: <HomeOutlined />, label: '首页' },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/system/user', label: '用户管理' },
      { key: '/system/role', label: '角色管理' },
      { key: '/system/menu', label: '菜单管理' },
      { key: '/system/dept', label: '部门管理' },
      { key: '/system/post', label: '岗位管理' },
      { key: '/system/dict', label: '字典管理' },
      { key: '/system/config', label: '参数设置' },
      { key: '/system/notice', label: '通知公告' },
      {
        key: 'system-log',
        label: '日志管理',
        children: [
          { key: '/system/log/operlog', label: '操作日志' },
          { key: '/system/log/logininfor', label: '登录日志' },
        ],
      },
    ],
  },
  {
    key: 'monitor',
    icon: <MonitorOutlined />,
    label: '系统监控',
    children: [
      { key: '/monitor/online', label: '在线用户' },
      { key: '/monitor/job', label: '定时任务' },
      { key: '/monitor/druid', label: '数据监控' },
      { key: '/monitor/server', label: '服务监控' },
      { key: '/monitor/cacheList', label: '缓存列表' },
    ],
  },
  {
    key: 'basic',
    icon: <DatabaseOutlined />,
    label: '基础信息',
    children: [
      { key: '/base/premiumexchangerateallocation', label: '保费汇率配置' },
      { key: '/base/detailsoftheinsurancerateconfiguration', label: '保费费率配置' },
    ],
  },
  {
    key: 'policy',
    icon: <FileProtectOutlined />,
    label: '保单管理',
    children: [
      { key: '/policyManage/insuranceapplication', label: '投保申请表' },
    ],
  },
  {
    key: 'claims',
    icon: <AlertOutlined />,
    label: '报案理赔',
    children: [
      { key: '/claimsManage/reportClaims', label: '报案理赔管理' },
    ],
  },
];

// 路由到面包屑的映射
const breadcrumbMap: Record<string, string> = {
  '/index': '首页',
  '/base/premiumexchangerateallocation': '保费汇率配置',
  '/base/detailsoftheinsurancerateconfiguration': '保费费率配置',
  '/policyManage/insuranceapplication': '投保申请表',
  '/policyManage/insuranceapplicationDetail': '投保单详情',
  '/policyManage/insuranceapplicationEdit': '编辑投保单',
  '/claimsManage/reportClaims': '报案理赔管理',
  '/claimsManage/reportClaimsAdd': '新增报案',
  '/claimsManage/reportClaimsDetail': '报案详情',
};

const parentMap: Record<string, string> = {
  '/base/premiumexchangerateallocation': '基础信息',
  '/base/detailsoftheinsurancerateconfiguration': '基础信息',
  '/policyManage/insuranceapplication': '保单管理',
  '/policyManage/insuranceapplicationDetail': '保单管理',
  '/policyManage/insuranceapplicationEdit': '保单管理',
  '/claimsManage/reportClaims': '报案理赔',
  '/claimsManage/reportClaimsAdd': '报案理赔',
  '/claimsManage/reportClaimsDetail': '报案理赔',
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/claimsManage/')) return ['/claimsManage/reportClaims'];
    return [path];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/base/')) return ['basic'];
    if (path.startsWith('/policyManage/')) return ['policy'];
    if (path.startsWith('/claimsManage/')) return ['claims'];
    if (path.startsWith('/system/')) return ['system'];
    if (path.startsWith('/monitor/')) return ['monitor'];
    return [];
  };

  const getBreadcrumbItems = () => {
    const path = location.pathname;
    const items = [
      { title: <a onClick={() => navigate('/index')}>首页</a> },
    ];
    const parent = parentMap[path];
    if (parent) {
      items.push({ title: <span>{parent}</span> });
    }
    const label = breadcrumbMap[path];
    if (label && label !== '首页') {
      items.push({ title: <span>{label}</span> });
    }
    return items;
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { key: 'layout', icon: <LayoutOutlined />, label: '布局设置' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  return (
    <Layout className="app-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        trigger={null}
      >
        <div className="logo-container">
          <h1>{collapsed ? 'IMS' : 'IMS保险管理系统'}</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: 18 }} onClick={() => setCollapsed(false)} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: 18 }} onClick={() => setCollapsed(true)} />
            )}
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size={30} icon={<UserOutlined />} />
              <span>管理员</span>
            </div>
          </Dropdown>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
