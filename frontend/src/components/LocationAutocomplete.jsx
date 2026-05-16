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

async function searchNominatim(query) {
  if (!query || query.length < 3) return []
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&countrycodes=us&q=${encodeURIComponent(query)}`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    return data
      .filter(r => {
        const addr = r.address || {}
        // Only keep results that have a US state
        return addr.country_code === 'us' && (addr.state || addr.city)
      })
      .map(r => {
        const addr = r.address || {}
        // Build clean "City, ST" format
        const city = addr.city || addr.town || addr.village || addr.county || ''
        const state = addr.state || ''
        const stateAbbr = STATE_ABBREVS[state] || state

        const label = city && stateAbbr
          ? `${city}, ${stateAbbr}`
          : r.display_name.split(',').slice(0, 2).join(',').trim()

        return { label, full: r.display_name }
      })
  } catch { return [] }
}

export default function LocationAutocomplete({ id, name, value, onChange, placeholder, dotColor, error, disabled }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen]               = useState(false)
  const [loading, setLoading]         = useState(false)
  const timerRef                      = useRef(null)
  const wrapRef                       = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = e => {
    onChange(e)
    const q = e.target.value
    clearTimeout(timerRef.current)
    if (q.length < 3) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      const results = await searchNominatim(q)
      setSuggestions(results)
      setOpen(results.length > 0)
      setLoading(false)
    }, 350)
  }

  const pick = (label) => {
    onChange({ target: { name, value: label } })
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
          <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: dotColor }} />
        </div>
        <input
          type="text" id={id} name={name} value={value}
          onChange={handleChange} onFocus={() => suggestions.length && setOpen(true)}
          placeholder={placeholder} disabled={disabled} autoComplete="off"
          className={`input-field pl-10 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => pick(s.label)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span className="truncate">{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}