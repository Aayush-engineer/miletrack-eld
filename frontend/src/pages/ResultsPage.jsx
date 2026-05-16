import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import RouteMap from '../components/RouteMap'
import LogSheetList from '../components/LogSheetList'
import StopsList from '../components/StopsList'
import TripSummary from '../components/TripSummary'

const VIEWS = { MAP: 'map', LOGS: 'logs', STOPS: 'stops' }

export default function ResultsPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const [mobileView, setMobileView]  = useState(VIEWS.MAP)
  const [activeTab, setActiveTab]    = useState('logs')
  const [mapFull, setMapFull]        = useState(false)
  const [mounted, setMounted]        = useState(false)

  const tripData = location.state?.tripData
  const formData = location.state?.formData

  useEffect(() => {
    if (!tripData) navigate('/', { replace: true })
    else setTimeout(() => setMounted(true), 80)
  }, [tripData, navigate])

  if (!tripData) return null

  const { route, daily_logs: dailyLogs } = tripData
  const totalDays   = dailyLogs?.length || 0
  const totalMiles  = route?.total_distance_miles || 0
  const fuelStops   = route?.stops?.filter(s => s.type === 'fuel').length || 0
  const restStops   = route?.stops?.filter(s => s.type === 'rest').length || 0

  return (
    <div className="h-[100dvh] flex flex-col bg-[#f4f6f9] overflow-hidden">

      <nav className="flex-shrink-0 z-30 bg-[#0f1c35] border-b border-white/8 shadow-lg shadow-navy/20">
        <div className="h-14 px-3 sm:px-5 flex items-center gap-3">

          <Link to="/" className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span className="hidden sm:block text-xs font-medium">New Trip</span>
          </Link>

          <div className="w-px h-5 bg-white/10 flex-shrink-0" />

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded bg-amber-400 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="8" width="14" height="10" rx="1.5" fill="#0f1c35"/>
                <rect x="15" y="11" width="7" height="7" rx="1" fill="#1a2e52"/>
                <circle cx="5" cy="19" r="2.5" fill="#0f1c35"/>
                <circle cx="12" cy="19" r="2.5" fill="#0f1c35"/>
                <circle cx="19" cy="19" r="2.5" fill="#0f1c35"/>
              </svg>
            </div>
            <span className="font-display text-white text-sm hidden sm:block">MileTrack</span>
          </div>

          {formData && (
            <div className="hidden md:flex items-center gap-1.5 ml-2 text-xs overflow-hidden">
              {[formData.current_location, formData.pickup_location, formData.dropoff_location].map((loc, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>}
                  <span className="px-2 py-0.5 rounded-md bg-white/8 text-white/60 font-mono truncate max-w-[110px]">{loc}</span>
                </span>
              ))}
            </div>
          )}

          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white/8 text-white/70">
                <span className="font-bold text-white">{totalMiles.toLocaleString()}</span> mi
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/8 text-white/70">
                <span className="font-bold text-white">{totalDays}</span> days
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-400/15 text-amber-300">
                <span className="font-bold">{fuelStops}</span> fuel · <span className="font-bold">{restStops}</span> rest
              </span>
            </div>

            <button
              onClick={() => setMapFull(v => !v)}
              className="hidden lg:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/8 text-white/60 hover:bg-white/15 hover:text-white transition-all border border-white/8"
            >
              {mapFull ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M15 9h4.5M15 9V4.5M9 15H4.5M9 15v4.5M15 15v4.5M15 15h4.5"/>
                  </svg>
                  Show Logs
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                  </svg>
                  Full Map
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-hidden hidden lg:flex">

        <div className={`relative flex-shrink-0 map-panel ${mapFull ? 'w-full' : 'w-[58%]'}`}>
          <RouteMap route={route} />
        </div>

        {!mapFull && (
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-l border-black/5 anim-fade-in">
            {/* Tab bar */}
            <div className="flex-shrink-0 bg-white border-b border-gray-100">
              <div className="flex">
                {[
                  { id: 'logs', label: 'Log Sheets', count: totalDays },
                  { id: 'stops', label: 'Stops & Rests', count: (fuelStops + restStops) || null },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-[#0f1c35] text-[#0f1c35]'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {tab.label}
                    {tab.count && (
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${
                        activeTab === tab.id ? 'bg-[#0f1c35] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === 'logs' && (
                <div className="p-4 anim-fade-in">
                  <TripSummary route={route} dailyLogs={dailyLogs} />
                  <LogSheetList dailyLogs={dailyLogs} />
                </div>
              )}
              {activeTab === 'stops' && (
                <div className="p-4 anim-fade-in">
                  <StopsList route={route} dailyLogs={dailyLogs} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden lg:hidden">

        <div className="flex-1 overflow-hidden relative">
          {/* Map view */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${mobileView === VIEWS.MAP ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <RouteMap route={route} />
          </div>

          {/* Logs view */}
          <div className={`absolute inset-0 overflow-y-auto bg-[#f4f6f9] transition-opacity duration-300 ${mobileView === VIEWS.LOGS ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="p-3 pb-6">
              <TripSummary route={route} dailyLogs={dailyLogs} />
              <LogSheetList dailyLogs={dailyLogs} />
            </div>
          </div>

          {/* Stops view */}
          <div className={`absolute inset-0 overflow-y-auto bg-[#f4f6f9] transition-opacity duration-300 ${mobileView === VIEWS.STOPS ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="p-3 pb-6">
              <StopsList route={route} dailyLogs={dailyLogs} />
            </div>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex h-16">
            <button
              onClick={() => setMobileView(VIEWS.MAP)}
              className={`mobile-tab ${mobileView === VIEWS.MAP ? 'active' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileView === VIEWS.MAP ? 2.5 : 1.5}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              <span>Map</span>
              {mobileView === VIEWS.MAP && <div className="w-1 h-1 rounded-full bg-amber-400" />}
            </button>

            <button
              onClick={() => setMobileView(VIEWS.LOGS)}
              className={`mobile-tab ${mobileView === VIEWS.LOGS ? 'active' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileView === VIEWS.LOGS ? 2.5 : 1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Log Sheets</span>
              {mobileView === VIEWS.LOGS && <div className="w-1 h-1 rounded-full bg-amber-400" />}
            </button>

            <button
              onClick={() => setMobileView(VIEWS.STOPS)}
              className={`mobile-tab ${mobileView === VIEWS.STOPS ? 'active' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileView === VIEWS.STOPS ? 2.5 : 1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileView === VIEWS.STOPS ? 2.5 : 1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>Stops</span>
              {mobileView === VIEWS.STOPS && <div className="w-1 h-1 rounded-full bg-amber-400" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}