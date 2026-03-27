"use client";

import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: "◈" },
  { href: "/users", label: "Users", icon: "◎" },
  { href: "/volumes", label: "Volumes", icon: "▦" },
  { href: "/sharing", label: "Sharing", icon: "⇄" },
  { href: "/repair", label: "Repair", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="w-56 shrink-0 bg-surface-main border-r border-border-dim h-screen sticky top-0 flex flex-col">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-border-dim">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-card border border-border flex items-center justify-center">
            <span className="text-base font-extralight text-accent">P</span>
          </div>
          <div>
            <div className="text-sm font-medium text-txt-primary leading-tight">
              PolyLog
            </div>
            <div className="text-[10px] uppercase tracking-widest text-txt-muted">
              Relay Admin
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                active
                  ? "bg-surface-card text-txt-primary font-medium"
                  : "text-txt-muted hover:text-txt-secondary hover:bg-surface-card/40"
              }`}
            >
              <span className={`text-xs ${active ? "text-accent" : "text-txt-muted"}`}>
                {item.icon}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border-dim">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-txt-muted hover:text-txt-secondary hover:bg-surface-card/40 rounded-lg transition-colors"
        >
          <span className="text-xs">→</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
