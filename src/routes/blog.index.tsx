import { createFileRoute } from "@tanstack/react-router";
import Shell from "@/components/Shell";

export const Route = createFileRoute("/blog/")({
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
  return (
    <Shell variant="page" wide>
      <section className="col" style={{ paddingTop: 190, paddingBottom: 96 }}>
        <h1 className="hero">Coming soon</h1>
      </section>
    </Shell>
  );
}
