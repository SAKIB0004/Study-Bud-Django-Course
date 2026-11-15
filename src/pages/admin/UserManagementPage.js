
import { useEffect, useState } from "react";

import AdminPageHeader from "../../components/admin/common/AdminPageHeader";
import AdminTable from "../../components/admin/common/AdminTable";
import roomService from "../../services/api/roomService";

import "../../assets/styles/admin/admin-common.css";

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let isActive = true;

        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await roomService.getUsers();

                const data = Array.isArray(response)
                    ? response
                    : response?.results || [];

                if (isActive) {
                    setUsers(data);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);

                if (isActive) {
                    setError(
                        error.response?.data?.detail ||
                        "Failed to load users."
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            isActive = false;
        };
    }, []);

    const userColumns = [
        { key: "serial", label: "SL", render: (room, index) => index + 1 },
        {
            key: "name",
            label: "Name",
            render: (user) => user.name || user.username || "-",
        },
        { key: "email", label: "Email" },
        {
            key: "role",
            label: "Role",
            render: (user) => {
                const role = user.role?.name;

                if (role === "ROOT_ADMIN") return "Root Admin";
                if (role === "USER") return "User";

                return "-";
            },
        },
        {
            key: "is_active",
            label: "Status",
            render: (user) => user.is_active ? "Active" : "Inactive",
        },
        {
            key: "is_superuser",
            label: "Superuser",
            render: (user) => user.is_superuser ? "Yes" : "No",
        },
    ];

    return (
        <div className="admin-section-page">
            <AdminPageHeader
                title="User Management"
                description="View and manage StudyBuddy users."
                breadcrumbs={[
                    { label: "Home", to: "/" },
                    { label: "Administration", to: "/admin/dashboard" },
                    { label: "User Management" },
                ]}
            />

            <div className="admin-section-content">
                {loading ? (
                    <p>Loading users...</p>
                ) : error ? (
                    <p className="admin-error">{error}</p>
                ) : (
                    <AdminTable
                        columns={userColumns}
                        data={users}
                        emptyMessage="No users available."
                    />
                )}
            </div>
        </div>
    );
}

export default UserManagementPage;
