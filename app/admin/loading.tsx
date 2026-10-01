export default function AdminLoading() {
  return (
    <div className="admin-shell">
      <div className="admin-page admin-page--loading">
        <div className="admin-grid">
          <div className="admin-card admin-card--skeleton" />
          <div className="admin-card admin-card--skeleton" />
          <div className="admin-card admin-card--skeleton admin-card--wide" />
        </div>
      </div>
    </div>
  );
}
