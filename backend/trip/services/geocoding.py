import time
import logging
import requests

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "spotter-eld-app/1.0 (contact@spotter-eld.example.com)"
RATE_LIMIT_SLEEP = 1.1  


def geocode_location(location_string: str) -> dict:
    time.sleep(RATE_LIMIT_SLEEP)  # Respect Nominatim rate limit

    params = {
        'q': location_string,
        'format': 'json',
        'limit': 1,
        'addressdetails': 1,
    }
    headers = {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en',
    }

    try:
        response = requests.get(
            NOMINATIM_URL,
            params=params,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        results = response.json()

        if not results:
            raise ValueError(f"Could not geocode location: '{location_string}'. "
                             f"Please use a more specific location (e.g. 'Chicago, IL, USA').")

        result = results[0]
        lat = float(result['lat'])
        lng = float(result['lon'])
        display_name = result.get('display_name', location_string)
        short_name = _shorten_display_name(display_name, location_string)

        logger.info(f"Geocoded '{location_string}' → ({lat}, {lng})")
        return {
            'name': short_name,
            'lat': lat,
            'lng': lng,
        }

    except requests.RequestException as e:
        logger.error(f"Nominatim API error for '{location_string}': {e}")
        raise requests.RequestException(
            f"Geocoding service unavailable. Please try again later. Error: {str(e)}"
        )


def geocode_multiple(locations: list[str]) -> list[dict]:
    results = []
    for location in locations:
        result = geocode_location(location)
        results.append(result)
    return results


def _shorten_display_name(display_name: str, fallback: str) -> str:
    # US state abbreviations map
    state_abbrevs = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
        'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
        'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
        'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
        'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
        'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
        'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
        'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
        'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
        'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
        'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
    }

    parts = [p.strip() for p in display_name.split(',')]
    city = parts[0] if parts else fallback

    for state_full, state_abbr in state_abbrevs.items():
        if state_full in display_name:
            return f"{city}, {state_abbr}"

    return fallback