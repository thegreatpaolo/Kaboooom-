from django.urls import path
from . import views

urlpatterns = [
    path('rooms/create/', views.create_room),
    path('rooms/<str:code>/', views.room_detail),
    path('rooms/<str:code>/close/', views.close_room),
]