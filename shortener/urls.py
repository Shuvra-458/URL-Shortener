from django.urls import path
from . import views
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [
    path('shorten/', views.create_short_url, name='create_short_url'),
    path('s/<str:short_code>/', views.redirect_view, name='redirect_view'),
    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),
    path('stats/', views.user_url_stats, name='user_url_stats'),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
]
