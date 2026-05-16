import { formatArrivalTime, formatDuration, getStatusLabel, getStatusChipClass } from '../utils/timeHelpers'

function StopBadge({ type }) {
  const config = {
    fuel: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⛽', label: 'Fuel Stop' },
    rest: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🛏', label: 'Rest Stop' },
    pickup: { bg: 'bg-green-100', text: 'text-green-800', icon: '📦', label: 'Pickup' },
    dropoff: { bg: 'bg-red-100', text: 'text-red-800', icon: '🏁', label: 'Dropoff' },
  }
  const c = config[type] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: '📍', label: type }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.icon} {c.label}
    </span>
  )
}

function DaySection({ log }) {
  const activeSegments = log.segments?.filter(s => s.status !== 'off_duty' || s.duration_hours >= 9.5) || []

  return (
    <div className="mb-5">
      {/* Day header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
          <span className="text-[9px] font-bold text-white">{log.day}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-navy leading-none">{log.date}</p>
          <p className="text-xs text-gray-400">{log.from_location} → {log.to_location}</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs font-mono text-gray-500">{Math.round(log.total_miles_today)} mi</span>
        </div>
      </div>

      {/* Segments timeline */}
      <div className="ml-3 border-l-2 border-gray-100 pl-4 space-y-2">
        {log.segments?.map((seg, idx) => {
          const isSignificant = seg.status !== 'off_duty' || seg.duration_hours >= 8.0
          if (!isSignificant) return null

          const chipClass = getStatusChipClass(seg.status)
          return (
            <div key={idx} className="flex items-start gap-3">
              {/* Timeline dot */}
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                seg.status === 'driving' ? 'bg-green-500' :
                seg.status === 'on_duty_not_driving' ? 'bg-blue-500' :
                seg.duration_hours >= 9 ? 'bg-orange-500' : 'bg-gray-300'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={chipClass}>{getStatusLabel(seg.status)}</span>
                  <span className="text-xs font-mono text-gray-500">
                    {seg.start} – {seg.end}
                  </span>
                  <span className="text-xs text-gray-400">({formatDuration(seg.duration_hours)})</span>
                </div>
                {seg.location && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate" title={seg.location}>
                    {seg.location}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function StopsList({ route, dailyLogs }) {
  const stops = route?.stops || []

  return (
    <div>
      {/* Map stops summary */}
      {stops.length > 0 && (
        <div className="card p-4 mb-4">
          <h3 className="font-display font-bold text-navy text-base mb-3 flex items-center gap-2">
            <span>📍</span> All Route Stops
          </h3>
          <div className="space-y-3">
            {stops.map((stop, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  stop.type === 'fuel' ? 'bg-yellow-100' : 'bg-orange-100'
                }`}>
                  <span className="text-sm">{stop.type === 'fuel' ? '⛽' : '🛏'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StopBadge type={stop.type} />
                  </div>
                  {stop.arrival_time && (
                    <p className="text-xs text-gray-500 mt-1">
                      Arrival: {formatArrivalTime(stop.arrival_time)}
                    </p>
                  )}
                  {stop.duration_minutes && (
                    <p className="text-xs font-medium text-navy mt-0.5">
                      Duration: {formatDuration(stop.duration_minutes / 60)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day-by-day timeline */}
      <div className="card p-4">
        <h3 className="font-display font-bold text-navy text-base mb-4 flex items-center gap-2">
          <span>📋</span> Day-by-Day Activity
        </h3>
        {dailyLogs?.map((log, idx) => (
          <DaySection key={`${log.date}-${idx}`} log={log} />
        ))}
      </div>
    </div>
  )
}