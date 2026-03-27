"use client";

import { useState } from "react";
import { Toast, ConfirmDialog } from "@/components/ui";

export default function RepairPage() {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  async function runAction(action) {
    setLoading(action);
    setConfirmAction(null);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      if (action === "cleanup") {
        setToast({ message: "Expired sessions and challenges cleaned up", type: "ok" });
      } else if (action === "expire_sessions") {
        const msg = data.sessions_expired
          ? `${data.sessions_expired} sessions expired`
          : "All sessions expired";
        setToast({ message: msg, type: "ok" });
      }
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
    setLoading(null);
  }

  const ACTIONS = [
    {
      id: "cleanup",
      title: "Cleanup expired data",
      desc: "Remove expired auth sessions, challenge nonces, and stale rate limit entries. Safe to run at any time — this is the same operation as the server's built-in maintenance endpoint.",
      buttonLabel: "Run cleanup",
      buttonStyle: "bg-surface-elevated text-txt-secondary hover:bg-surface-elevated/80",
      needsConfirm: false,
    },
    {
      id: "expire_sessions",
      title: "Force-expire all sessions",
      desc: "Immediately invalidate every active session. All connected System App and Friend Client users will need to re-authenticate on their next sync. Useful if you suspect a compromised session token.",
      buttonLabel: "Expire all sessions",
      buttonStyle: "bg-warn/15 text-warn hover:bg-warn/25",
      needsConfirm: true,
      confirmTitle: "Expire all sessions",
      confirmMessage: "This will disconnect every active user. They'll automatically re-authenticate on their next sync, but there may be a brief interruption. Continue?",
    },
  ];

  return (
    <div>
      <h1 className="text-lg font-medium text-txt-primary mb-2">Repair</h1>
      <p className="text-sm text-txt-muted mb-6">
        Maintenance operations for server health. These actions never expose encrypted data.
      </p>

      {/* Actions */}
      <div className="space-y-3 mb-10">
        {ACTIONS.map((a) => (
          <div
            key={a.id}
            className="bg-surface-card/30 border border-border-dim rounded-xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-txt-primary mb-1">
                  {a.title}
                </div>
                <div className="text-xs text-txt-muted leading-relaxed">
                  {a.desc}
                </div>
              </div>
              <button
                onClick={() =>
                  a.needsConfirm ? setConfirmAction(a) : runAction(a.id)
                }
                disabled={loading === a.id}
                className={`shrink-0 px-4 py-2 text-xs rounded-lg transition-colors disabled:opacity-40 ${a.buttonStyle}`}
              >
                {loading === a.id ? "Running..." : a.buttonLabel}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy boundaries reference */}
      <div className="mb-2">
        <div className="text-[11px] uppercase tracking-wider text-txt-muted mb-4">
          Privacy boundaries
        </div>

        <div className="bg-surface-card/30 border border-border-dim rounded-xl p-5 space-y-4">
          <div>
            <div className="text-xs font-medium text-ok mb-2.5">
              Admin can
            </div>
            <div className="space-y-2">
              {[
                "View user metadata: IDs, handles, client types, protocol versions, feature sets, storage usage, registration dates",
                "View volume metadata: names, version counters, sizes, last-updated timestamps",
                "View sharing relationships: which system↔friend pairs exist, their status, permission flags",
                "Delete users and all their data (encrypted blobs are removed, not exposed)",
                "Expire sessions and clean up stale auth data",
                "View aggregate statistics (user counts, storage totals, volume breakdowns)",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-ok text-[10px] mt-0.5 shrink-0">✓</span>
                  <span className="text-xs text-txt-secondary leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border-dim pt-4">
            <div className="text-xs font-medium text-danger mb-2.5">
              Admin cannot
            </div>
            <div className="space-y-2">
              {[
                "Decrypt any volume payload — all payloads are AES-256-GCM encrypted with keys the server never possesses",
                "Read member names, descriptions, pronouns, or any profile content",
                "Read journal entries, front history details, poll questions, or chat messages",
                "Access VEK blobs or any cryptographic key material (signing keys, exchange keys, derived keys)",
                "Impersonate users or forge authentication tokens",
                "Create, modify, or inject data into volumes",
                "Forge or modify sharing relationships (only the system user controls sharing)",
                "View session tokens or associate specific sessions with specific requests",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-danger text-[10px] mt-0.5 shrink-0">✗</span>
                  <span className="text-xs text-txt-secondary leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.confirmTitle}
        message={confirmAction?.confirmMessage}
        onConfirm={() => runAction(confirmAction.id)}
        onCancel={() => setConfirmAction(null)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
