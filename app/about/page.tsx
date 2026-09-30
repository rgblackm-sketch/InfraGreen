import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="content-page">
      <section className="page-intro"><div className="container"><span className="eyebrow">About InfraGreen</span><h1>Better connections<br />for a water-wise city.</h1><p>Stormwater challenges are local. Finding a qualified professional to help address them should feel more straightforward.</p></div></section>
      <section className="about-story"><div className="container about-grid"><div><span className="eyebrow">Our purpose</span><h2>A clearer starting point for property owners and professionals.</h2></div><div><p>InfraGreen is building a marketplace that connects property owners experiencing stormwater and drainage problems with independent local professionals who provide green-infrastructure services.</p><p>We help property owners describe what they’re seeing and explore relevant services. Professionals evaluate each site and determine which approaches may be appropriate for its conditions.</p><div className="location-line"><MapPin size={17} aria-hidden="true" /><span>Starting in the New Orleans metro area</span></div></div></div></section>
      <section className="about-next"><div className="container about-next-inner"><h2>Start with your property.<br />Build from there.</h2><Link className="button button-primary" href="/post-project">Find a Solution <ArrowRight size={17} aria-hidden="true" /></Link></div></section>
      <div className="container legal-notes"><section id="privacy"><h2>Privacy</h2><p>InfraGreen is an early-stage prototype. Forms on this site do not currently store or transmit personal information.</p></section><section id="terms"><h2>Terms</h2><p>Service availability and suitability depend on site conditions and independent professional assessment.</p></section><section id="contact"><h2>Contact</h2><p>Contact details will be available soon.</p></section></div>
    </div>
  );
}