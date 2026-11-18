import api from "./axiosInstance";

const uploadFile = async (endpoint, file) => {
    if (!file) {
        throw new Error("Please select a file first.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(endpoint, formData);

    return response.data;
};

const adminBulkImportService = {
    importUsers: (file) =>
        uploadFile("/admin/users/bulk-create/", file),

    importRooms: (file) =>
        uploadFile("/admin/rooms/bulk-create/", file),

    importTopics: (file) =>
        uploadFile("/admin/topics/bulk-create/", file),
};

export default adminBulkImportService;