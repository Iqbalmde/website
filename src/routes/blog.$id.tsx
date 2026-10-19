import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import Shell from "@/components/Shell";
import { getPost } from "@/lib/public.functions";
import { fmtDate, nameFromEmail } from "@/lib/admin-session";

const q = (id: string) => queryOptions({ queryKey: ["post", id], queryFn: () => getPost({ data: id }) });

export const Route = createFileRoute("/blog/$id")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(q(params.id));
    if (!p) throw redirect({ to: "/blog" });
    return { title: p.title, excerpt: p.body.slice(0, 150) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} · Zelantrix` : "Blog · Zelantrix" },
      { name: "description", content: loaderData?.excerpt ?? "A post from Zelantrix." },
      { property: "og:title", content: loaderData?.title ?? "Zelantrix" },
      { property: "og:description", content: loaderData?.excerpt ?? "A post from Zelantrix." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: Post,
});

function Post() {
  const { id } = Route.useParams();
  const { data: p } = useSuspenseQuery(q(id));
  if (!p) return null;
  const paras = p.body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return (
    <Shell variant="page">
      <article className="colc" style={{ paddingTop: 190, paddingBottom: 96 }}>
        <h1 className="hero">{p.title}</h1>
        <p className="who" style={{ margin: "14px 0 48px" }}>{nameFromEmail(p.created_by)} · {fmtDate(p.created_at)}</p>
        <div className="txt">{paras.map((t, i) => <p key={i} className="p" style={{ whiteSpace: "pre-line" }}>{t}</p>)}</div>
      </article>
    </Shell>
  );
}
