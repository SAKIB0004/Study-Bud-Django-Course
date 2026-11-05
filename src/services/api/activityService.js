
import api from "./axiosInstance";

const activityService = {
    // Fetch all recent activity
    async getActivity() {
        const response = await api.get("/activity/");
        return response.data;
    },
};

export default activityService;
