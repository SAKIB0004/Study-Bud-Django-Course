
import { Link } from "react-router-dom";

function AdminPageHeader({
    title,
    description = "",
    breadcrumbs = [],
    actions = []
}) {
    return (
        <div className="admin-page-header">

            {breadcrumbs.length > 0 && (
                <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
                    {breadcrumbs.map((item, index) => (
                        <span
                            key={`${item.label}-${index}`}
                            className="admin-breadcrumb-item"
                        >
                            {item.to ? (
                                <Link
                                    to={item.to}
                                    className="admin-breadcrumb-link"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="admin-breadcrumb-current">
                                    {item.label}
                                </span>
                            )}

                            {index !== breadcrumbs.length - 1 && (
                                <span className="breadcrumb-separator">
                                    /
                                </span>
                            )}
                        </span>
                    ))}
                </nav>
            )}

            <div className="admin-page-header-content">
                <div className="admin-page-heading">
                    <h1>{title}</h1>

                    {description && <p>{description}</p>}
                </div>

                {actions.length > 0 && (
                    <div className="admin-page-actions">
                        {actions.map((action, index) => (
                            <button
                                key={`${action.label}-${index}`}
                                type="button"
                                className={`admin-action-button ${
                                    action.className || ""
                                }`}
                                onClick={action.onClick}
                                disabled={action.disabled || false}
                            >
                                {action.icon}
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPageHeader;
