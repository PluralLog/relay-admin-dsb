"use client";

import { useState, useEffect } from "react";
import { Metric, Badge, formatBytes, formatUptime, PrivacyNote } from "@/components/ui";

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [healthRes, sessRes] = await Promise.all([
        fetch("/api/health"),
        fetch("/api/sessions"),
      ]);
      if (!healthRes.ok) throw new Error("Failed to reach relay server");
      setData(await healthRes.json());
      if (sessRes.ok) setSessions(await sessRes.json());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-32 bg-surface-card rounded" />
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-surface-card rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-lg font-medium text-txt-primary mb-4">Overview</h1>
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-card p-5 text-sm">
          <div className="font-medium mb-1">Cannot reach relay server</div>
          <div className="text-danger/70">{error}</div>
          <button
            onClick={load}
            className="mt-3 text-xs bg-danger/20 px-3 py-1.5 rounded-lg hover:bg-danger/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { health, stats } = data || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-txt-primary">Overview</h1>
        <button
          onClick={load}
          className="text-xs text-txt-muted hover:text-txt-secondary px-2.5 py-1.5 rounded-lg hover:bg-surface-card transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Server health */}
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-wider text-txt-muted mb-3">
          Server health
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric
            label="Status"
            value={
              <span className={health?.status === "ok" ? "text-ok" : "text-danger"}>
                {health?.status?.toUpperCase() || "—"}
              </span>
            }
          />
          <Metric label="Version" value={health?.version || "—"} />
          <Metric label="Uptime" value={formatUptime(health?.uptime_seconds)} />
          <Metric label="Min protocol" value={`v${health?.min_protocol_version || "?"}`} />
        </div>
      </div>

      {/* Aggregate stats */}
      {stats && (
        <div className="mb-8">
          <div className="text-[11px] uppercase tracking-wider text-txt-muted mb-3">
            Ecosystem
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric
              label="System users"
              value={stats.system_users}
              sub={stats.recent_registrations_30d > 0 ? `+${stats.recent_registrations_30d} last 30d` : null}
            />
            <Metric label="Friend clients" value={stats.friend_users} />
            <Metric label="Total volumes" value={stats.total_volumes} />
            <Metric label="Total storage" value={formatBytes(stats.total_storage_bytes)} />
          </div>
        </div>
      )}

      {/* Sharing + sessions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {stats && (
          <div>
            <div className="text-[11px] uppercase tracking-wider text-txt-muted mb-3">
              Sharing
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Active" value={stats.active_shares} />
              <Metric label="Pending" value={stats.pending_shares} />
            </div>
          </div>
        )}

        {sessions && (
          <div>
            <div className="text-[11px] uppercase tracking-wider text-txt-muted mb-3">
              Auth
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Active sessions" value={sessions.active_sessions} />
              <Metric label="Pending challenges" value={sessions.pending_challenges} />
            </div>
          </div>
        )}
      </div>

      {/* Volume breakdown */}
      {stats?.volume_breakdown?.length > 0 && (
        <div className="mb-8">
          <div className="text-[11px] uppercase tracking-wider text-txt-muted mb-3">
            Volume breakdown
          </div>
          <div className="bg-surface-card/30 border border-border-dim rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-txt-muted text-[11px] uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5 font-medium">Type</th>
                  <th className="text-right px-4 py-2.5 font-medium">Count</th>
                  <th className="text-right px-4 py-2.5 font-medium">Total size</th>
                </tr>
              </thead>
              <tbody>
                {stats.volume_breakdown.map((v) => (
                  <tr key={v.volume_name} className="border-t border-border-dim">
                    <td className="px-4 py-2.5">
                      <Badge color={v.volume_name}>{v.volume_name}</Badge>
                    </td>
                    <td className="text-right px-4 py-2.5 text-txt-secondary">
                      {v.count}
                    </td>
                    <td className="text-right px-4 py-2.5 text-txt-secondary">
                      {formatBytes(v.total_bytes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite stats */}
      {sessions && (sessions.active_invites > 0 || sessions.redeemed_invites > 0) && (
        <div className="mb-8">
          <div className="text-[11px] uppercase tracking-wider text-txt-muted mb-3">
            Invite codes
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Active (unredeemed)" value={sessions.active_invites} />
            <Metric label="Redeemed" value={sessions.redeemed_invites} />
          </div>
        </div>
      )}

      <PrivacyNote>
        All statistics are derived from metadata the server already stores
        in plaintext (IDs, handles, sizes, timestamps). No encrypted
        payloads are read or decrypted to produce this view.
      </PrivacyNote>
    </div>
  );
}
