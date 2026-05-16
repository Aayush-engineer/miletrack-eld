function fmt(hours) {
  if (!hours && hours !== 0) return '—'
  const h = Math.floor(hours), m = Math.round((hours-h)*60)
  return h===0?`${m}m`:m===0?`${h}h`:`${h}h ${m}m`
}

function StatCard({ emoji, label, value, sub, highlight }) {
  return (
    <div style={{
      background: highlight ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : 'white',
      border: highlight ? '1px solid #fde68a' : '1px solid rgba(0,0,0,0.06)',
      borderRadius: 16, padding: '16px 18px',
      boxShadow: highlight ? '0 4px 20px rgba(245,197,24,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize:22, marginBottom:6 }}>{emoji}</div>
      <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:24, color: highlight ? '#92400e' : '#0a1628', letterSpacing:'-0.03em', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'#d1d5db', marginTop:2 }}>{sub}</div>}
    </div>
  )
}

export default function TripSummary({ route, dailyLogs }) {
  if (!route) return null
  const totalDriving = dailyLogs?.reduce((s,l)=>s+(l.total_hours?.driving||0),0)||0
  const totalOnDuty  = dailyLogs?.reduce((s,l)=>s+(l.total_hours?.on_duty_not_driving||0),0)||0
  const totalDays    = dailyLogs?.length||0
  const fuelStops    = route.stops?.filter(s=>s.type==='fuel').length||0
  const restStops    = route.stops?.filter(s=>s.type==='rest').length||0
  const lastLog      = dailyLogs?.[dailyLogs.length-1]
  const cycleEnd     = lastLog?.cycle_hours_at_end_of_day||0
  const pct          = Math.min(100,(cycleEnd/70)*100)
  const cycleColor   = pct>90?'#ef4444':pct>70?'#f59e0b':'#10b981'

  return (
    <div className="card p-5 mb-4 anim-fade-up">
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
        <div style={{ width:3, height:22, background:'#f5c518', borderRadius:2 }}/>
        <h2 style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:20, color:'#0a1628', letterSpacing:'-0.02em' }}>Trip Summary</h2>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        <StatCard emoji="🛣️" label="Total Distance" value={`${route.total_distance_miles?.toLocaleString()} mi`} sub={`${route.legs?.length||0} legs`} highlight />
        <StatCard emoji="📅" label="Trip Duration" value={`${totalDays} day${totalDays!==1?'s':''}`} sub={`~${route.total_estimated_hours?.toFixed(1)}h drive`} />
        <StatCard emoji="🚛" label="Drive Time" value={fmt(totalDriving)} sub={`${totalDriving.toFixed(1)}h total`} />
        <StatCard emoji="📦" label="On Duty" value={fmt(totalOnDuty)} sub="Pickup, dropoff, fuel" />
      </div>

      {/* Stops */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        {[
          { bg:'#fff7ed', border:'#fed7aa', textC:'#c2410c', emoji:'🛏', label:'Rest Stops', val:restStops },
          { bg:'#fffbeb', border:'#fde68a', textC:'#b45309', emoji:'⛽', label:'Fuel Stops', val:fuelStops },
        ].map(({ bg, border, textC, emoji, label, val }) => (
          <div key={label} style={{ background:bg, border:`1px solid ${border}`, borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:22 }}>{emoji}</span>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:textC, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
              <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:22, color:textC, letterSpacing:'-0.02em', lineHeight:1.1 }}>{val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cycle gauge */}
      <div style={{ background:'#f9fafb', borderRadius:12, padding:'14px 16px', border:'1px solid #f3f4f6' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em' }}>70-Hr Cycle Used (End of Trip)</span>
          <span style={{ fontSize:13, fontWeight:700, color:cycleColor, fontFamily:"'JetBrains Mono',monospace" }}>{cycleEnd.toFixed(1)}h / 70h</span>
        </div>
        <div style={{ background:'#e5e7eb', borderRadius:99, height:8, overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:99, background:cycleColor, width:`${pct}%`, transition:'width 0.7s cubic-bezier(0.16,1,0.3,1)' }}/>
        </div>
        <div style={{ fontSize:11, color:'#9ca3af', marginTop:6, fontFamily:"'JetBrains Mono',monospace" }}>{(70-cycleEnd).toFixed(1)}h remaining after trip</div>
      </div>

      {/* Route legs */}
      {route.legs?.length > 0 && (
        <div style={{ marginTop:16 }}>
          <p style={{ fontSize:10, fontWeight:700, color:'#d1d5db', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Route Legs</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {route.legs.map((leg,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
                <div style={{ width:20, height:20, borderRadius:'50%', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:'#0a1628' }}>{i+1}</span>
                </div>
                <span style={{ flex:1, color:'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  <strong style={{ color:'#0a1628' }}>{leg.from}</strong>
                  <span style={{ color:'#d1d5db', margin:'0 6px' }}>→</span>
                  <strong style={{ color:'#0a1628' }}>{leg.to}</strong>
                </span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#0a1628', fontWeight:500, flexShrink:0 }}>{leg.distance_miles} mi</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}