import { ArrowUpRight, CloudRain, GitBranch, Grid2X2, TreePine } from "lucide-react";
import Link from "next/link";

const solutions = [
  { title: "Rain gardens", description: "Planted areas designed to capture and manage localized stormwater runoff.", icon: CloudRain, code: "RG / 01" },
  { title: "Bioswales", description: "Landscaped channels designed to slow, filter, and direct stormwater runoff.", icon: GitBranch, code: "BS / 02" },
  { title: "Permeable pavement", description: "Surfaces designed to let stormwater move through into an underlying drainage or storage system.", icon: Grid2X2, code: "PP / 03" },
  { title: "Stormwater tree trenches", description: "Tree systems that combine vegetation with engineered stormwater storage and management.", icon: TreePine, code: "TT / 04" },
];

export function Solutions() {
  return (
    <section className="section solutions-section" id="solutions">
      <div className="container">
        <div className="section-heading solutions-heading">
          <div>
            <span className="eyebrow">Designed around the site</span>
            <h2>Green infrastructure<br />solutions.</h2>
          </div>
          <Link className="text-link" href="/solutions">Explore solutions <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="solutions-grid">
          {solutions.map(({ title, description, icon: Icon, code }) => (
            <article className="solution-card" key={title}>
              <div className="solution-card-top"><span>{code}</span><Icon size={22} strokeWidth={1.6} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="solution-line" />
            </article>
          ))}
        </div>
        <p className="solutions-caveat">Appropriate solutions depend on property conditions and professional assessment.</p>
      </div>
    </section>
  );
}