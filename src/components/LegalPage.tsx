import Shell from "@/components/Shell";
import legal from "@/lib/legal-content.json";

export type Seg = string | { strong: string } | { href: string; text: string; external: boolean };
export type LegalBlock = { t: "h2"; text: string } | { t: "p"; segs: Seg[] } | { t: "ul"; items: Seg[][] };
export type LegalPageData = { title: string; date: string; intro: Seg[][]; notice: Seg[]; body: LegalBlock[] };

export const legalPages = legal as unknown as Record<"privacy" | "terms" | "grievance" | "cookie", LegalPageData>;

export function Segs({ segs }: { segs: Seg[] }) {
  return (
    <>
      {segs.map((s, i) => {
        if (typeof s === "string") return <span key={i}>{s}</span>;
        if ("strong" in s) return <strong key={i}>{s.strong}</strong>;
        return (
          <a key={i} href={s.href} target={s.external ? "_blank" : undefined} rel={s.external ? "noopener" : undefined}>
            {s.text}
          </a>
        );
      })}
    </>
  );
}

export default function LegalPage({ page }: { page: LegalPageData }) {
  return (
    <Shell variant="page">
      <article className="policy-page colc">
        <div className="lbl">Zelantrix, Inc. · Legal &amp; privacy</div>
        <h1 className="hero">{page.title}</h1>
        <p className="policy-date">{page.date}</p>
        {page.intro.map((segs, i) => (
          <p key={i} className="p"><Segs segs={segs} /></p>
        ))}
        <aside className="policy-notice"><Segs segs={page.notice} /></aside>
        <div className="policy-body">
          {page.body.map((b, i) =>
            b.t === "h2" ? (
              <h2 key={i}>{b.text}</h2>
            ) : b.t === "p" ? (
              <p key={i}><Segs segs={b.segs} /></p>
            ) : (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}><Segs segs={it} /></li>
                ))}
              </ul>
            ),
          )}
        </div>
      </article>
    </Shell>
  );
}
