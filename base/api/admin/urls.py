
from django.urls import path

from .views import (
    AdminDashboardView,
    AdminRoomListView,
    AdminRoomCreateView,
    AdminTopicListCreateView,
    AdminUserDetailView,
    AdminUserListCreateView

)


urlpatterns = [
    # Dashboard
    path("dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),

    # Room Management
    path("rooms/", AdminRoomListView.as_view(),name="admin-rooms"),

    # Create Room
    path("create-room/",AdminRoomCreateView.as_view(),name="admin-create-room"),

    # Topic Management
    path("topics/", AdminTopicListCreateView.as_view(), name="admin-topics"),

    #User management

    path("users/", AdminUserListCreateView.as_view(), name="admin-user-list-create"),

    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
]














































# AdminUserListView,
# AdminUserDetailView,
#
# AdminRoomListView,
# AdminRoomDetailView,
#
# AdminTopicListView,
# AdminTopicDetailView,

# # Users
# path("users/", AdminUserListView.as_view(), name="admin-users"),
# path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
#
# # Rooms
# path("rooms/", AdminRoomListView.as_view(), name="admin-rooms"),
# path("rooms/<int:pk>/",AdminRoomDetailView.as_view(), name="admin-room-detail"),
#
# # Topics
# path("topics/",AdminTopicListView.as_view(), name="admin-topics"),
# path("topics/<int:pk>/",AdminTopicDetailView.as_view(),name="admin-topic-detail"),