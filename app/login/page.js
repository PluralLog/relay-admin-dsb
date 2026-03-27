"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/overview");
    } else {
      const data = await res.json();
      setError(data.error || "Invalid password");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-card border border-border mb-5">
            <span className="text-3xl font-extralight text-accent">P</span>
          </div>
          <h1 className="text-lg font-medium text-txt-primary mb-1">
            PolyLog Relay Admin
          </h1>
          <p className="text-sm text-txt-muted">
            Sign in to manage your relay server
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-main border border-border rounded-card p-6">
          <label className="block text-xs text-txt-muted mb-1.5">
            Admin password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full bg-surface-deep border border-border rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent transition-colors mb-4"
            placeholder="Enter admin password"
          />
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 text-sm font-medium bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors disabled:opacity-40"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {error && (
            <div className="mt-3 text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </form>

        <p className="text-center text-xs text-txt-muted mt-5">
          Privacy-safe administration — no encrypted data is ever exposed
        </p>
      </div>
    </div>
  );
}
