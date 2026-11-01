from django.urls import path
# from rest_framework.authtoken.views import obtain_auth_token
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # path('token/', obtain_auth_token),
    path('', views.get_routes),

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('users/', views.get_users),
    path('users/<str:pk>/', views.get_user),
    path('users-create/', views.create_user),

    path('rooms/', views.get_rooms), # GET, POST
    path('rooms/<str:pk>/', views.get_room),
    path('rooms/<str:pk>/update/', views.update_room),

    path('topics/', views.get_topics), # GET, POST
    path('topics/<str:pk>/', views.get_topic),


]