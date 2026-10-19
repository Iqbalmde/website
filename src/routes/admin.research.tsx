import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import Shell from "@/components/Shell";
import { adminApi } from "@/lib/admin.functions";
import { useAdmin } from "@/lib/admin-session";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/research")({
  ssr: false,
  head: () => ({ meta: [{ title: "Research · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminResearch,
});

type Item = { id: string; title: string; created_by: string };

function AdminResearch() {
  const { session, kick } = useAdmin();
  const api = useServerFn(adminApi);
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const call = useCallback(async (action: string, payload?: Record<string, unknown>) => {
    const r = await api({ data: { action, token: session?.token, payload } }) as any;
    if (!r.ok && r.error === "unauthorized") kick();
    return r;
  }, [api, session, kick]);

  const load = useCallback(async () => {
    const r = await call("research_list");
    if (r.ok) setItems(r.items);
  }, [call]);
  useEffect(() => { if (session) load(); }, [session, load]);

  async function add() {
    setErr("");
    if (!file && !link.trim()) { setErr("Paste a link or choose a PDF."); return; }
    setBusy(true);
    try {
      let r;
      if (file) {
        if (file.type !== "application/pdf") throw new Error("Only PDF files are allowed.");
        if (file.size > 20 * 1024 * 1024) throw new Error("PDFs must be 20 MB or smaller.");
        const u = await call("upload_url", { name: file.name, type: file.type, size: file.size });
        if (!u.ok) throw new Error(u.error);
        const { error } = await supabase.storage.from("research-pdfs").uploadToSignedUrl(u.path, u.uploadToken, file, { contentType: "application/pdf" });
        if (error) throw new Error("Upload failed.");
        r = await call("research_add", { file_path: u.path, name: file.name });
      } else {
        r = await call("research_add", { url: link.trim() });
      }
      if (!r.ok) throw new Error(r.error);
      setLink(""); setFile(null); if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (e) { setErr((e as Error).message || "Something went wrong."); }
    setBusy(false);
  }

  async function del(it: Item) {
    if (!confirm(`Delete “${it.title}”?`)) return;
    const r = await call("research_delete", { id: it.id });
    if (!r.ok) setErr(r.error); else load();
  }

  if (!session) return null;
  return (
    <Shell variant="admin">
      <section className="colc" style={{ paddingTop: 190, paddingBottom: 56 }}>
        <h1 className="hero">Research</h1>
        <p className="who">Signed in as {session.email}</p>
        <div className="txt" style={{ marginTop: 40 }}>
          <p className="p">Paste a link or upload a PDF. The title is detected automatically, and the entry appears on the Research page labeled “New Research.”</p>
          <label className="fld"><span className="lbl">Link or PDF</span>
            <input className="in" type="url" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} disabled={!!file} /></label>
          <input ref={fileRef} className="file" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div><button className="tl" onClick={add} disabled={busy}>{busy ? "Adding…" : "Add research"}</button></div>
          {err && <p className="err">{err}</p>}
        </div>
      </section>
      <section className="colc" style={{ paddingTop: 24, paddingBottom: 72 }}>
        <div className="txt">
          <h2 className="h">Posted research</h2>
          {items.length === 0 && <p className="p">Nothing yet.</p>}
          {items.map((it) => (
            <div key={it.id} className="item">
              <p className="t">{it.title}</p>
              <p className="m">New Research · added by {it.created_by}</p>
              <button className="del" onClick={() => del(it)}>Delete</button>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
