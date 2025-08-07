from django.contrib import admin
from .models import ShortenedURL

@admin.register(ShortenedURL)
class ShortenedURLAdmin(admin.ModelAdmin):
    list_display = ('short_code', 'original_url', 'user', 'click_count', 'expires_at', 'created_at')
    search_fields = ('short_code', 'original_url')
    list_filter = ('user', 'created_at')

