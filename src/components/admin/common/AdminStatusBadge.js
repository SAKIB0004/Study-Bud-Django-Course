function AdminStatusBadge({ status }) {
    const normalizedStatus = String(status || "")
        .toLowerCase()
        .trim();

    const statusClass = {
        active: "success",
        inactive: "danger",
        pending: "warning",
        approved: "success",
        rejected: "danger",
        reported: "warning",
    }[normalizedStatus] || "default";

    const label = status
        ? String(status).charAt(0).toUpperCase() +
          String(status).slice(1)
        : "Unknown";

    return (
        <span
            className={`admin-status-badge admin-status-badge--${statusClass}`}
        >
            {label}
        </span>
    );
}

export default AdminStatusBadge;