import { ArrowRight, MoveUpRight } from "lucide-react";
import Link from "next/link";

export function ProfessionalCTA() {
  return (
    <section className="professional-section" id="professionals">
      <div className="container professional-inner">
        <div className="professional-mark" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="professional-copy">
          <span className="eyebrow">For local professionals</span>
          <h2>Grow your green infrastructure business.</h2>
          <p>Join InfraGreen to connect with property owners actively looking for stormwater and green-infrastructure services.</p>
        </div>
        <Link className="button button-light" href="/professionals/join">Join as a Professional <ArrowRight size={17} aria-hidden="true" /></Link>
        <MoveUpRight className="professional-arrow" size={22} aria-hidden="true" />
      </div>
    </section>
  );
}