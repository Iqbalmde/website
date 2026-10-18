import { createServerFn } from "@tanstack/react-start";

export const listPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const { data } = await db.from("blog_posts").select("id,title,created_by,created_at").order("created_at", { ascending: false });
  return data || [];
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((id: string) => String(id))
  .handler(async ({ data: id }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const { data } = await db.from("blog_posts").select("id,title,body,created_by,created_at").eq("id", id).maybeSingle();
    return data;
  });

export const listResearch = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const { data } = await db.from("research_items").select("id,url,file_path,title,created_at").order("created_at", { ascending: false });
  const rows = data || [];
  return Promise.all(rows.map(async (r) => {
    let href = r.url || "";
    if (r.file_path) {
      const { data: s } = await db.storage.from("research-pdfs").createSignedUrl(r.file_path, 60 * 60 * 24 * 7);
      href = s?.signedUrl || "";
    }
    let src = "PDF";
    if (r.url) { try { src = new URL(r.url).hostname.replace(/^www\./, ""); } catch { src = r.url; } }
    return { id: r.id, title: r.title, href, src, created_at: r.created_at };
  }));
});
