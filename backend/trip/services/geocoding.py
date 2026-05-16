import logging
import requests

logger = logging.getLogger(__name__)

# ── Photon (komoot) — no rate limits, no API key, same OSM data ──
PHOTON_URL = "https://photon.komoot.io/api/"


def geocode_location(location_string: str) -> dict:
    # No sleep needed — Photon has no rate limits

    params = {
        'q': location_string,
        'limit': 1,
        'lang': 'en',
    }
    headers = {
        'User-Agent': 'MileTrack-ELD/1.0',
    }

    try:
        response = requests.get(
            PHOTON_URL,
            params=params,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()

        if not data.get('features'):
            raise ValueError(
                f"Could not geocode location: '{location_string}'. "
                f"Please use a more specific location (e.g. 'Chicago, IL, USA')."
            )

        feature = data['features'][0]
        coords = feature['geometry']['coordinates']  # Photon returns [lon, lat]
        props = feature.get('properties', {})

        lat = float(coords[1])
        lng = float(coords[0])

        # Build display name from Photon properties (same structure as before)
        display_name = _build_display_name(props, location_string)
        short_name = _shorten_display_name(display_name, location_string)

        logger.info(f"Geocoded '{location_string}' → ({lat}, {lng})")
        return {
            'name': short_name,
            'lat': lat,
            'lng': lng,
        }

    except requests.RequestException as e:
        logger.error(f"Photon API error for '{location_string}': {e}")
        raise requests.RequestException(
            f"Geocoding service unavailable. Please try again later. Error: {str(e)}"
        )


def geocode_multiple(locations: list[str]) -> list[dict]:
    # No delay needed between calls with Photon
    results = []
    for location in locations:
        result = geocode_location(location)
        results.append(result)
    return results


def _build_display_name(props: dict, fallback: str) -> str:
    """Build a display name string from Photon property fields."""
    parts = [
        props.get('name', ''),
        props.get('city', props.get('town', props.get('village', ''))),
        props.get('state', ''),
        props.get('country', ''),
    ]
    display = ', '.join(p for p in parts if p)
    return display or fallback


def _shorten_display_name(display_name: str, fallback: str) -> str:
    # US state abbreviations map — unchanged from original
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