import api from "./axiosInstance";

const userService = {

    // Fetch a single user's profile
    async getUserById(userId) {
        const response = await api.get(`/users/${userId}/`);
        return response.data;
    },

    // Update a user's profile
    async updateUser(userId, userData) {
        const response = await api.patch(
            `/users/${userId}/update/`,
            userData
        );
        return response.data;
    },

};

export default userService;