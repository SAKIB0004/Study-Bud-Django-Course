import api from "./axiosInstance";

const roomService = {

    // Fetch all rooms
    async getRooms() {
        const response = await api.get("/rooms/");
        return response.data;
    },

    // Fetch all topics
    async getTopics() {
        const response = await api.get("/topics/");
        return response.data;
    },

    // Fetch Users
    async getUsers() {
        const response = await api.get("/users/");
        return response.data;
    },

    // Create a new topic
    async createTopic(topicData) {
        const response = await api.post("/topics/", topicData);
        return response.data;
    },

    // Fetch a single room
    async getRoomById(roomId) {
        const response = await api.get(`/rooms/${roomId}/`);
        return response.data;
    },

    // Create a new room
    async createRoom(roomData) {
        const response = await api.post("/rooms/", roomData);
        return response.data;
    },

    // Update an existing room
    async updateRoom(roomId, roomData) {
        const response = await api.patch(`/rooms/${roomId}/update/`, roomData);
        return response.data;
    },

    // Delete a room
    async deleteRoom(roomId) {
        const response = await api.delete(`/rooms/${roomId}/delete/`);
        return response.data;
    },

    
    // Fetch messages belonging to a room
    async getMessages(roomId) {
    const response = await api.get(`/rooms/${roomId}/messages/`);
    return response.data;
    },

    // Fetch participants belonging to a room
    async getParticipants(roomId) {
    const response = await api.get(`/rooms/${roomId}/participants/`);
    return response.data;
    },

    // Create a message in a room
    async createMessage(roomId, messageData) {
    const response = await api.post(`/rooms/${roomId}/messages/create/`, messageData);
    return response.data;
    },


    // Delete message
    async deleteMessage(roomId, messageId) {
        const response = await api.delete(`/rooms/${roomId}/messages/${messageId}/delete/`);
        return response.data;
    },

};

export default roomService;