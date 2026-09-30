import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HowItWorks } from "@/components/HowItWorks";
import { Hero } from "@/components/Hero";
import { ProblemSection } from "@/components/ProblemSection";
import { ProfessionalCTA } from "@/components/ProfessionalCTA";
import { Solutions } from "@/components/Solutions";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <Solutions />
      <HowItWorks />
      <ProfessionalCTA />
      <section className="closing-cta" aria-labelledby="closing-title">
        <div className="container closing-inner">
          <div>
            <span className="eyebrow">A better place to start</span>
            <h2 id="closing-title">Tell us what water is doing on your property.</h2>
          </div>
          <Link className="button button-primary" href="/post-project">
            Find a solution <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}