import type { ReactNode } from "react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  ChevronRight,
  ClipboardList,
  Database,
  House,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  ShoppingCart,
  Users,
  Warehouse,
  Workflow,
  X,
} from "lucide-react";
import { Button } from "./ui/button";

type NavIconName =
  | "purchase"
  | "execute"
  | "master"
  | "orders"
  | "notice"
  | "receive"
  | "putaway"
  | "supplier"
  | "customer"
  | "warehouse";

type NavItem = {
  id: string;
  label: string;
  icon: NavIconName;
  enabled?: boolean;
  statusLabel?: string;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

type NavSection = {
  id: string;
  label: string;
  icon: NavIconName;
  groups: NavGroup[];
};

const navigationTree: NavSection[] = [
  {
    id: "collaboration",
    label: "采购协同",
    icon: "purchase",
    groups: [
      {
        id: "order-management",
        label: "订单管理",
        items: [
          { id: "purchase-order", label: "采购订单", icon: "orders" },
          { id: "inbound-notice", label: "入库通知单", icon: "notice", enabled: false, statusLabel: "未搭建" },
        ],
      },
    ],
  },
  {
    id: "execution",
    label: "执行作业",
    icon: "execute",
    groups: [
      {
        id: "warehouse-ops",
        label: "仓内执行",
        items: [
          { id: "receiving", label: "收货执行", icon: "receive", enabled: false, statusLabel: "未搭建" },
          { id: "putaway", label: "上架任务", icon: "putaway", enabled: false, statusLabel: "未搭建" },
        ],
      },
    ],
  },
  {
    id: "master-data",
    label: "主数据",
    icon: "master",
    groups: [
      {
        id: "base-data",
        label: "基础资料",
        items: [
          { id: "customer", label: "客户主数据", icon: "customer" },
          { id: "supplier", label: "供应商主数据", icon: "supplier" },
          { id: "warehouse", label: "仓库主数据", icon: "warehouse", enabled: false, statusLabel: "未搭建" },
        ],
      },
    ],
  },
];

const iconMap: Record<NavIconName, LucideIcon> = {
  purchase: ShoppingCart,
  execute: Workflow,
  master: Database,
  orders: ClipboardList,
  notice: ScrollText,
  receive: ArrowDownToLine,
  putaway: ArrowUpFromLine,
  supplier: Building2,
  customer: Users,
  warehouse: Warehouse,
};

const defaultSectionExpanded = Object.fromEntries(navigationTree.map((section) => [section.id, true]));
const defaultGroupExpanded = Object.fromEntries(
  navigationTree.flatMap((section) => section.groups.map((group) => [group.id, true])),
);

export function AppShell({
  tabs,
  currentTab,
  onTabChange,
  onTabClose,
  onNavItemSelect,
  activeNavItemId,
  secondaryNavItems,
  activeSecondaryNavId,
  onSecondaryNavSelect,
  children,
}: {
  tabs: Array<{ key: string; label: string; closable?: boolean; icon?: LucideIcon }>;
  currentTab: string;
  onTabChange: (key: string) => void;
  onTabClose: (key: string) => void;
  onNavItemSelect?: (key: string) => void;
  activeNavItemId?: string;
  secondaryNavItems?: Array<{ id: string; label: string; icon: LucideIcon }>;
  activeSecondaryNavId?: string;
  onSecondaryNavSelect?: (key: string) => void;
  children: ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(defaultSectionExpanded);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(defaultGroupExpanded);

  function toggleSection(sectionId: string) {
    setExpandedSections((current) => ({ ...current, [sectionId]: !current[sectionId] }));
  }

  function toggleGroup(groupId: string) {
    setExpandedGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  }

  return (
    <div className="page-shell flex min-h-screen">
      <aside
        className={`hidden shrink-0 border-r border-border bg-white transition-all duration-200 lg:flex lg:flex-col ${
          sidebarCollapsed ? "w-sidebar-collapsed" : "w-sidebar"
        }`}
      >
        <div className={`${sidebarCollapsed ? "px-2" : "px-section"} flex h-tabs items-center border-b border-border`}>
          {sidebarCollapsed ? (
            <div className="flex w-full justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary-subtle text-primary">
                <SidebarIcon name="purchase" className="h-5 w-5" />
              </div>
            </div>
          ) : (
            <div className="truncate">
              <div className="text-section-title font-section-title text-text-primary">维他命B端后台模板</div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4">
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              {navigationTree.map((section) => {
                const active = section.groups.some((group) =>
                  group.items.some((item) => item.id === activeNavItemId),
                );
                return (
                  <button
                    key={section.id}
                    type="button"
                    title={section.label}
                    className={`flex h-10 w-10 items-center justify-center rounded-sm border transition ${
                      active
                        ? "border-primary bg-primary-subtle text-primary"
                        : "border-border bg-white text-text-secondary hover:bg-bg-hover"
                    }`}
                  >
                    <SidebarIcon name={section.icon} className="h-5 w-5" />
                  </button>
                );
              })}
              {secondaryNavItems?.length ? <div className="w-6 border-t border-border pt-3" /> : null}
              {secondaryNavItems?.map((item) => {
                const active = item.id === activeSecondaryNavId;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => onSecondaryNavSelect?.(item.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-sm border transition ${
                      active
                        ? "border-primary bg-primary-subtle text-primary"
                        : "border-border bg-white text-text-secondary hover:bg-bg-hover"
                    }`}
                  >
                    <Icon aria-hidden="true" strokeWidth={1.8} className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 text-body text-text-secondary">
              {navigationTree.map((section) => {
                const sectionExpanded = expandedSections[section.id];
                return (
                  <div key={section.id} className="space-y-2">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-left transition hover:bg-bg-hover"
                      onClick={() => toggleSection(section.id)}
                    >
                      <span className="flex items-center gap-control text-body text-text-primary">
                        <SidebarIcon name={section.icon} className="h-4 w-4 text-text-muted" />
                        <span>{section.label}</span>
                      </span>
                      <ChevronIcon expanded={sectionExpanded} />
                    </button>

                    {sectionExpanded ? (
                      <div className="space-y-2 pl-2">
                        {section.groups.map((group) => {
                          const groupExpanded = expandedGroups[group.id];
                          return (
                            <div key={group.id} className="space-y-1">
                              <button
                                type="button"
                                className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left transition hover:bg-bg-hover"
                                onClick={() => toggleGroup(group.id)}
                              >
                                <span className="text-small text-text-secondary">{group.label}</span>
                                <ChevronIcon expanded={groupExpanded} small />
                              </button>

                              {groupExpanded ? (
                                <div className="space-y-1 pl-3">
                                  {group.items.map((item) => {
                                    const disabled = item.enabled === false;
                                    const active = item.id === activeNavItemId;
                                    return (
                                      <button
                                        key={item.id}
                                        type="button"
                                        disabled={disabled}
                                        title={disabled ? `${item.label}暂未搭建` : undefined}
                                        onClick={disabled ? undefined : () => onNavItemSelect?.(item.id)}
                                        className={`flex w-full items-center justify-between gap-control rounded-sm px-3 py-2 text-left transition ${
                                          disabled
                                            ? "cursor-not-allowed text-text-disabled"
                                            : active
                                              ? "bg-primary-subtle text-primary"
                                              : "text-text-secondary hover:bg-bg-hover"
                                        }`}
                                      >
                                        <span className="flex min-w-0 items-center gap-control">
                                          <SidebarIcon
                                            name={item.icon}
                                            className={`h-4 w-4 ${
                                              disabled ? "text-text-disabled" : active ? "text-primary" : "text-text-muted"
                                            }`}
                                          />
                                          <span>{item.label}</span>
                                        </span>
                                        {item.statusLabel ? (
                                          <span className="shrink-0 rounded-full border border-border bg-bg-subtle px-2 py-0.5 text-mini text-text-muted">
                                            {item.statusLabel}
                                          </span>
                                        ) : null}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {secondaryNavItems?.length ? (
                <div className="border-t border-border pt-4">
                  <div className="space-y-1">
                    {secondaryNavItems.map((item) => {
                      const active = item.id === activeSecondaryNavId;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSecondaryNavSelect?.(item.id)}
                          className={`flex w-full items-center gap-control rounded-sm px-3 py-2 text-left transition ${
                            active
                              ? "bg-primary-subtle text-primary"
                              : "text-text-secondary hover:bg-bg-hover"
                          }`}
                        >
                          <Icon aria-hidden="true" strokeWidth={1.8} className={`h-4 w-4 ${active ? "text-primary" : "text-text-muted"}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <button
            type="button"
            className={`flex w-full items-center rounded-sm border border-border transition hover:bg-bg-hover ${
              sidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
            }`}
            aria-label={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
            onClick={() => setSidebarCollapsed((value) => !value)}
          >
            <span className="flex items-center gap-control text-text-secondary">
              <CollapseIcon collapsed={sidebarCollapsed} />
              {sidebarCollapsed ? null : <span className="text-small">收起导航</span>}
            </span>
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="bg-white">
          <div className="workspace-tab-strip">
            {tabs.map((tab) => {
              const active = tab.key === currentTab;
              const TabIcon = tab.icon;
              return (
                <div key={tab.key} className={`workspace-tab-item ${active ? "is-active" : ""}`}>
                  <button
                    type="button"
                    className="workspace-tab-trigger border-0 bg-transparent p-0 text-inherit focus-visible:outline-none"
                    onClick={() => onTabChange(tab.key)}
                  >
                    <span className="workspace-tab-label">
                      {TabIcon ? <TabIcon aria-hidden="true" strokeWidth={1.8} className="workspace-tab-icon" /> : null}
                      <span>{tab.label}</span>
                    </span>
                  </button>
                  {tab.closable ? (
                    <button
                      type="button"
                      className="workspace-tab-close focus-visible:outline-none"
                      aria-label={`关闭${tab.label}`}
                      onClick={() => onTabClose(tab.key)}
                    >
                      <X aria-hidden="true" strokeWidth={1.8} className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              );
            })}
            <div className="ml-auto hidden items-center gap-actions py-1 md:flex">
              <input
                className="h-input-md w-64 rounded-sm border border-border px-input-x text-body outline-none ring-0 placeholder:text-text-placeholder"
                placeholder="菜单搜索，快捷键 /"
              />
              <Button size="sm">帮助</Button>
            </div>
          </div>
        </header>
        <div className="page-content flex-1">{children}</div>
      </main>
    </div>
  );
}

function ChevronIcon({ expanded, small = false }: { expanded: boolean; small?: boolean }) {
  const Icon = ChevronRight;
  return (
    <Icon
      aria-hidden="true"
      strokeWidth={1.8}
      className={`text-text-muted transition-transform ${small ? "h-3 w-3" : "h-4 w-4"} ${
        expanded ? "rotate-90" : ""
      }`}
    />
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <Icon aria-hidden="true" strokeWidth={1.8} className="h-4 w-4 text-text-muted" />
  );
}

function SidebarIcon({ name, className }: { name: NavIconName; className?: string }) {
  const Icon = iconMap[name];
  return <Icon aria-hidden="true" strokeWidth={1.8} className={className} />;
}
