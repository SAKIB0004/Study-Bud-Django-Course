import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";

import AdminPageHeader from "../../components/admin/common/AdminPageHeader";
import AdminTable from "../../components/admin/common/AdminTable";
import AdminModal from "../../components/admin/common/AdminModal";
import AdminSearch from "../../components/admin/common/AdminSearch";
import AdminFilter from "../../components/admin/common/AdminFilter";
import AdminPagination from "../../components/admin/common/AdminPagination";
import AdminStatusBadge from "../../components/admin/common/AdminStatusBadge";
import AdminConfirmModal from "../../components/admin/common/AdminConfirmModal";

import adminUserService from "../../services/api/adminUserService";

import "../../assets/styles/admin/UserManagementPage.css";


const INITIAL_FORM_DATA = {
    username: "",
    email: "",
    name: "",
    bio: "",
    role_id: "1",
    is_active: true,
};


const ROLE_OPTIONS = [
    { value: "", label: "All Roles" },
    { value: "USER", label: "User" },
    { value: "ROOT_ADMIN", label: "Root Admin" },
];

const STATUS_OPTIONS = [
    { value: "", label: "All Statuses" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
];

const SUPERUSER_OPTIONS = [
    { value: "", label: "All Superuser States" },
    { value: "true", label: "Superusers" },
    { value: "false", label: "Non-superusers" },
];


function UserManagementPage() {

    // --------------------------------
    // State
    // --------------------------------

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search and filters
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [superuserFilter, setSuperuserFilter] = useState("");

    // Cursor pagination
    const [limit, setLimit] = useState(25);
    const [cursor, setCursor] = useState(null);

    const [pagination, setPagination] = useState({
        count: 0,
        next_cursor: null,
        prev_cursor: null,
        has_more: false,
        has_prev: false,
    });

    // Create / Edit modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [selectedUser, setSelectedUser] = useState(null);

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // Delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState(null);

    // Refresh trigger
    const [refreshKey, setRefreshKey] = useState(0);


    // --------------------------------
    // Fetch Users
    // --------------------------------

    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await adminUserService.getUsers({
                    limit,
                    cursor,
                    search,
                    role: roleFilter,
                    status: statusFilter,
                    superuser: superuserFilter,
                });

                if (!isMounted) return;

                setUsers(response.data || []);

                setPagination(
                    response.pagination || {
                        count: 0,
                        next_cursor: null,
                        prev_cursor: null,
                        has_more: false,
                        has_prev: false,
                    }
                );

            } catch (err) {
                if (!isMounted) return;

                console.error("Failed to fetch users:", err);

                setError(
                    err.response?.data?.detail ||
                    "Failed to load users. Please try again."
                );

                setUsers([]);

            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            isMounted = false;
        };

    }, [
        limit,
        cursor,
        search,
        roleFilter,
        statusFilter,
        superuserFilter,
        refreshKey,
    ]);


    // --------------------------------
    // Search and Filters
    // --------------------------------

    const handleSearch = (value) => {
        setSearch(value);
        setCursor(null);
    };

    const handleRoleFilter = (value) => {
        setRoleFilter(value);
        setCursor(null);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setCursor(null);
    };

    const handleSuperuserFilter = (value) => {
        setSuperuserFilter(value);
        setCursor(null);
    };


    // --------------------------------
    // Pagination
    // --------------------------------

    const handleNextPage = () => {
        if (pagination.next_cursor) {
            setCursor(pagination.next_cursor);
        }
    };

    const handlePreviousPage = () => {
        if (pagination.prev_cursor) {
            setCursor(pagination.prev_cursor);
        }
    };

    const handlePageSizeChange = (value) => {
        setLimit(Number(value));
        setCursor(null);
    };


    // --------------------------------
    // Create User
    // --------------------------------

    const handleOpenCreateModal = () => {
        setModalMode("create");
        setSelectedUser(null);
        setFormData({ ...INITIAL_FORM_DATA });
        setFormError("");
        setIsModalOpen(true);
    };


    // --------------------------------
    // Edit User
    // --------------------------------

    const handleOpenEditModal = (user) => {
        setModalMode("edit");
        setSelectedUser(user);

        setFormData({
            username: user.username || "",
            email: user.email || "",
            name: user.name || "",
            bio: user.bio || "",
            role_id: String(user.role?.id || "1"),
            is_active: user.is_active,
        });

        setFormError("");
        setIsModalOpen(true);
    };


    const handleCloseModal = () => {
        if (saving) return;

        setIsModalOpen(false);
        setSelectedUser(null);
        setFormData({ ...INITIAL_FORM_DATA });
        setFormError("");
    };


    // --------------------------------
    // Form Input Changes
    // --------------------------------

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };


    // --------------------------------
    // Submit Create / Edit
    // --------------------------------

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setFormError("");

        const payload = {
            username: formData.username.trim(),
            email: formData.email.trim(),
            name: formData.name.trim(),
            bio: formData.bio,
            role_id: Number(formData.role_id),
            is_active: formData.is_active,
        };

        try {
            if (modalMode === "create") {
                await adminUserService.createUser(payload);
            } else {
                await adminUserService.updateUser(
                    selectedUser.id,
                    payload
                );
            }

            setIsModalOpen(false);
            setSelectedUser(null);
            setFormData({ ...INITIAL_FORM_DATA });

            setCursor(null);
            setRefreshKey((previous) => previous + 1);

        } catch (err) {
            console.error("Failed to save user:", err);

            const responseData = err.response?.data;

            if (responseData && typeof responseData === "object") {
                    const messages = Object.entries(responseData).map(
                        ([field, value]) => {
                            const message = Array.isArray(value)
                                ? value.join(", ")
                                : typeof value === "object"
                                    ? JSON.stringify(value)
                                    : String(value);

                            return `${field}: ${message}`;
                        }
                    );

                    setFormError(messages.join(" | "));
                } else {
                    setFormError("Failed to save user. Please try again.");
            }

        } finally {
            setSaving(false);
        }
    };


    // --------------------------------
    // Delete User
    // --------------------------------

    const handleOpenDeleteModal = (user) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        if (deletingUserId !== null) return;

        setDeleteModalOpen(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        setDeletingUserId(selectedUser.id);

        try {
            await adminUserService.deleteUser(selectedUser.id);

            setDeleteModalOpen(false);
            setSelectedUser(null);

            setCursor(null);
            setRefreshKey((previous) => previous + 1);

        } catch (err) {
            console.error("Failed to delete user:", err);

            setDeleteModalOpen(false);
            setSelectedUser(null);

            setError(
                err.response?.data?.detail ||
                "Failed to delete user. Please try again."
            );

        } finally {
            setDeletingUserId(null);
        }
    };


    // --------------------------------
    // Table Columns
    // --------------------------------

    const columns = [
        {
            label: "SL",
            render: (user, index) => index + 1,
        },
        {
            label: "Username",
            accessor: "username",
            render: (user) => (
                <div className="admin-user-identity">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                </div>
            ),
        },
        {
            label: "Name",
            accessor: "name",
            render: (user) => user.name || "-",
        },
        {
            label: "Role",
            render: (user) => (
                <span className="admin-user-role">
                    {user.role?.name === "ROOT_ADMIN"
                        ? "Root Admin"
                        : "User"}
                </span>
            ),
        },
        {
            label: "Status",
            render: (user) => (
                <AdminStatusBadge
                    status={user.is_active ? "active" : "inactive"}
                />
            ),
        },
        {
            label: "Superuser",
            render: (user) => (
                <span className={
                    user.is_superuser
                        ? "admin-superuser-yes"
                        : "admin-superuser-no"
                }>
                    {user.is_superuser ? "Yes" : "No"}
                </span>
            ),
        },
        {
            label: "Actions",
            render: (user) => (
                <div className="admin-user-actions">

                    <button
                        type="button"
                        className="admin-action-btn admin-edit-btn"
                        title="Edit user"
                        onClick={() => handleOpenEditModal(user)}
                    >
                        <FaEdit />
                    </button>

                    <button
                        type="button"
                        className="admin-action-btn admin-delete-btn"
                        title="Delete user"
                        onClick={() => handleOpenDeleteModal(user)}
                    >
                        <FaTrashAlt />
                    </button>

                </div>
            ),
        },
    ];


    // --------------------------------
    // Render
    // --------------------------------

    return (
        <div className="admin-users-page">

            <AdminPageHeader
                title="User Management"
                description="Manage all StudyBuddy users."
                breadcrumbs={[
                    { label: "Home", to: "/" },
                    {
                        label: "Administration",
                        to: "/admin/dashboard",
                    },
                    { label: "User Management" },
                ]}
            />


            {/* Search, Filters and Create Button */}

            <div className="admin-users-toolbar">

                <div className="admin-users-search">
                    <AdminSearch
                        value={search}
                        onChange={handleSearch}
                        placeholder="Search users..."
                    />
                </div>

                <AdminFilter
                    label="Role"
                    value={roleFilter}
                    options={ROLE_OPTIONS}
                    onChange={handleRoleFilter}
                />

                <AdminFilter
                    label="Status"
                    value={statusFilter}
                    options={STATUS_OPTIONS}
                    onChange={handleStatusFilter}
                />

                <AdminFilter
                    label="Superuser"
                    value={superuserFilter}
                    options={SUPERUSER_OPTIONS}
                    onChange={handleSuperuserFilter}
                />

                <button
                    type="button"
                    className="admin-create-user-btn"
                    onClick={handleOpenCreateModal}
                >
                    <FaPlus />
                    <span>Create User</span>
                </button>

            </div>


            {/* User Count */}

            <div className="admin-users-count">
                Total users: <strong>{pagination.count || 0}</strong>
            </div>


            {/* Error */}

            {error && (
                <div className="admin-users-error">
                    {error}

                    <button
                        type="button"
                        onClick={() => setRefreshKey((previous) => previous + 1)}
                    >
                        Retry
                    </button>
                </div>
            )}


            {/* Users Table */}

            <AdminTable
                columns={columns}
                data={users}
                rowKey="id"
                emptyMessage={
                    loading ? "Loading users..." : "No users found."
                }
            />


            {/* Pagination */}

            <AdminPagination
                hasPrevious={pagination.has_prev}
                hasNext={pagination.has_more}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
                pageSize={limit}
                onPageSizeChange={handlePageSizeChange}
                loading={loading}
            />


            {/* Create / Edit Modal */}

            <AdminModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalMode === "create" ? "Create User" : "Edit User"}
                size="medium"
            >
                <form
                    className="admin-user-form"
                    onSubmit={handleSubmit}
                >

                    {formError && (
                        <div className="admin-form-error">
                            {formError}
                        </div>
                    )}

                    <div className="admin-form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="role_id">Role</label>
                        <select
                            id="role_id"
                            name="role_id"
                            value={formData.role_id}
                            onChange={handleInputChange}
                        >
                            <option value="1">User</option>
                            <option value="2">Root Admin</option>
                        </select>
                    </div>

                    <div className="admin-form-checkbox">
                        <input
                            id="is_active"
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                        />

                        <label htmlFor="is_active">
                            Active account
                        </label>
                    </div>

                    <div className="admin-user-form-actions">

                        <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            onClick={handleCloseModal}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="admin-btn admin-btn-primary"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : modalMode === "create"
                                    ? "Create User"
                                    : "Save Changes"}
                        </button>

                    </div>

                </form>
            </AdminModal>


            {/* Delete Confirmation */}

            <AdminConfirmModal
                isOpen={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message="Are you sure you want to delete this user?"
                itemName={selectedUser?.username}
                warning="This action cannot be undone."
                confirmText="Delete User"
                cancelText="Cancel"
                loading={deletingUserId !== null}
                confirmVariant="danger"
            />

        </div>
    );
}

export default UserManagementPage;
