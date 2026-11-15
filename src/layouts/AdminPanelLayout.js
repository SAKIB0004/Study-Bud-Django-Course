
import { Outlet, Link, NavLink } from "react-router-dom";
import {
    FaChartPie,
    FaComments,
    FaTags,
    FaUsers,
    FaArrowLeft,
    FaShieldAlt
} from "react-icons/fa";

import "../assets/styles/admin/admin-panel-layout.css";

function AdminPanelLayout() {
    const adminLinks = [
        {
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: <FaChartPie />
        },
        {
            label: "Rooms",
            path: "/admin/rooms",
            icon: <FaComments />
        },
        {
            label: "Topics",
            path: "/admin/topics",
            icon: <FaTags />
        },
        {
            label: "Users",
            path: "/admin/users",
            icon: <FaUsers />
        }
    ];

    return (
        <div className="admin-panel-layout">

            {/* ADMIN SIDEBAR */}
            <aside className="admin-panel-sidebar">

                <div className="admin-panel-brand">
                    <FaShieldAlt />
                    <span>StudyBuddy Admin</span>
                </div>

                <nav className="admin-panel-navigation">
                    <p className="admin-nav-label">MANAGEMENT</p>

                    {adminLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `admin-panel-nav-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-panel-sidebar-footer">
                    <Link to="/" className="admin-back-link">
                        <FaArrowLeft />
                        <span>Back to StudyBuddy</span>
                    </Link>
                </div>

            </aside>

            {/* ADMIN MAIN AREA */}
            <div className="admin-panel-main">

                <header className="admin-panel-topbar">
                    <div>
                        <span className="admin-topbar-label">
                            Administration
                        </span>
                    </div>

                    {/* <Link to="/" className="admin-topbar-back">
                        Back to StudyBuddy
                    </Link> */}
                </header>

                <main className="admin-panel-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AdminPanelLayout;
