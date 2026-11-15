
import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
    FaChevronDown,
    FaChevronUp,
    FaChartPie,
    FaComments,
    FaTags,
    FaUsers,
    FaShieldAlt
} from "react-icons/fa";

import useAuth from "../../hooks/useAuth";
import "../../assets/styles/admin-navigation.css";

function AdminDropdown() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    console.log("Current authenticated user:", user);
    console.log("Current user role:", user?.role);
    console.log("Role name:", user?.role?.name);

    // Admin navigation is visible only to root admins
    const isRootAdmin = user?.role?.name === "ROOT_ADMIN";
    console.log("Is Root Admin:", isRootAdmin);
    
    if (!isRootAdmin) return null;

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
        <div className="admin-dropdown">
            <button
                type="button"
                className="admin-dropdown-toggle"
                onClick={() => setIsOpen((previous) => !previous)}
                aria-expanded={isOpen}
            >
                <span className="admin-dropdown-title">
                    <FaShieldAlt />
                    Admin Management
                </span>

                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {isOpen && (
                <div className="admin-dropdown-menu">
                    {adminLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `admin-dropdown-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminDropdown;
