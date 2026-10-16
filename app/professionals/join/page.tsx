import { ProfessionalForm } from "@/components/ProfessionalForm";

export const metadata = { title: "Join the provider network" };

export default function JoinProfessionalsPage() {
  return (
    <div className="form-page">
      <div className="container form-layout">
        <aside className="form-aside">
          <span className="eyebrow">Local professionals / Louisiana</span>
          <h1>Built around local expertise.</h1>
          <p>InfraGreen connects property owners with independent professionals who provide stormwater and green-infrastructure services.</p>
          <div className="form-aside-note"><span className="note-rule" /> New Orleans metro area</div>
        </aside>
        <ProfessionalForm />
      </div>
    </div>
  );
}