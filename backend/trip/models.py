from django.db import models


class TripLog(models.Model):
    """Stores a record of each planned trip for history/auditing."""
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    current_cycle_used = models.FloatField()
    total_distance_miles = models.FloatField(null=True, blank=True)
    total_days = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    response_json = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.current_location} → {self.pickup_location} → {self.dropoff_location} ({self.created_at.date()})"