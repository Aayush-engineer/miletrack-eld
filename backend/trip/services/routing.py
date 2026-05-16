import logging
import requests

logger = logging.getLogger(__name__)

OSRM_BASE_URL = "http://router.project-osrm.org/route/v1/driving"
AVERAGE_SPEED_MPH = 55.0  
METERS_PER_MILE = 1609.344


def get_route(waypoints: list[dict]) -> dict:
   if len(waypoints) < 2:
        raise ValueError("At least 2 waypoints required for routing.")

    coord_string = ';'.join(
        f"{wp['lng']},{wp['lat']}" for wp in waypoints
    )
    url = f"{OSRM_BASE_URL}/{coord_string}"

    params = {
        'overview': 'full',       
        'geometries': 'polyline', 
        'steps': 'false',
        'annotations': 'false',
    }

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        if data.get('code') != 'Ok':
            raise ValueError(
                f"OSRM routing error: {data.get('message', 'Unknown error')}. "
                f"Code: {data.get('code', 'Unknown')}"
            )

        route = data['routes'][0]
        legs_data = route['legs']
        encoded_polyline = route['geometry']

        # Decode the OSRM encoded polyline to [[lat, lng], ...]
        polyline_coords = decode_polyline(encoded_polyline)

        # Build leg summaries
        legs = []
        total_distance_meters = 0

        for i, leg in enumerate(legs_data):
            distance_meters = leg['distance']
            distance_miles = distance_meters / METERS_PER_MILE
            drive_time_hours = distance_miles / AVERAGE_SPEED_MPH
            total_distance_meters += distance_meters

            legs.append({
                'from': waypoints[i]['name'],
                'to': waypoints[i + 1]['name'],
                'distance_miles': round(distance_miles, 1),
                'drive_time_hours': round(drive_time_hours, 2),
            })

        total_distance_miles = total_distance_meters / METERS_PER_MILE
        total_estimated_hours = total_distance_miles / AVERAGE_SPEED_MPH

        return {
            'legs': legs,
            'polyline': polyline_coords,
            'total_distance_miles': round(total_distance_miles, 1),
            'total_estimated_hours': round(total_estimated_hours, 2),
        }

    except requests.RequestException as e:
        logger.error(f"OSRM API error: {e}")
        raise requests.RequestException(
            f"Routing service unavailable. Please try again later. Error: {str(e)}"
        )


def decode_polyline(encoded: str, precision: int = 5) -> list[list[float]]:
    coordinates = []
    index = 0
    lat = 0
    lng = 0
    factor = 10 ** precision

    while index < len(encoded):
        # Decode latitude
        lat_delta, index = _decode_value(encoded, index)
        lat += lat_delta

        # Decode longitude
        lng_delta, index = _decode_value(encoded, index)
        lng += lng_delta

        coordinates.append([lat / factor, lng / factor])

    return coordinates


def _decode_value(encoded: str, index: int) -> tuple[int, int]:
    result = 0
    shift = 0

    while True:
        byte = ord(encoded[index]) - 63
        index += 1
        result |= (byte & 0x1F) << shift
        shift += 5
        if byte < 0x20:
            break

    if result & 1:
        result = ~result
    result >>= 1

    return result, index


def interpolate_coordinates_along_route(
    polyline: list[list[float]],
    target_distance_miles: float,
    total_distance_miles: float
) -> list[float]:
    if not polyline:
        return [0.0, 0.0]

    if target_distance_miles <= 0:
        return polyline[0]

    if target_distance_miles >= total_distance_miles:
        return polyline[-1]

    # Calculate the fraction along the route
    fraction = target_distance_miles / total_distance_miles

    # Use the fraction to index into the polyline
    target_index = fraction * (len(polyline) - 1)
    lower = int(target_index)
    upper = min(lower + 1, len(polyline) - 1)

    if lower == upper:
        return polyline[lower]

    interp_fraction = target_index - lower
    lat = polyline[lower][0] + (polyline[upper][0] - polyline[lower][0]) * interp_fraction
    lng = polyline[lower][1] + (polyline[upper][1] - polyline[lower][1]) * interp_fraction

    return [lat, lng]