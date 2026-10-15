import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

const KEY = "zx-admin-token";
export const getToken = () => (typeof window === "undefined" ? null : sessionStorage.getItem(KEY));
export const setToken = (t: string) => sessionStorage.setItem(KEY, t);
export const clearToken = () => sessionStorage.removeItem(KEY);

export function tokenEmail(t: string | null): string | null {
  if (!t) return null;
  try {
    const p = JSON.parse(atob((t.split(".")[1] ?? "").replace(/-/g, "+").replace(/_/g, "/")));
    if (!p.exp || p.exp * 1000 < Date.now()) return null;
    return p.email;
  } catch { return null; }
}

/** Client-side UX gate only; every server action re-verifies the token. */
export function useAdmin() {
  const navigate = useNavigate();
  const [s, setS] = useState<{ token: string; email: string } | null>(null);
  useEffect(() => {
    const t = getToken();
    const e = tokenEmail(t);
    if (!t || !e) { clearToken(); navigate({ to: "/admin", replace: true }); return; }
    setS({ token: t, email: e });
  }, [navigate]);
  const kick = () => { clearToken(); navigate({ to: "/admin", replace: true }); };
  return { session: s, kick };
}

export const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
export const fmtDateTime = (d: string) => new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
export const nameFromEmail = (e: string) => { const n = e.split("@")[0] ?? ""; return n.charAt(0).toUpperCase() + n.slice(1); };
