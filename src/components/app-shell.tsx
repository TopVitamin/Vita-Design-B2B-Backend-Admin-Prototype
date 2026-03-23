import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Building2,
  ChevronRight,
  ClipboardList,
  Database,
  Languages,
  LogOut,
  House,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Search,
  ScrollText,
  ShoppingCart,
  UserCircle2,
  Users,
  Warehouse,
  Workflow,
  X,
} from "lucide-react";

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
    id: "inventory",
    label: "库存管理",
    icon: "warehouse",
    groups: [
      {
        id: "inventory-query-group",
        label: "库存查询",
        items: [
          { id: "inventory-query", label: "即时库存查询", icon: "warehouse" },
          { id: "inventory-flow-query", label: "库存流水查询", icon: "notice" },
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

type NotificationFeedTab = "message" | "notice" | "todo";

type NotificationPreviewItem = {
  id: string;
  feedTab: NotificationFeedTab;
  title: string;
  summary: string;
  time: string;
  unread: boolean;
  avatarLabel: string;
  avatarBackground: string;
};

type SearchMenuItem = {
  id: string;
  label: string;
  sectionLabel: string;
  groupLabel?: string;
  type: "primary" | "secondary";
};

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
  onProfileAction,
  onThemeSwitchAction,
  onLanguageAction,
  onLogoutAction,
  notificationUnreadCount = 0,
  notificationPreviewItems = [],
  onNotificationItemOpen,
  onNotificationMarkAllRead,
  onNotificationViewMore,
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
  onProfileAction?: () => void;
  onThemeSwitchAction?: () => void;
  onLanguageAction?: () => void;
  onLogoutAction?: () => void;
  notificationUnreadCount?: number;
  notificationPreviewItems?: NotificationPreviewItem[];
  onNotificationItemOpen?: (id: string) => void;
  onNotificationMarkAllRead?: (feedTab: NotificationFeedTab) => void;
  onNotificationViewMore?: () => void;
  children: ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(defaultSectionExpanded);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(defaultGroupExpanded);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [activeNotificationTab, setActiveNotificationTab] = useState<NotificationFeedTab>("message");
  const [menuSearchOpen, setMenuSearchOpen] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [menuSearchHighlightedIndex, setMenuSearchHighlightedIndex] = useState(0);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationPanelRef = useRef<HTMLDivElement | null>(null);
  const menuSearchRef = useRef<HTMLDivElement | null>(null);
  const menuSearchInputRef = useRef<HTMLInputElement | null>(null);

  const notificationTabs = [
    { id: "message" as const, label: "消息" },
    { id: "notice" as const, label: "通知" },
    { id: "todo" as const, label: "待办" },
  ];

  const currentNotificationItems = notificationPreviewItems.filter((item) => item.feedTab === activeNotificationTab).slice(0, 4);
  const allSearchMenuItems = useMemo<SearchMenuItem[]>(
    () => [
      ...navigationTree.flatMap((section) =>
        section.groups.flatMap((group) =>
          group.items
            .filter((item) => item.enabled !== false)
            .map((item) => ({
              id: item.id,
              label: item.label,
              sectionLabel: section.label,
              groupLabel: group.label,
              type: "primary" as const,
            })),
        ),
      ),
      ...(secondaryNavItems ?? []).map((item) => ({
        id: item.id,
        label: item.label,
        sectionLabel: "辅助菜单",
        type: "secondary" as const,
      })),
    ],
    [secondaryNavItems],
  );

  const filteredSearchMenuItems = useMemo(() => {
    const keyword = menuSearchQuery.trim().toLowerCase();
    if (!keyword) {
      return allSearchMenuItems.slice(0, 8);
    }

    return allSearchMenuItems
      .filter((item) =>
        [item.label, item.sectionLabel, item.groupLabel]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(keyword)),
      )
      .slice(0, 12);
  }, [allSearchMenuItems, menuSearchQuery]);

  useEffect(() => {
    if (!menuSearchOpen) {
      return;
    }

    if (!filteredSearchMenuItems.length) {
      setMenuSearchHighlightedIndex(-1);
      return;
    }

    setMenuSearchHighlightedIndex((current) => {
      if (current < 0 || current >= filteredSearchMenuItems.length) {
        return 0;
      }

      return current;
    });
  }, [filteredSearchMenuItems, menuSearchOpen]);

  useEffect(() => {
    if (!menuSearchOpen || menuSearchHighlightedIndex < 0) {
      return;
    }

    const highlightedItem = menuSearchRef.current?.querySelector<HTMLButtonElement>(
      `[data-search-index="${menuSearchHighlightedIndex}"]`,
    );
    highlightedItem?.scrollIntoView({ block: "nearest" });
  }, [menuSearchHighlightedIndex, menuSearchOpen]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }

      if (notificationPanelRef.current && !notificationPanelRef.current.contains(target)) {
        setNotificationPanelOpen(false);
      }

      if (menuSearchRef.current && !menuSearchRef.current.contains(target)) {
        setMenuSearchOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isEditable =
        target?.isContentEditable ||
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select";

      if (event.key === "/" && !isEditable) {
        event.preventDefault();
        setMenuSearchOpen(true);
        setMenuSearchHighlightedIndex(0);
        setNotificationPanelOpen(false);
        setUserMenuOpen(false);
        window.setTimeout(() => menuSearchInputRef.current?.focus(), 0);
      }

      if (event.key === "Escape") {
        setMenuSearchOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function toggleSection(sectionId: string) {
    setExpandedSections((current) => ({ ...current, [sectionId]: !current[sectionId] }));
  }

  function toggleGroup(groupId: string) {
    setExpandedGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  }

  function handleSearchItemSelect(item: SearchMenuItem) {
    if (item.type === "primary") {
      onNavItemSelect?.(item.id);
    } else {
      onSecondaryNavSelect?.(item.id);
    }

    setMenuSearchOpen(false);
    setMenuSearchQuery("");
    setMenuSearchHighlightedIndex(0);
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
            <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto pr-4">
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
            </div>

            <div className="flex shrink-0 items-center gap-actions py-1">
              <div ref={menuSearchRef} className="relative hidden md:flex">
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    ref={menuSearchInputRef}
                    value={menuSearchQuery}
                    onChange={(event) => {
                      setMenuSearchQuery(event.target.value);
                      setMenuSearchOpen(true);
                      setMenuSearchHighlightedIndex(0);
                    }}
                    onFocus={() => {
                      setMenuSearchOpen(true);
                      setMenuSearchHighlightedIndex(0);
                      setNotificationPanelOpen(false);
                      setUserMenuOpen(false);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        if (!filteredSearchMenuItems.length) {
                          return;
                        }
                        setMenuSearchHighlightedIndex((current) =>
                          current >= filteredSearchMenuItems.length - 1 ? 0 : current + 1,
                        );
                      }

                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        if (!filteredSearchMenuItems.length) {
                          return;
                        }
                        setMenuSearchHighlightedIndex((current) =>
                          current <= 0 ? filteredSearchMenuItems.length - 1 : current - 1,
                        );
                      }

                      if (event.key === "Enter" && filteredSearchMenuItems[menuSearchHighlightedIndex]) {
                        event.preventDefault();
                        handleSearchItemSelect(filteredSearchMenuItems[menuSearchHighlightedIndex]);
                      }

                      if (event.key === "Escape") {
                        event.preventDefault();
                        setMenuSearchOpen(false);
                      }
                    }}
                    className="h-input-md w-64 rounded-sm border border-border bg-white pl-9 pr-input-x text-body outline-none ring-0 placeholder:text-text-placeholder transition focus:border-border-focus focus:ring-2 focus:ring-primary-subtle"
                    placeholder="菜单搜索，快捷键 /"
                  />
                </div>

                {menuSearchOpen ? (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-full overflow-hidden rounded-md border border-border bg-white shadow-md">
                    <div className="max-h-[420px] overflow-auto py-2">
                      {filteredSearchMenuItems.length ? (
                        filteredSearchMenuItems.map((item, index) => (
                          <button
                            key={`${item.type}-${item.id}`}
                            type="button"
                            data-search-index={index}
                            onClick={() => handleSearchItemSelect(item)}
                            onMouseEnter={() => setMenuSearchHighlightedIndex(index)}
                            className={`block w-full px-section py-2 text-left transition ${
                              index === menuSearchHighlightedIndex ? "bg-primary-subtle" : "hover:bg-bg-hover"
                            }`}
                          >
                            <span className="block min-w-0">
                              <span className="block truncate text-body text-text-primary">{item.label}</span>
                              <span className="mt-1 block truncate text-small text-text-muted">
                                {item.groupLabel ? `${item.sectionLabel} / ${item.groupLabel}` : item.sectionLabel}
                              </span>
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-section py-10 text-center text-body text-text-muted">没有找到匹配的菜单。</div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div ref={notificationPanelRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={notificationPanelOpen}
                  aria-label="打开消息通知"
                  onClick={() => {
                    setNotificationPanelOpen((current) => !current);
                    setUserMenuOpen(false);
                  }}
                  className={`relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-subtle focus-visible:ring-offset-2 ${
                    notificationPanelOpen ? "border-primary bg-primary-subtle text-primary" : "border-border bg-white text-text-secondary hover:bg-bg-hover"
                  }`}
                >
                  <Bell aria-hidden="true" className="h-4 w-4" />
                  {notificationUnreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] leading-4 text-white">
                      {notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}
                    </span>
                  ) : null}
                </button>

                {notificationPanelOpen ? (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[420px] overflow-hidden rounded-md border border-border bg-white shadow-md">
                    <div className="flex items-center justify-between border-b border-border px-section py-section-tight">
                      <div className="flex items-center gap-2">
                        {notificationTabs.map((tab) => {
                          const active = tab.id === activeNotificationTab;
                          const count = notificationPreviewItems.filter(
                            (item) => item.feedTab === tab.id && item.unread,
                          ).length;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveNotificationTab(tab.id)}
                              className={`rounded-full px-3 py-1.5 text-body transition ${
                                active ? "bg-primary-subtle text-primary" : "text-text-secondary hover:bg-bg-hover"
                              }`}
                            >
                              {tab.label}({count})
                            </button>
                          );
                        })}
                      </div>

                    </div>

                    <div className="max-h-[420px] overflow-auto">
                      {currentNotificationItems.length ? (
                        currentNotificationItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setNotificationPanelOpen(false);
                              onNotificationItemOpen?.(item.id);
                            }}
                            className="flex w-full items-start gap-3 border-b border-border px-section py-section transition hover:bg-bg-hover"
                          >
                            <span
                              className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-small font-section-title text-white"
                              style={{ background: item.avatarBackground }}
                            >
                              {item.avatarLabel}
                            </span>
                            <span className="min-w-0 flex-1 text-left">
                              <span className="flex items-center gap-2">
                                <span className={`truncate text-body ${item.unread ? "font-body-strong text-text-primary" : "text-text-primary"}`}>
                                  {item.title}
                                </span>
                                {item.unread ? <span className="h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
                              </span>
                              <span className="mt-1 block truncate text-body text-text-secondary">{item.summary}</span>
                              <span className="mt-2 block text-small text-text-muted">{item.time}</span>
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-section py-10 text-center text-body text-text-muted">当前分类下暂无待处理消息。</div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 border-t border-border bg-white">
                      <button
                        type="button"
                        onClick={() => onNotificationMarkAllRead?.(activeNotificationTab)}
                        className="inline-flex items-center justify-center border-r border-border px-4 py-3 text-body text-primary transition hover:bg-bg-hover"
                      >
                        全部已读
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationPanelOpen(false);
                          onNotificationViewMore?.();
                        }}
                        className="inline-flex items-center justify-center px-4 py-3 text-body text-primary transition hover:bg-bg-hover"
                      >
                        查看更多
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((current) => !current)}
                  aria-label="打开用户菜单"
                  onMouseDown={() => setNotificationPanelOpen(false)}
                  className={`inline-flex h-8 w-8 min-w-8 shrink-0 items-center justify-center whitespace-nowrap rounded-sm text-mini font-section-title leading-none tracking-tight text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-subtle focus-visible:ring-offset-2 ${
                    userMenuOpen ? "bg-primary-hover" : "bg-primary hover:bg-primary-hover"
                  }`}
                >
                  VM
                </button>

                {userMenuOpen ? (
                  <div
                    role="menu"
                    aria-label="用户菜单"
                    className="absolute right-0 top-[calc(100%+8px)] z-30 w-56 rounded-md border border-border bg-white p-2 shadow-md"
                  >
                    <UserMenuItem
                      icon={UserCircle2}
                      label="个人中心"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onProfileAction?.();
                      }}
                    />
                    <UserMenuItem
                      icon={Palette}
                      label="主题色切换"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onThemeSwitchAction?.();
                      }}
                    />
                    <UserMenuItem
                      icon={Languages}
                      label="语言切换"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLanguageAction?.();
                      }}
                    />
                    <UserMenuItem
                      icon={LogOut}
                      label="退出登录"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogoutAction?.();
                      }}
                      danger
                    />
                  </div>
                ) : null}
              </div>
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

function UserMenuItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-body transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-subtle ${
        danger ? "text-danger hover:bg-danger-subtle" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
      }`}
    >
      <Icon aria-hidden="true" strokeWidth={1.8} className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
