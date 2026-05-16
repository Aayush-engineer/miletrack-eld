from django.contrib import admin
from .models import TripLog


@admin.register(TripLog)
class TripLogAdmin(admin.ModelAdmin):
    list_display = ['current_location', 'pickup_location', 'dropoff_location',
                    'current_cycle_used', 'total_distance_miles', 'total_days', 'created_at']
    list_filter = ['created_at']
    search_fields = ['current_location', 'pickup_location', 'dropoff_location']
    readonly_fields = ['created_at']