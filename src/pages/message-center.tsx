import { useEffect, useMemo } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Settings2,
  X,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  messageCenterCategories,
  type MessageCategoryId,
  type MessageRecord,
} from "../data/message-center";

export function MessageCenterPage({
  records,
  activeCategory,
  onlyUnread,
  selectedIds,
  activeMessageId,
  onCategoryChange,
  onOnlyUnreadChange,
  onSelectedIdsChange,
  onOpenMessage,
  onCloseMessage,
  onMarkSelectedRead,
  onOpenRelated,
  onOpenSettings,
}: {
  records: MessageRecord[];
  activeCategory: MessageCategoryId;
  onlyUnread: boolean;
  selectedIds: string[];
  activeMessageId: string | null;
  onCategoryChange: (category: MessageCategoryId) => void;
  onOnlyUnreadChange: (checked: boolean) => void;
  onSelectedIdsChange: (ids: string[]) => void;
  onOpenMessage: (id: string) => void;
  onCloseMessage: () => void;
  onMarkSelectedRead: () => void;
  onOpenRelated: (record: MessageRecord) => void;
  onOpenSettings: () => void;
}) {
  const categories = useMemo(
    () =>
      messageCenterCategories.map((category) => ({
        ...category,
        count:
          category.id === "all"
            ? records.filter((item) => item.unread).length
            : records.filter((item) => item.category === category.id && item.unread).length,
      })),
    [records],
  );

  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        if (activeCategory !== "all" && item.category !== activeCategory) {
          return false;
        }

        if (onlyUnread && !item.unread) {
          return false;
        }

        return true;
      }),
    [activeCategory, onlyUnread, records],
  );

  const activeMessage = useMemo(
    () => records.find((item) => item.id === activeMessageId) ?? null,
    [activeMessageId, records],
  );

  const visibleIds = filteredRecords.map((item) => item.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const selectedUnreadCount = selectedIds.filter((id) => records.find((item) => item.id === id)?.unread).length;

  const activeIndex = filteredRecords.findIndex((item) => item.id === activeMessageId);
  const prevMessageId = activeIndex > 0 ? filteredRecords[activeIndex - 1]?.id : null;
  const nextMessageId =
    activeIndex >= 0 && activeIndex < filteredRecords.length - 1 ? filteredRecords[activeIndex + 1]?.id : null;

  useEffect(() => {
    if (activeMessageId && !filteredRecords.some((item) => item.id === activeMessageId)) {
      onCloseMessage();
    }
  }, [activeMessageId, filteredRecords, onCloseMessage]);

  function toggleRowSelection(id: string) {
    onSelectedIdsChange(
      selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id],
    );
  }

  function toggleCurrentPageSelection() {
    if (allVisibleSelected) {
      onSelectedIdsChange(selectedIds.filter((id) => !visibleIds.includes(id)));
      return;
    }

    onSelectedIdsChange(Array.from(new Set([...selectedIds, ...visibleIds])));
  }

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <div className="page-title">消息中心</div>
          <div className="mt-2 text-body text-text-secondary">
            统一查看审批提醒、运营通知和系统消息，支持批量标记已读与抽屉详情查看。
          </div>
        </div>
      </div>

      <section className="page-section relative overflow-hidden p-0">
        <div className="flex min-h-[680px]">
          <aside className="flex w-[184px] shrink-0 flex-col border-r border-border bg-bg-subtle">
            <div className="flex-1 px-2 py-3">
              <div className="space-y-1">
                {categories.map((category) => {
                  const active = category.id === activeCategory;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => onCategoryChange(category.id)}
                      className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-body transition ${
                        active ? "bg-primary-subtle text-primary" : "text-text-secondary hover:bg-white hover:text-text-primary"
                      }`}
                    >
                      <span>{category.label}</span>
                      <span className={`tabular-nums text-small ${active ? "text-primary" : "text-text-muted"}`}>
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border p-2">
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-body text-text-secondary transition hover:bg-white hover:text-text-primary"
              >
                <Settings2 aria-hidden="true" className="h-4 w-4" />
                <span>消息设置</span>
              </button>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex h-[56px] items-center border-b border-border bg-white px-section">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-input-md items-center gap-2 rounded-sm border border-border bg-white px-3 text-body text-text-secondary transition hover:bg-bg-hover"
                >
                  <CalendarDays aria-hidden="true" className="h-4 w-4" />
                  <span>2026-01-22 - 2026-03-23</span>
                </button>

                <Button size="sm" onClick={onMarkSelectedRead} disabled={selectedUnreadCount === 0}>
                  标记已读
                </Button>

                <label className="inline-flex items-center gap-2 text-body text-text-secondary">
                  <input
                    checked={onlyUnread}
                    onChange={(event) => onOnlyUnreadChange(event.target.checked)}
                    type="checkbox"
                  />
                  <span>只有未读</span>
                </label>
              </div>
            </div>

            <div className="overflow-auto">
              <table>
                <thead>
                  <tr>
                    <th className="w-12">
                      <input checked={allVisibleSelected} onChange={toggleCurrentPageSelection} type="checkbox" />
                    </th>
                    <th>消息内容</th>
                    <th className="w-40">消息类型</th>
                    <th className="w-48">消息时间</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((item) => {
                    const active = item.id === activeMessageId;
                    const selected = selectedIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`${active ? "bg-bg-hover" : ""} cursor-pointer transition hover:bg-bg-hover`}
                        onClick={() => onOpenMessage(item.id)}
                      >
                        <td onClick={(event) => event.stopPropagation()}>
                          <input checked={selected} onChange={() => toggleRowSelection(item.id)} type="checkbox" />
                        </td>
                        <td>
                          <div className="flex min-w-0 items-start gap-3">
                            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${item.unread ? "bg-primary" : "bg-transparent"}`} />
                            <div className="min-w-0">
                              <div className={`truncate text-body ${item.unread ? "font-body-strong text-text-primary" : "text-text-primary"}`}>
                                {item.summary}
                              </div>
                              <div className="mt-1 truncate text-small text-text-muted">
                                {item.relatedDocumentNo ? `关联单据：${item.relatedDocumentNo}` : item.title}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-body text-text-secondary">{item.messageType}</td>
                        <td className="tabular-nums text-body text-text-secondary">{item.time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredRecords.length === 0 ? (
                <div className="flex min-h-[320px] items-center justify-center text-body text-text-muted">
                  当前筛选条件下暂无消息。
                </div>
              ) : null}
            </div>
          </div>

          {activeMessage ? (
            <>
              <div className="absolute inset-y-0 right-0 left-[184px] z-10 bg-black/8" onClick={onCloseMessage} />
              <aside className="absolute inset-y-0 right-0 z-20 flex w-[min(42vw,720px)] min-w-[480px] max-w-[var(--drawer-width-lg)] flex-col border-l border-border bg-white shadow-md">
                <div className="flex h-[56px] items-center justify-between border-b border-border px-section">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!prevMessageId}
                      onClick={() => prevMessageId && onOpenMessage(prevMessageId)}
                      className="inline-flex h-btn-sm w-btn-sm items-center justify-center rounded-sm border border-border bg-white text-text-secondary transition hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={!nextMessageId}
                      onClick={() => nextMessageId && onOpenMessage(nextMessageId)}
                      className="inline-flex h-btn-sm w-btn-sm items-center justify-center rounded-sm border border-border bg-white text-text-secondary transition hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronRight aria-hidden="true" className="h-4 w-4" />
                    </button>
                    <span className="tabular-nums text-small text-text-muted">{activeMessage.time}</span>
                  </div>

                  <button
                    type="button"
                    onClick={onCloseMessage}
                    className="inline-flex h-btn-sm w-btn-sm items-center justify-center rounded-sm text-text-muted transition hover:bg-bg-hover hover:text-text-primary"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-auto px-drawer py-drawer">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-page-title font-page-title text-text-primary">{activeMessage.title}</div>
                        <Badge tone={activeMessage.unread ? "pending" : "draft"}>
                          {activeMessage.unread ? "未读" : "已读"}
                        </Badge>
                      </div>
                      <div className="mt-2 text-body text-text-secondary">{activeMessage.summary}</div>
                    </div>

                    {activeMessage.actionTarget ? (
                      <button
                        type="button"
                        onClick={() => onOpenRelated(activeMessage)}
                        className="inline-flex items-center gap-1 text-body text-primary transition hover:text-primary-hover"
                      >
                        <span>{activeMessage.actionLabel ?? "查看详情"}</span>
                        <ExternalLink aria-hidden="true" className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-0 overflow-hidden rounded-md border border-border">
                    {activeMessage.detailSections.map((section, index) => (
                      <div
                        key={`${section.label}-${index}`}
                        className={`grid grid-cols-[120px_minmax(0,1fr)] gap-4 bg-white px-section py-3 ${
                          index === 0 ? "" : "border-t border-border"
                        }`}
                      >
                        <div className="text-small text-text-muted">{section.label}</div>
                        <div className="text-body text-text-primary">{section.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-4">
                    {activeMessage.detailBlocks.map((block) => (
                      <section key={block.title} className="rounded-md border border-border bg-bg-subtle p-section">
                        <div className="text-body font-section-title text-text-primary">{block.title}</div>
                        <div className="mt-2 text-body leading-ui-relaxed text-text-secondary">{block.content}</div>
                      </section>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={onCloseMessage}>
                      关闭
                    </Button>
                    {activeMessage.actionTarget ? (
                      <Button size="sm" variant="primary" onClick={() => onOpenRelated(activeMessage)}>
                        {activeMessage.actionLabel ?? "查看详情"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </aside>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
