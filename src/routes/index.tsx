import { createFileRoute, Link } from "@tanstack/react-router";
import Shell from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zelantrix" },
      { name: "description", content: "Zelantrix is a physical AI research lab." },
      { property: "og:title", content: "Zelantrix" },
      { property: "og:description", content: "Zelantrix is a physical AI research lab." },
    ],
  }),
  component: Home,
});

const nodes: [number, number][] = [[230, 50], [410, 230], [230, 410], [50, 230]];
const steps = [
  ["Deploy", "Robots on real", "factory tasks"],
  ["Route", "Right model,", "every moment"],
  ["Eval", "Runs become", "training data"],
  ["Post-train", "Better models,", "smarter routing"],
];
const delays = ["0s", "4s", "8s", "12s"];

function Flywheel() {
  return (
    <svg viewBox="0 0 460 460" role="img" aria-label="Deployment flywheel: deploy, route, eval, post-train" style={{ display: "block", width: "100%", maxWidth: 460, margin: "0 auto" }}>
      <circle cx="230" cy="230" r="180" fill="none" stroke="#111111" strokeWidth="1.5" />
      <g className="spin">
        <circle cx="230" cy="230" r="180" fill="none" stroke="#2f9e92" strokeWidth="3" strokeLinecap="round" pathLength="100" strokeDasharray="14 86" />
        <circle cx="344.7" cy="368.7" r="6" fill="#2f9e92" />
      </g>
      {nodes.map(([x, y], i) => (
        <g key={`b${i}`}>
          <circle cx={x} cy={y} r="25" fill="#fafafa" stroke="#111111" strokeWidth="1.5" />
          <text x={x} y={y + 6} textAnchor="middle" fontSize="18" fill="#111111">{i + 1}</text>
        </g>
      ))}
      {nodes.map(([x, y], i) => (
        <g key={`a${i}`} className={i === 0 ? "act a1" : "act"} style={{ animationDelay: delays[i] }}>
          <circle cx={x} cy={y} r="25" fill="#2f9e92" stroke="#2f9e92" strokeWidth="1.5" />
          <text x={x} y={y + 6} textAnchor="middle" fontSize="18" fill="#ffffff">{i + 1}</text>
        </g>
      ))}
      {steps.map(([t, l1, l2], i) => (
        <g key={`l${i}`} className={i === 0 ? "act a1" : "act"} style={{ animationDelay: delays[i] }}>
          <text x="230" y="222" textAnchor="middle" fontSize="24" fontWeight="500" fill="#111111">{t}</text>
          <text x="230" y="254" textAnchor="middle" fontSize="14" fill="#555555">{l1}</text>
          <text x="230" y="274" textAnchor="middle" fontSize="14" fill="#555555">{l2}</text>
        </g>
      ))}
    </svg>
  );
}

function Row({ text, href, last }: { text: string; href: string; last?: boolean }) {
  return (
    <div className="ln" style={last ? { marginBottom: 32 } : undefined}>
      <a href={href} target="_blank" rel="noopener">{text}</a><span>↗</span>
    </div>
  );
}

function Home() {
  return (
    <Shell variant="home">
      <section className="colc" style={{ paddingTop: 190, paddingBottom: 56 }}>
        <h1 className="hero">Understanding Physical AI</h1>
      </section>

      <section className="colc" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <div className="txt">
          <p className="p" style={{ marginBottom: 40 }}>Physical AI is the intelligence that lets robots perceive, decide and act in the real world. Making it work on a factory floor is less about one breakthrough model and more about a loop with four parts: data, evals, routing and post-training.</p>
        </div>
      </section>

      <section className="colc" style={{ paddingTop: 64, paddingBottom: 72 }}>
        <h2 className="h">Deployment flywheel</h2>
        <Flywheel />
        <div style={{ marginTop: 48 }}>
          <p className="p" style={{ margin: "0 0 8px" }}>– factories seed the loop</p>
          <p className="p" style={{ margin: "0 0 8px" }}>– data as a byproduct of real work</p>
          <p className="p" style={{ margin: 0 }}>– the advantage compounds with every robot</p>
        </div>
      </section>

      <section className="colc" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <div className="txt">
          <p className="k">Data.</p>
          <p className="p" style={{ marginBottom: 36 }}>Robots have far less training data than language models. Ken Goldberg puts the gap at roughly 100,000 years. The most relevant source is deployment itself. Every run on a real task produces observations, actions and outcomes. When logging is built into the robot's normal work, this data arrives as a byproduct, and it reflects the exact objects, lighting and layouts the robot will meet again.</p>
          <p className="k">Evals.</p>
          <p className="p" style={{ marginBottom: 36 }}>Before a model is trusted with a robot, it has to be measured on the real task in the real environment. An eval runs a model on a defined task and records whether it succeeded, and how it failed. Demos hide this. Vision-language-action models that succeed 80–90% of the time on tasks they have seen can fall to 30–60% on tasks they haven't (SAFE, 2025), and a model that leads on average can still lose on a specific skill, such as precision placement. Good evals are per task, per environment, and continuous, because a factory keeps changing.</p>
          <p className="k">Routing.</p>
          <p className="p" style={{ marginBottom: 36 }}>No single model wins every task, so instead of committing to one, a router chooses the model for each moment, based on the task, the robot and the conditions, and switches before a failure. Routing between VLAs has been shown to lift task success by 13.5 points over a single global model (RouterVLA). It also keeps the system open: a new model joins the pool and is used wherever it wins.</p>
          <p className="k">Post-training.</p>
          <p className="p" style={{ margin: 0 }}>Evals and logged runs flow back into the models. Post-training adapts a model to its environment using its own deployment data. Physical Intelligence reported about twice the throughput and roughly half the failures with this approach. The same runs also teach the router which model succeeds where. Then the loop starts again, deploy, route, eval, post-train, and each cycle compounds.</p>
        </div>
      </section>

      <section className="colc" style={{ paddingTop: 64, paddingBottom: 56 }}>
        <div className="txt">
          <h2 className="h">How we work</h2>
          <p className="k">Measurement.</p>
          <p className="p" style={{ marginBottom: 20 }}>Robots should be judged on deployments, not demos. We start by measuring how models behave on real tasks, one task at a time. Averages hide what matters: a model that leads overall can still lose on precision placement.</p>
          <Row text="SO-101 VLA benchmark" href="https://arxiv.org/abs/2606.08881" />
          <Row text="SAFE: unseen-task failures" href="https://arxiv.org/abs/2506.09937" last />
          <p className="k">Routing.</p>
          <p className="p" style={{ marginBottom: 20 }}>Measurement only matters if it changes what the robot does. We predict which model fits the moment and switch before a failure happens. Routing between VLAs has been shown to lift task success by 13.5 points over a single global model.</p>
          <Row text="RouterVLA" href="https://arxiv.org/abs/2606.27355" last />
          <p className="k">Deployment.</p>
          <p className="p" style={{ margin: 0 }}>Real work is the best teacher. The gap between the data behind language models and the largest robot dataset is estimated at 100,000 years. Every deployment logs runs that become evaluation and training data, which produce better models and smarter routing. The advantage compounds with each robot we serve.</p>
        </div>
      </section>

      <section className="colc" style={{ paddingTop: 64, paddingBottom: 40 }}>
        <div className="txt">
          <h2 className="h">Why Zelantrix</h2>
          <p className="p">Robot models are arriving faster than anyone can evaluate them. Each is strong somewhere and brittle somewhere else, and the person responsible for a production line cannot afford to guess which is which.</p>
          <p className="p">Most routing work today targets language models. Most robot data sits in storage, or inside a single company's own model. The missing piece is an intelligence layer built on real deployment data, one that works with whatever models the field produces next.</p>
          <p className="p">That is the layer we are building: grounded in measurement, tested in the factory, and improved by every robot it serves.</p>
          <p className="p">Read the <Link to="/research" className="inl">research</Link> behind it, or <Link to="/contact" className="inl">get in touch</Link>.</p>
        </div>
      </section>

      <section className="colc" style={{ paddingTop: 64, paddingBottom: 72 }}>
        <div className="txt">
          <h2 className="h">Supporters</h2>
          <p className="p" style={{ margin: "0 0 32px" }}>we are grateful for the people and companies backing our work.</p>
          <div className="sup">
            <div className="lbl">Backed by</div>
            <div className="v">The Residency</div>
            <div className="v">Right Side Capital</div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
