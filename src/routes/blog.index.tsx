import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import Shell from "@/components/Shell";
import { listPosts } from "@/lib/public.functions";
import { fmtDate, nameFromEmail } from "@/lib/admin-session";

const q = queryOptions({ queryKey: ["posts"], queryFn: () => listPosts() });

export const Route = createFileRoute("/blog/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "Blog · Zelantrix" },
      { name: "description", content: "Notes on physical intelligence from the Zelantrix founders." },
      { property: "og:title", content: "Blog · Zelantrix" },
      { property: "og:description", content: "Notes on physical intelligence from the Zelantrix founders." },
    ],
  }),
  component: Blog,
});

function Blog() {
  const { data } = useSuspenseQuery(q);
  return (
    <Shell variant="page" wide>
      <section className="col" style={{ paddingTop: 190, paddingBottom: 80 }}>
        <h1 className="hero">Notes on Physical Intelligence</h1>
      </section>
      {data.length === 0 ? (
        <section className="col" style={{ paddingBottom: 96 }}>
          <p className="p">The founders will be posting here soon.</p>
        </section>
      ) : (
        <section className="grid">
          {data.map((p) => (
            <Link key={p.id} to="/blog/$id" params={{ id: p.id }} className="card">
              <div className="nm">Post</div>
              <div className="ct">{p.title}</div>
              <div className="au">{nameFromEmail(p.created_by)} · {fmtDate(p.created_at)}</div>
            </Link>
          ))}
        </section>
      )}
    </Shell>
  );
}
