"""
Geocoding service with automatic fallback chain.
Provider 1: Nominatim (OpenStreetMap) — primary
Provider 2: Photon (Komoot)           — fallback 1
Provider 3: US Census Bureau          — fallback 2
"""
import time
import logging
import requests

logger = logging.getLogger(__name__)

STATE_ABBREVS = {
    'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR',
    'California':'CA','Colorado':'CO','Connecticut':'CT','Delaware':'DE',
    'Florida':'FL','Georgia':'GA','Hawaii':'HI','Idaho':'ID',
    'Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS',
    'Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD',
    'Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS',
    'Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV',
    'New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY',
    'North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK',
    'Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC',
    'South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT',
    'Vermont':'VT','Virginia':'VA','Washington':'WA','West Virginia':'WV',
    'Wisconsin':'WI','Wyoming':'WY','District of Columbia':'DC',
}


def geocode_location(location_string: str) -> dict:
    """
    Geocode a US location string with automatic fallback.
    Tries 3 providers in order — returns on first success.

    Returns:
        dict with keys: name (str), lat (float), lng (float)

    Raises:
        requests.RequestException: if all providers fail
        ValueError: if location cannot be found in any provider
    """
    errors = []

    # ── Provider 1: Nominatim ──────────────────────────────
    try:
        result = _try_nominatim(location_string)
        if result:
            logger.info(f"[Nominatim] '{location_string}' → {result['name']} ({result['lat']}, {result['lng']})")
            return result
    except Exception as e:
        errors.append(f"Nominatim: {e}")
        logger.warning(f"[Nominatim] failed for '{location_string}': {e}")

    # ── Provider 2: Photon ─────────────────────────────────
    try:
        result = _try_photon(location_string)
        if result:
            logger.info(f"[Photon] '{location_string}' → {result['name']} ({result['lat']}, {result['lng']})")
            return result
    except Exception as e:
        errors.append(f"Photon: {e}")
        logger.warning(f"[Photon] failed for '{location_string}': {e}")

    # ── Provider 3: US Census Bureau ───────────────────────
    try:
        result = _try_census(location_string)
        if result:
            logger.info(f"[Census] '{location_string}' → {result['name']} ({result['lat']}, {result['lng']})")
            return result
    except Exception as e:
        errors.append(f"Census: {e}")
        logger.warning(f"[Census] failed for '{location_string}': {e}")

    # All 3 failed
    raise requests.RequestException(
        f"All geocoding services failed for '{location_string}'. "
        f"Check your internet connection. Errors: {' | '.join(errors)}"
    )


# ── Provider implementations ───────────────────────────────────────

def _try_nominatim(location_string: str) -> dict | None:
    """Nominatim — OpenStreetMap geocoding. Rate limit: 1 req/sec."""
    time.sleep(1.1)  # Required by Nominatim ToS
    response = requests.get(
        'https://nominatim.openstreetmap.org/search',
        params={
            'q': location_string,
            'format': 'json',
            'limit': 1,
            'addressdetails': 1,
            'countrycodes': 'us',
        },
        headers={
            'User-Agent': 'MileTrack-ELD/1.0 (contact@miletrack.example.com)',
            'Accept-Language': 'en',
        },
        timeout=30,
    )
    response.raise_for_status()
    results = response.json()

    if not results:
        return None

    r    = results[0]
    addr = r.get('address', {})
    city = (addr.get('city') or addr.get('town') or
            addr.get('village') or addr.get('county') or '')
    state_full = addr.get('state', '')
    state      = STATE_ABBREVS.get(state_full, state_full)
    name       = f"{city}, {state}" if city and state else location_string

    return {
        'name': name,
        'lat':  float(r['lat']),
        'lng':  float(r['lon']),
    }


def _try_photon(location_string: str) -> dict | None:
    """Photon — Komoot geocoding. No rate limit, no API key."""
    time.sleep(0.3)
    response = requests.get(
        'https://photon.komoot.io/api/',
        params={
            'q':     location_string,
            'limit': 1,
            'lang':  'en',
            # Bounding box restricts results to continental US
            'bbox':  '-125.0,24.0,-66.0,50.0',
        },
        headers={'User-Agent': 'MileTrack-ELD/1.0'},
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    features = data.get('features', [])
    if not features:
        return None

    f      = features[0]
    props  = f.get('properties', {})
    coords = f['geometry']['coordinates']  # [lng, lat]

    # Reject non-US results that slipped through
    country_code = props.get('country_code', '').lower()
    if country_code not in ('us', 'usa', ''):
        logger.warning(f"[Photon] rejected non-US result for '{location_string}': {country_code}")
        return None

    city       = props.get('city') or props.get('town') or props.get('name') or location_string
    state_full = props.get('state', '')
    state      = STATE_ABBREVS.get(state_full, state_full)
    name       = f"{city}, {state}" if city and state else location_string

    return {
        'name': name,
        'lat':  float(coords[1]),
        'lng':  float(coords[0]),
    }


def _try_census(location_string: str) -> dict | None:
    """
    US Census Bureau Geocoder — completely free, US only, no API key.
    Very reliable for US city/state queries.
    """
    response = requests.get(
        'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress',
        params={
            'address':   location_string,
            'benchmark': 'Public_AR_Current',
            'format':    'json',
        },
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    matches = data.get('result', {}).get('addressMatches', [])
    if not matches:
        return None

    m      = matches[0]
    coords = m['coordinates']
    raw    = m.get('matchedAddress', location_string)

    # Shorten "123 Main St, CHICAGO, IL, 60601" → "Chicago, IL"
    parts = raw.split(',')
    if len(parts) >= 3:
        city  = parts[-3].strip().title()
        state = parts[-2].strip()
        name  = f"{city}, {state}"
    elif len(parts) == 2:
        name = f"{parts[0].strip().title()}, {parts[1].strip()}"
    else:
        name = location_string

    return {
        'name': name,
        'lat':  float(coords['y']),
        'lng':  float(coords['x']),
    }


def geocode_multiple(locations: list[str]) -> list[dict]:
    """Geocode multiple locations in sequence."""
    results = []
    for location in locations:
        result = geocode_location(location)
        results.append(result)
    return results