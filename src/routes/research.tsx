import { createFileRoute } from "@tanstack/react-router";
import Shell from "@/components/Shell";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research · Zelantrix" },
      { name: "description", content: "Towards reliable physical intelligence: papers and reading from Zelantrix." },
      { property: "og:title", content: "Research · Zelantrix" },
      { property: "og:description", content: "Towards reliable physical intelligence: papers and reading from Zelantrix." },
    ],
  }),
  component: Research,
});

const papers = [
  ["01 · Benchmark", "Benchmarking Vision-Language-Action Models on SO-101: Failure and Recovery Analysis", "Yi Yu, Xinchuan Qiu (2026)", "https://arxiv.org/abs/2606.08881"],
  ["02 · Routing", "RouterVLA: Budgeted Commissioning and Expert Onboarding for Growing VLA Pools", "Xingyu Ren, Chugang Yi, Youran Sun (2026)", "https://arxiv.org/abs/2606.27355"],
  ["03 · Safety", "SAFE: Multitask Failure Detection for Vision-Language-Action Models", "Qiao Gu et al. (2025)", "https://arxiv.org/abs/2506.09937"],
  ["04 · Deployment data", "π*0.6: a VLA That Learns From Experience", "Physical Intelligence (2025)", "https://arxiv.org/abs/2511.14759"],
  ["05 · Data gap", "Good old-fashioned engineering can close the 100,000-year “data gap” in robotics", "Ken Goldberg, Science Robotics (2025)", "https://www.science.org/doi/10.1126/scirobotics.aea7390"],
  ["06 · Industry", "The True Cost of Downtime 2024", "Siemens (2024)", "https://assets.new.siemens.com/siemens/assets/api/uuid:1b43afb5-2d07-47f7-9eb7-893fe7d0bc59/TCOD-2024_original.pdf"],
  ["07 · Industry", "World Robotics 2025: Industrial Robots", "International Federation of Robotics (2025)", "https://ifr.org/ifr-press-releases/news/global-robot-demand-in-factories-doubles-over-10-years"],
];

function Research() {
  return (
    <Shell variant="page" wide>
      <section className="col" style={{ paddingTop: 190, paddingBottom: 80 }}>
        <h1 className="hero">Towards Reliable Physical Intelligence</h1>
      </section>
      <section className="grid">
        {papers.map(([nm, ct, au, href]) => (
          <a key={href} className="card" href={href} target="_blank" rel="noopener">
            <div className="nm">{nm}</div>
            <div className="ct">{ct}</div>
            <div className="au">{au} ↗</div>
          </a>
        ))}
      </section>
    </Shell>
  );
}
