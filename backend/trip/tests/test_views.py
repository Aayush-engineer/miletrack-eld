from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status


MOCK_GEO_CHICAGO = {'name': 'Chicago, IL', 'lat': 41.8781, 'lng': -87.6298}
MOCK_GEO_DALLAS = {'name': 'Dallas, TX', 'lat': 32.7767, 'lng': -96.7970}
MOCK_GEO_LA = {'name': 'Los Angeles, CA', 'lat': 34.0522, 'lng': -118.2437}

MOCK_ROUTE = {
    'legs': [
        {'from': 'Chicago, IL', 'to': 'Dallas, TX', 'distance_miles': 921.0, 'drive_time_hours': 16.7},
        {'from': 'Dallas, TX', 'to': 'Los Angeles, CA', 'distance_miles': 1435.0, 'drive_time_hours': 26.1},
    ],
    'polyline': [[41.8781, -87.6298], [36.0, -95.0], [32.7767, -96.7970], [34.0522, -118.2437]],
    'total_distance_miles': 2356.0,
    'total_estimated_hours': 42.8,
}


class TripPlanViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/trip/plan/'

    def test_missing_required_fields_returns_400(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_invalid_cycle_hours_returns_400(self):
        payload = {
            'current_location': 'Chicago, IL',
            'pickup_location': 'Dallas, TX',
            'dropoff_location': 'Los Angeles, CA',
            'current_cycle_used': 75.0,  # Invalid: above 70
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_negative_cycle_hours_returns_400(self):
        payload = {
            'current_location': 'Chicago, IL',
            'pickup_location': 'Dallas, TX',
            'dropoff_location': 'Los Angeles, CA',
            'current_cycle_used': -5.0,
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('trip.views.get_route')
    @patch('trip.views.geocode_location')
    def test_successful_trip_plan_returns_200(self, mock_geocode, mock_route):
        mock_geocode.side_effect = [MOCK_GEO_CHICAGO, MOCK_GEO_DALLAS, MOCK_GEO_LA]
        mock_route.return_value = MOCK_ROUTE

        payload = {
            'current_location': 'Chicago, IL',
            'pickup_location': 'Dallas, TX',
            'dropoff_location': 'Los Angeles, CA',
            'current_cycle_used': 20.0,
        }
        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('route', response.data)
        self.assertIn('daily_logs', response.data)

    @patch('trip.views.get_route')
    @patch('trip.views.geocode_location')
    def test_response_contains_required_route_fields(self, mock_geocode, mock_route):
        mock_geocode.side_effect = [MOCK_GEO_CHICAGO, MOCK_GEO_DALLAS, MOCK_GEO_LA]
        mock_route.return_value = MOCK_ROUTE

        payload = {
            'current_location': 'Chicago, IL',
            'pickup_location': 'Dallas, TX',
            'dropoff_location': 'Los Angeles, CA',
            'current_cycle_used': 0.0,
        }
        response = self.client.post(self.url, payload, format='json')

        route = response.data['route']
        required_fields = ['total_distance_miles', 'total_estimated_hours', 'legs', 'waypoints', 'polyline']
        for field in required_fields:
            self.assertIn(field, route, f"Route missing field: {field}")

    @patch('trip.views.get_route')
    @patch('trip.views.geocode_location')
    def test_daily_logs_have_required_structure(self, mock_geocode, mock_route):
        mock_geocode.side_effect = [MOCK_GEO_CHICAGO, MOCK_GEO_DALLAS, MOCK_GEO_LA]
        mock_route.return_value = MOCK_ROUTE

        payload = {
            'current_location': 'Chicago, IL',
            'pickup_location': 'Dallas, TX',
            'dropoff_location': 'Los Angeles, CA',
            'current_cycle_used': 0.0,
        }
        response = self.client.post(self.url, payload, format='json')

        self.assertGreater(len(response.data['daily_logs']), 0)
        log = response.data['daily_logs'][0]

        required_log_fields = [
            'day', 'date', 'from_location', 'to_location',
            'total_miles_today', 'segments', 'total_hours', 'remarks',
            'cycle_hours_at_end_of_day'
        ]
        for field in required_log_fields:
            self.assertIn(field, log, f"Daily log missing field: {field}")

    @patch('trip.views.geocode_location')
    def test_geocoding_failure_returns_error(self, mock_geocode):
        mock_geocode.side_effect = ValueError("Could not geocode 'Nonexistent Place'")

        payload = {
            'current_location': 'Nonexistent Place',
            'pickup_location': 'Dallas, TX',
            'dropoff_location': 'Los Angeles, CA',
            'current_cycle_used': 0.0,
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn('error', response.data)