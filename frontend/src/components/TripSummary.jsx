function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`bg-white rounded-2xl p-4 border ${accent ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white' : 'border-black/5'} shadow-sm`}>
      <div className="text-xl mb-2">{icon}</div>
      <div className={`text-2xl font-display font-bold ${accent ? 'text-amber-600' : 'text-[#0f1c35]'} leading-none mb-0.5`}>{value}</div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

function formatDuration(hours) {
  if (!hours && hours !== 0) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default function TripSummary({ route, dailyLogs }) {
  if (!route) return null

  const totalDriving = dailyLogs?.reduce((s, l) => s + (l.total_hours?.driving || 0), 0) || 0
  const totalOnDuty  = dailyLogs?.reduce((s, l) => s + (l.total_hours?.on_duty_not_driving || 0), 0) || 0
  const totalDays    = dailyLogs?.length || 0
  const fuelStops    = route.stops?.filter(s => s.type === 'fuel').length || 0
  const restStops    = route.stops?.filter(s => s.type === 'rest').length || 0
  const lastLog      = dailyLogs?.[dailyLogs.length - 1]
  const cycleEnd     = lastLog?.cycle_hours_at_end_of_day || 0
  const cyclePercent = Math.min(100, (cycleEnd / 70) * 100)

  return (
    <div className="card p-5 mb-4 anim-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-amber-400 rounded-full" />
        <h2 className="font-display text-[#0f1c35] text-xl">Trip Summary</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard icon="🛣️" label="Total Distance" value={`${route.total_distance_miles?.toLocaleString()} mi`} sub={`${route.legs?.length || 0} legs`} accent />
        <StatCard icon="📅" label="Trip Duration" value={`${totalDays} day${totalDays !== 1 ? 's' : ''}`} sub={`~${route.total_estimated_hours?.toFixed(1)}h drive`} />
        <StatCard icon="🚛" label="Drive Time" value={formatDuration(totalDriving)} sub={`${totalDriving.toFixed(1)}h total`} />
        <StatCard icon="📦" label="On Duty" value={formatDuration(totalOnDuty)} sub="Pickup, dropoff, fuel" />
      </div>

      {/* Stops row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-3 bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
          <span className="text-2xl">🛏</span>
          <div>
            <div className="text-xs text-orange-600 font-medium uppercase tracking-wide">Rest Stops</div>
            <div className="font-display font-bold text-orange-700 text-xl">{restStops}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
          <span className="text-2xl">⛽</span>
          <div>
            <div className="text-xs text-amber-600 font-medium uppercase tracking-wide">Fuel Stops</div>
            <div className="font-display font-bold text-amber-700 text-xl">{fuelStops}</div>
          </div>
        </div>
      </div>

      {/* 70hr cycle gauge */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">70-Hr Cycle Used (End of Trip)</span>
          <span className={`text-sm font-bold font-mono ${cycleEnd > 65 ? 'text-red-600' : cycleEnd > 50 ? 'text-amber-600' : 'text-green-600'}`}>
            {cycleEnd.toFixed(1)}h / 70h
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-700 ${cyclePercent > 92 ? 'bg-red-500' : cyclePercent > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
            style={{ width: `${cyclePercent}%` }}
          />
        </div>
        <div className="text-[11px] text-gray-400 mt-1.5 font-mono">{(70 - cycleEnd).toFixed(1)}h remaining after trip</div>
      </div>

      {/* Legs */}
      {route.legs?.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Route Legs</p>
          <div className="space-y-2">
            {route.legs.map((leg, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-[#0f1c35]/8 flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-[#0f1c35]">{i+1}</span>
                </div>
                <span className="flex-1 text-gray-600 truncate text-xs">
                  <span className="font-medium text-gray-800">{leg.from}</span>
                  <span className="text-gray-300 mx-1.5">→</span>
                  <span className="font-medium text-gray-800">{leg.to}</span>
                </span>
                <span className="font-mono text-xs text-[#0f1c35] font-medium">{leg.distance_miles} mi</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}