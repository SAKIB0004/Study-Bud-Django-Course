const API_BASE_URL = process.env.REACT_APP_API_URL;

function getImageUrl(imagePath) {
    // Default avatar from React public folder
    if (!imagePath) {
        return `${process.env.PUBLIC_URL}/images/avatar.svg`;
    }

    // Already an absolute URL
    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {
        return imagePath;
    }

    // Remove /api to get the Django server root
    const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

    return `${MEDIA_BASE_URL}${
        imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;
}

export default getImageUrl;