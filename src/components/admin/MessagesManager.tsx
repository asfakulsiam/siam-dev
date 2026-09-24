"use client";

import { useState } from "react";
import {
  Mail,
  Search,
  Trash2,
  Check,
  RotateCcw,
  Loader2,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { ContactMessage } from "@/features/contact/schema";
import {
  updateMessageStatusAction,
  deleteMessageAction,
} from "@/features/contact/actions";

interface MessagesManagerProps {
  initialMessages: ContactMessage[];
}

export function MessagesManager({ initialMessages }: MessagesManagerProps) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");

  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.projectType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "unread" && msg.status === "unread") ||
      (filterStatus === "read" && msg.status === "read");

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (msg: ContactMessage) => {
    const targetId = msg.id || "";
    if (!targetId) return;

    setActionPendingId(targetId);
    const newStatus = msg.status === "unread" ? "read" : "unread";

    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === targetId ? { ...m, status: newStatus } : m)),
    );
    if (activeMessage?.id === targetId) {
      setActiveMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await updateMessageStatusAction(targetId, newStatus);
      if (res.ok) {
        setNotification({
          message: `Message marked as ${newStatus}.`,
          type: "success",
        });
      } else {
        // Revert
        setMessages((prev) =>
          prev.map((m) => (m.id === targetId ? { ...m, status: msg.status } : m)),
        );
        setNotification({
          message: res.error || "Failed to update message status.",
          type: "error",
        });
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === targetId ? { ...m, status: msg.status } : m)),
      );
      setNotification({
        message: "Error updating message status.",
        type: "error",
      });
    } finally {
      setActionPendingId(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id || "";
    setIsDeleting(true);

    try {
      const res = await deleteMessageAction(targetId);
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== targetId));
        if (activeMessage?.id === targetId) {
          setActiveMessage(null);
        }
        setNotification({
          message: "Message deleted successfully.",
          type: "success",
        });
        setDeleteTarget(null);
      } else {
        setNotification({
          message: res.error || "Failed to delete message.",
          type: "error",
        });
      }
    } catch {
      setNotification({
        message: "Error deleting message.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
              Contact Inquiries
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--accent)] text-[var(--accent-ink)]">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Submissions received from the public /contact form.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3 rounded-[var(--r-sm)] text-xs font-medium border flex items-center justify-between ${
            notification.type === "success"
              ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30"
              : "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/30"
          }`}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="underline hover:opacity-80 text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[var(--surface)] border border-[var(--line)] p-3 rounded-[var(--r-md)] shadow-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-3.5 h-3.5 text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/60 focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "unread" | "read")}
            aria-label="Filter messages by status"
            className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="all">All Messages ({messages.length})</option>
            <option value="unread">Unread Only ({unreadCount})</option>
            <option value="read">Read ({messages.length - unreadCount})</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] overflow-hidden shadow-xs">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Mail className="w-8 h-8 text-[var(--ink-muted)] mx-auto opacity-40" aria-hidden="true" />
            <p className="text-sm font-medium text-[var(--ink-muted)]">
              No inquiries found matching criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {filteredMessages.map((msg) => {
              const isUnread = msg.status === "unread";
              const isPending = actionPendingId === msg.id;

              return (
                <div
                  key={msg.id || msg.createdAt}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                    isUnread
                      ? "bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10"
                      : "hover:bg-[var(--surface-2)]/40"
                  }`}
                >
                  <div
                    onClick={() => setActiveMessage(msg)}
                    className="flex-1 space-y-1.5 cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-[var(--ink)]">
                        {msg.name}
                      </span>
                      {isUnread && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[var(--accent)] text-[var(--accent-ink)]">
                          NEW
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-[var(--r-sm)] text-[10px] font-semibold bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink-muted)]">
                        {msg.projectType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--ink-muted)] font-mono">
                      <span>{msg.email}</span>
                      <span>&bull;</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--ink)]/80 line-clamp-2 leading-relaxed">
                      {msg.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleStatus(msg)}
                      title={isUnread ? "Mark as read" : "Mark as unread"}
                      aria-label={isUnread ? "Mark as read" : "Mark as unread"}
                      className="p-1.5 rounded-[var(--r-sm)] border border-[var(--line)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      ) : isUnread ? (
                        <Check className="w-3.5 h-3.5 text-[var(--success)]" aria-hidden="true" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5 text-[var(--ink-muted)]" aria-hidden="true" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveMessage(msg)}
                      title="Read full message"
                      aria-label="Read full message"
                      className="p-1.5 rounded-[var(--r-sm)] border border-[var(--line)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(msg)}
                      title="Delete message"
                      aria-label="Delete message"
                      className="p-1.5 rounded-[var(--r-sm)] border border-[var(--line)] hover:bg-[var(--danger)]/10 text-[var(--ink-muted)] hover:text-[var(--danger)] hover:border-[var(--danger)]/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Message Detail Modal / Drawer */}
      {activeMessage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="msg-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 space-y-5 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h2 id="msg-detail-title" className="text-base font-bold text-[var(--ink)]">
                  {activeMessage.name}
                </h2>
                <a
                  href={`mailto:${activeMessage.email}`}
                  className="text-xs text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-mono mt-0.5"
                >
                  <span>{activeMessage.email}</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[var(--r-sm)] text-[10px] font-semibold bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)]">
                  {activeMessage.projectType}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-[var(--ink-muted)] font-mono text-[11px] pb-2 border-b border-[var(--line)]">
                <span>Timeline: {activeMessage.timeline || "Not specified"}</span>
                <span>
                  {new Date(activeMessage.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <div className="p-3.5 rounded-[var(--r-sm)] bg-[var(--bg)] border border-[var(--line)] whitespace-pre-wrap leading-relaxed text-sm text-[var(--ink)] font-sans">
                {activeMessage.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => handleToggleStatus(activeMessage)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors cursor-pointer"
              >
                {activeMessage.status === "unread" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                    <span>Mark as Read</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                    <span>Mark as Unread</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${activeMessage.email}?subject=Re: [Dev Den] Project Inquiry`}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 transition-opacity"
                >
                  Reply via Email
                </a>
                <button
                  type="button"
                  onClick={() => setActiveMessage(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-msg-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-[var(--danger)]">
              <div className="w-9 h-9 rounded-[var(--r-sm)] bg-[var(--danger)]/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 id="delete-msg-title" className="text-base font-bold text-[var(--ink)]">
                Delete Inquiry
              </h2>
            </div>

            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Are you sure you want to permanently delete the inquiry from{" "}
              <strong className="text-[var(--ink)] font-semibold">{deleteTarget.name}</strong> (
              <span className="font-mono">{deleteTarget.email}</span>)?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[var(--r-sm)] bg-[var(--danger)] text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
