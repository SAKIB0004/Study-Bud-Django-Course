const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const tokenStorage = {
    getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setTokens({ access, refresh }) {
        if (access) {
            localStorage.setItem(ACCESS_TOKEN_KEY, access);
        }

        if (refresh) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
        }
    },

    setAccessToken(access) {
        localStorage.setItem(ACCESS_TOKEN_KEY, access);
    },

    clearTokens() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
};

export default tokenStorage;