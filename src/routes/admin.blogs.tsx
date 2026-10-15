import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { adminApi } from "@/lib/admin.functions";
import { useAdmin } from "@/lib/admin-session";

export const Route = createFileRoute("/admin/blogs")({
  ssr: false,
  head: () => ({ meta: [{ title: "Blogs · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminBlogs,
});

type Item = { id: string; title: string; created_by: string };

function AdminBlogs() {
  const { session, kick } = useAdmin();
  const api = useServerFn(adminApi);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [refined, setRefined] = useState<{ title: string; body: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const call = useCallback(async (action: string, payload?: Record<string, unknown>) => {
    const r = await api({ data: { action, token: session?.token, payload } }) as any;
    if (!r.ok && r.error === "unauthorized") kick();
    return r;
  }, [api, session, kick]);

  const load = useCallback(async () => { const r = await call("blog_list"); if (r.ok) setItems(r.items); }, [call]);
  useEffect(() => { if (session) load(); }, [session, load]);

  async function refine() {
    setErr("");
    if (!title.trim() || !body.trim()) { setErr("Add a title and body first."); return; }
    setBusy(true);
    try {
      const r = await call("blog_refine", { title, body });
      if (!r.ok) throw new Error(r.error);
      setRefined({ title: r.title, body: r.body }); setEditing(false);
    } catch (e) { setErr((e as Error).message || "Could not refine."); }
    setBusy(false);
  }

  async function publish() {
    if (!refined) return;
    setBusy(true); setErr("");
    const r = await call("blog_publish", refined);
    if (!r.ok) setErr(r.error);
    else { setTitle(""); setBody(""); setRefined(null); await load(); }
    setBusy(false);
  }

  async function del(it: Item) {
    if (!confirm(`Delete “${it.title}”?`)) return;
    const r = await call("blog_delete", { id: it.id });
    if (!r.ok) setErr(r.error); else load();
  }

  if (!session) return null;
  return (
    <Shell variant="admin">
      <section className="colc" style={{ paddingTop: 190, paddingBottom: 56 }}>
        <h1 className="hero">Blogs</h1>
        <p className="who">Signed in as {session.email}</p>
        <div className="txt" style={{ marginTop: 40 }}>
          <label className="fld"><span className="lbl">Title</span>
            <input className="in" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!!refined} /></label>
          <label className="fld"><span className="lbl">Body</span>
            <textarea className="in" value={body} onChange={(e) => setBody(e.target.value)} disabled={!!refined} /></label>
          {!refined && <button className="tl" onClick={refine} disabled={busy}>{busy ? "Refining…" : "Refine with AI"}</button>}
          {refined && (
            <div className="panel">
              <p className="lbl" style={{ margin: "0 0 20px" }}>AI-refined version · review before posting</p>
              <label className="fld"><span className="lbl">Title</span>
                <input className="in" value={refined.title} readOnly={!editing} onChange={(e) => setRefined({ ...refined, title: e.target.value })} /></label>
              <label className="fld"><span className="lbl">Body</span>
                <textarea className="in" value={refined.body} readOnly={!editing} onChange={(e) => setRefined({ ...refined, body: e.target.value })} /></label>
              <div className="acts">
                <button className="tl" onClick={publish} disabled={busy}>Approve &amp; publish</button>
                <button className="tl" onClick={() => setEditing(true)} disabled={editing}>Edit</button>
                <button className="tl" onClick={() => { setRefined(null); setEditing(false); }}>Discard</button>
              </div>
            </div>
          )}
          {err && <p className="err">{err}</p>}
        </div>
      </section>
      <section className="colc" style={{ paddingTop: 24, paddingBottom: 72 }}>
        <div className="txt">
          <h2 className="h">Published posts</h2>
          {items.length === 0 && <p className="p">Nothing yet.</p>}
          {items.map((it) => (
            <div key={it.id} className="item">
              <p className="t">{it.title}</p>
              <p className="m">Posted by {it.created_by}</p>
              <button className="del" onClick={() => del(it)}>Delete</button>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
