const API_BASE_URL = "http://127.0.0.1:8000";

function getImageUrl(imagePath) {

    if (!imagePath) {
        return `${API_BASE_URL}/images/avatar.svg`;
    }

    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {
        return imagePath;
    }

    return `${API_BASE_URL}${
        imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;
}

export default getImageUrl;