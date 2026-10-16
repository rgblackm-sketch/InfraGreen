"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  CloudRain,
  Droplets,
  House,
  Image as ImageIcon,
  MoveDownRight,
  Route,
  Trash2,
  Waves,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import {
  type ProjectSubmissionData,
  type ProjectSubmissionReceipt,
} from "@/lib/project-submission";
import { createSubmissionReference } from "@/lib/submission-reference";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const stepLabels = ["Problem", "Property", "Photos", "Contact", "Review"];

const problemOptions = [
  { label: "Standing water after rain", icon: Droplets },
  { label: "Yard flooding", icon: Waves },
  { label: "Runoff from pavement", icon: Route },
  { label: "Water collecting near a building", icon: House },
  { label: "Drainage problems", icon: CloudRain },
  { label: "Other", icon: MoveDownRight },
  { label: "I'm not sure", icon: CircleHelp },
];

const propertyTypes = [
  "Home",
  "Business",
  "Rental Property",
  "School / Church / Community Property",
  "Other",
];

const durations = ["Recently", "Several months", "1–2 years", "More than 2 years", "Not sure"];

const budgets = [
  "Not sure yet",
  "Under $1,000",
  "$1,000–$2,500",
  "$2,500–$5,000",
  "$5,000–$10,000",
  "$10,000+",
  "Prefer not to say",
];

type LocalPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type StepErrors = Record<string, string>;

function validateStep(step: number, draft: ProjectSubmissionData): StepErrors {
  const errors: StepErrors = {};

  if (step === 0 && draft.stormwaterProblems.length === 0) {
    errors.stormwaterProblems = "Choose at least one problem to continue.";
  }

  if (step === 1) {
    if (!draft.propertyType) errors.propertyType = "Select a property type.";
    if (!draft.city.trim()) errors.city = "Enter the property's city.";
    if (!draft.state.trim()) errors.state = "Enter the property's state.";
    if (!/^\d{5}(?:-\d{4})?$/.test(draft.zipCode.trim())) {
      errors.zipCode = "Enter a valid ZIP code, such as 70112.";
    }
  }

  if (step === 3) {
    if (!draft.firstName.trim()) errors.firstName = "Enter your first name.";
    if (!draft.lastName.trim()) errors.lastName = "Enter your last name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!draft.budget.trim()) errors.budget = "Select an estimated project budget.";
    if (!draft.acknowledgement) {
      errors.acknowledgement = "Please confirm that you understand this before continuing.";
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
        <button className="review-edit" type="button" onClick={() => onEdit(step)}>
          Edit <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
      {children}
    </section>
  );
}

export function ProjectForm() {
  const [draft, setDraft] = useState<ProjectSubmissionData>({
    stormwaterProblems: [],
    problemDescription: "",
    propertyType: "",
    streetAddress: "",
    city: "",
    state: "Louisiana",
    zipCode: "",
    problemDuration: "",
    afterRainDescription: "",
    photos: [],
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    budget: "",
    acknowledgement: false,
  });
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<StepErrors>({});
  const [receipt, setReceipt] = useState<ProjectSubmissionReceipt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const didMountRef = useRef(false);
  const previewUrlsRef = useRef(new Set<string>());
  const submissionInProgressRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) headingRef.current?.focus();
    else didMountRef.current = true;
  }, [activeStep]);

  useEffect(() => () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function updateDraft<Key extends keyof ProjectSubmissionData>(
    key: Key,
    value: ProjectSubmissionData[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  function addPhotos(fileList: FileList | null) {
    if (!fileList?.length) return;
    const selectedFiles = Array.from(fileList);
    const validFiles = selectedFiles.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      return ["image/jpeg", "image/png", "image/heic", "image/heif"].includes(file.type)
        || ["jpg", "jpeg", "png", "heic", "heif"].includes(extension ?? "");
    });

    if (validFiles.length !== selectedFiles.length) {
      setErrors((current) => ({ ...current, photos: "Choose JPG, PNG, or HEIC image files." }));
    } else {
      setErrors((current) => {
        if (!current.photos) return current;
        const next = { ...current };
        delete next.photos;
        return next;
      });
    }

    const additions = validFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      return { id: crypto.randomUUID(), file, previewUrl };
    });

    if (additions.length) {
      setPhotos((current) => [...current, ...additions]);
      setDraft((current) => ({ ...current, photos: [...current.photos, ...additions.map(({ file }) => file)] }));
    }
  }

  function removePhoto(id: string) {
    const removed = photos.find((photo) => photo.id === id);
    if (removed) {
      URL.revokeObjectURL(removed.previewUrl);
      previewUrlsRef.current.delete(removed.previewUrl);
    }
    setPhotos((current) => current.filter((photo) => photo.id !== id));
    setDraft((current) => ({
      ...current,
      photos: current.photos.filter((_, index) => photos[index]?.id !== id),
    }));
  }

  function continueToNextStep() {
    const nextErrors = validateStep(activeStep, draft);
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
    if (activeStep !== stepLabels.length - 1) {
      continueToNextStep();
      return;
    }

    const allErrors = [0, 1, 2, 3].reduce<StepErrors>(
      (collected, step) => ({ ...collected, ...validateStep(step, draft) }),
      {},
    );
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      if (allErrors.stormwaterProblems) setActiveStep(0);
      else if (allErrors.propertyType || allErrors.city || allErrors.state || allErrors.zipCode) setActiveStep(1);
      else if (allErrors.photos) setActiveStep(2);
      else setActiveStep(3);
      return;
    }

    if (submissionInProgressRef.current) return;
    submissionInProgressRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    const referenceNumber = createSubmissionReference("IG");

    try {
      const { error } = await getSupabaseBrowserClient().from("projects").insert({
        problems: draft.stormwaterProblems,
        problem_description: draft.problemDescription,
        property_type: draft.propertyType,
        street_address: draft.streetAddress,
        city: draft.city,
        state: draft.state,
        zip_code: draft.zipCode,
        problem_duration: draft.problemDuration,
        rain_description: draft.afterRainDescription,
        first_name: draft.firstName,
        last_name: draft.lastName,
        email: draft.email,
        phone: draft.phone,
        estimated_budget: draft.budget,
        acknowledgement: draft.acknowledgement,
      });

      if (error) throw error;
      setReceipt({ referenceNumber });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to submit project to Supabase:", error);
      }
      setSubmitError("We couldn't submit your project right now. Your information is still here. Please try again.");
    } finally {
      submissionInProgressRef.current = false;
      setIsSubmitting(false);
    }
  }

  if (receipt) {
    return (
      <section className="confirmation project-success" aria-live="polite">
        <span className="confirmation-icon"><Check size={25} aria-hidden="true" /></span>
        <span className="eyebrow">Project inquiry</span>
        <h2>Project submitted.</h2>
        <p>Thanks for telling us about your property. InfraGreen will review your information and work to identify relevant professionals.</p>
        <div className="project-reference"><span>Project reference</span><strong>{receipt.referenceNumber}</strong></div>
        <p className="confirmation-note">Your project information has been received. Selected photos were not uploaded with this inquiry.</p>
        <div className="success-actions">
          <Link className="button button-primary" href="/">Return Home <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link className="button button-quiet" href="/solutions">Learn About Solutions</Link>
        </div>
      </section>
    );
  }

  return (
    <form aria-busy={isSubmitting} className="form-panel project-flow" noValidate onSubmit={handleSubmit}>
      <nav className="flow-progress" aria-label={`Step ${activeStep + 1} of ${stepLabels.length}: ${stepLabels[activeStep]}`}>
        <ol>
          {stepLabels.map((label, index) => (
            <li
              className={`flow-progress-step${activeStep === index ? " is-current" : ""}${activeStep > index ? " is-complete" : ""}`}
              aria-current={activeStep === index ? "step" : undefined}
              key={label}
            >
              <span className="flow-progress-number">{activeStep > index ? <Check size={13} aria-hidden="true" /> : index + 1}</span>
              <span className="flow-progress-label">{label}</span>
            </li>
          ))}
        </ol>
      </nav>

      {activeStep === 0 && (
        <section className="flow-step-content" aria-labelledby="project-step-heading">
          <header className="flow-step-heading">
            <span className="eyebrow">Step 01 / Problem</span>
            <h2 id="project-step-heading" ref={headingRef} tabIndex={-1}>What&apos;s happening on your property?</h2>
            <p>Tell us what you&apos;re experiencing. You don&apos;t need to know which solution you need.</p>
          </header>
          <fieldset aria-describedby={errors.stormwaterProblems ? "problem-error" : undefined} className="problem-picker">
            <legend className="field-legend">Choose any that apply</legend>
            <div className="problem-choice-grid">
              {problemOptions.map(({ label, icon: Icon }) => {
                const selected = draft.stormwaterProblems.includes(label);
                return (
                  <button
                    aria-pressed={selected}
                    className={`problem-choice${selected ? " is-selected" : ""}`}
                    key={label}
                    onClick={() => {
                      const problems = selected
                        ? draft.stormwaterProblems.filter((problem) => problem !== label)
                        : [...draft.stormwaterProblems, label];
                      updateDraft("stormwaterProblems", problems);
                    }}
                    type="button"
                  >
                    <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
                    <span>{label}</span>
                    <span className="problem-choice-check"><Check size={13} aria-hidden="true" /></span>
                  </button>
                );
              })}
            </div>
            <FieldError id="problem-error" message={errors.stormwaterProblems} />
          </fieldset>
          <label className="field flow-description">
            <span>Tell us a little more <em>Optional</em></span>
            <textarea name="problemDescription" onChange={(event) => updateDraft("problemDescription", event.target.value)} placeholder="What do you notice, and when does it happen?" rows={4} value={draft.problemDescription} />
          </label>
        </section>
      )}

      {activeStep === 1 && (
        <section className="flow-step-content" aria-labelledby="project-step-heading">
          <header className="flow-step-heading">
            <span className="eyebrow">Step 02 / Property</span>
            <h2 id="project-step-heading" ref={headingRef} tabIndex={-1}>Tell us about the property.</h2>
            <p>A few details help local professionals understand where the issue is happening.</p>
          </header>
          <div className="form-grid">
            <label className="field field-full">
              <span>Property type <b>*</b></span>
              <select aria-describedby={errors.propertyType ? "propertyType-error" : undefined} aria-invalid={Boolean(errors.propertyType)} name="propertyType" onChange={(event) => updateDraft("propertyType", event.target.value)} value={draft.propertyType}>
                <option value="">Select a property type</option>
                {propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              <FieldError id="propertyType-error" message={errors.propertyType} />
            </label>
            <label className="field field-full">
              <span>Street address <em>Optional</em></span>
              <input autoComplete="street-address" name="streetAddress" onChange={(event) => updateDraft("streetAddress", event.target.value)} placeholder="Street address" value={draft.streetAddress} />
            </label>
            <label className="field">
              <span>City <b>*</b></span>
              <input aria-describedby={errors.city ? "city-error" : undefined} aria-invalid={Boolean(errors.city)} autoComplete="address-level2" name="city" onChange={(event) => updateDraft("city", event.target.value)} value={draft.city} />
              <FieldError id="city-error" message={errors.city} />
            </label>
            <label className="field">
              <span>State <b>*</b></span>
              <input aria-describedby={errors.state ? "state-error" : undefined} aria-invalid={Boolean(errors.state)} autoComplete="address-level1" name="state" onChange={(event) => updateDraft("state", event.target.value)} value={draft.state} />
              <FieldError id="state-error" message={errors.state} />
            </label>
            <label className="field">
              <span>ZIP code <b>*</b></span>
              <input aria-describedby={errors.zipCode ? "zipCode-error" : undefined} aria-invalid={Boolean(errors.zipCode)} autoComplete="postal-code" inputMode="numeric" maxLength={10} name="zipCode" onChange={(event) => updateDraft("zipCode", event.target.value)} placeholder="70112" value={draft.zipCode} />
              <FieldError id="zipCode-error" message={errors.zipCode} />
            </label>
            <label className="field field-full">
              <span>How long have you noticed this problem?</span>
              <select name="problemDuration" onChange={(event) => updateDraft("problemDuration", event.target.value)} value={draft.problemDuration}>
                <option value="">Select a timeframe</option>
                {durations.map((duration) => <option key={duration} value={duration}>{duration}</option>)}
              </select>
            </label>
            <label className="field field-full">
              <span>What usually happens after heavy rain? <em>Optional</em></span>
              <textarea name="afterRainDescription" onChange={(event) => updateDraft("afterRainDescription", event.target.value)} placeholder="Share any details that might help explain what happens." rows={3} value={draft.afterRainDescription} />
            </label>
          </div>
        </section>
      )}

      {activeStep === 2 && (
        <section className="flow-step-content" aria-labelledby="project-step-heading">
          <header className="flow-step-heading">
            <span className="eyebrow">Step 03 / Photos</span>
            <h2 id="project-step-heading" ref={headingRef} tabIndex={-1}>Show us what&apos;s happening.</h2>
            <p>Photos can help professionals better understand the property and the stormwater problem.</p>
          </header>
          <div className={`project-dropzone${isDragging ? " is-dragging" : ""}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDragOver={(event) => event.preventDefault()} onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setIsDragging(false); addPhotos(event.dataTransfer.files); }}>
            <label className="project-dropzone-label" htmlFor="project-photos">
              <span className="dropzone-icon"><ImageIcon size={23} aria-hidden="true" /></span>
              <span className="dropzone-title">Drop photos here or <strong>browse files</strong></span>
              <span className="dropzone-hint" id="photo-help">JPG, PNG, or HEIC · Optional</span>
              <input accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif" aria-describedby={errors.photos ? "photo-help photo-error" : "photo-help"} className="project-file-input" id="project-photos" multiple name="photos" onChange={(event: ChangeEvent<HTMLInputElement>) => { addPhotos(event.target.files); event.currentTarget.value = ""; }} type="file" />
            </label>
          </div>
          <FieldError id="photo-error" message={errors.photos} />
          {photos.length > 0 ? (
            <div className="photo-selection">
              <div className="photo-selection-heading"><span>Selected photos <em>Kept on this device for now</em></span><span>{photos.length}</span></div>
              <div className="photo-preview-grid">
                {photos.map((photo) => <PhotoPreview key={photo.id} photo={photo} onRemove={() => removePhoto(photo.id)} />)}
              </div>
            </div>
          ) : (
            <p className="photo-local-note">At least one photo is required. Selected files stay in this browser and are not uploaded.</p>
          )}
        </section>
      )}

      {activeStep === 3 && (
        <section className="flow-step-content" aria-labelledby="project-step-heading">
          <header className="flow-step-heading">
            <span className="eyebrow">Step 04 / Contact</span>
            <h2 id="project-step-heading" ref={headingRef} tabIndex={-1}>Where should professionals reach you?</h2>
            <p>Your contact details help InfraGreen follow up about your project inquiry.</p>
          </header>
          <div className="form-grid">
            <label className="field">
              <span>First name <b>*</b></span>
              <input aria-describedby={errors.firstName ? "firstName-error" : undefined} aria-invalid={Boolean(errors.firstName)} autoComplete="given-name" name="firstName" onChange={(event) => updateDraft("firstName", event.target.value)} value={draft.firstName} />
              <FieldError id="firstName-error" message={errors.firstName} />
            </label>
            <label className="field">
              <span>Last name <b>*</b></span>
              <input aria-describedby={errors.lastName ? "lastName-error" : undefined} aria-invalid={Boolean(errors.lastName)} autoComplete="family-name" name="lastName" onChange={(event) => updateDraft("lastName", event.target.value)} value={draft.lastName} />
              <FieldError id="lastName-error" message={errors.lastName} />
            </label>
            <label className="field field-full">
              <span>Email <b>*</b></span>
              <input aria-describedby={errors.email ? "email-error" : undefined} aria-invalid={Boolean(errors.email)} autoComplete="email" name="email" onChange={(event) => updateDraft("email", event.target.value)} type="email" value={draft.email} />
              <FieldError id="email-error" message={errors.email} />
            </label>
            <label className="field field-full">
              <span>Phone <em>Optional</em></span>
              <input autoComplete="tel" name="phone" onChange={(event) => updateDraft("phone", event.target.value)} type="tel" value={draft.phone} />
            </label>
            <label className="field field-full">
              <span>Estimated project budget <b>*</b></span>
              <select aria-describedby={errors.budget ? "budget-error" : undefined} aria-invalid={Boolean(errors.budget)} name="budget" onChange={(event) => updateDraft("budget", event.target.value)} value={draft.budget}>
                <option value="">Select an estimate</option>
                {budgets.map((budget) => <option key={budget} value={budget}>{budget}</option>)}
              </select>
              <FieldError id="budget-error" message={errors.budget} />
            </label>
          </div>
          <label className={`project-acknowledgement${errors.acknowledgement ? " has-error" : ""}`}>
            <input aria-describedby={errors.acknowledgement ? "acknowledgement-error" : undefined} checked={draft.acknowledgement} name="acknowledgement" onChange={(event) => updateDraft("acknowledgement", event.target.checked)} type="checkbox" />
            <span>I understand that submitting a project does not guarantee that a particular green-infrastructure solution is appropriate for my property.</span>
          </label>
          <FieldError id="acknowledgement-error" message={errors.acknowledgement} />
        </section>
      )}

      {activeStep === 4 && (
        <section className="flow-step-content" aria-labelledby="project-step-heading">
          <header className="flow-step-heading">
            <span className="eyebrow">Step 05 / Review</span>
            <h2 id="project-step-heading" ref={headingRef} tabIndex={-1}>Review your project.</h2>
            <p>Check your details before sending your project inquiry.</p>
          </header>
          <div className="project-review">
            <ReviewSection onEdit={editStep} step={0} title="Stormwater problem">
              <p className="review-problems">{draft.stormwaterProblems.join(" · ")}</p>
              <dl><ReviewValue label="Description" value={draft.problemDescription} /></dl>
            </ReviewSection>
            <ReviewSection onEdit={editStep} step={1} title="Property">
              <dl>
                <ReviewValue label="Property type" value={draft.propertyType} />
                <ReviewValue label="Location" value={[draft.streetAddress, draft.city, draft.state, draft.zipCode].filter(Boolean).join(", ")} />
                <ReviewValue label="Problem duration" value={draft.problemDuration} />
                <ReviewValue label="After heavy rain" value={draft.afterRainDescription} />
              </dl>
            </ReviewSection>
            <ReviewSection onEdit={editStep} step={2} title="Photos">
              <dl><ReviewValue label="Selected photos" value={`${photos.length} ${photos.length === 1 ? "photo" : "photos"}`} /></dl>
            </ReviewSection>
            <ReviewSection onEdit={editStep} step={3} title="Contact">
              <dl>
                <ReviewValue label="Name" value={`${draft.firstName} ${draft.lastName}`} />
                <ReviewValue label="Email" value={draft.email} />
                <ReviewValue label="Phone" value={draft.phone} />
                <ReviewValue label="Estimated budget" value={draft.budget} />
              </dl>
            </ReviewSection>
          </div>
        </section>
      )}

      <div className="flow-actions">
        <button className="button button-quiet flow-back" disabled={activeStep === 0} onClick={goBack} type="button">
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </button>
        <span className="flow-step-count">Step {activeStep + 1} of {stepLabels.length}</span>
        <div className="flow-action-right">
          {activeStep < stepLabels.length - 1 ? (
            <button className="button button-primary" onClick={continueToNextStep} type="button">
              Continue <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button className="button button-primary" disabled={isSubmitting} type="submit">
              Submit Project <Check size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      {submitError && <p className="field-error" role="alert">{submitError}</p>}
      {activeStep === 4 && (
        <p className="review-disclaimer">InfraGreen will review your project information and work to connect you with relevant professionals. Professionals are responsible for evaluating site conditions and determining appropriate solutions.</p>
      )}
    </form>
  );
}

function ReviewValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="review-value">
      <dt>{label}</dt>
      <dd>{value.trim() || "Not provided"}</dd>
    </div>
  );
}

function PhotoPreview({ photo, onRemove }: { photo: LocalPhoto; onRemove: () => void }) {
  const [previewUnavailable, setPreviewUnavailable] = useState(false);
  return (
    <figure className="photo-preview">
      {previewUnavailable ? (
        <div className="photo-preview-unavailable"><ImageIcon size={22} aria-hidden="true" /><span>Preview unavailable</span></div>
      ) : (
        <Image
          alt={`Selected photo: ${photo.file.name}`}
          className="photo-preview-image"
          height={144}
          onError={() => setPreviewUnavailable(true)}
          src={photo.previewUrl}
          unoptimized
          width={192}
        />
      )}
      <figcaption>
        <span title={photo.file.name}>{photo.file.name}</span>
        <button aria-label={`Remove ${photo.file.name}`} onClick={onRemove} type="button"><Trash2 size={15} aria-hidden="true" /></button>
      </figcaption>
    </figure>
  );
}