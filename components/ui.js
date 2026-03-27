"use client";

import { useState } from "react";

// ─── Stat card ─────────
export function Metric({ label, value, sub }) {
  return (
    <div className="bg-surface-card/60 rounded-xl px-4 py-3.5 border border-border-dim">
      <div className="text-[11px] uppercase tracking-wider text-txt-muted mb-1">
        {label}
      </div>
      <div className="text-xl font-medium text-txt-primary leading-tight">
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-txt-muted mt-1">{sub}</div>
      )}
    </div>
  );
}

// ─── Badge / pill ──────
const BADGE_COLORS = {
  default: "bg-surface-elevated text-txt-secondary",
  accent: "bg-accent/15 text-accent",
  system: "bg-[#7C8AF6]/15 text-[#7C8AF6]",
  friend: "bg-accent/15 text-accent",
  ok: "bg-ok/15 text-ok",
  warn: "bg-warn/15 text-warn",
  danger: "bg-danger/15 text-danger",
  meta: "bg-surface-elevated text-txt-secondary",
  members: "bg-[#7C8AF6]/15 text-[#7C8AF6]",
  fronts: "bg-ok/15 text-ok",
  journal: "bg-warn/15 text-warn",
  chat: "bg-accent/15 text-accent",
  polls: "bg-[#9B6DD7]/15 text-[#9B6DD7]",
  analytics: "bg-danger/15 text-danger",
  active: "bg-ok/15 text-ok",
  pending: "bg-warn/15 text-warn",
  revoked: "bg-danger/15 text-danger",
};

export function Badge({ children, color = "default" }) {
  const cls = BADGE_COLORS[color] || BADGE_COLORS.default;
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md ${cls}`}>
      {children}
    </span>
  );
}

// ─── Nav tab ───────────
export function NavTab({ active, children, href }) {
  return (
    <a
      href={href}
      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
        active
          ? "bg-surface-card text-txt-primary font-medium"
          : "text-txt-muted hover:text-txt-secondary hover:bg-surface-card/40"
      }`}
    >
      {children}
    </a>
  );
}

// ─── Empty state ───────
export function EmptyState({ message }) {
  return (
    <div className="text-center py-16 text-txt-muted text-sm">
      {message}
    </div>
  );
}

// ─── Confirm dialog ────
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-main border border-border rounded-card p-5 max-w-sm w-full shadow-2xl">
        <div className="text-txt-primary font-medium mb-2">{title}</div>
        <div className="text-txt-secondary text-sm mb-5 leading-relaxed">
          {message}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 text-sm text-txt-muted hover:text-txt-secondary rounded-lg hover:bg-surface-card transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-3.5 py-1.5 text-sm rounded-lg transition-colors ${
              danger
                ? "bg-danger/20 text-danger hover:bg-danger/30"
                : "bg-accent/20 text-accent hover:bg-accent/30"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Privacy notice box
export function PrivacyNote({ children }) {
  return (
    <div className="mt-6 p-3.5 bg-surface-card/30 border border-border-dim rounded-xl">
      <div className="flex items-start gap-2.5">
        <span className="text-warn text-xs mt-px shrink-0">◆</span>
        <div className="text-xs text-txt-muted leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Toast
export function Toast({ message, type = "ok", onDismiss }) {
  if (!message) return null;
  const colors = {
    ok: "bg-ok/15 text-ok border-ok/20",
    error: "bg-danger/15 text-danger border-danger/20",
    warn: "bg-warn/15 text-warn border-warn/20",
  };
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-sm shadow-lg ${colors[type] || colors.ok}`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        {onDismiss && (
          <button onClick={onDismiss} className="opacity-60 hover:opacity-100">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Format helpers
export function formatBytes(b) {
  if (!b || b === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatUptime(seconds) {
  if (!seconds) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function timeAgo(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function shortId(id) {
  return id ? id.slice(0, 8) : "—";
}
