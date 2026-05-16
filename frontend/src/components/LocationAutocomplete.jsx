import { useState, useRef, useEffect } from 'react'

const STATE_ABBREVS = {
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

// Top US cities by population — instant local prefix matching, no network needed
const US_CITIES = [
  'New York, NY','Los Angeles, CA','Chicago, IL','Houston, TX','Phoenix, AZ',
  'Philadelphia, PA','San Antonio, TX','San Diego, CA','Dallas, TX','San Jose, CA',
  'Austin, TX','Jacksonville, FL','Fort Worth, TX','Columbus, OH','Charlotte, NC',
  'Indianapolis, IN','San Francisco, CA','Seattle, WA','Denver, CO','Nashville, TN',
  'Oklahoma City, OK','El Paso, TX','Washington, DC','Las Vegas, NV','Louisville, KY',
  'Memphis, TN','Portland, OR','Baltimore, MD','Milwaukee, WI','Albuquerque, NM',
  'Tucson, AZ','Fresno, CA','Sacramento, CA','Mesa, AZ','Kansas City, MO',
  'Atlanta, GA','Omaha, NE','Colorado Springs, CO','Raleigh, NC','Long Beach, CA',
  'Virginia Beach, VA','Minneapolis, MN','Tampa, FL','New Orleans, LA','Arlington, TX',
  'Bakersfield, CA','Honolulu, HI','Aurora, CO','Anaheim, CA','Santa Ana, CA',
  'Corpus Christi, TX','Riverside, CA','Lexington, KY','St. Louis, MO','Pittsburgh, PA',
  'Stockton, CA','Anchorage, AK','Cincinnati, OH','St. Paul, MN','Greensboro, NC',
  'Toledo, OH','Newark, NJ','Plano, TX','Henderson, NV','Orlando, FL',
  'Lincoln, NE','Jersey City, NJ','Chandler, AZ','St. Petersburg, FL','Laredo, TX',
  'Norfolk, VA','Madison, WI','Durham, NC','Lubbock, TX','Winston-Salem, NC',
  'Garland, TX','Glendale, AZ','Hialeah, FL','Reno, NV','Baton Rouge, LA',
  'Irvine, CA','Chesapeake, VA','Irving, TX','Scottsdale, AZ','North Las Vegas, NV',
  'Fremont, CA','Gilbert, AZ','San Bernardino, CA','Birmingham, AL','Boise, ID',
  'Rochester, NY','Richmond, VA','Spokane, WA','Des Moines, IA','Montgomery, AL',
  'Modesto, CA','Fayetteville, NC','Tacoma, WA','Shreveport, LA','Fontana, CA',
  'Moreno Valley, CA','Glendale, CA','Akron, OH','Little Rock, AR','Columbus, GA',
  'Augusta, GA','Grand Rapids, MI','Oxnard, CA','Tallahassee, FL','Worcester, MA',
  'Knoxville, TN','Newport News, VA','Providence, RI','Fort Lauderdale, FL',
  'Brownsville, TX','Salt Lake City, UT','Tempe, AZ','Huntsville, AL','Overland Park, KS',
  'Frisco, TX','Mobile, AL','Yonkers, NY','Amarillo, TX','Sioux Falls, SD',
  'McKinney, TX','Springfield, MO','Chattanooga, TN','Fort Wayne, IN','Peoria, IL',
  'Bridgeport, CT','Rockford, IL','Ontario, CA','Elk Grove, CA','Oceanside, CA',
  'Salem, OR','Corona, CA','Eugene, OR','Clarksville, TN','Hartford, CT',
  'Garden Grove, CA','Murfreesboro, TN','Savannah, GA','Jackson, MS','Hayward, CA',
  'Lakewood, CO','Escondido, CA','Sunnyvale, CA','Pomona, CA','Kansas City, KS',
  'Torrance, CA','Pasadena, TX','Paterson, NJ','Alexandria, VA','Fullerton, CA',
  'Macon, GA','Killeen, TX','Warren, MI','Hampton, VA','West Valley City, UT',
  'Columbia, SC','Surprise, AZ','Sterling Heights, MI','Palmdale, CA','Visalia, CA',
  'Bellevue, WA','Waco, TX','Elizabeth, NJ','Roseville, CA','Topeka, KS',
  'Santa Clarita, CA','Columbia, MO','Cedar Rapids, IA','Fargo, ND','Concord, CA',
  'Cape Coral, FL','Thousand Oaks, CA','Victorville, CA','Denton, TX','El Monte, CA',
  'Syracuse, NY','Midland, TX','Palm Bay, FL','McAllen, TX','Grand Prairie, TX',
  'Peoria, AZ','Mesquite, TX','Springfield, IL','Rancho Cucamonga, CA','Cary, NC',
  'Lansing, MI','Salinas, CA','Athens, GA','Vancouver, WA','Fort Collins, CO',
  'Pasadena, CA','Pomona, CA','Hayward, CA','Palmdale, CA','Joliet, IL',
  'Naperville, IL','Rockford, IL','Springfield, MA','Paterson, NJ','Bridgeport, CT',
  'Savannah, GA','Torrance, CA','Syracuse, NY','Hollywood, FL','Escondido, CA',
  'Sunnyvale, CA','Pembroke Pines, FL','Fort Lauderdale, FL','Providence, RI',
  'Tempe, AZ','Rancho Cucamonga, CA','Vancouver, WA','Sioux Falls, SD','Peoria, IL',
]

// Deduplicated list
const CITY_LIST = [...new Set(US_CITIES)]

function localSearch(query) {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const hasComma = q.includes(',')

  if (hasComma) {
    const [cityPart, statePart] = q.split(',').map(s => s.trim())
    return CITY_LIST
      .filter(c => {
        const [cCity, cState] = c.toLowerCase().split(',').map(s => s.trim())
        return cCity.startsWith(cityPart) &&
          (statePart === '' || cState.startsWith(statePart))
      })
      .slice(0, 5)
  }

  // Priority 1: city name starts with query
  const startsWith = CITY_LIST.filter(c =>
    c.toLowerCase().split(',')[0].trim().startsWith(q)
  )

  // Priority 2: city name contains query (but doesn't start with it)
  const contains = CITY_LIST.filter(c => {
    const city = c.toLowerCase().split(',')[0].trim()
    return !city.startsWith(q) && city.includes(q)
  })

  return [...startsWith, ...contains].slice(0, 5)
}

async function nominatimSearch(query) {
  if (!query || query.trim().length < 2) return []
  try {
    const q = query.trim()
    const hasComma = q.includes(',')
    let url

    if (hasComma) {
      const [cityPart, statePart] = q.split(',').map(s => s.trim())
      const stateFullName = Object.entries(STATE_ABBREVS)
        .find(([, abbr]) => abbr.toLowerCase() === statePart.toLowerCase())?.[0] || statePart
      url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&countrycodes=us&city=${encodeURIComponent(cityPart)}&state=${encodeURIComponent(stateFullName)}`
    } else {
      url = `https://nominatim.openstreetmap.org/search?format=json&limit=8&addressdetails=1&countrycodes=us&featuretype=city&q=${encodeURIComponent(q)}`
    }

    const res  = await fetch(url, { headers: { 'Accept-Language': 'en-US,en' } })
    const data = await res.json()
    const seen = new Set()
    const results = []
    const queryCity = q.split(',')[0].trim().toLowerCase()

    for (const r of data) {
      const addr = r.address || {}
      if (addr.country_code !== 'us') continue
      const city  = addr.city || addr.town || addr.village || addr.municipality || ''
      const state = addr.state || ''
      const abbr  = STATE_ABBREVS[state] || ''
      if (!city || !abbr) continue
      // Hard filter: city must contain the typed text
      if (!city.toLowerCase().includes(queryCity)) continue
      const label = `${city}, ${abbr}`
      if (seen.has(label)) continue
      seen.add(label)
      results.push(label)
      if (results.length >= 5) break
    }
    return results
  } catch {
    return []
  }
}

export default function LocationAutocomplete({
  id, name, value, onChange, placeholder, dotColor, error, disabled
}) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen]               = useState(false)
  const [loading, setLoading]         = useState(false)
  const timerRef                      = useRef(null)
  const reqIdRef                      = useRef(0)
  const wrapRef                       = useRef(null)

  useEffect(() => {
    const handler = e => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = e => {
    onChange(e)
    const q = e.target.value
    clearTimeout(timerRef.current)

    if (!q || q.trim().length < 2) {
      setSuggestions([]); setOpen(false); setLoading(false)
      return
    }

    // Step 1: instant local match
    const local = localSearch(q)
    setSuggestions(local)
    setOpen(local.length > 0)

    // Step 2: if local gave 4–5 results, skip network call
    if (local.length >= 4) {
      setLoading(false)
      return
    }

    // Step 3: fetch Nominatim to supplement
    setLoading(true)
    const myId = ++reqIdRef.current
    timerRef.current = setTimeout(async () => {
      const remote = await nominatimSearch(q)
      if (reqIdRef.current !== myId) return

      const merged = [...local]
      for (const r of remote) {
        if (!merged.includes(r)) merged.push(r)
      }
      const final = merged.slice(0, 5)
      setSuggestions(final)
      setOpen(final.length > 0)
      setLoading(false)
    }, 350)
  }

  const pick = label => {
    onChange({ target: { name, value: label } })
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
          <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
            style={{ background: dotColor }} />
        </div>
        <input
          type="text" id={id} name={name} value={value}
          onChange={handleChange}
          onKeyDown={e => e.key === 'Escape' && setOpen(false)}
          onFocus={() => suggestions.length && setOpen(true)}
          placeholder={placeholder} disabled={disabled}
          autoComplete="off" spellCheck="false"
          className={`input-field pl-10 ${error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((label, i) => (
            <li key={i}>
              <button type="button" onMouseDown={() => pick(label)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700
                  hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2
                  transition-colors border-b border-gray-50 last:border-0">
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span className="truncate">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}