from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from datetime import timedelta
from .models import ShortenedURL
import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication


@csrf_exempt
def create_short_url(request):
    if request.method != 'POST':
        return HttpResponseBadRequest("Only POST method is allowed.")
    try:
        data = json.loads(request.body)
        original_url = data.get('original_url')
        custom_code = data.get('custom_code')
        expires_in_days = data.get('expires_in_days', None)

        if not original_url:
            return JsonResponse({'error': 'Original URL is required.'}, status = 400)
        if custom_code and ShortenedURL.objects.filter(short_code=custom_code).exists():
            return JsonResponse({'error': 'Custom code already exists.'}, status=400)
        url = ShortenedURL(
            original_url = original_url,
            short_code = custom_code or None,
            user = request.user if request.user.is_authenticated else None,
        )

        if expires_in_days:
            url.expires_at = timezone.now() + timedelta(days=int(expires_in_days))

        url.save()

        return JsonResponse({
            'short_url': f"http://127.0.0.1:8000/s/{url.short_code}",
            'original_url': url.original_url,
            'expires_at': url.expires_at,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
 
def redirect_view(request, short_code):
    try:
        url = ShortenedURL.objects.get(short_code=short_code)
    except ShortenedURL.DoesNotExist:
        return JsonResponse({'error': 'URL not found'}, status=404)

    if url.is_expired():
        return JsonResponse({'error': 'URL has expired'}, status=410)
    
    url.click_count += 1
    url.save()
    return HttpResponseRedirect(url.original_url)

@csrf_exempt
def register_user(request):
    if request.method != 'POST':
        return HttpResponseBadRequest("Only POST method is allowed.")
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")

    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=400)
    user = User.objects.create_user(username=username, password=password)
    Token.objects.create(user=user)
    return JsonResponse({"message": "User registered successfully"})

@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return HttpResponseBadRequest("Only POST method is allowed.")
    
    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return JsonResponse({"token": token.key})
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def logout_user(request):
    logout(request)
    return JsonResponse({"message": "Logged out"})

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@login_required
def user_url_stats(request):
    urls = ShortenedURL.objects.filter(user=request.user).values(
        'original_url', 'short_code', 'click_count', 'created_at', 'expires_at'
    )
    return JsonResponse(list(urls), safe=False)


# Create your views here.


