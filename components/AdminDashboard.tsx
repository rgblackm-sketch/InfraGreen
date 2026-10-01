"use client";

import { useMemo, useState, useTransition } from "react";

import {
  signOutAdmin,
  updateProfessionalApplicationStatus,
  updateProjectStatus,
} from "@/app/admin/actions";

export type DashboardProject = {
  id: string;
  reference_number?: string | null;
  created_at?: string | null;
  problems?: string[] | string | null;
  property_type?: string | null;
  city?: string | null;
  state?: string | null;
  estimated_budget?: string | null;
  status?: string | null;
  problem_description?: string | null;
  street_address?: string | null;
  problem_duration?: string | null;
  rain_description?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  photo_count?: number | null;
  [key: string]: unknown;
};

export type DashboardProfessional = {
  id: string;
  reference_number?: string | null;
  business_name?: string | null;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  services?: string[] | string | null;
  service_areas?: string[] | string | null;
  years_in_business?: number | string | null;
  application_status?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

export type DashboardData = {
  projects: DashboardProject[];
  professionals: DashboardProfessional[];
  userEmail: string;
};

const PROJECT_STATUSES = ["new", "reviewing", "matching", "connected", "completed", "closed"];
const PROFESSIONAL_STATUSES = ["pending", "reviewing", "approved", "declined"];

function formatDate(value?: string | null) {
  if (!value) return "Not provided";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatList(value: string[] | string | null | undefined) {
  if (!value) return "Not provided";
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ") || "Not provided";
  }
  return value.trim() || "Not provided";
}

function statusBadgeClass(value?: string | null, type: "project" | "professional" = "project") {
  const normalized = (value ?? "").toLowerCase();
  if (type === "project") {
    if (["new", "reviewing", "matching"].includes(normalized)) return "status-badge status-badge--neutral";
    if (["connected", "completed"].includes(normalized)) return "status-badge status-badge--success";
    if (normalized === "closed") return "status-badge status-badge--muted";
    return "status-badge";
  }

  if (["approved"].includes(normalized)) return "status-badge status-badge--success";
  if (["reviewing"].includes(normalized)) return "status-badge status-badge--neutral";
  if (["declined"].includes(normalized)) return "status-badge status-badge--muted";
  return "status-badge";
}

export function AdminDashboard({ initialData }: { initialData: DashboardData }) {
  const [activeTab, setActiveTab] = useState<"projects" | "professionals">("projects");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialData.projects[0]?.id ?? null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(initialData.professionals[0]?.id ?? null);
  const [isPending, startTransition] = useTransition();

  const projects = initialData.projects;
  const professionals = initialData.professionals;

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null,
    [projects, selectedProjectId],
  );

  const selectedProfessional = useMemo(
    () => professionals.find((professional) => professional.id === selectedProfessionalId) ?? professionals[0] ?? null,
    [professionals, selectedProfessionalId],
  );

  const summary = {
    newProjects: projects.filter((project) => (project.status ?? "new").toLowerCase() === "new").length,
    inReviewProjects: projects.filter((project) => ["reviewing", "matching"].includes((project.status ?? "").toLowerCase())).length,
    professionalApplications: professionals.length,
    approvedProfessionals: professionals.filter((professional) => (professional.application_status ?? "").toLowerCase() === "approved").length,
  };

  const handleProjectStatusChange = async (projectId: string, status: string) => {
    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("status", status);

    startTransition(() => {
      void updateProjectStatus(formData).then(() => {
        window.location.reload();
      });
    });
  };

  const handleProfessionalStatusChange = async (applicationId: string, status: string) => {
    const formData = new FormData();
    formData.set("applicationId", applicationId);
    formData.set("status", status);

    startTransition(() => {
      void updateProfessionalApplicationStatus(formData).then(() => {
        window.location.reload();
      });
    });
  };

  return (
    <div className="admin-shell">
      <div className="admin-page">
        <header className="admin-header">
          <div>
            <div className="admin-brand">InfraGreen</div>
            <p className="admin-brand-subtitle">Admin</p>
          </div>
          <div className="admin-header-actions">
            <span className="admin-user-pill">{initialData.userEmail}</span>
            <form action={signOutAdmin} method="post">
              <button className="button button-quiet button-small" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section className="admin-summary-grid">
          <div className="admin-card admin-stat-card">
            <span className="admin-stat-label">New Projects</span>
            <strong>{summary.newProjects}</strong>
          </div>
          <div className="admin-card admin-stat-card">
            <span className="admin-stat-label">Projects In Review</span>
            <strong>{summary.inReviewProjects}</strong>
          </div>
          <div className="admin-card admin-stat-card">
            <span className="admin-stat-label">Professional Applications</span>
            <strong>{summary.professionalApplications}</strong>
          </div>
          <div className="admin-card admin-stat-card">
            <span className="admin-stat-label">Approved Professionals</span>
            <strong>{summary.approvedProfessionals}</strong>
          </div>
        </section>

        <section className="admin-card admin-tab-panel">
          <div className="admin-tabs" role="tablist" aria-label="Admin sections">
            <button
              aria-selected={activeTab === "projects"}
              className={activeTab === "projects" ? "admin-tab is-active" : "admin-tab"}
              onClick={() => setActiveTab("projects")}
              role="tab"
              type="button"
            >
              Projects
            </button>
            <button
              aria-selected={activeTab === "professionals"}
              className={activeTab === "professionals" ? "admin-tab is-active" : "admin-tab"}
              onClick={() => setActiveTab("professionals")}
              role="tab"
              type="button"
            >
              Professionals
            </button>
          </div>

          {activeTab === "projects" ? (
            <div className="admin-content-grid">
              <div className="admin-list-panel">
                {projects.length === 0 ? (
                  <div className="admin-empty-state">No project submissions yet.</div>
                ) : (
                  projects.map((project) => (
                    <button
                      className={selectedProject?.id === project.id ? "admin-list-item is-selected" : "admin-list-item"}
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      type="button"
                    >
                      <div className="admin-list-item-header">
                        <span>{project.reference_number ?? project.id.slice(0, 8)}</span>
                        <span className={statusBadgeClass(project.status, "project")}>{project.status ?? "new"}</span>
                      </div>
                      <div className="admin-list-item-meta">
                        <span>{formatDate(project.created_at)}</span>
                        <span>{project.city ?? "Unknown city"}, {project.state ?? "Unknown state"}</span>
                      </div>
                      <p>{formatList(project.problems)}</p>
                      <div className="admin-list-item-footer">
                        <span>{project.property_type ?? "Unknown property"}</span>
                        <span>{project.estimated_budget ?? "Budget not provided"}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="admin-detail-panel">
                {!selectedProject ? (
                  <div className="admin-empty-state">Select a project to review details.</div>
                ) : (
                  <>
                    <div className="admin-detail-header">
                      <div>
                        <span className="admin-detail-label">Reference</span>
                        <h3>{selectedProject.reference_number ?? selectedProject.id}</h3>
                      </div>
                      <span className={statusBadgeClass(selectedProject.status, "project")}>{selectedProject.status ?? "new"}</span>
                    </div>

                    <div className="admin-detail-grid">
                      <DetailRow label="Submitted" value={formatDate(selectedProject.created_at)} />
                      <DetailRow label="Property type" value={selectedProject.property_type ?? "Not provided"} />
                      <DetailRow label="Location" value={[selectedProject.city, selectedProject.state].filter(Boolean).join(", ") || "Not provided"} />
                      <DetailRow label="Budget" value={selectedProject.estimated_budget ?? "Not provided"} />
                      <DetailRow label="Problem duration" value={selectedProject.problem_duration ?? "Not provided"} />
                      <DetailRow label="Customer" value={[selectedProject.first_name, selectedProject.last_name].filter(Boolean).join(" ") || "Not provided"} />
                      <DetailRow label="Email" value={selectedProject.email ?? "Not provided"} />
                      <DetailRow label="Phone" value={selectedProject.phone ?? "Not provided"} />
                    </div>

                    <div className="admin-detail-section">
                      <h4>Problem details</h4>
                      <p>{selectedProject.problem_description || "No additional problem description provided."}</p>
                    </div>

                    <div className="admin-detail-section">
                      <h4>Street address</h4>
                      <p>{selectedProject.street_address || "No street address provided."}</p>
                    </div>

                    <div className="admin-detail-section">
                      <h4>After heavy rain</h4>
                      <p>{selectedProject.rain_description || "No rain description provided."}</p>
                    </div>

                    <div className="admin-detail-section">
                      <h4>Problem categories</h4>
                      <p>{formatList(selectedProject.problems)}</p>
                    </div>

                    <div className="admin-detail-section">
                      <h4>Photo information</h4>
                      <p>{selectedProject.photo_count ? `${selectedProject.photo_count} photo(s) were supplied.` : "No photo metadata was provided."}</p>
                    </div>

                    <label className="field admin-status-field">
                      <span>Project status</span>
                      <select
                        defaultValue={selectedProject.status ?? "new"}
                        disabled={isPending}
                        onChange={(event) => void handleProjectStatusChange(selectedProject.id, event.target.value)}
                      >
                        {PROJECT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="admin-content-grid">
              <div className="admin-list-panel">
                {professionals.length === 0 ? (
                  <div className="admin-empty-state">No professional applications yet.</div>
                ) : (
                  professionals.map((professional) => (
                    <button
                      className={selectedProfessional?.id === professional.id ? "admin-list-item is-selected" : "admin-list-item"}
                      key={professional.id}
                      onClick={() => setSelectedProfessionalId(professional.id)}
                      type="button"
                    >
                      <div className="admin-list-item-header">
                        <span>{professional.reference_number ?? professional.id.slice(0, 8)}</span>
                        <span className={statusBadgeClass(professional.application_status, "professional")}>{professional.application_status ?? "pending"}</span>
                      </div>
                      <div className="admin-list-item-meta">
                        <span>{formatDate(professional.created_at)}</span>
                        <span>{professional.business_name ?? "Unnamed business"}</span>
                      </div>
                      <p>{professional.contact_first_name ?? ""} {professional.contact_last_name ?? ""}</p>
                      <div className="admin-list-item-footer">
                        <span>{formatList(professional.services)}</span>
                        <span>{professional.years_in_business ?? "Years not provided"}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="admin-detail-panel">
                {!selectedProfessional ? (
                  <div className="admin-empty-state">Select a professional application to review details.</div>
                ) : (
                  <>
                    <div className="admin-detail-header">
                      <div>
                        <span className="admin-detail-label">Reference</span>
                        <h3>{selectedProfessional.reference_number ?? selectedProfessional.id}</h3>
                      </div>
                      <span className={statusBadgeClass(selectedProfessional.application_status, "professional")}>{selectedProfessional.application_status ?? "pending"}</span>
                    </div>

                    <div className="admin-detail-grid">
                      <DetailRow label="Business" value={selectedProfessional.business_name ?? "Not provided"} />
                      <DetailRow label="Contact" value={[selectedProfessional.contact_first_name, selectedProfessional.contact_last_name].filter(Boolean).join(" ") || "Not provided"} />
                      <DetailRow label="Services" value={formatList(selectedProfessional.services)} />
                      <DetailRow label="Service areas" value={formatList(selectedProfessional.service_areas)} />
                      <DetailRow label="Years in business" value={String(selectedProfessional.years_in_business ?? "Not provided")} />
                      <DetailRow label="Created" value={formatDate(selectedProfessional.created_at)} />
                    </div>

                    <div className="admin-detail-section">
                      <h4>Application details</h4>
                      <p>Full professional profile details are available in the underlying Supabase records. This dashboard keeps the review process focused on the most relevant fields.</p>
                    </div>

                    <label className="field admin-status-field">
                      <span>Application status</span>
                      <select
                        defaultValue={selectedProfessional.application_status ?? "pending"}
                        disabled={isPending}
                        onChange={(event) => void handleProfessionalStatusChange(selectedProfessional.id, event.target.value)}
                      >
                        {PROFESSIONAL_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
