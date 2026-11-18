
import { useEffect, useState } from "react";
import { FaFileImport } from "react-icons/fa";

import AdminPageHeader from "../../components/admin/common/AdminPageHeader";
import AdminTable from "../../components/admin/common/AdminTable";
import AdminPagination from "../../components/admin/common/AdminPagination";
import AdminSearch from "../../components/admin/common/AdminSearch";
import BulkImportModal from "../../components/admin/common/BulkImportModal";

import roomService from "../../services/api/roomService";

import "../../assets/styles/admin/admin-common.css";

const INITIAL_PAGINATION = {
    count: 0,
    next_cursor: null,
    prev_cursor: null,
    has_more: false,
    has_prev: false,
};

function TopicManagementPage() {
    // --------------------------------
    // State
    // --------------------------------

    const [topics, setTopics] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search
    const [search, setSearch] = useState("");

    // Cursor pagination
    const [limit, setLimit] = useState(25);
    const [cursor, setCursor] = useState(null);
    const [currentBatch, setCurrentBatch] = useState(1);

    const [pagination, setPagination] = useState({
        ...INITIAL_PAGINATION,
    });

    // Refresh trigger
    const [refreshKey, setRefreshKey] = useState(0);

    // Modals
    const [showAddTopic, setShowAddTopic] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);


    // --------------------------------
    // Fetch Topics
    // --------------------------------

    useEffect(() => {
        let isMounted = true;

        const fetchTopics = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await roomService.getAdminTopics(
                    limit,
                    cursor,
                    { search }
                );

                if (!isMounted) return;

                setTopics(response.data || []);

                setPagination(
                    response.pagination || {
                        ...INITIAL_PAGINATION,
                    }
                );

            } catch (err) {
                if (!isMounted) return;

                console.error("Failed to fetch topics:", err);

                setError(
                    err.response?.data?.detail ||
                    "Failed to load topics. Please try again."
                );

                setTopics([]);
                setPagination({
                    ...INITIAL_PAGINATION,
                });

            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchTopics();

        return () => {
            isMounted = false;
        };

    }, [limit, cursor, search, refreshKey]);


    // --------------------------------
    // Search
    // --------------------------------

    const handleSearch = (value) => {
        setSearch(value);
        setCursor(null);
        setCurrentBatch(1);
    };


    // --------------------------------
    // Pagination
    // --------------------------------

    const handleNextPage = () => {
        if (pagination.next_cursor) {
            setCursor(pagination.next_cursor);

            setCurrentBatch((previous) => previous + 1);
        }
    };

    const handlePreviousPage = () => {
        if (pagination.prev_cursor) {
            setCursor(pagination.prev_cursor);

            setCurrentBatch((previous) =>
                Math.max(1, previous - 1)
            );
        }
    };

    const handlePageSizeChange = (value) => {
        setLimit(Number(value));
        setCursor(null);
        setCurrentBatch(1);
    };


    // --------------------------------
    // Refresh Topics
    // --------------------------------

    const handleRefreshTopics = () => {
        setCursor(null);
        setCurrentBatch(1);

        setRefreshKey((previous) => previous + 1);
    };


    // --------------------------------
    // Row Numbering
    // --------------------------------

    const firstRow = topics.length > 0
        ? (currentBatch - 1) * limit + 1
        : 0;


    // --------------------------------
    // Table Columns
    // --------------------------------

    const topicColumns = [
        {
            key: "serial",
            label: "SL",
            render: (topic, index) => firstRow + index,
        },
        {
            key: "name",
            label: "Topic Name",
        },
        {
            key: "hosts",
            label: "Hosts",
            render: (topic) =>
                topic.hosts?.length
                    ? topic.hosts
                        .map((host) => host.name)
                        .join(", ")
                    : "No hosts",
        },
        {
            key: "room_count",
            label: "Rooms",
            render: (topic) => topic.room_count ?? 0,
        },
    ];


    // --------------------------------
    // Render
    // --------------------------------

    return (
        <div className="admin-section-page">

            <AdminPageHeader
                title="Topic Management"
                description="Manage all StudyBuddy topics."
                breadcrumbs={[
                    { label: "Home", to: "/" },
                    {
                        label: "Administration",
                        to: "/admin/dashboard",
                    },
                    { label: "Topic Management" },
                ]}
                actions={[
                    {
                        label: "Import Topics",
                        className: "admin-btn-secondary",
                        onClick: () => setShowBulkImport(true),
                        icon: <FaFileImport />,
                    },
                    {
                        label: "Add Topic",
                        className: "admin-btn-primary",
                        onClick: () => setShowAddTopic(true),
                        icon: <span>+</span>,
                    },
                ]}
            />

            <div className="admin-section-content">

                {/* Search */}

                <div className="admin-users-toolbar">
                    <AdminSearch
                        value={search}
                        onChange={handleSearch}
                        placeholder="Search topics by name or ID..."
                    />
                </div>


                {/* Topic Count */}

                <div className="admin-users-count">
                    Total topics:{" "}
                    <strong>{pagination.count || 0}</strong>
                </div>


                {/* Error */}

                {error && (
                    <div className="admin-error">
                        {error}

                        <button
                            type="button"
                            onClick={handleRefreshTopics}
                        >
                            Retry
                        </button>
                    </div>
                )}


                {/* Topics Table */}

                <AdminTable
                    columns={topicColumns}
                    data={topics}
                    rowKey="id"
                    emptyMessage={
                        loading
                            ? "Loading topics..."
                            : "No topics found."
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

            </div>


            {/* Add Topic Modal */}

            {showAddTopic && (
                <div className="admin-modal-backdrop">
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-topic-title"
                    >
                        <h2 id="add-topic-title">
                            Add Topic
                        </h2>

                        <p>
                            Topic creation form will be added next.
                        </p>

                        <button
                            type="button"
                            onClick={() => setShowAddTopic(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}


            {/* Bulk Import Modal */}

            {showBulkImport && (
                <BulkImportModal
                    entity="topics"
                    onClose={() => setShowBulkImport(false)}
                    onSuccess={handleRefreshTopics}
                />
            )}

        </div>
    );
}

export default TopicManagementPage;
