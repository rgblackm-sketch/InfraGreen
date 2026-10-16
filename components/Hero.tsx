import { ArrowDownRight, ArrowRight, MoveUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import stCharlesOaks from "@/public/images/st-charles-oaks.jpg";

export function Hero() {
  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> New Orleans metro area</span>
          <h1>Smarter solutions<br />for <span>stormwater.</span></h1>
          <p className="hero-subtitle">InfraGreen connects property owners with qualified local professionals who can help assess and address stormwater problems.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/post-project">Find a Solution <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link className="button button-quiet" href="/professionals/join">Join as a Professional <MoveUpRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="hero-note"><span className="note-rule" /> Start with what you see. We’ll help with what comes next.</div>
        </div>
        <figure className="hero-media">
        <div className="hero-visual">
          <Image
            className="hero-image"
            src={stCharlesOaks}
            alt="Live oak trees arching over the streetcar tracks on St. Charles Avenue in New Orleans"
            placeholder="blur"
            sizes="(max-width: 740px) 100vw, 55vw"
            priority
          />
          <div className="visual-label visual-label-top"><span className="label-mark"><ArrowDownRight size={16} aria-hidden="true" /></span><span>Water, working<br />with the landscape</span></div>
          <div className="visual-caption"><span className="caption-kicker">INFRASTRUCTURE, IN A NEW LIGHT</span><span>Thoughtful systems. Healthier places.</span></div>
          <div className="visual-index"><span>01</span><span className="index-line" /><span>03</span></div>
        </div>
        <figcaption className="hero-credit">
          Photo: <a href="https://commons.wikimedia.org/wiki/File:St._Charles_Ave,_New_Orleans,_LA.jpg" rel="noopener noreferrer" target="_blank">&ldquo;St. Charles Ave, New Orleans, LA&rdquo;</a> by TexasExplorer98, licensed under{" "}
          <a href="https://creativecommons.org/licenses/by/2.0/" rel="noopener noreferrer license" target="_blank">CC BY 2.0</a>. Resized.
        </figcaption>
        </figure>
      </div>
    </section>
  );
}