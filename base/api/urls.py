from django.urls import path, include
# from rest_framework.authtoken.views import obtain_auth_token
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # API information
    path('', views.get_routes),

    # Authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.logout_user),

    #Users
    path('users/', views.get_users),
    path('users/<str:pk>/', views.get_user),
    path('users-create/', views.create_user),
    path('users/<str:pk>/update/', views.update_user),


    #Roles
    path('roles/', views.get_roles),
    # path('users/roles/create/', views.create_role),

    # Rooms
    path('rooms/', views.get_rooms), # GET, POST
    path('rooms/<str:pk>/', views.get_room),
    path('rooms/<str:pk>/update/', views.update_room),
    path('rooms/<str:pk>/delete/', views.delete_room),

    # Messages
    path('rooms/<str:pk>/messages/', views.get_messages),
    path('rooms/<str:pk>/messages/create/', views.create_message),
    path('rooms/<str:pk>/messages/<str:message_id>/delete/', views.delete_message),

    # Participants
    path('rooms/<str:pk>/participants/', views.get_participants),

    # Topics
    path('topics/', views.get_topics), # GET, POST
    path('topics/<str:pk>/', views.get_topic),

    # Activity
    path('activity/', views.get_activity),

    # Home
    path('home/', views.get_home),

    #Admin
    path("admin/", include("base.api.admin.urls")),
]