import axios from "axios";
import tokenStorage from "../storage/tokenStorage";

const BASE_URL = process.env.REACT_APP_API_URL;


const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach access token to every API request
api.interceptors.request.use(
    (config) => {
        const accessToken = tokenStorage.getAccessToken();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Shared refresh request prevents simultaneous requests
// from trying to refresh the same token independently.
let refreshPromise = null;

function refreshAccessToken() {
    if (!refreshPromise) {
        const refreshToken = tokenStorage.getRefreshToken();

        if (!refreshToken) {
            return Promise.reject(
                new Error("Refresh token not available")
            );
        }

        refreshPromise = axios
            .post(`${BASE_URL}/token/refresh/`, {
                refresh: refreshToken,
            })
            .then((response) => {
                const { access, refresh } = response.data;

                tokenStorage.setTokens({
                    access,
                    refresh,
                });

                return access;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

// Handle expired access tokens
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        const isUnauthorized = error.response?.status === 401;

        const isAuthEndpoint = [
            "/token/",
            "/token/refresh/",
            "/logout/",
        ].some((endpoint) =>
            originalRequest?.url?.includes(endpoint)
        );

        if (
            isUnauthorized &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthEndpoint
        ) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await refreshAccessToken();

                originalRequest.headers =
                    originalRequest.headers || {};

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);

            } catch (refreshError) {
                tokenStorage.clearTokens();

                window.dispatchEvent(
                    new Event("auth:session-expired")
                );

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;