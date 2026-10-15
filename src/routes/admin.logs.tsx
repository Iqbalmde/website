import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { adminApi } from "@/lib/admin.functions";
import { fmtDateTime, useAdmin } from "@/lib/admin-session";

export const Route = createFileRoute("/admin/logs")({
  ssr: false,
  head: () => ({ meta: [{ title: "Logs · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLogs,
});

type Log = { id: string; email: string; action: string; item_title: string | null; created_at: string };

function AdminLogs() {
  const { session, kick } = useAdmin();
  const api = useServerFn(adminApi);
  const [items, setItems] = useState<Log[]>([]);

  useEffect(() => {
    if (!session) return;
    api({ data: { action: "logs_list", token: session.token } }).then((r: any) => {
      if (r.ok) setItems(r.items); else if (r.error === "unauthorized") kick();
    });
  }, [session, api, kick]);

  if (!session) return null;
  return (
    <Shell variant="admin">
      <section className="colc" style={{ paddingTop: 190, paddingBottom: 72 }}>
        <h1 className="hero">Logs</h1>
        <p className="who">Signed in as {session.email}</p>
        <div className="txt" style={{ marginTop: 40 }}>
          <p className="p" style={{ marginBottom: 40 }}>Who has signed in, added or deleted content. Newest first.</p>
          {items.map((l) => (
            <div key={l.id} className="item" style={{ marginBottom: 20 }}>
              <p className="t">{l.action}{l.item_title ? ` · “${l.item_title}”` : ""}</p>
              <p className="m">{l.email} · {fmtDateTime(l.created_at)}</p>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
