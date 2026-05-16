function fmt(hours) {
  if (!hours) return ''
  const h = Math.floor(hours), m = Math.round((hours - h) * 60)
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`
}

function fmtTime(str) {
  if (!str) return ''
  try {
    const [dp, tp] = str.split('T')
    const [y, mo, d] = dp.split('-').map(Number)
    const [h, mi] = tp.split(':').map(Number)
    return new Date(y, mo-1, d, h, mi).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    })
  } catch { return str }
}

const STATUS = {
  off_duty:            { label: 'Off Duty',           dot: '#94a3b8', chip: 'chip-off-duty' },
  driving:             { label: 'Driving',             dot: '#059669', chip: 'chip-driving'  },
  on_duty_not_driving: { label: 'On Duty',             dot: '#2563eb', chip: 'chip-on-duty'  },
  sleeper_berth:       { label: 'Sleeper Berth',       dot: '#7c3aed', chip: 'chip-sleeper'  },
}

const F = { display: "'Clash Display',system-ui,sans-serif", body: "'Plus Jakarta Sans',system-ui,sans-serif", mono: "'JetBrains Mono',ui-monospace,monospace" }

export default function StopsList({ route, dailyLogs }) {
  const stops = route?.stops || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Route stops */}
      {stops.length > 0 && (
        <div className="card" style={{ padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 3, height: 20, background: '#f5c518', borderRadius: 2 }} />
            <h3 style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18, color: '#0a1628', letterSpacing: '-0.02em' }}>
              Route Stops
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stops.map((stop, i) => {
              const isFuel   = stop.type === 'fuel'
              const isRestart = (stop.duration_minutes || 0) >= 34 * 60
              const label    = isFuel ? 'Fuel Stop' : isRestart ? '34-Hr Restart' : '10-Hr Rest'
              const emoji    = isFuel ? '⛽' : isRestart ? '🔄' : '🛏'
              const bg       = isFuel ? '#fffbeb' : '#fff7ed'
              const border   = isFuel ? '#fde68a' : '#fed7aa'
              const textC    = isFuel ? '#92400e' : '#9a3412'

              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: bg, border: `1px solid ${border}`, borderRadius: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${border}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 99, background: border, fontSize: 11, fontWeight: 700, color: textC, fontFamily: F.body, letterSpacing: '0.02em', marginBottom: 4 }}>
                      {label}
                    </span>
                    {stop.arrival_time && (
                      <p style={{ fontSize: 11, color: '#6b7280', fontFamily: F.body, marginBottom: 2 }}>
                        Arrival: {fmtTime(stop.arrival_time)}
                      </p>
                    )}
                    {stop.duration_minutes && (
                      <p style={{ fontSize: 12, fontWeight: 600, color: textC, fontFamily: F.mono }}>
                        Duration: {fmt(stop.duration_minutes / 60)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Day-by-day timeline */}
      <div className="card" style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 3, height: 20, background: '#2563eb', borderRadius: 2 }} />
          <h3 style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18, color: '#0a1628', letterSpacing: '-0.02em' }}>
            Day-by-Day Activity
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {dailyLogs?.map((log, idx) => {
            const significant = log.segments?.filter(s =>
              s.status !== 'off_duty' || s.duration_hours >= 8.0
            ) || []

            return (
              <div key={idx}>
                {/* Day header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0a1628', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: F.display }}>
                    {log.day}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0a1628', fontFamily: F.body, lineHeight: 1.2 }}>{log.date}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', fontFamily: F.body, fontWeight: 400 }}>
                      {log.from_location} → {log.to_location}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: F.mono, color: '#9ca3af' }}>{Math.round(log.total_miles_today)} mi</span>
                </div>

                {/* Segments timeline */}
                <div style={{ marginLeft: 14, borderLeft: '2px solid #f3f4f6', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {significant.map((seg, si) => {
                    const meta = STATUS[seg.status] || STATUS.off_duty
                    return (
                      <div key={si} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.dot, flexShrink: 0, marginTop: 5 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span className={meta.chip}>{meta.label}</span>
                            <span style={{ fontSize: 11, fontFamily: F.mono, color: '#9ca3af' }}>
                              {seg.start}–{seg.end}
                            </span>
                            <span style={{ fontSize: 11, color: '#d1d5db', fontFamily: F.body }}>
                              ({fmt(seg.duration_hours)})
                            </span>
                          </div>
                          {seg.location && (
                            <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: F.body }}>
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
          })}
        </div>
      </div>
    </div>
  )
}