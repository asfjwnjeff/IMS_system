'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, type NavItem } from '@/lib/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showSidebarText, setShowSidebarText] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // 侧栏展开/收起时的文字延迟
  useEffect(() => {
    if (sidebarExpanded) {
      const timer = setTimeout(() => setShowSidebarText(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowSidebarText(false);
    }
  }, [sidebarExpanded]);

  // 自动展开当前激活的菜单
  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.children?.some((child) => pathname.startsWith(child.href || ''))) {
        setExpandedMenus((prev) =>
          prev.includes(item.label) ? prev : [...prev, item.label]
        );
      }
    });
  }, [pathname]);

  function toggleMenu(label: string) {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  function isParentActive(item: NavItem) {
    return item.children?.some((child) => pathname.startsWith(child.href || ''));
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 左侧栏 */}
      <aside
        className={`flex flex-col h-full transition-all duration-200 shrink-0 ${
          sidebarExpanded ? 'w-[228px]' : 'w-[56px]'
        }`}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        {/* Logo */}
        <div className="flex items-center h-[55px] px-4 shrink-0 border-b border-white/10">
          {showSidebarText ? (
            <span className="text-white font-bold text-md tracking-wide">IMS 2.0</span>
          ) : (
            <span className="text-white font-bold text-md">I</span>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isMenuExpanded = expandedMenus.includes(item.label);
            const active = hasChildren ? isParentActive(item) : isActive(item.href || '');

            if (hasChildren) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center gap-3 px-4 h-10 text-sm transition-colors ${
                      active
                        ? 'text-white bg-white/10'
                        : 'text-white/65 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {showSidebarText && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        <span className="shrink-0">
                          {isMenuExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </>
                    )}
                  </button>
                  {isMenuExpanded && showSidebarText && (
                    <div className="py-1">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href || '/'}
                          className={`block pl-12 pr-4 h-9 text-sm leading-9 transition-colors ${
                            isActive(child.href || '')
                              ? 'text-white bg-white/10'
                              : 'text-white/55 hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href || '/'}
                className={`flex items-center gap-3 px-4 h-10 text-sm transition-colors ${
                  active
                    ? 'text-white bg-white/10'
                    : 'text-white/65 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {showSidebarText && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* 收起/展开按钮 */}
        <div className="shrink-0 px-2 py-3 border-t border-white/10">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-full flex items-center justify-center h-8 rounded text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            {sidebarExpanded ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 顶部栏 */}
        <header
          className="flex items-center justify-between h-[55px] px-6 shrink-0 border-b bg-white dark:bg-[#1C1C1E]"
          style={{ borderColor: 'var(--border-light)' }}
        >
          {/* 面包屑 */}
          <div className="flex items-center gap-2 text-sm text-secondary">
            {getBreadcrumb(pathname).map((crumb, i) => (
              <React.Fragment key={crumb.label}>
                {i > 0 && <span className="text-tertiary">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-primary transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-primary font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* 右侧操作 */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-auto bg-page">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

// 面包屑解析
function getBreadcrumb(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [{ label: '首页', href: '/' }];

  for (const item of NAV_ITEMS) {
    if (item.children) {
      for (const child of item.children) {
        if (pathname.startsWith(child.href || '')) {
          crumbs.push({ label: item.label });
          crumbs.push({ label: child.label });
          return crumbs;
        }
      }
    } else if (isActivePath(pathname, item.href || '')) {
      crumbs.push({ label: item.label });
      return crumbs;
    }
  }

  return crumbs;
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}
