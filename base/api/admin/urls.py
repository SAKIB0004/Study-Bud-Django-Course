
from django.urls import path

from .views import (
    AdminDashboardView,
    AdminRoomListView,
    AdminRoomCreateView,
    AdminTopicListCreateView,
    AdminUserDetailView,
    AdminUserListCreateView,
    AdminBulkUserCreateView,
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

    #Bulk upload

    path("users/bulk-create/",AdminBulkUserCreateView.as_view(),name="admin-user-bulk-create",),
]

