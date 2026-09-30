import { ArrowUpRight, Droplets } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand-block">
            <Link className="brand footer-brand" href="/">
              <span className="brand-mark"><Droplets size={21} strokeWidth={2.2} aria-hidden="true" /></span>
              <span>Infra<span className="brand-green">Green</span></span>
            </Link>
            <p>New Orleans, Louisiana</p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/post-project">Property Owners</Link>
            <Link href="/professionals/join">Professionals</Link>
            <Link href="/solutions">Solutions</Link>
            <Link href="/about">About</Link>
            <Link href="/about#privacy">Privacy</Link>
            <Link href="/about#terms">Terms</Link>
            <Link href="/about#contact">Contact <ArrowUpRight size={13} aria-hidden="true" /></Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>InfraGreen is a marketplace connecting property owners with independent professionals. Availability and suitability of services depend on property conditions and provider assessment.</p>
          <span>© {new Date().getFullYear()} InfraGreen</span>
        </div>
      </div>
    </footer>
  );
}