
import api from "./axiosInstance";

const adminUserService = {

    async getUsers({
        limit = 25,
        cursor = null,
        search = "",
        role = "",
        status = "",
        superuser = "",
    } = {}) {
        const params = { limit };

        if (cursor) params.cursor = cursor;
        if (search.trim()) params.search = search.trim();

        if (role) params.role = role;
        if (status) params.is_active = status;
        if (superuser) params.is_superuser = superuser;

        const response = await api.get("/admin/users/", { params });

        return response.data;
    },

    async getUserById(userId) {
        const response = await api.get(`/admin/users/${userId}/`);
        return response.data;
    },

    async createUser(userData) {
        const response = await api.post("/admin/users/", userData);
        return response.data;
    },

    async updateUser(userId, userData) {
        const response = await api.patch(`/admin/users/${userId}/`, userData);
        return response.data;
    },

    async deleteUser(userId) {
        const response = await api.delete(`/admin/users/${userId}/`);
        return response.data;
    },
};

export default adminUserService;
