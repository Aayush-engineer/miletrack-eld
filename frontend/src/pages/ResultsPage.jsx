import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import RouteMap from '../components/RouteMap'
import LogSheetList from '../components/LogSheetList'
import StopsList from '../components/StopsList'
import TripSummary from '../components/TripSummary'

const TABS = [
  { id: 'logs', label: 'Log Sheets', icon: '📋' },
  { id: 'stops', label: 'Stops & Rests', icon: '📍' },
]

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('logs')
  const [mapExpanded, setMapExpanded] = useState(false)

  const tripData = location.state?.tripData
  const formData = location.state?.formData

  useEffect(() => {
    if (!tripData) {
      navigate('/', { replace: true })
    }
  }, [tripData, navigate])

  if (!tripData) return null

  const { route, daily_logs: dailyLogs } = tripData

  return (
    <div className="h-screen flex flex-col bg-fmcsa-bg overflow-hidden">

      <nav className="bg-navy border-b border-white/10 flex-shrink-0 z-10">
        <div className="h-14 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:block">New Trip</span>
            </Link>

            <div className="w-px h-5 bg-white/20" />

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-fmcsa-yellow rounded flex items-center justify-center">
                <span className="text-navy font-display font-black text-[9px]">ELD</span>
              </div>
              <span className="font-display font-bold text-white text-sm hidden sm:block">miletrack Trip Planner</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs">
            {formData && (
              <>
                <span className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono truncate max-w-28">
                  {formData.current_location}
                </span>
                <svg className="w-3 h-3 text-fmcsa-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono truncate max-w-28">
                  {formData.pickup_location}
                </span>
                <svg className="w-3 h-3 text-fmcsa-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono truncate max-w-28">
                  {formData.dropoff_location}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-white/60 flex-shrink-0">
            {route && (
              <>
                <span className="hidden sm:block">
                  <span className="font-bold text-white">{route.total_distance_miles?.toLocaleString()}</span> mi
                </span>
                <span className="hidden sm:block text-white/30">·</span>
                <span className="hidden sm:block">
                  <span className="font-bold text-white">{dailyLogs?.length}</span> days
                </span>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">

        <div className={`relative flex-shrink-0 transition-all duration-300 ${
          mapExpanded ? 'w-full' : 'w-[58%] hidden lg:block'
        }`}>
          <button
            onClick={() => setMapExpanded(e => !e)}
            className="absolute top-3 right-3 z-[1000] bg-white rounded-lg shadow-md px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            {mapExpanded ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
                Collapse Map
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Expand Map
              </>
            )}
          </button>
          <RouteMap route={route} />
        </div>

        <div className="lg:hidden w-full absolute top-14 left-0 right-0 z-20 bg-white border-b border-gray-100 px-4 py-2 flex gap-2">
          <button
            onClick={() => setMapExpanded(e => !e)}
            className="flex-1 text-center text-sm font-medium text-navy py-1.5 rounded-lg border border-gray-200 hover:bg-navy hover:text-white transition-all"
          >
            {mapExpanded ? '📋 Show Log Sheets' : '🗺️ Show Map'}
          </button>
        </div>

        <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${mapExpanded ? 'hidden' : ''}`}>
          <div className="bg-white border-b border-gray-100 px-4 flex-shrink-0">
            <div className="flex gap-0">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-navy text-navy'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.id === 'logs' && dailyLogs?.length > 0 && (
                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {dailyLogs.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'logs' && (
              <div className="animate-fade-in">
                <TripSummary route={route} dailyLogs={dailyLogs} />
                <LogSheetList dailyLogs={dailyLogs} />
              </div>
            )}
            {activeTab === 'stops' && (
              <div className="animate-fade-in">
                <StopsList route={route} dailyLogs={dailyLogs} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}