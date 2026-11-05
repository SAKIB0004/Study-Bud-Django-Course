import api from "./axiosInstance";

import tokenStorage from "../storage/tokenStorage";
import { decodeToken } from "../../utils/decodeToken";

const authService = {

    // User login
    async login(credentials) {
        // console.log("Sending login request:", credentials);
        const response =  await api.post("/token/", credentials);
        // console.log("Login API response:", response.data);
        return response.data;
    },

    // User registration
    async register(userData) {
        const response = await api.post("/users-create/", userData);
        return response.data;
    },

    // Get currently authenticated user

    async getCurrentUser() {
        const accessToken = tokenStorage.getAccessToken();
        
        if (!accessToken) {
            throw new Error("Access token not available");
        }

        const payload = decodeToken(accessToken);

        if (!payload || payload.user_id === undefined) {
            throw new Error("User ID not found in access token");
        }

        const response = await api.get(
            `/users/${payload.user_id}/`
        );
        return response.data;

    },

    // User logout

    async logout() {
        const refreshToken = tokenStorage.getRefreshToken();

        try{
            if (refreshToken) {
                await api.post("/logout/", {refresh: refreshToken,});
            }

        } finally {
            tokenStorage.clearTokens();
        }

    }

};

export default authService;
