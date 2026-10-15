import { createFileRoute } from "@tanstack/react-router";
import Shell from "@/components/Shell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact · Zelantrix" },
      { name: "description", content: "Reach the Zelantrix founders by email or on X." },
      { property: "og:title", content: "Contact · Zelantrix" },
      { property: "og:description", content: "Reach the Zelantrix founders by email or on X." },
    ],
  }),
  component: Contact,
});

const people = [
  ["Rahil", "rahil@zelantrix.com", "https://x.com/rahiltrips"],
  ["Raihan", "raihan@zelantrix.com", "https://x.com/ryxnnzz"],
  ["Iqbal", "iqbal@zelantrix.com", "https://x.com/Iqbalmde"],
];

function Contact() {
  return (
    <Shell variant="page">
      <section className="colc" style={{ paddingTop: 190, paddingBottom: 80 }}>
        <h1 className="hero">Get in touch</h1>
      </section>
      <section className="colc" style={{ paddingTop: 24, paddingBottom: 96 }}>
        <div className="txt">
          <p className="p" style={{ margin: "0 0 28px" }}>Reach out to our founders by email or on X.</p>
          <div className="ctc">
            {people.map(([n, e, x]) => (
              <div key={n} style={{ display: "contents" }}>
                <div className="n">{n}</div>
                <div className="ls">
                  <a href={`mailto:${e}`}>{e}</a>
                  <a className="x" href={x} target="_blank" rel="noopener">X ↗</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
