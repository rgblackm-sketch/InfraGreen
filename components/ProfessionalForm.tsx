"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Droplets,
  Fence,
  Leaf,
  MoveUpRight,
  Trees,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  type ProfessionalApplication,
  type ProfessionalApplicationReceipt,
} from "@/lib/professional-application";
import { createSubmissionReference } from "@/lib/submission-reference";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const stepLabels = ["Business", "Services", "Experience", "Coverage", "Review"];

const businessTypes = [
  "Landscaping Company",
  "Drainage / Stormwater Contractor",
  "General Contractor",
  "Landscape Designer / Landscape Architect",
  "Paving / Hardscape Contractor",
  "Environmental / Green Infrastructure Professional",
  "Independent Professional",
  "Other",
];

const yearsOptions = ["Less than 1 year", "1–2 years", "3–5 years", "6–10 years", "10+ years"];

const services = [
  {
    name: "Rain Gardens",
    description: "Installation and maintenance of planted areas designed to capture and manage stormwater runoff.",
    icon: Droplets,
  },
  {
    name: "Bioswales",
    description: "Design, installation, or maintenance of landscaped channels used to slow, filter, and direct runoff.",
    icon: Leaf,
  },
  {
    name: "Permeable Pavement",
    description: "Installation or maintenance of permeable paving systems for driveways, walkways, patios, parking areas, or similar surfaces.",
    icon: Fence,
  },
  {
    name: "Stormwater Tree Trenches",
    description: "Design, installation, or maintenance of tree-based systems incorporating stormwater storage and management.",
    icon: Trees,
  },
];

const serviceAreas = [
  "New Orleans",
  "Jefferson Parish",
  "St. Bernard Parish",
  "St. Tammany Parish",
  "Plaquemines Parish",
  "Other Louisiana Area",
];

const propertyTypes = [
  "Residential",
  "Commercial",
  "Rental / Multifamily",
  "Schools / Churches / Community Properties",
  "Municipal / Public",
  "Other",
];

const projectSizes = [
  "Under $1,000",
  "$1,000–$2,500",
  "$2,500–$5,000",
  "$5,000–$10,000",
  "$10,000–$25,000",
  "$25,000+",
  "Varies by project",
];

const insuranceOptions = [
  "Currently insured",
  "Not currently insured",
  "In process",
  "Prefer to discuss with InfraGreen",
];

const availabilityOptions = ["Yes", "Limited availability", "Not currently"];

type ApplicationErrors = Record<string, string>;
type SelectionField = "services" | "serviceAreas" | "propertyTypes" | "projectSizes";

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validateStep(step: number, application: ProfessionalApplication): ApplicationErrors {
  const errors: ApplicationErrors = {};

  if (step === 0) {
    if (!application.businessName.trim()) errors.businessName = "Enter your business name.";
    if (!application.contactFirstName.trim()) errors.contactFirstName = "Enter the contact's first name.";
    if (!application.contactLastName.trim()) errors.contactLastName = "Enter the contact's last name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.email.trim())) {
      errors.email = "Enter a valid business email address.";
    }
    if (!application.phone.trim()) errors.phone = "Enter a phone number where your business can be reached.";
    if (!application.businessType) errors.businessType = "Select a business type.";
    if (!application.yearsInBusiness) errors.yearsInBusiness = "Select how long you have been in business.";
    if (!application.businessDescription.trim()) errors.businessDescription = "Tell us about your business and the work you perform.";
    if (application.website && !isValidUrl(application.website)) {
      errors.website = "Enter a website address starting with http:// or https://.";
    }
  }

  if (step === 1 && application.services.length === 0) {
    errors.services = "Choose at least one service your business currently provides.";
  }

  if (step === 2) {
    if (application.businessType.includes("Contractor") && !application.licenses.trim()) {
      errors.licenses = "Enter at least one relevant license or registration.";
    }
    if (application.portfolioUrls.some((url) => url.trim() && !isValidUrl(url))) {
      errors.portfolioUrls = "Enter portfolio links as complete URLs starting with http:// or https://.";
    }
  }

  if (step === 3) {
    if (application.serviceAreas.length === 0) errors.serviceAreas = "Choose at least one service area.";
    if (application.propertyTypes.length === 0) errors.propertyTypes = "Choose at least one property type.";
    if (!application.availability) errors.availability = "Select your current project availability.";
  }

  if (step === 4) {
    if (!application.acknowledgements.informationAccurate) {
      errors.informationAccurate = "Confirm that your application information is accurate.";
    }
    if (!application.acknowledgements.networkAcceptance) {
      errors.networkAcceptance = "Confirm that submission does not guarantee network acceptance.";
    }
    if (!application.acknowledgements.additionalInfoRequest) {
      errors.additionalInfoRequest = "Confirm that InfraGreen may request additional information.";
    }
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <span className="field-error" id={id} role="alert">{message}</span>;
}

function ReviewSection({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="review-section">
      <div className="review-section-heading">
        <h3>{title}</h3>
        <button className="review-edit" onClick={() => onEdit(step)} type="button">
          Edit <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
      {children}
    </section>
  );
}

function ReviewValue({ label, value }: { label: string; value: string | string[] }) {
  const displayValue = Array.isArray(value)
    ? value.filter(Boolean).join(" · ")
    : value.trim();

  return (
    <div className="review-value">
      <dt>{label}</dt>
      <dd>{displayValue || "Not provided"}</dd>
    </div>
  );
}

export function ProfessionalForm() {
  const [started, setStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [receipt, setReceipt] = useState<ProfessionalApplicationReceipt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const didMountRef = useRef(false);
  const submissionInProgressRef = useRef(false);
  const [application, setApplication] = useState<ProfessionalApplication>({
    businessName: "",
    contactFirstName: "",
    contactLastName: "",
    email: "",
    phone: "",
    website: "",
    businessType: "",
    yearsInBusiness: "",
    businessDescription: "",
    services: [],
    otherServices: "",
    licenses: "",
    certifications: "",
    insuranceStatus: "",
    portfolioUrls: ["", ""],
    projectExperience: "",
    professionalReferences: "",
    serviceAreas: [],
    zipCodes: "",
    propertyTypes: [],
    projectSizes: [],
    availability: "",
    additionalInformation: "",
    acknowledgements: {
      informationAccurate: false,
      networkAcceptance: false,
      additionalInfoRequest: false,
    },
    applicationStatus: "pending",
  });

  useEffect(() => {
    if (didMountRef.current) headingRef.current?.focus();
    else didMountRef.current = true;
  }, [activeStep, started]);

  function clearError(key: string) {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function updateApplication<Key extends keyof ProfessionalApplication>(
    key: Key,
    value: ProfessionalApplication[Key],
  ) {
    setApplication((current) => ({ ...current, [key]: value }));
    clearError(key as string);
  }

  function toggleSelection(key: SelectionField, value: string) {
    setApplication((current) => {
      const selected = current[key];
      return {
        ...current,
        [key]: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      };
    });
    clearError(key);
  }

  function updateAcknowledgement(key: keyof ProfessionalApplication["acknowledgements"], value: boolean) {
    setApplication((current) => ({
      ...current,
      acknowledgements: { ...current.acknowledgements, [key]: value },
    }));
    clearError(key);
  }

  function updatePortfolio(index: number, value: string) {
    setApplication((current) => ({
      ...current,
      portfolioUrls: current.portfolioUrls.map((url, itemIndex) => itemIndex === index ? value : url),
    }));
    clearError("portfolioUrls");
  }

  function continueToNextStep() {
    const nextErrors = validateStep(activeStep, application);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setActiveStep((current) => Math.min(current + 1, stepLabels.length - 1));
  }

  function goBack() {
    setErrors({});
    setActiveStep((current) => Math.max(current - 1, 0));
  }

  function editStep(step: number) {
    setErrors({});
    setActiveStep(step);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeStep < stepLabels.length - 1) {
      continueToNextStep();
      return;
    }

    const allErrors: ApplicationErrors = {};
    let firstInvalidStep = -1;
    stepLabels.forEach((_, step) => {
      const stepErrors = validateStep(step, application);
      if (Object.keys(stepErrors).length > 0 && firstInvalidStep === -1) firstInvalidStep = step;
      Object.assign(allErrors, stepErrors);
    });
    setErrors(allErrors);

    if (firstInvalidStep !== -1) {
      setActiveStep(firstInvalidStep);
      return;
    }

    if (submissionInProgressRef.current) return;
    submissionInProgressRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    const referenceNumber = createSubmissionReference("IG-PRO");

    try {
      const { error } = await getSupabaseBrowserClient().from("professional_applications").insert({
        business_name: application.businessName,
        contact_first_name: application.contactFirstName,
        contact_last_name: application.contactLastName,
        email: application.email,
        phone: application.phone,
        website: application.website,
        business_type: application.businessType,
        years_in_business: application.yearsInBusiness,
        business_description: application.businessDescription,
        services: application.services,
        other_services: application.otherServices,
        licenses: application.licenses,
        certifications: application.certifications,
        insurance_status: application.insuranceStatus,
        portfolio_urls: application.portfolioUrls.filter((url) => url.trim()),
        project_experience: application.projectExperience,
        professional_references: application.professionalReferences,
        service_areas: application.serviceAreas,
        zip_codes: application.zipCodes,
        property_types: application.propertyTypes,
        project_sizes: application.projectSizes,
        availability: application.availability,
        additional_information: application.additionalInformation,
        acknowledgements: application.acknowledgements,
        application_status: "pending",
      });

      if (error) throw error;
      setReceipt({ referenceNumber });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to submit professional application to Supabase:", error);
      }
      setSubmitError("We couldn't submit your application right now. Your information is still here. Please try again.");
    } finally {
      submissionInProgressRef.current = false;
      setIsSubmitting(false);
    }
  }

  if (receipt) {
    return (
      <section className="confirmation professional-success" aria-live="polite">
        <span className="confirmation-icon"><Check size={25} aria-hidden="true" /></span>
        <span className="eyebrow">Professional application</span>
        <h2>Application received.</h2>
        <p>Thanks for your interest in joining InfraGreen. We&apos;ll review your information before adding your business to the professional network.</p>
        <div className="project-reference"><span>Application reference</span><strong>{receipt.referenceNumber}</strong></div>
        <p className="confirmation-note">Applications are reviewed manually; submission does not mean your business is approved or verified.</p>
        <div className="success-actions">
          <Link className="button button-primary" href="/">Return Home <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link className="button button-quiet" href="/about">Explore InfraGreen <MoveUpRight size={15} aria-hidden="true" /></Link>
        </div>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="form-panel professional-intro-panel" aria-labelledby="professional-intro-heading">
        <span className="eyebrow">InfraGreen / Professional network</span>
        <h2 id="professional-intro-heading" ref={headingRef} tabIndex={-1}>Grow your green infrastructure business.</h2>
        <p>Join InfraGreen&apos;s professional network and connect with property owners looking for stormwater and green-infrastructure services.</p>
        <p className="professional-intro-note">Submitting an application does not guarantee acceptance into the InfraGreen professional network.</p>
        <button className="button button-primary" onClick={() => setStarted(true)} type="button">
          Get Started <ArrowRight size={16} aria-hidden="true" />
        </button>
      </section>
    );
  }

  return (
    <form aria-busy={isSubmitting} className="form-panel professional-flow" noValidate onSubmit={handleSubmit}>
      <nav className="flow-progress" aria-label={`Step ${activeStep + 1} of ${stepLabels.length}: ${stepLabels[activeStep]}`}>
        <ol>
          {stepLabels.map((label, index) => (
            <li
              aria-current={activeStep === index ? "step" : undefined}
              className={`flow-progress-step${activeStep === index ? " is-current" : ""}${activeStep > index ? " is-complete" : ""}`}
              key={label}
            >
              <span className="flow-progress-number">{activeStep > index ? <Check size={13} aria-hidden="true" /> : index + 1}</span>
              <span className="flow-progress-label">{label}</span>
            </li>
          ))}
        </ol>
      </nav>

      {activeStep === 0 && (
        <section aria-labelledby="professional-step-heading" className="flow-step-content">
          <header className="flow-step-heading">
            <span className="eyebrow">Step 01 / Business</span>
            <h2 id="professional-step-heading" ref={headingRef} tabIndex={-1}>Tell us about your business.</h2>
            <p>Share your business and contact details so InfraGreen can review your application.</p>
          </header>
          <div className="form-grid">
            <label className="field field-full">
              <span>Business name <b>*</b></span>
              <input aria-describedby={errors.businessName ? "businessName-error" : undefined} aria-invalid={Boolean(errors.businessName)} autoComplete="organization" name="businessName" onChange={(event) => updateApplication("businessName", event.target.value)} value={application.businessName} />
              <FieldError id="businessName-error" message={errors.businessName} />
            </label>
            <label className="field">
              <span>Contact first name <b>*</b></span>
              <input aria-describedby={errors.contactFirstName ? "contactFirstName-error" : undefined} aria-invalid={Boolean(errors.contactFirstName)} autoComplete="given-name" name="contactFirstName" onChange={(event) => updateApplication("contactFirstName", event.target.value)} value={application.contactFirstName} />
              <FieldError id="contactFirstName-error" message={errors.contactFirstName} />
            </label>
            <label className="field">
              <span>Contact last name <b>*</b></span>
              <input aria-describedby={errors.contactLastName ? "contactLastName-error" : undefined} aria-invalid={Boolean(errors.contactLastName)} autoComplete="family-name" name="contactLastName" onChange={(event) => updateApplication("contactLastName", event.target.value)} value={application.contactLastName} />
              <FieldError id="contactLastName-error" message={errors.contactLastName} />
            </label>
            <label className="field">
              <span>Business email <b>*</b></span>
              <input aria-describedby={errors.email ? "email-error" : undefined} aria-invalid={Boolean(errors.email)} autoComplete="email" name="email" onChange={(event) => updateApplication("email", event.target.value)} type="email" value={application.email} />
              <FieldError id="email-error" message={errors.email} />
            </label>
            <label className="field">
              <span>Phone number <b>*</b></span>
              <input aria-describedby={errors.phone ? "phone-error" : undefined} aria-invalid={Boolean(errors.phone)} autoComplete="tel" name="phone" onChange={(event) => updateApplication("phone", event.target.value)} type="tel" value={application.phone} />
              <FieldError id="phone-error" message={errors.phone} />
            </label>
            <label className="field field-full">
              <span>Website <em>Optional</em></span>
              <input aria-describedby={errors.website ? "website-error" : undefined} aria-invalid={Boolean(errors.website)} autoComplete="url" name="website" onChange={(event) => updateApplication("website", event.target.value)} placeholder="https://" type="url" value={application.website} />
              <FieldError id="website-error" message={errors.website} />
            </label>
            <label className="field field-full">
              <span>Business type <b>*</b></span>
              <select aria-describedby={errors.businessType ? "businessType-error" : undefined} aria-invalid={Boolean(errors.businessType)} name="businessType" onChange={(event) => updateApplication("businessType", event.target.value)} value={application.businessType}>
                <option value="">Select a business type</option>
                {businessTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              <FieldError id="businessType-error" message={errors.businessType} />
            </label>
            <label className="field field-full">
              <span>Years in business <b>*</b></span>
              <select aria-describedby={errors.yearsInBusiness ? "yearsInBusiness-error" : undefined} aria-invalid={Boolean(errors.yearsInBusiness)} name="yearsInBusiness" onChange={(event) => updateApplication("yearsInBusiness", event.target.value)} value={application.yearsInBusiness}>
                <option value="">Select years in business</option>
                {yearsOptions.map((years) => <option key={years} value={years}>{years}</option>)}
              </select>
              <FieldError id="yearsInBusiness-error" message={errors.yearsInBusiness} />
            </label>
            <label className="field field-full">
              <span>Business description <b>*</b></span>
              <textarea aria-describedby={errors.businessDescription ? "businessDescription-error" : undefined} aria-invalid={Boolean(errors.businessDescription)} name="businessDescription" onChange={(event) => updateApplication("businessDescription", event.target.value)} placeholder="Tell property owners about your company, experience, and the type of work you perform." rows={4} value={application.businessDescription} />
              <FieldError id="businessDescription-error" message={errors.businessDescription} />
            </label>
          </div>
        </section>
      )}

      {activeStep === 1 && (
        <section aria-labelledby="professional-step-heading" className="flow-step-content">
          <header className="flow-step-heading">
            <span className="eyebrow">Step 02 / Services</span>
            <h2 id="professional-step-heading" ref={headingRef} tabIndex={-1}>What services do you provide?</h2>
            <p>Select every service your business currently provides.</p>
          </header>
          <fieldset aria-describedby={errors.services ? "services-error" : undefined} className="professional-service-fieldset">
            <legend className="field-legend">InfraGreen service categories <b>*</b></legend>
            <div className="professional-service-grid">
              {services.map(({ name, description, icon: Icon }) => {
                const selected = application.services.includes(name);
                return (
                  <button
                    aria-pressed={selected}
                    className={`professional-service-card${selected ? " is-selected" : ""}`}
                    key={name}
                    onClick={() => toggleSelection("services", name)}
                    type="button"
                  >
                    <Icon className="professional-service-icon" size={21} strokeWidth={1.7} aria-hidden="true" />
                    <span className="professional-service-copy"><strong>{name}</strong><span>{description}</span></span>
                    <span className="professional-service-check"><Check size={13} aria-hidden="true" /></span>
                  </button>
                );
              })}
            </div>
            <FieldError id="services-error" message={errors.services} />
          </fieldset>
          <label className="field professional-other-services">
            <span>Other stormwater / green infrastructure services <em>Optional</em></span>
            <textarea name="otherServices" onChange={(event) => updateApplication("otherServices", event.target.value)} placeholder="Tell us about other relevant services your business provides." rows={3} value={application.otherServices} />
          </label>
        </section>
      )}

      {activeStep === 2 && (
        <section aria-labelledby="professional-step-heading" className="flow-step-content">
          <header className="flow-step-heading">
            <span className="eyebrow">Step 03 / Experience</span>
            <h2 id="professional-step-heading" ref={headingRef} tabIndex={-1}>Tell us about your experience.</h2>
            <p>Share relevant credentials, insurance status, and examples of your work.</p>
          </header>
          <div className="form-grid">
            <label className="field field-full">
              <span>Relevant licenses or registrations {application.businessType.includes("Contractor") ? <b>*</b> : <em>Optional</em>}</span>
              <span className="field-helper">{application.businessType.includes("Contractor") ? "List at least one relevant contractor license or registration." : "List contractor or professional licenses, registrations, or other relevant credentials. Leave blank if not applicable."}</span>
              <textarea aria-describedby={errors.licenses ? "licenses-error" : undefined} aria-invalid={Boolean(errors.licenses)} name="licenses" onChange={(event) => updateApplication("licenses", event.target.value)} rows={3} value={application.licenses} />
              <FieldError id="licenses-error" message={errors.licenses} />
            </label>
            <label className="field field-full">
              <span>Certifications <em>Optional</em></span>
              <textarea name="certifications" onChange={(event) => updateApplication("certifications", event.target.value)} placeholder="List relevant certifications, if applicable." rows={2} value={application.certifications} />
            </label>
            <label className="field field-full">
              <span>Insurance status <em>Optional</em></span>
              <select name="insuranceStatus" onChange={(event) => updateApplication("insuranceStatus", event.target.value)} value={application.insuranceStatus}>
                <option value="">Select an insurance status</option>
                {insuranceOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <span className="field-helper">Selecting “Currently insured” does not mean InfraGreen has verified your insurance.</span>
            </label>
            <div className="field field-full portfolio-fields">
              <span className="field-title">Do you have previous work you can share? <em>Optional</em></span>
              <label className="field">
                <span>Portfolio / website URL</span>
                <input aria-describedby={errors.portfolioUrls ? "portfolioUrls-error" : undefined} aria-invalid={Boolean(errors.portfolioUrls)} name="portfolioUrlPrimary" onChange={(event) => updatePortfolio(0, event.target.value)} placeholder="https://" type="url" value={application.portfolioUrls[0]} />
              </label>
              <label className="field">
                <span>Additional portfolio URL</span>
                <input aria-describedby={errors.portfolioUrls ? "portfolioUrls-error" : undefined} aria-invalid={Boolean(errors.portfolioUrls)} name="portfolioUrlAdditional" onChange={(event) => updatePortfolio(1, event.target.value)} placeholder="https://" type="url" value={application.portfolioUrls[1]} />
              </label>
              <FieldError id="portfolioUrls-error" message={errors.portfolioUrls} />
            </div>
            <label className="field field-full">
              <span>Recent project <em>Optional</em></span>
              <textarea name="projectExperience" onChange={(event) => updateApplication("projectExperience", event.target.value)} placeholder="Describe a recent stormwater, drainage, landscaping, paving, or green-infrastructure project your business completed." rows={4} value={application.projectExperience} />
            </label>
            <label className="field field-full">
              <span>Professional references <em>Optional</em></span>
              <textarea name="professionalReferences" onChange={(event) => updateApplication("professionalReferences", event.target.value)} placeholder="Share a reference name and contact details if available." rows={3} value={application.professionalReferences} />
            </label>
          </div>
        </section>
      )}

      {activeStep === 3 && (
        <section aria-labelledby="professional-step-heading" className="flow-step-content">
          <header className="flow-step-heading">
            <span className="eyebrow">Step 04 / Coverage</span>
            <h2 id="professional-step-heading" ref={headingRef} tabIndex={-1}>Where do you work?</h2>
            <p>Tell us which communities and project types your business serves.</p>
          </header>
          <SelectionGroup
            error={errors.serviceAreas}
            legend="Primary service area *"
            onToggle={(value) => toggleSelection("serviceAreas", value)}
            options={serviceAreas}
            selected={application.serviceAreas}
          />
          <label className="field professional-zip-field">
            <span>ZIP codes served <em>Optional</em></span>
            <input name="zipCodes" onChange={(event) => updateApplication("zipCodes", event.target.value)} placeholder="e.g. 70112, 70116, 70001" value={application.zipCodes} />
          </label>
          <SelectionGroup
            className="professional-coverage-group"
            error={errors.propertyTypes}
            legend="What types of properties do you work on? *"
            onToggle={(value) => toggleSelection("propertyTypes", value)}
            options={propertyTypes}
            selected={application.propertyTypes}
          />
          <SelectionGroup
            className="professional-coverage-group"
            legend="Typical project size"
            onToggle={(value) => toggleSelection("projectSizes", value)}
            options={projectSizes}
            selected={application.projectSizes}
          />
          <fieldset aria-describedby={errors.availability ? "availability-error" : undefined} className="professional-availability professional-coverage-group">
            <legend className="field-legend">Are you currently accepting new projects? <b>*</b></legend>
            <div className="professional-availability-options">
              {availabilityOptions.map((availability) => (
                <label className="professional-radio-option" key={availability}>
                  <input checked={application.availability === availability} name="availability" onChange={() => updateApplication("availability", availability)} type="radio" value={availability} />
                  <span>{availability}</span>
                </label>
              ))}
            </div>
            <FieldError id="availability-error" message={errors.availability} />
          </fieldset>
          <label className="field professional-coverage-group">
            <span>Anything else InfraGreen should know? <em>Optional</em></span>
            <textarea name="additionalInformation" onChange={(event) => updateApplication("additionalInformation", event.target.value)} rows={3} value={application.additionalInformation} />
          </label>
        </section>
      )}

      {activeStep === 4 && (
        <section aria-labelledby="professional-step-heading" className="flow-step-content">
          <header className="flow-step-heading">
            <span className="eyebrow">Step 05 / Review</span>
            <h2 id="professional-step-heading" ref={headingRef} tabIndex={-1}>Review your professional application.</h2>
            <p>Check your information and confirm the statements below before submitting.</p>
          </header>
          <div className="project-review professional-review">
            <ReviewSection onEdit={editStep} step={0} title="Business information">
              <dl>
                <ReviewValue label="Business name" value={application.businessName} />
                <ReviewValue label="Business type" value={application.businessType} />
                <ReviewValue label="Years in business" value={application.yearsInBusiness} />
                <ReviewValue label="Business description" value={application.businessDescription} />
                <ReviewValue label="Website" value={application.website} />
              </dl>
            </ReviewSection>
            <ReviewSection onEdit={editStep} step={0} title="Contact information">
              <dl>
                <ReviewValue label="Contact name" value={`${application.contactFirstName} ${application.contactLastName}`} />
                <ReviewValue label="Business email" value={application.email} />
                <ReviewValue label="Phone number" value={application.phone} />
              </dl>
            </ReviewSection>
            <ReviewSection onEdit={editStep} step={1} title="Services">
              <dl>
                <ReviewValue label="InfraGreen services" value={application.services} />
                <ReviewValue label="Other services" value={application.otherServices} />
              </dl>
            </ReviewSection>
            <ReviewSection onEdit={editStep} step={2} title="Experience and credentials">
              <dl>
                <ReviewValue label="Licenses / registrations" value={application.licenses} />
                <ReviewValue label="Certifications" value={application.certifications} />
                <ReviewValue label="Insurance status" value={application.insuranceStatus} />
                <ReviewValue label="Portfolio URLs" value={application.portfolioUrls} />
                <ReviewValue label="Recent project" value={application.projectExperience} />
                <ReviewValue label="Professional references" value={application.professionalReferences} />
              </dl>
            </ReviewSection>
            <ReviewSection onEdit={editStep} step={3} title="Service area and projects">
              <dl>
                <ReviewValue label="Service areas" value={application.serviceAreas} />
                <ReviewValue label="ZIP codes" value={application.zipCodes} />
                <ReviewValue label="Property types" value={application.propertyTypes} />
                <ReviewValue label="Typical project sizes" value={application.projectSizes} />
                <ReviewValue label="Availability" value={application.availability} />
                <ReviewValue label="Additional information" value={application.additionalInformation} />
              </dl>
            </ReviewSection>
          </div>

          <fieldset className="professional-acknowledgements">
            <legend className="field-legend">Before you submit <b>*</b></legend>
            <Acknowledgement
              checked={application.acknowledgements.informationAccurate}
              error={errors.informationAccurate}
              id="informationAccurate"
              label="I confirm that the information provided in this application is accurate to the best of my knowledge."
              onChange={(checked) => updateAcknowledgement("informationAccurate", checked)}
            />
            <Acknowledgement
              checked={application.acknowledgements.networkAcceptance}
              error={errors.networkAcceptance}
              id="networkAcceptance"
              label="I understand that submitting this application does not guarantee acceptance into the InfraGreen professional network."
              onChange={(checked) => updateAcknowledgement("networkAcceptance", checked)}
            />
            <Acknowledgement
              checked={application.acknowledgements.additionalInfoRequest}
              error={errors.additionalInfoRequest}
              id="additionalInfoRequest"
              label="I understand that InfraGreen may request additional information before approving a professional profile."
              onChange={(checked) => updateAcknowledgement("additionalInfoRequest", checked)}
            />
          </fieldset>
        </section>
      )}

      <div className="flow-actions">
        <button className="button button-quiet flow-back" disabled={activeStep === 0} onClick={goBack} type="button">
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </button>
        <span className="flow-step-count">Step {activeStep + 1} of {stepLabels.length}</span>
        {activeStep < stepLabels.length - 1 ? (
          <button className="button button-primary" onClick={continueToNextStep} type="button">
            Continue <ArrowRight size={16} aria-hidden="true" />
          </button>
        ) : (
          <button className="button button-primary professional-submit" disabled={isSubmitting} type="submit">
            Submit Application <Check size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      {submitError && <p className="field-error" role="alert">{submitError}</p>}
    </form>
  );
}

function SelectionGroup({
  className = "",
  error,
  legend,
  onToggle,
  options,
  selected,
}: {
  className?: string;
  error?: string;
  legend: string;
  onToggle: (value: string) => void;
  options: string[];
  selected: string[];
}) {
  const errorId = `${legend.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-error`;
  return (
    <fieldset aria-describedby={error ? errorId : undefined} className={`professional-selection-group ${className}`}>
      <legend className="field-legend">{legend}</legend>
      <div className="professional-option-grid">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              aria-pressed={isSelected}
              className={`professional-select-card${isSelected ? " is-selected" : ""}`}
              key={option}
              onClick={() => onToggle(option)}
              type="button"
            >
              <span>{option}</span>
              <span className="professional-select-check"><Check size={13} aria-hidden="true" /></span>
            </button>
          );
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}

function Acknowledgement({
  checked,
  error,
  id,
  label,
  onChange,
}: {
  checked: boolean;
  error?: string;
  id: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="professional-acknowledgement-wrap">
      <label className={`project-acknowledgement${error ? " has-error" : ""}`}>
        <input aria-describedby={error ? errorId : undefined} checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
        <span>{label}</span>
      </label>
      <FieldError id={errorId} message={error} />
    </div>
  );
}