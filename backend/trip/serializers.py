from rest_framework import serializers


class TripRequestSerializer(serializers.Serializer):
    current_location = serializers.CharField(max_length=255, help_text="Driver's current location (city, state)")
    pickup_location = serializers.CharField(max_length=255, help_text="Pickup location (city, state)")
    dropoff_location = serializers.CharField(max_length=255, help_text="Dropoff location (city, state)")
    current_cycle_used = serializers.FloatField(
        min_value=0.0,
        max_value=70.0,
        help_text="Hours already used in the driver's current 8-day cycle (0-70)"
    )

    def validate(self, data):
        """Ensure all three locations are distinct."""
        locations = [
            data.get('current_location', '').strip().lower(),
            data.get('pickup_location', '').strip().lower(),
            data.get('dropoff_location', '').strip().lower(),
        ]
        if locations[1] == locations[2]:
            raise serializers.ValidationError("Pickup and dropoff locations must be different.")
        return data


class SegmentSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        'off_duty', 'sleeper_berth', 'driving', 'on_duty_not_driving'
    ])
    start = serializers.CharField()
    end = serializers.CharField()
    location = serializers.CharField()
    duration_hours = serializers.FloatField()


class TotalHoursSerializer(serializers.Serializer):
    off_duty = serializers.FloatField()
    sleeper_berth = serializers.FloatField()
    driving = serializers.FloatField()
    on_duty_not_driving = serializers.FloatField()


class DayLogSerializer(serializers.Serializer):
    day = serializers.IntegerField()
    date = serializers.CharField()
    from_location = serializers.CharField()
    to_location = serializers.CharField()
    total_miles_today = serializers.FloatField()
    segments = SegmentSerializer(many=True)
    total_hours = TotalHoursSerializer()
    remarks = serializers.ListField(child=serializers.CharField())
    cycle_hours_at_end_of_day = serializers.FloatField()