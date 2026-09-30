const steps = [
  { number: "01", title: "Describe your property", text: "Tell us what's happening and upload photos." },
  { number: "02", title: "Connect with professionals", text: "InfraGreen helps connect you with professionals who provide relevant stormwater services." },
  { number: "03", title: "Compare your options", text: "Review professionals and proposed approaches." },
  { number: "04", title: "Move forward", text: "Select the professional and solution that works for your property." },
];

export function HowItWorks() {
  return (
    <section className="section how-section" id="how-it-works">
      <div className="container">
        <div className="how-intro">
          <div><span className="eyebrow">A clear path forward</span><h2>From water problem<br />to next steps.</h2></div>
          <p>No need to have all the answers before you begin. Start with the conditions on your property.</p>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step" key={step.number}>
              <span className="step-number">{step.number}</span>
              <span className="step-rule" />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}