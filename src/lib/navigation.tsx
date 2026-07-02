import {
  LayoutDashboard,
  Database,
  ClipboardList,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

const iconClass = 'w-5 h-5';

export const NAV_ITEMS: NavItem[] = [
  {
    label: '首页',
    href: '/',
    icon: <LayoutDashboard className={iconClass} />,
  },
  {
    label: '基础信息',
    icon: <Database className={iconClass} />,
    children: [
      { label: '保费汇率配置', href: '/basic-info/exchange-rates' },
      { label: '保费费率配置', href: '/basic-info/insurance-rates' },
    ],
  },
  {
    label: '保单管理',
    icon: <ClipboardList className={iconClass} />,
    children: [
      { label: '投保申请表', href: '/policy-manage/applications' },
    ],
  },
  {
    label: '报案理赔',
    icon: <ShieldCheck className={iconClass} />,
    children: [
      { label: '报案理赔管理', href: '/claims/reports' },
    ],
  },
];
