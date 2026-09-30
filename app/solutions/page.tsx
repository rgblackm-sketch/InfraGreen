import { ArrowRight, CloudRain, GitBranch, Grid2X2, TreePine } from "lucide-react";
import Link from "next/link";

const solutions = [
  { title: "Rain Gardens", text: "Planted areas designed to capture and manage localized stormwater runoff.", icon: CloudRain, number: "01" },
  { title: "Bioswales", text: "Landscaped channels designed to slow, filter, and direct stormwater runoff.", icon: GitBranch, number: "02" },
  { title: "Permeable Pavement", text: "Surfaces designed to allow stormwater to move through into an underlying drainage or storage system.", icon: Grid2X2, number: "03" },
  { title: "Stormwater Tree Trenches", text: "Tree systems that combine vegetation with engineered stormwater storage and management.", icon: TreePine, number: "04" },
];

export default function SolutionsPage() {
  return (
    <div className="content-page">
      <section className="page-intro"><div className="container"><span className="eyebrow">Green infrastructure / 01</span><h1>Solutions start<br />with the site.</h1><p>Green infrastructure can help manage stormwater by working with natural processes. The right approach depends on the property and its conditions.</p></div></section>
      <section className="section solutions-detail"><div className="container"><div className="detail-list">{solutions.map(({ title, text, icon: Icon, number }) => <article className="detail-row" key={number}><span className="detail-number">{number}</span><span className="detail-icon"><Icon size={25} strokeWidth={1.5} aria-hidden="true" /></span><div><h2>{title}</h2><p>{text}</p></div></article>)}</div><div className="assessment-note"><span className="eyebrow">A note on site fit</span><p>Appropriate solutions depend on property conditions and professional assessment. No single approach is right for every site.</p></div><Link className="button button-primary" href="/post-project">Describe your property <ArrowRight size={17} aria-hidden="true" /></Link></div></section>
    </div>
  );
}