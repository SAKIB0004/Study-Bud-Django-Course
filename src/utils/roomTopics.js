export function getRoomTopicIds(room) {
    const topics = Array.isArray(room?.topic_ids)
        ? room.topic_ids
        : Array.isArray(room?.topics)
            ? room.topics
            : [];

    return topics
        .map((topic) =>
            topic && typeof topic === "object" ? topic.id : topic
        )
        .filter((topicId) => topicId !== null && topicId !== undefined);
}

export function roomHasTopic(room, topicId) {
    return getRoomTopicIds(room).some(
        (roomTopicId) => String(roomTopicId) === String(topicId)
    );
}

export function countRoomsForTopic(rooms, topicId) {
    return rooms.filter((room) => roomHasTopic(room, topicId)).length;
}
