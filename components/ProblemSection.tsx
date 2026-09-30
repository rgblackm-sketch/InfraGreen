import { ArrowUpRight, Droplets, House, MoveDownRight, Waves, CircleHelp, Route } from "lucide-react";
import Link from "next/link";

const problems = [
  { label: "Standing water", detail: "Puddles that linger after rain", icon: Droplets },
  { label: "Yard flooding", detail: "Water collecting across your yard", icon: Waves },
  { label: "Excessive runoff", detail: "Water moving where it shouldn't", icon: MoveDownRight },
  { label: "Water near buildings", detail: "Pooling close to a structure", icon: House },
  { label: "Pavement runoff", detail: "Water shedding from hard surfaces", icon: Route },
  { label: "Not sure?", detail: "Start with a site assessment", icon: CircleHelp },
];

export function ProblemSection() {
  return (
    <section className="section problem-section" id="problems">
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow">First, what are you seeing?</span>
            <h2>Start with the problem,<br className="desktop-break" /> not the solution.</h2>
          </div>
          <p>You don&apos;t need to know whether your property needs a rain garden, bioswale, permeable pavement, or something else. Tell us what&apos;s happening and connect with professionals who can evaluate your property.</p>
        </div>
        <div className="problem-grid">
          {problems.map(({ label, detail, icon: Icon }, index) => (
            <Link className="problem-item" href="/post-project" key={label}>
              <span className="problem-number">0{index + 1}</span>
              <span className="problem-icon"><Icon size={20} strokeWidth={1.7} aria-hidden="true" /></span>
              <span className="problem-label">{label}</span>
              <span className="problem-detail">{detail}</span>
              <ArrowUpRight className="problem-arrow" size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}