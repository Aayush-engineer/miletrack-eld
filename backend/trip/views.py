import logging
from datetime import datetime, timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TripRequestSerializer
from .services.geocoding import geocode_location
from .services.routing import get_route, interpolate_coordinates_along_route
from .services.hos_calculator import (
    HOSCalculator,
    AVERAGE_SPEED_MPH,
    OFF_DUTY_RESET_HOURS,  
    RESTART_HOURS,           
    FUEL_STOP_DURATION_HOURS, 
)
from .models import TripLog

logger = logging.getLogger(__name__)

FUEL_STOP_INTERVAL_MILES = 1000.0


class TripPlanView(APIView):
    def post(self, request):
        serializer = TripRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid request data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        current_location_str = data['current_location']
        pickup_location_str = data['pickup_location']
        dropoff_location_str = data['dropoff_location']
        current_cycle_used = data['current_cycle_used']

        try:
            current_geo = geocode_location(current_location_str)
            pickup_geo = geocode_location(pickup_location_str)
            dropoff_geo = geocode_location(dropoff_location_str)
        except ValueError as e:
            return Response(
                {'error': 'Geocoding failed', 'details': str(e)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
        except Exception as e:
            logger.exception("Geocoding service error")
            return Response(
                {'error': 'Geocoding service unavailable', 'details': str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        waypoints = [current_geo, pickup_geo, dropoff_geo]
        try:
            route_data = get_route(waypoints)
        except ValueError as e:
            return Response(
                {'error': 'Routing failed', 'details': str(e)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
        except Exception as e:
            logger.exception("OSRM routing error")
            return Response(
                {'error': 'Routing service unavailable', 'details': str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        hos_segments = []
        for leg in route_data['legs']:
            hos_segments.append((
                leg['distance_miles'],
                leg['from'],
                leg['to'],
            ))

        now = datetime.now()
        trip_start = datetime(now.year, now.month, now.day, 6, 0, 0)

        calculator = HOSCalculator(
            segments=hos_segments,
            current_cycle_used_hours=current_cycle_used,
            trip_start_datetime=trip_start,
        )
        daily_logs = calculator.calculate()

        map_stops = self._build_map_stops(daily_logs, route_data)

        map_waypoints = [
            {
                'name': current_geo['name'],
                'lat': current_geo['lat'],
                'lng': current_geo['lng'],
                'type': 'start',
            },
            {
                'name': pickup_geo['name'],
                'lat': pickup_geo['lat'],
                'lng': pickup_geo['lng'],
                'type': 'pickup',
            },
            {
                'name': dropoff_geo['name'],
                'lat': dropoff_geo['lat'],
                'lng': dropoff_geo['lng'],
                'type': 'dropoff',
            },
        ]

        try:
            TripLog.objects.create(
                current_location=current_geo['name'],
                pickup_location=pickup_geo['name'],
                dropoff_location=dropoff_geo['name'],
                current_cycle_used=current_cycle_used,
                total_distance_miles=route_data['total_distance_miles'],
                total_days=len(daily_logs),
            )
        except Exception as e:
            logger.warning(f"Failed to save trip log: {e}")

        response_data = {
            'route': {
                'total_distance_miles': route_data['total_distance_miles'],
                'total_estimated_hours': route_data['total_estimated_hours'],
                'legs': route_data['legs'],
                'waypoints': map_waypoints,
                'stops': map_stops,
                'polyline': route_data['polyline'],
            },
            'daily_logs': daily_logs,
        }

        return Response(response_data, status=status.HTTP_200_OK)

    def _build_map_stops(self, daily_logs: list[dict], route_data: dict) -> list[dict]:
        stops = []
        polyline = route_data.get('polyline', [])
        total_miles = route_data.get('total_distance_miles', 1)
        total_hours = route_data.get('total_estimated_hours', 1)

        cumulative_drive_hours = 0.0

        for day_log in daily_logs:
            for seg in day_log.get('segments', []):
                seg_status = seg['status']
                seg_duration = seg['duration_hours']

                if seg_status == 'driving':
                    cumulative_drive_hours += seg_duration
                    continue

                if seg_status in ('off_duty',) and seg_duration >= 8.0:
                    progress = min(cumulative_drive_hours / max(total_hours, 1), 1.0)
                    miles_at_stop = progress * total_miles
                    coords = interpolate_coordinates_along_route(polyline, miles_at_stop, total_miles)

                    if seg_duration >= 30.0:
                        label            = '34-Hour Restart'
                        display_duration = RESTART_HOURS        # always 34h
                    else:
                        label            = '10-Hour Rest'
                        display_duration = OFF_DUTY_RESET_HOURS # always 10h

                    stops.append({
                        'type': 'rest',
                        'label': label,
                        'lat': coords[0],
                        'lng': coords[1],
                        'arrival_time': f"{day_log['date']}T{seg['start']}:00",
                        'duration_minutes': int(display_duration * 60),
                        'duration_hours': display_duration,
                    })

                elif seg_status == 'on_duty_not_driving' and 'Fuel' in seg.get('location', ''):
                    # Fuel stop
                    progress = min(cumulative_drive_hours / max(total_hours, 1), 1.0)
                    miles_at_stop = progress * total_miles
                    coords = interpolate_coordinates_along_route(polyline, miles_at_stop, total_miles)

                    stops.append({
                        'type': 'fuel',
                        'label': 'Fuel Stop',
                        'lat': coords[0],
                        'lng': coords[1],
                        'arrival_time': f"{day_log['date']}T{seg['start']}:00",
                        'duration_minutes': int(seg_duration * 60),
                        'duration_hours': seg_duration,
                    })

        return stops