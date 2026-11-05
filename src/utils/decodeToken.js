export function decodeToken(token) {
    try {
        const payload = token.split(".")[1];

        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const decoded = atob(base64);

        return JSON.parse(decoded);
    } catch (error) {
        console.error("Invalid JWT token:", error);
        return null;
    }
}