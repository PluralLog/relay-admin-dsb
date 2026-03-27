/**
 * Server-side relay client.
 * 
 * All communication with the relay server happens through this module.
 * The ADMIN_TOKEN is only ever used server-side — it never reaches the browser.
 * 
 * These endpoints return only metadata the server already stores
 * in plaintext.
 */

const RELAY_URL = process.env.RELAY_URL || "http://localhost:8443";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

async function relayFetch(path, options = {}) {
  const url = `${RELAY_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": ADMIN_TOKEN,
      ...options.headers,
    },
    // Don't cache on the server side — always fresh data
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Relay ${res.status}: ${body}`);
  }

  return res.json();
}

export async function getHealth() {
  // Health endpoint doesn't require admin token
  const url = `${RELAY_URL}/api/v1/health`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function getStats() {
  return relayFetch("/api/v1/admin/stats");
}

export async function getUsers() {
  return relayFetch("/api/v1/admin/users");
}

export async function getUser(userId) {
  return relayFetch(`/api/v1/admin/users/${userId}`);
}

export async function deleteUser(userId) {
  return relayFetch(`/api/v1/admin/users/${userId}`, { method: "DELETE" });
}

export async function getVolumes() {
  return relayFetch("/api/v1/admin/volumes");
}

export async function getSharing() {
  return relayFetch("/api/v1/admin/sharing");
}

export async function getSessionStats() {
  return relayFetch("/api/v1/admin/sessions");
}

export async function runMaintenance() {
  return relayFetch("/api/v1/admin/maintenance", { method: "POST" });
}

export async function expireAllSessions() {
  return relayFetch("/api/v1/admin/sessions/expire-all", { method: "POST" });
}

export function getRelayUrl() {
  return RELAY_URL;
}
