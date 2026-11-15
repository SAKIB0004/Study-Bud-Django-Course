import { useCallback, useEffect, useRef, useState } from "react";

import AdminPageHeader from "../../components/admin/common/AdminPageHeader";
import AdminTable from "../../components/admin/common/AdminTable";
import AdminLoading from "../../components/admin/common/AdminLoading";
import AdminEmptyState from "../../components/admin/common/AdminEmptyState";
import AdminErrorState from "../../components/admin/common/AdminErrorState";
import AdminModal from "../../components/admin/common/AdminModal";
import AdminPagination from "../../components/admin/common/AdminPagination";
import AdminSearch from "../../components/admin/common/AdminSearch";
import AdminFilter from "../../components/admin/common/AdminFilter";

import AdminRoomForm from "../../components/admin/rooms/AdminRoomForm";
import AdminRoomMessages from "../../components/admin/rooms/AdminRoomMessages";

import roomService from "../../services/api/roomService";

import "../../assets/styles/admin/admin-common.css";

import { FaRegCommentDots } from "react-icons/fa";


function RoomManagementPage() {
  
    // Room data
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Pagination
    const [limit, setLimit] = useState(25);
    const [currentBatch, setCurrentBatch] = useState(1);

    const [pagination, setPagination] = useState({
        count: 0,
        next_cursor: null,
        prev_cursor: null,
        has_more: false,
        has_prev: false,
        next_url: null,
        prev_url: null,
    });

    const requestIdRef = useRef(0);

    // Room filters
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [selectedTopic, setSelectedTopic] = useState("");
    const [selectedHostFilter, setSelectedHostFilter] = useState("");

    const [filterTopics, setFilterTopics] = useState([]);
    const [filterUsers, setFilterUsers] = useState([]);

    // Add Room modal and form
    const [showAddRoom, setShowAddRoom] = useState(false);

    const [users, setUsers] = useState([]);
    const [topics, setTopics] = useState([]);

    const [roomName, setRoomName] = useState("");
    const [description, setDescription] = useState("");

    const [selectedHost, setSelectedHost] = useState("");
    const [selectedTopics, setSelectedTopics] = useState([]);

    const [formLoading, setFormLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [addingTopic, setAddingTopic] = useState(false);
    const [formError, setFormError] = useState("");

    // Messages modal
    const [showMessages, setShowMessages] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState("");

    // Fetch rooms
    const fetchRooms = useCallback(async (cursor = null, batch = 1) => {

        const requestId = ++requestIdRef.current;

        try {
            setLoading(true);
            setError("");

            const filters = {
                search: debouncedSearch,
                topic: selectedTopic,
                host: selectedHostFilter,
            };

            const response = await roomService.getAdminRooms(
                limit,
                cursor,
                filters
            );

            // Ignore outdated requests
            if (requestId !== requestIdRef.current) return;

            setRooms(response.data || []);
            setPagination(response.pagination || {});
            setCurrentBatch(batch);

        } catch (error) {

            console.error("Failed to fetch rooms:", error);

            if (requestId === requestIdRef.current) {
                setError(
                    error.response?.data?.detail ||
                    "Failed to load rooms."
                );
            }

        } finally {

            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }

    }, [
        limit,
        debouncedSearch,
        selectedTopic,
        selectedHostFilter,
    ]);


    // Fetch first batch when filters change

    useEffect(() => {

        fetchRooms(null, 1);

        return () => {
            // Invalidate pending requests
            requestIdRef.current += 1;
        };

    }, [fetchRooms]);

    // Load filter dropdown options

    useEffect(() => {

        let isActive = true;

        const loadFilterOptions = async () => {

            try {

                const [usersResponse, topicsResponse] =
                    await Promise.all([
                        roomService.getUsers(),
                        roomService.getTopics(),
                    ]);

                const usersData = Array.isArray(usersResponse)
                    ? usersResponse
                    : usersResponse?.results || [];

                const topicsData = Array.isArray(topicsResponse)
                    ? topicsResponse
                    : topicsResponse?.results || [];

                if (!isActive) return;

                setFilterUsers(usersData);
                setFilterTopics(topicsData);

            } catch (error) {

                console.error(
                    "Failed to load room filter options:",
                    error
                );
            }
        };

        loadFilterOptions();

        return () => {
            isActive = false;
        };

    }, []);

    // Debounce search

    useEffect(() => {

        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, 400);

        return () => clearTimeout(timer);

    }, [searchQuery]);

    // Filter dropdown options

    const topicOptions = [
        {
            value: "",
            label: "All Topics",
        },
        ...filterTopics.map((topic) => ({
            value: String(topic.id),
            label: topic.name,
        })),
    ];

    const hostOptions = [
        {
            value: "",
            label: "All Hosts",
        },
        ...filterUsers.map((user) => ({
            value: String(user.id),
            label:
                user.name ||
                user.username ||
                user.email ||
                `User ${user.id}`,
        })),
    ];

    // Clear filters

    const handleClearFilters = () => {

        setSearchQuery("");
        setDebouncedSearch("");

        setSelectedTopic("");
        setSelectedHostFilter("");
    };

    const hasActiveFilters = Boolean(
        searchQuery.trim() ||
        debouncedSearch ||
        selectedTopic ||
        selectedHostFilter
    );


    // Pagination handlers

    const handleNext = () => {

        if (!pagination.next_cursor || loading) return;

        fetchRooms(
            pagination.next_cursor,
            currentBatch + 1
        );
    };

    const handlePrevious = () => {

        if (!pagination.prev_cursor || loading) return;

        fetchRooms(
            pagination.prev_cursor,
            Math.max(1, currentBatch - 1)
        );
    };

    const handleLimitChange = (newLimit) => {

        setLimit(Number(newLimit));
        setCurrentBatch(1);
    };

    
    // Load Add Room form data

    useEffect(() => {

        if (!showAddRoom) return;

        let isActive = true;

        const fetchFormData = async () => {

            try {

                setFormLoading(true);
                setFormError("");

                const [usersResponse, topicsResponse] =
                    await Promise.all([
                        roomService.getUsers(),
                        roomService.getTopics(),
                    ]);

                const usersData = Array.isArray(usersResponse)
                    ? usersResponse
                    : usersResponse?.results || [];

                const topicsData = Array.isArray(topicsResponse)
                    ? topicsResponse
                    : topicsResponse?.results || [];

                if (isActive) {

                    setUsers(
                        usersData.filter((user) => user.is_active)
                    );

                    setTopics(topicsData);
                }

            } catch (error) {

                console.error(
                    "Failed to load room form data:",
                    error
                );

                if (isActive) {
                    setFormError(
                        error.response?.data?.detail ||
                        "Failed to load users and topics."
                    );
                }

            } finally {

                if (isActive) {
                    setFormLoading(false);
                }
            }
        };

        fetchFormData();

        return () => {
            isActive = false;
        };

    }, [showAddRoom]);

    // Create topic

    const handleCreateTopic = async (topicName) => {

        try {

            setAddingTopic(true);
            setFormError("");

            const createdTopic = await roomService.createTopic({name: topicName,});

            setTopics((previousTopics) => [
                ...previousTopics,
                createdTopic,
            ]);

            // Also update the filter options
            setFilterTopics((previousTopics) => [
                ...previousTopics,
                createdTopic,
            ]);

            return createdTopic;

        } catch (error) {

            console.error("Failed to create topic:", error);

            const responseData = error.response?.data;

            setFormError(
                responseData?.detail ||
                responseData?.name?.[0] ||
                "Unable to create topic."
            );

            return null;

        } finally {

            setAddingTopic(false);
        }
    };

    // Reset room form

    const resetRoomForm = () => {

        setRoomName("");
        setDescription("");
        setSelectedHost("");
        setSelectedTopics([]);
        setFormError("");
    };

    const handleCloseAddRoom = () => {

        if (submitting) return;

        setShowAddRoom(false);
        resetRoomForm();
    };

    // Create room

    const handleAddRoom = async (event) => {

        event.preventDefault();

        if (
            !roomName.trim() ||
            !selectedHost ||
            selectedTopics.length === 0
        ) {

            setFormError("Please complete all required fields.");

            return;
        }

        const roomData = {
            name: roomName.trim(),
            description: description.trim(),
            host: Number(selectedHost),
            topics: selectedTopics.map(Number),
        };

        try {

            setSubmitting(true);
            setFormError("");

            await roomService.createAdminRoom(roomData);

            resetRoomForm();
            setShowAddRoom(false);

            // Refresh first batch
            await fetchRooms(null, 1);

        } catch (error) {

            console.error("Failed to create room:", error);

            const errorData = error.response?.data;

            if (typeof errorData === "string") {

                setFormError(errorData);

            } else if (
                errorData &&
                typeof errorData === "object"
            ) {

                const errorMessages = Object.values(errorData).flat().join(" ");

                setFormError(errorMessages || "Failed to create room.");

            } else {
                setFormError("Something went wrong. Please try again.");
            }

        } finally {

            setSubmitting(false);
        }
    };

    // View room messages

    const handleViewMessages = (room) => {

        setSelectedRoom(room);
        setMessages(room.messages || []);
        setMessagesError("");
        setMessagesLoading(false);
        setShowMessages(true);
    };

    const handleCloseMessages = () => {

        setShowMessages(false);
        setSelectedRoom(null);
        setMessages([]);
        setMessagesError("");
    };

    // Row numbering

    const firstRow = rooms.length > 0
        ? (currentBatch - 1) * limit + 1
        : 0;


    // Table columns

    const roomColumns = [

        {
            key: "serial",
            label: "SL",
            render: (index) => firstRow + index,
        },

        {
            key: "name",
            label: "Room",
        },

        {
            key: "topic_name",
            label: "Topic",
            render: (room) => room.topic_names?.join(", ") || "No topic",
        },

        {
            key: "host_name",
            label: "Host",
            render: (room) => room.host_name || "No host",
        },

        {
            key: "participants_count",
            label: "Participant Count",
        },

        {
            key: "participant_details",
            label: "Participants",

            render: (room) => {

                const participants = room.participant_details || [];

                if (participants.length === 0) {
                    return "No participants";
                }

                const visibleNames = participants.slice(0, 3).map((user) => user.username);

                const remaining = participants.length - visibleNames.length;

                return (
                    <span title={participants.map((user) => user.username).join(", ")}>
                        {visibleNames.join(", ")}
                        {remaining > 0 && ` +${remaining}`}
                    </span>
                );
            },
        },

        {
            key: "messages_count",
            label: "Messages",

            render: (room) => (

                <button
                    type="button"
                    className="admin-message-icon-btn"
                    onClick={() => handleViewMessages(room)}
                    aria-label={`View ${room.messages_count} messages`}
                    title="View messages"
                >
                    <FaRegCommentDots />

                    {room.messages_count > 0 && (
                        <span className="admin-message-count">
                            {room.messages_count}
                        </span>
                    )}

                </button>
            ),
        },
    ];

    // Render

    return (

        <div className="admin-section-page">

            <AdminPageHeader
                title="Room Management"
                description="Manage all StudyBuddy rooms."
                breadcrumbs={[
                    { label: "Home", to: "/" },
                    {
                        label: "Administration",
                        to: "/admin/dashboard",
                    },
                    { label: "Room Management" },
                ]}
                actions={[
                    {
                        label: "Add Room",
                        className: "admin-btn-primary",
                        onClick: () => setShowAddRoom(true),
                        icon: <span>+</span>,
                    },
                ]}
            />

            <div className="admin-section-content">

                {/*Room count*/}

                <div className="admin-room-count">
                    <p>Total Rooms: {pagination.count ?? 0}</p>
                </div>

                {/* Search and filters */}

                <div className="admin-filters">

                    <div className="admin-filter-search">

                        <AdminSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search rooms by name..."
                        />

                    </div>

                    <AdminFilter
                        label="Topic"
                        value={selectedTopic}
                        onChange={setSelectedTopic}
                        options={topicOptions}
                    />

                    <AdminFilter
                        label="Host"
                        value={selectedHostFilter}
                        onChange={setSelectedHostFilter}
                        options={hostOptions}
                    />

                    <button
                        type="button"
                        className="admin-clear-filters"
                        onClick={handleClearFilters}
                        disabled={!hasActiveFilters}
                    >
                        Clear filters
                    </button>

                </div>

                {/* Room table */}

                {loading ? ( <AdminLoading message="Loading rooms..." />) : error ? (

                    <AdminErrorState
                        message={error}
                        onRetry={() => fetchRooms(null, 1)}
                    />

                ) : rooms.length === 0 ? (

                    <AdminEmptyState
                        title={
                            hasActiveFilters
                                ? "No matching rooms found"
                                : "No rooms found"
                        }
                        message={
                            hasActiveFilters
                                ? "Try changing your search or filters."
                                : "There are currently no rooms to display."
                        }
                        action={
                            hasActiveFilters
                                ? handleClearFilters
                                : () => setShowAddRoom(true)
                        }
                        actionLabel={
                            hasActiveFilters
                                ? "Clear filters"
                                : "Create Room"
                        }
                    />

                ) : (

                    <AdminTable
                        columns={roomColumns}
                        data={rooms}
                        emptyMessage="No rooms available."
                    />

                )}

            </div>

            {/* =====================================
                Pagination
            ===================================== */}

            <AdminPagination
                pageSize={limit}
                onPageSizeChange={handleLimitChange}
                hasPrevious={pagination.has_prev}
                hasNext={pagination.has_more}
                onPrevious={handlePrevious}
                onNext={handleNext}
                loading={loading}
            />

            {/* Messages Modal */}

            <AdminModal
                isOpen={showMessages && Boolean(selectedRoom)}
                onClose={handleCloseMessages}
                title={`${selectedRoom?.name || "Room"} - Messages`}
            >

                <p>{messages.length} messages</p>

                <AdminRoomMessages
                    messages={messages}
                    loading={messagesLoading}
                    error={messagesError}
                />

            </AdminModal>

            {/* Add Room Modal */}

            <AdminModal
                isOpen={showAddRoom}
                onClose={handleCloseAddRoom}
                title="Add New Room"
                closeDisabled={submitting}
            >

                <AdminRoomForm
                    roomName={roomName}
                    setRoomName={setRoomName}
                    description={description}
                    setDescription={setDescription}
                    users={users}
                    topics={topics}
                    selectedHost={selectedHost}
                    setSelectedHost={setSelectedHost}
                    selectedTopics={selectedTopics}
                    setSelectedTopics={setSelectedTopics}
                    onCreateTopic={handleCreateTopic}
                    formLoading={formLoading}
                    submitting={submitting}
                    addingTopic={addingTopic}
                    formError={formError}
                    onSubmit={handleAddRoom}
                    onCancel={handleCloseAddRoom}
                />

            </AdminModal>

        </div>
    );
}

export default RoomManagementPage;
