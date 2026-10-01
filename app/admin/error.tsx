"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="admin-shell">
      <div className="admin-page">
        <div className="admin-message admin-message--error">
          <h2>Admin dashboard unavailable</h2>
          <p>We couldn&apos;t load the latest submissions right now. Please try again.</p>
          <button className="button button-primary" onClick={() => reset()} type="button">
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
