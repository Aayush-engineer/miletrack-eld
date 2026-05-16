import { formatDuration } from '../utils/timeHelpers'

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`card p-4 flex items-start gap-3 ${accent ? 'border-l-4 border-l-fmcsa-yellow' : ''}`}>
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-display font-bold text-navy leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function TripSummary({ route, dailyLogs }) {
  if (!route) return null

  const totalDays = dailyLogs?.length || 0
  const totalDrivingHours = dailyLogs?.reduce(
    (sum, log) => sum + (log.total_hours?.driving || 0), 0
  ) || 0
  const totalOnDutyHours = dailyLogs?.reduce(
    (sum, log) => sum + (log.total_hours?.on_duty_not_driving || 0), 0
  ) || 0
  const fuelStops = route.stops?.filter(s => s.type === 'fuel').length || 0
  const restStops = route.stops?.filter(s => s.type === 'rest').length || 0

  const lastLog = dailyLogs?.[dailyLogs.length - 1]
  const finalCycleHours = lastLog?.cycle_hours_at_end_of_day || 0
  const cyclePercent = Math.min(100, (finalCycleHours / 70) * 100)

  return (
    <div className="card p-5 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-fmcsa-yellow rounded-full" />
        <h2 className="font-display font-bold text-navy text-xl">Trip Summary</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          icon="🛣️"
          label="Total Distance"
          value={`${route.total_distance_miles?.toLocaleString() || 0} mi`}
          sub={`${route.legs?.length || 0} leg${route.legs?.length !== 1 ? 's' : ''}`}
          accent
        />
        <StatCard
          icon="📅"
          label="Trip Duration"
          value={`${totalDays} day${totalDays !== 1 ? 's' : ''}`}
          sub={`~${route.total_estimated_hours?.toFixed(1)} drive hours`}
        />
        <StatCard
          icon="🚛"
          label="Drive Time"
          value={formatDuration(totalDrivingHours)}
          sub={`${totalDrivingHours.toFixed(1)} hours`}
        />
        <StatCard
          icon="📦"
          label="On-Duty (Not Driving)"
          value={formatDuration(totalOnDutyHours)}
          sub="Pickup, dropoff, fuel"
        />
      </div>

      {/* Stops row */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2.5">
          <span className="text-lg">🛏</span>
          <div>
            <p className="text-xs text-orange-700 font-medium">Rest Stops</p>
            <p className="font-bold text-orange-900">{restStops}</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-yellow-50 rounded-lg px-3 py-2.5">
          <span className="text-lg">⛽</span>
          <div>
            <p className="text-xs text-yellow-700 font-medium">Fuel Stops</p>
            <p className="font-bold text-yellow-900">{fuelStops}</p>
          </div>
        </div>
      </div>

      {/* Cycle hours gauge */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-xs font-semibold text-navy">70-Hour Cycle Used (End of Trip)</p>
          <p className={`text-sm font-bold font-mono ${finalCycleHours > 65 ? 'text-red-600' : finalCycleHours > 50 ? 'text-yellow-600' : 'text-green-700'}`}>
            {finalCycleHours.toFixed(1)}h / 70h
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              cyclePercent > 92 ? 'bg-red-500' :
              cyclePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${cyclePercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {(70 - finalCycleHours).toFixed(1)}h remaining after trip
        </p>
      </div>

      {/* Route legs */}
      {route.legs && route.legs.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-navy uppercase tracking-wider mb-2">Route Legs</p>
          <div className="space-y-2">
            {route.legs.map((leg, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-navy">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-gray-700 truncate block">
                    <span className="font-medium">{leg.from}</span>
                    <span className="text-gray-400 mx-1">→</span>
                    <span className="font-medium">{leg.to}</span>
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-mono text-navy font-medium">{leg.distance_miles} mi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}