import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { planTrip } from '../api/tripApi'
import LoadingSpinner from './LoadingSpinner'
import LocationAutocomplete from './LocationAutocomplete'

const EXAMPLES = [
  { label: 'Chicago → Dallas → LA', current_location:'Chicago, IL', pickup_location:'Dallas, TX', dropoff_location:'Los Angeles, CA', current_cycle_used:20 },
  { label: 'NY → Atlanta → Houston', current_location:'New York, NY', pickup_location:'Atlanta, GA', dropoff_location:'Houston, TX', current_cycle_used:0 },
  { label: 'Seattle → Denver → KC', current_location:'Seattle, WA', pickup_location:'Denver, CO', dropoff_location:'Kansas City, MO', current_cycle_used:35 },
]

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
      </svg>
      {msg}
    </p>
  )
}

function LocationInput({ id, name, value, onChange, placeholder, dotColor, error, disabled }) {
  return (
    <div>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
          <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: dotColor }} />
        </div>
        <input
          type="text" id={id} name={name} value={value} onChange={onChange}
          placeholder={placeholder} disabled={disabled} autoComplete="off"
          className={`input-field pl-10 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
        />
      </div>
      <FieldError msg={error} />
    </div>
  )
}

export default function TripForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ current_location:'', pickup_location:'', dropoff_location:'', current_cycle_used:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const change = e => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }))
    setApiError(null)
  }

  const validate = () => {
    const e = {}
    if (!form.current_location.trim()) e.current_location = 'Current location is required'
    if (!form.pickup_location.trim())  e.pickup_location  = 'Pickup location is required'
    if (!form.dropoff_location.trim()) e.dropoff_location = 'Dropoff location is required'
    if (form.pickup_location.trim().toLowerCase() === form.dropoff_location.trim().toLowerCase())
      e.dropoff_location = 'Pickup and dropoff must differ'
    const cv = parseFloat(form.current_cycle_used)
    if (form.current_cycle_used === '' || isNaN(cv)) e.current_cycle_used = 'Enter hours (0–70)'
    else if (cv < 0)  e.current_cycle_used = 'Cannot be negative'
    else if (cv > 70) e.current_cycle_used = 'Max is 70 hours'
    return e
  }

  const submit = async e => {
    e.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }
    setLoading(true)
    setApiError(null)
    try {
      const result = await planTrip({
        current_location: form.current_location.trim(),
        pickup_location:  form.pickup_location.trim(),
        dropoff_location: form.dropoff_location.trim(),
        current_cycle_used: parseFloat(form.current_cycle_used),
      })
      navigate('/results', { state: { tripData: result, formData: form } })
    } catch (err) {
      setApiError(err.message || 'Failed to plan trip. Is the backend running on port 8000?')
      setLoading(false)
    }
  }

  const loadExample = ex => {
    setForm({ current_location: ex.current_location, pickup_location: ex.pickup_location, dropoff_location: ex.dropoff_location, current_cycle_used: String(ex.current_cycle_used) })
    setErrors({}); setApiError(null)
  }

  const cv = parseFloat(form.current_cycle_used) || 0

  return (
    <>
      {loading && <LoadingSpinner subMessage="Geocoding + routing + HOS calculation…" />}

      {/* Quick examples */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Quick examples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button key={ex.label} type="button" onClick={() => loadExample(ex)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="relative">
          <div className="absolute left-[17px] top-10 bottom-10 w-px bg-gradient-to-b from-blue-400 via-green-400 to-red-400 z-0 opacity-30" />
          <div className="space-y-3 relative z-10">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Current Location <span className="text-red-400">*</span>
              </label>
              <LocationAutocomplete id="current_location" name="current_location" value={form.current_location}
                onChange={change} placeholder="e.g. Chicago, IL" dotColor="#1e6eb5"
                error={errors.current_location} disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Pickup Location <span className="text-red-400">*</span>
              </label>
              <LocationAutocomplete id="pickup_location" name="pickup_location" value={form.pickup_location}
                onChange={change} placeholder="e.g. Dallas, TX" dotColor="#10b981"
                error={errors.pickup_location} disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Dropoff Location <span className="text-red-400">*</span>
              </label>
              <LocationAutocomplete id="dropoff_location" name="dropoff_location" value={form.dropoff_location}
                onChange={change} placeholder="e.g. Los Angeles, CA" dotColor="#ef4444"
                error={errors.dropoff_location} disabled={loading} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Current Cycle Used (Hrs) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input type="number" name="current_cycle_used" value={form.current_cycle_used}
              onChange={change} placeholder="0" min="0" max="70" step="0.5" disabled={loading}
              className={`input-field pr-14 ${errors.current_cycle_used ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">/ 70h</span>
          </div>
          {form.current_cycle_used !== '' && !errors.current_cycle_used && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">0h</span>
                <span className={`font-semibold font-mono ${cv > 60 ? 'text-red-500' : cv > 40 ? 'text-amber-500' : 'text-green-600'}`}>{cv}h used</span>
                <span className="text-gray-400">70h</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full transition-all duration-300 ${cv > 60 ? 'bg-red-400' : cv > 40 ? 'bg-amber-400' : 'bg-green-400'}`}
                  style={{ width: `${Math.min(100, (cv/70)*100)}%` }} />
              </div>
            </div>
          )}
          <FieldError msg={errors.current_cycle_used} />
        </div>

        {/* API error */}
        {apiError && (
          <div className="flex gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700">Error</p>
              <p className="text-xs text-red-600 mt-0.5">{apiError}</p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="btn-amber w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          Plan My Trip
        </button>

        <p className="text-center text-xs text-gray-400">FMCSA compliant · ELD logs generated · ~15 sec</p>
      </form>
    </>
  )
}