function formatDuration(hours) {
  if (!hours) return ''
  const h = Math.floor(hours); const m = Math.round((hours-h)*60)
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`
}

function formatArrival(str) {
  if (!str) return ''
  try {
    const [dp, tp] = str.split('T')
    const [y,mo,d] = dp.split('-').map(Number)
    const [h,mi] = tp.split(':').map(Number)
    return new Date(y,mo-1,d,h,mi).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',hour12:true})
  } catch { return str }
}

const STATUS_META = {
  off_duty:            { label:'Off Duty',           dot:'bg-slate-300',   chipCls:'chip-off-duty' },
  driving:             { label:'Driving',             dot:'bg-green-400',   chipCls:'chip-driving'  },
  on_duty_not_driving: { label:'On Duty',             dot:'bg-blue-400',    chipCls:'chip-on-duty'  },
  sleeper_berth:       { label:'Sleeper Berth',       dot:'bg-purple-400',  chipCls:'chip-sleeper'  },
}

export default function StopsList({ route, dailyLogs }) {
  const stops = route?.stops || []

  return (
    <div className="space-y-4">
      {/* Map stops */}
      {stops.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-amber-400 rounded-full" />
            <h3 className="font-display text-[#0f1c35] text-lg">Route Stops</h3>
          </div>
          <div className="space-y-3">
            {stops.map((stop, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${stop.type === 'fuel' ? 'bg-amber-50 border-amber-100' : 'bg-orange-50 border-orange-100'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${stop.type === 'fuel' ? 'bg-amber-100' : 'bg-orange-100'}`}>
                  {stop.type === 'fuel' ? '⛽' : '🛏'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`chip ${stop.type === 'fuel' ? 'chip-fuel' : 'chip-rest'}`}>
                      {stop.type === 'fuel' ? 'Fuel Stop' : stop.duration_hours >= 30 ? '34-Hr Restart' : '10-Hr Rest'}
                    </span>
                  </div>
                  {stop.arrival_time && (
                    <p className="text-xs text-gray-500 mt-1">Arrival: {formatArrival(stop.arrival_time)}</p>
                  )}
                  {stop.duration_minutes && (
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">Duration: {formatDuration(stop.duration_minutes/60)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day-by-day */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-[#1e6eb5] rounded-full" />
          <h3 className="font-display text-[#0f1c35] text-lg">Day-by-Day Activity</h3>
        </div>
        <div className="space-y-6">
          {dailyLogs?.map((log, idx) => {
            const significant = log.segments?.filter(s =>
              s.status !== 'off_duty' || s.duration_hours >= 8.0
            ) || []
            return (
              <div key={idx}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#0f1c35] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{log.day}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f1c35] leading-none">{log.date}</p>
                    <p className="text-xs text-gray-400">{log.from_location} → {log.to_location}</p>
                  </div>
                  <span className="ml-auto text-xs font-mono text-gray-400">{Math.round(log.total_miles_today)} mi</span>
                </div>
                <div className="ml-3.5 border-l-2 border-gray-100 pl-4 space-y-2.5">
                  {significant.map((seg, si) => {
                    const meta = STATUS_META[seg.status] || STATUS_META.off_duty
                    return (
                      <div key={si} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${meta.dot}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={meta.chipCls}>{meta.label}</span>
                            <span className="text-[11px] font-mono text-gray-400">{seg.start}–{seg.end}</span>
                            <span className="text-[11px] text-gray-400">({formatDuration(seg.duration_hours)})</span>
                          </div>
                          {seg.location && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{seg.location}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}