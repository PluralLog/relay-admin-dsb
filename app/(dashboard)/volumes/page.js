"use client";

import { useState, useEffect } from "react";
import {
  Metric, Badge, EmptyState, PrivacyNote,
  formatBytes, timeAgo, shortId,
} from "@/components/ui";

export default function VolumesPage() {
  const [volumes, setVolumes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("updated");
  const [typeFilter, setTypeFilter] = useState("all");

  async function load() {
    setLoading(true);
    try {
      const [vRes, uRes] = await Promise.all([
        fetch("/api/volumes"),
        fetch("/api/users"),
      ]);
      if (vRes.ok) {
        const vd = await vRes.json();
        setVolumes(vd.volumes || []);
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

  const totalSize = volumes.reduce((s, v) => s + (v.size_bytes || 0), 0);

  const volumeTypes = {};
  volumes.forEach((v) => {
    volumeTypes[v.volume_name] = (volumeTypes[v.volume_name] || 0) + 1;
  });

  const filtered = typeFilter === "all"
    ? volumes
    : volumes.filter((v) => v.volume_name === typeFilter);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "updated") return new Date(b.updated_at) - new Date(a.updated_at);
    if (sortBy === "size") return (b.size_bytes || 0) - (a.size_bytes || 0);
    if (sortBy === "version") return b.version - a.version;
    return 0;
  });

  const SORT_OPTS = [
    { key: "updated", label: "Last updated" },
    { key: "size", label: "Size" },
    { key: "version", label: "Version" },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-28 bg-surface-card rounded" />
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-surface-card rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-txt-primary">Volumes</h1>
        <button
          onClick={load}
          className="text-xs text-txt-muted hover:text-txt-secondary px-2.5 py-1.5 rounded-lg hover:bg-surface-card transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Metric label="Total volumes" value={volumes.length} />
        <Metric label="Total storage" value={formatBytes(totalSize)} />
        <Metric label="Unique owners" value={new Set(volumes.map((v) => v.user_id)).size} />
        <Metric label="Volume types" value={Object.keys(volumeTypes).length} />
      </div>

      {/* Type badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setTypeFilter("all")}
          className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors ${
            typeFilter === "all"
              ? "bg-surface-card text-txt-primary"
              : "bg-surface-elevated/40 text-txt-muted hover:text-txt-secondary"
          }`}
        >
          all: {volumes.length}
        </button>
        {Object.entries(volumeTypes).map(([name, count]) => (
          <button
            key={name}
            onClick={() => setTypeFilter(typeFilter === name ? "all" : name)}
          >
            <Badge color={typeFilter === name ? name : "default"}>
              {name}: {count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-4 items-center">
        <span className="text-[11px] text-txt-muted uppercase tracking-wider">
          Sort
        </span>
        {SORT_OPTS.map((o) => (
          <button
            key={o.key}
            onClick={() => setSortBy(o.key)}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
              sortBy === o.key
                ? "bg-surface-card text-txt-primary font-medium"
                : "text-txt-muted hover:text-txt-secondary hover:bg-surface-card/40"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Volume list */}
      {sorted.length === 0 ? (
        <EmptyState message="No volumes uploaded yet" />
      ) : (
        <div className="space-y-1.5">
          {sorted.map((v, i) => {
            const owner = userMap[v.user_id];
            return (
              <div
                key={`${v.user_id}-${v.volume_name}-${i}`}
                className="flex items-center gap-3 bg-surface-card/30 border border-border-dim rounded-xl px-4 py-3 hover:border-border transition-colors"
              >
                <Badge color={v.volume_name}>{v.volume_name}</Badge>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-txt-muted font-mono">
                    {shortId(v.user_id)}
                  </span>
                  {owner?.handle && (
                    <span className="text-xs text-txt-muted ml-1.5">
                      ({owner.handle})
                    </span>
                  )}
                </div>
                <div className="flex gap-5 text-xs text-txt-muted shrink-0">
                  <span className="w-10 text-right">v{v.version}</span>
                  <span className="w-16 text-right">
                    {formatBytes(v.size_bytes)}
                  </span>
                  <span className="w-20 text-right">
                    {timeAgo(v.updated_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PrivacyNote>
        Volume payloads are opaque encrypted blobs. This view shows
        metadata only (name, version, size, timestamp) —{" "}
        <strong className="text-txt-secondary">never</strong> the contents.
        The server is untrusted by design.
      </PrivacyNote>
    </div>
  );
}
