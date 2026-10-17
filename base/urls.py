from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name="home"),

    path('room/<str:pk>', views.room, name="room"),

    path('about/', views.about, name="about"),

    path('create-room/', views.create_room, name="create_room"),


]