import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import Shell from "@/components/Shell";
import { adminApi } from "@/lib/admin.functions";
import { getToken, setToken, tokenEmail } from "@/lib/admin-session";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Zelantrix" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: SignIn,
});

function SignIn() {
  const api = useServerFn(adminApi);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (tokenEmail(getToken())) navigate({ to: "/admin/research", replace: true }); }, [navigate]);

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const r = await api({ data: { action: "login", payload: { email, password } } });
      if (r.ok && "token" in r) { setToken(r.token); navigate({ to: "/admin/research", replace: true }); }
      else setErr(("error" in r && r.error) || "Invalid email or password.");
    } catch { setErr("Invalid email or password."); }
    setBusy(false);
  }

  return (
    <Shell variant="signin">
      <section className="colc" style={{ paddingTop: 190, paddingBottom: 96 }}>
        <h1 className="hero">Admin</h1>
        <p className="p" style={{ margin: "24px 0 40px" }}>Sign in with your @zelantrix.com email and the team password.</p>
        <form className="txt" onSubmit={submit}>
          <label className="fld"><span className="lbl">Email</span>
            <input className="in" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="fld"><span className="lbl">Password</span>
            <input className="in" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <button type="submit" className="tl" disabled={busy}>Sign in</button>
          {err && <p className="err">{err}</p>}
        </form>
      </section>
    </Shell>
  );
}
