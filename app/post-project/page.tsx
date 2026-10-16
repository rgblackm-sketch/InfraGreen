import { ProjectForm } from "@/components/ProjectForm";

export const metadata = { title: "Describe your project" };

export default function PostProjectPage() {
  return (
    <div className="form-page">
      <div className="container form-layout">
        <aside className="form-aside">
          <span className="eyebrow">Property owners / Start here</span>
          <h1>Tell us what’s happening.</h1>
          <p>Take it one step at a time. Start with the stormwater problem and share only what you know so far.</p>
          <div className="form-aside-note"><span className="note-rule" /> New Orleans metro area</div>
        </aside>
        <ProjectForm />
      </div>
    </div>
  );
}