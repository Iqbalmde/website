import { createServerFn } from "@tanstack/react-start";

type Input = { action: string; token?: string | undefined; payload?: Record<string, unknown> | undefined };

export const adminApi = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => {
    if (!d || typeof d.action !== "string") throw new Error("Bad request");
    return d;
  })
  .handler(async ({ data }) => {
    const srv = await import("./admin.server");
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { getRequestIP } = await import("@tanstack/react-start/server");
    const ip = getRequestIP({ xForwardedFor: true }) || "unknown";
    const p = (data.payload || {}) as any;
    const log = (email: string, action: string, item_type: string | null, item_title: string | null) =>
      db.from("admin_logs").insert({ email, action, item_type, item_title, ip });

    if (data.action === "login") {
      const email = String(p.email || "").trim().toLowerCase();
      const password = String(p.password || "");
      const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count } = await db.from("login_attempts").select("id", { count: "exact", head: true })
        .eq("email", email).eq("ip", ip).gte("created_at", since);
      if ((count || 0) >= 5) return { ok: false as const, error: "Too many attempts. Try again later." };
      const expected = process.env["ADMIN_SHARED_PASSWORD"];
      const good = !!expected && email.endsWith("@zelantrix.com") && email.length > 14 &&
        srv.passwordMatches(password, expected);
      if (!good) {
        await db.from("login_attempts").insert({ email, ip });
        await log(email || "(empty)", "Failed sign-in attempt", null, null);
        return { ok: false as const, error: "Invalid email or password." };
      }
      await db.from("login_attempts").delete().eq("email", email).eq("ip", ip);
      await log(email, "Signed in", null, null);
      return { ok: true as const, token: await srv.signJwt(email), email };
    }

    let email: string;
    try { email = await srv.verifyJwt(data.token); } catch { return { ok: false as const, error: "unauthorized" }; }

    try {
      switch (data.action) {
        case "me":
          return { ok: true as const, email };
        case "upload_url": {
          const name = String(p.name || "file.pdf");
          if (p.type !== "application/pdf" || !/\.pdf$/i.test(name)) return { ok: false as const, error: "Only PDF files are allowed." };
          if (typeof p.size !== "number" || p.size > 20 * 1024 * 1024) return { ok: false as const, error: "PDFs must be 20 MB or smaller." };
          const path = `${crypto.randomUUID()}.pdf`;
          const { data: s, error } = await db.storage.from("research-pdfs").createSignedUploadUrl(path);
          if (error || !s) return { ok: false as const, error: "Could not prepare upload." };
          return { ok: true as const, path: s.path, uploadToken: s.token };
        }
        case "research_add": {
          let row: { url: string | null; file_path: string | null; title: string };
          if (p.file_path) {
            const fp = String(p.file_path);
            if (!/^[0-9a-f-]{36}\.pdf$/.test(fp)) return { ok: false as const, error: "Bad file." };
            const { data: s } = await db.storage.from("research-pdfs").createSignedUrl(fp, 600);
            if (!s) return { ok: false as const, error: "Upload not found." };
            row = { url: null, file_path: fp, title: await srv.titleFromPdf(s.signedUrl, String(p.name || "")) };
          } else {
            const r = await srv.titleFromUrl(String(p.url || ""));
            row = { url: r.url, file_path: null, title: r.title };
          }
          const { error } = await db.from("research_items").insert({ ...row, created_by: email });
          if (error) return { ok: false as const, error: "Could not save." };
          await log(email, "Added research", "research", row.title);
          return { ok: true as const };
        }
        case "research_delete": {
          const { data: it } = await db.from("research_items").select("*").eq("id", String(p.id)).maybeSingle();
          if (!it) return { ok: false as const, error: "Not found." };
          if (it.file_path) await db.storage.from("research-pdfs").remove([it.file_path]);
          await db.from("research_items").delete().eq("id", it.id);
          await log(email, "Deleted research", "research", it.title);
          return { ok: true as const };
        }
        case "research_list": {
          const { data: rows } = await db.from("research_items").select("id,title,created_by,created_at").order("created_at", { ascending: false });
          return { ok: true as const, items: rows || [] };
        }
        case "blog_refine": {
          const title = String(p.title || ""), body = String(p.body || "");
          const out = await srv.aiText(
            `Improve clarity, grammar, flow and concision of this blog post. Keep the author's meaning, voice, facts and numbers. Do not invent facts or add claims. Return JSON {title, body}.\n\nTITLE:\n${title}\n\nBODY:\n${body}`,
            {
              type: "json_schema", name: "post", strict: true,
              schema: { type: "object", additionalProperties: false, required: ["title", "body"], properties: { title: { type: "string" }, body: { type: "string" } } },
            },
          );
          const j = JSON.parse(out);
          return { ok: true as const, title: String(j.title), body: String(j.body) };
        }
        case "blog_publish": {
          const title = String(p.title || "").trim(), body = String(p.body || "").trim();
          if (!title || !body) return { ok: false as const, error: "Title and body are required." };
          const { error } = await db.from("blog_posts").insert({ title, body, created_by: email });
          if (error) return { ok: false as const, error: "Could not publish." };
          await log(email, "Published blog post", "blog", title);
          return { ok: true as const };
        }
        case "blog_delete": {
          const { data: it } = await db.from("blog_posts").select("id,title").eq("id", String(p.id)).maybeSingle();
          if (!it) return { ok: false as const, error: "Not found." };
          await db.from("blog_posts").delete().eq("id", it.id);
          await log(email, "Deleted blog post", "blog", it.title);
          return { ok: true as const };
        }
        case "blog_list": {
          const { data: rows } = await db.from("blog_posts").select("id,title,created_by,created_at").order("created_at", { ascending: false });
          return { ok: true as const, items: rows || [] };
        }
        case "logs_list": {
          const { data: rows } = await db.from("admin_logs").select("id,email,action,item_title,created_at").order("created_at", { ascending: false }).limit(200);
          return { ok: true as const, items: rows || [] };
        }
      }
      return { ok: false as const, error: "Unknown action." };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message || "Something went wrong." };
    }
  });
