"use client";

import { useState, useEffect } from "react";
import {
  Metric, Badge, EmptyState, PrivacyNote,
  timeAgo, shortId,
} from "@/components/ui";

export default function SharingPage() {
  const [sharing, setSharing] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  async function load() {
    setLoading(true);
    try {
      const [sRes, uRes] = await Promise.all([
        fetch("/api/sharing"),
        fetch("/api/users"),
      ]);
      if (sRes.ok) {
        const sd = await sRes.json();
        setSharing(sd.sharing || []);
      }
      if (uRes.ok) {
        const ud = await uRes.json();
        setUsers(ud.users || []);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const userMap = {};
  users.forEach((u) => { userMap[u.id] = u; });

  const activeCount = sharing.filter((s) => s.status === "active").length;
  const pendingCount = sharing.filter((s) => s.status === "pending").length;

  const filtered = statusFilter === "all"
    ? sharing
    : sharing.filter((s) => s.status === statusFilter);

  function permsList(permsJson) {
    try {
      const p = JSON.parse(permsJson || "{}");
      return Object.entries(p)
        .filter(([, v]) => v)
        .map(([k]) => k.replace("share_", ""));
    } catch {
      return [];
    }
  }

  const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "pending", label: "Pending" },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-28 bg-surface-card rounded" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-surface-card rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-txt-primary">Sharing</h1>
        <button
          onClick={load}
          className="text-xs text-txt-muted hover:text-txt-secondary px-2.5 py-1.5 rounded-lg hover:bg-surface-card transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Metric label="Total relationships" value={sharing.length} />
        <Metric label="Active" value={activeCount} />
        <Metric label="Pending" value={pendingCount} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              statusFilter === t.key
                ? "bg-surface-card text-txt-primary font-medium"
                : "text-txt-muted hover:text-txt-secondary hover:bg-surface-card/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sharing list */}
      {filtered.length === 0 ? (
        <EmptyState message="No sharing relationships" />
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const sys = userMap[s.system_user_id];
            const fri = userMap[s.friend_user_id];
            const perms = permsList(s.permissions);

            return (
              <div
                key={s.id}
                className="bg-surface-card/30 border border-border-dim rounded-xl p-4 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Badge color={s.status}>{s.status}</Badge>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#7C8AF6] font-medium">
                      {sys?.handle || shortId(s.system_user_id)}
                    </span>
                    <span className="text-txt-muted text-xs">→</span>
                    <span className="text-accent font-medium">
                      {fri?.handle || shortId(s.friend_user_id)}
                    </span>
                  </div>
                  <span className="text-xs text-txt-muted ml-auto">
                    {timeAgo(s.created_at)}
                  </span>
                </div>

                {/* Participant IDs */}
                <div className="mt-2 flex gap-4 text-[11px] text-txt-muted font-mono">
                  <span>sys: {shortId(s.system_user_id)}</span>
                  <span>fri: {shortId(s.friend_user_id)}</span>
                </div>

                {/* Permission chips */}
                {perms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {perms.map((p) => (
                      <span
                        key={p}
                        className="text-[11px] bg-surface-elevated/60 text-txt-muted px-1.5 py-0.5 rounded-md"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Is this needed? */}
      <PrivacyNote>
        Admins can see which sharing relationships exist and their
        permission flags, but{" "}
        <strong className="text-txt-secondary">cannot</strong> read
        shared data, decrypt VEK blobs, or impersonate either party.
        All sharing is controlled exclusively by the system user.
      </PrivacyNote>
    </div>
  );
}
