"use client";

import { useState, useEffect } from "react";
import {
  Metric, Badge, EmptyState, ConfirmDialog, Toast,
  formatBytes, timeAgo, shortId,
} from "@/components/ui";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [uRes, vRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/volumes"),
      ]);
      if (uRes.ok) {
        const ud = await uRes.json();
        setUsers(ud.users || []);
      }
      if (vRes.ok) {
        const vd = await vRes.json();
        setVolumes(vd.volumes || []);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(userId) {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setToast({ message: "User deleted", type: "ok" });
      setConfirmDelete(null);
      load();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }

  function getUserVolumes(userId) {
    return volumes.filter((v) => v.user_id === userId);
  }

  const systemCount = users.filter((u) => u.client_type === "system").length;
  const friendCount = users.filter((u) => u.client_type === "friend").length;

  const filtered = users.filter((u) => {
    if (filter !== "all" && u.client_type !== filter) return false;
    if (
      search &&
      !(u.handle || "").toLowerCase().includes(search.toLowerCase()) &&
      !u.id.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const FILTER_TABS = [
    { key: "all", label: "All" },
    { key: "system", label: "System" },
    { key: "friend", label: "Friend" },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-24 bg-surface-card rounded" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-surface-card rounded-xl" />)}
        </div>
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-surface-card rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-medium text-txt-primary mb-6">Users</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Metric label="Total" value={users.length} />
        <Metric label="System apps" value={systemCount} />
        <Metric label="Friend clients" value={friendCount} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5 items-center">
        {FILTER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === t.key
                ? "bg-surface-card text-txt-primary font-medium"
                : "text-txt-muted hover:text-txt-secondary hover:bg-surface-card/40"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Search handle or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface-deep border border-border rounded-lg px-3 py-1.5 text-sm text-txt-primary placeholder:text-txt-muted w-52 focus:border-accent transition-colors"
        />
      </div>

      {/* User list */}
      {filtered.length === 0 ? (
        <EmptyState message="No users match your filter" />
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => {
            const uVols = getUserVolumes(u.id);
            let features = [];
            try { features = JSON.parse(u.feature_set || "[]"); } catch {}

            return (
              <div
                key={u.id}
                className="bg-surface-card/30 border border-border-dim rounded-xl p-4 hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                        u.client_type === "system"
                          ? "bg-[#7C8AF6]/15 text-[#7C8AF6]"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {u.client_type === "system" ? "S" : "F"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-txt-primary truncate">
                          {u.handle || (
                            <span className="text-txt-muted italic font-normal">
                              no handle
                            </span>
                          )}
                        </span>
                        <Badge color={u.client_type}>{u.client_type}</Badge>
                      </div>
                      <div className="text-xs text-txt-muted font-mono mt-0.5">
                        {u.id}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmDelete(u)}
                    className="text-xs text-txt-muted hover:text-danger transition-colors shrink-0 px-2.5 py-1 rounded-lg hover:bg-danger/10"
                    title="Delete user and all their data"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-txt-muted">
                  <span>Protocol v{u.protocol_version}</span>
                  <span>Storage: {formatBytes(u.storage_used_bytes)}</span>
                  <span>Registered {timeAgo(u.created_at)}</span>
                  {uVols.length > 0 && (
                    <span>
                      {uVols.length} volume{uVols.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {features.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {features.map((f) => (
                      <span
                        key={f}
                        className="text-[11px] bg-surface-elevated/60 text-txt-muted px-1.5 py-0.5 rounded-md"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        danger
        title="Delete user"
        message={`Permanently delete "${
          confirmDelete?.handle || shortId(confirmDelete?.id || "")
        }" and all their volumes, sharing relationships, and sessions. Encrypted data will be removed, not exposed. This cannot be undone.`}
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
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
