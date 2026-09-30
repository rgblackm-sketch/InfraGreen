import { ArrowUpRight, Droplets, Menu } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link className="brand" href="/" aria-label="InfraGreen home">
          <span className="brand-mark"><Droplets size={21} strokeWidth={2.2} aria-hidden="true" /></span>
          <span>Infra<span className="brand-green">Green</span></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/solutions">Solutions</Link>
          <Link href="/professionals/join">For Professionals</Link>
          <Link href="/about">About</Link>
        </nav>
        <div className="nav-actions">
          <button className="login-link" type="button" disabled aria-label="Log in, coming soon">Log In</button>
          <Link className="button button-small button-primary" href="/post-project">Find a Solution <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
        <details className="mobile-menu">
          <summary aria-label="Open navigation menu"><Menu size={22} aria-hidden="true" /></summary>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <Link href="/#how-it-works">How It Works</Link>
            <Link href="/solutions">Solutions</Link>
            <Link href="/professionals/join">For Professionals</Link>
            <Link href="/about">About</Link>
            <span className="mobile-login" aria-disabled="true">Log In · coming soon</span>
            <Link href="/post-project">Find a Solution</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}