import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { planTrip } from '../api/tripApi'
import LoadingSpinner from './LoadingSpinner'

const EXAMPLE_TRIPS = [
  {
    label: 'Chicago → Dallas → LA',
    current_location: 'Chicago, IL',
    pickup_location: 'Dallas, TX',
    dropoff_location: 'Los Angeles, CA',
    current_cycle_used: 20,
  },
  {
    label: 'New York → Atlanta → Houston',
    current_location: 'New York, NY',
    pickup_location: 'Atlanta, GA',
    dropoff_location: 'Houston, TX',
    current_cycle_used: 0,
  },
  {
    label: 'Seattle → Denver → Kansas City',
    current_location: 'Seattle, WA',
    pickup_location: 'Denver, CO',
    dropoff_location: 'Kansas City, MO',
    current_cycle_used: 35,
  },
]

const LOADING_STEPS = [
  'Geocoding your locations...',
  'Fetching route from OSRM...',
  'Calculating HOS compliance...',
  'Generating ELD log sheets...',
]

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </p>
  )
}

function FormField({ label, id, required, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-navy mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      <FieldError message={error} />
    </div>
  )
}

export default function TripForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [apiError, setApiError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    setApiError(null)
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.current_location.trim()) newErrors.current_location = 'Current location is required'
    if (!formData.pickup_location.trim()) newErrors.pickup_location = 'Pickup location is required'
    if (!formData.dropoff_location.trim()) newErrors.dropoff_location = 'Dropoff location is required'
    if (formData.pickup_location.trim().toLowerCase() === formData.dropoff_location.trim().toLowerCase()) {
      newErrors.dropoff_location = 'Pickup and dropoff must be different'
    }
    const cycleVal = parseFloat(formData.current_cycle_used)
    if (formData.current_cycle_used === '' || isNaN(cycleVal)) {
      newErrors.current_cycle_used = 'Cycle hours is required'
    } else if (cycleVal < 0) {
      newErrors.current_cycle_used = 'Cannot be negative'
    } else if (cycleVal > 70) {
      newErrors.current_cycle_used = 'Cannot exceed 70 hours'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setLoadingStep(0)
    setApiError(null)

    // Cycle through loading steps for UX
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 4000)

    try {
      const result = await planTrip({
        current_location: formData.current_location.trim(),
        pickup_location: formData.pickup_location.trim(),
        dropoff_location: formData.dropoff_location.trim(),
        current_cycle_used: parseFloat(formData.current_cycle_used),
      })
      clearInterval(stepInterval)
      navigate('/results', { state: { tripData: result, formData } })
    } catch (err) {
      clearInterval(stepInterval)
      setApiError(err.message || 'Failed to plan trip. Please try again.')
      setIsLoading(false)
    }
  }

  const loadExample = (example) => {
    setFormData({
      current_location: example.current_location,
      pickup_location: example.pickup_location,
      dropoff_location: example.dropoff_location,
      current_cycle_used: String(example.current_cycle_used),
    })
    setErrors({})
    setApiError(null)
  }

  const cycleVal = parseFloat(formData.current_cycle_used) || 0

  return (
    <>
      {/* Full-page loading overlay */}
      {isLoading && (
        <LoadingSpinner
          message={LOADING_STEPS[loadingStep]}
          subMessage="This takes 10–20 seconds. Geocoding + routing + HOS calculation..."
        />
      )}

      <div className="w-full max-w-lg mx-auto">
        {/* Quick examples */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2">Quick examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_TRIPS.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => loadExample(ex)}
                className="text-xs px-3 py-1.5 rounded-full border border-navy/20 text-navy/70 hover:border-fmcsa-yellow hover:bg-fmcsa-yellow/10 transition-all"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Visual connector between location fields */}
          <div className="relative">
            <div className="absolute left-5 top-12 bottom-12 w-px bg-gray-200 z-0" />
            <div className="space-y-3 relative z-10">
              <FormField label="Current Location" id="current_location" required error={errors.current_location} hint="Where the driver is right now">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-fmcsa-blue border-2 border-white shadow-sm" />
                  <input
                    type="text" id="current_location" name="current_location"
                    value={formData.current_location} onChange={handleChange}
                    placeholder="e.g. Chicago, IL" disabled={isLoading}
                    className={`input-field pl-9 ${errors.current_location ? 'border-red-400' : ''}`}
                  />
                </div>
              </FormField>

              <FormField label="Pickup Location" id="pickup_location" required error={errors.pickup_location} hint="Where to pick up the load">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                  <input
                    type="text" id="pickup_location" name="pickup_location"
                    value={formData.pickup_location} onChange={handleChange}
                    placeholder="e.g. Dallas, TX" disabled={isLoading}
                    className={`input-field pl-9 ${errors.pickup_location ? 'border-red-400' : ''}`}
                  />
                </div>
              </FormField>

              <FormField label="Dropoff Location" id="dropoff_location" required error={errors.dropoff_location} hint="Final destination">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm" />
                  <input
                    type="text" id="dropoff_location" name="dropoff_location"
                    value={formData.dropoff_location} onChange={handleChange}
                    placeholder="e.g. Los Angeles, CA" disabled={isLoading}
                    className={`input-field pl-9 ${errors.dropoff_location ? 'border-red-400' : ''}`}
                  />
                </div>
              </FormField>
            </div>
          </div>

          <FormField
            label="Current Cycle Hours Used"
            id="current_cycle_used" required
            error={errors.current_cycle_used}
            hint="Hours used in your current 8-day rolling cycle (0–70)"
          >
            <div className="relative">
              <input
                type="number" id="current_cycle_used" name="current_cycle_used"
                value={formData.current_cycle_used} onChange={handleChange}
                placeholder="0" min="0" max="70" step="0.5" disabled={isLoading}
                className={`input-field pr-12 ${errors.current_cycle_used ? 'border-red-400' : ''}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">/ 70h</span>
            </div>
            {formData.current_cycle_used !== '' && !errors.current_cycle_used && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>0h</span>
                  <span className={cycleVal > 60 ? 'text-red-500 font-semibold' : cycleVal > 40 ? 'text-yellow-600 font-semibold' : 'text-green-600 font-semibold'}>
                    {cycleVal}h used
                  </span>
                  <span>70h</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${cycleVal > 60 ? 'bg-red-500' : cycleVal > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (cycleVal / 70) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </FormField>

          {/* API Error banner */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-700">Error planning trip</p>
                <p className="text-xs text-red-600 mt-0.5">{apiError}</p>
                <p className="text-xs text-red-400 mt-1">Make sure the backend server is running on port 8000.</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-fmcsa-yellow text-navy font-bold text-lg py-4 rounded-xl hover:bg-yellow-400 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md shadow-yellow-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Plan My Trip
          </button>

          <p className="text-center text-xs text-gray-400">
            Calculates FMCSA HOS schedule · Generates ELD log sheets · ~10–20 sec
          </p>
        </form>
      </div>
    </>
  )
}