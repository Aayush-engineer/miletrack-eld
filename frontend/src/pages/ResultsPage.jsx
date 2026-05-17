import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import RouteMap from '../components/RouteMap'
import LogSheetList from '../components/LogSheetList'
import StopsList from '../components/StopsList'
import TripSummary from '../components/TripSummary'

const VIEWS = { MAP:'map', LOGS:'logs', STOPS:'stops' }

const NAV_STYLE = {
  flexShrink:0, zIndex:30,
  background:'#0a1628',
  borderBottom:'1px solid rgba(255,255,255,0.07)',
  boxShadow:'0 2px 24px rgba(0,0,0,0.4)',
}

export default function ResultsPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const [mobileView, setMobileView] = useState(VIEWS.MAP)
  const [activeTab, setActiveTab]   = useState('logs')
  const [mapFull, setMapFull]       = useState(false)

  const tripData = location.state?.tripData
  const formData = location.state?.formData

  useEffect(() => { if (!tripData) navigate('/', { replace:true }) }, [tripData, navigate])
  if (!tripData) return null

  const { route, daily_logs: dailyLogs } = tripData
  const totalDays  = dailyLogs?.length || 0
  const totalMiles = route?.total_distance_miles || 0
  const fuelStops  = route?.stops?.filter(s=>s.type==='fuel').length || 0
  const restStops  = route?.stops?.filter(s=>s.type==='rest').length || 0

  const TABS = [
    { id:'logs',  label:'Log Sheets',    count:totalDays },
    { id:'stops', label:'Stops & Rests', count:fuelStops+restStops },
  ]

  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', overflow:'hidden', background:'#f3f5f8' }}>

      {/* ═══ NAV ═══ */}
      <nav style={NAV_STYLE}>
        <div style={{ height:56, padding:'0 16px', display:'flex', alignItems:'center', gap:12 }}>

          <Link to="/" style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.4)', textDecoration:'none', fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:500, flexShrink:0, transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='white'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span className="hidden sm:block">New Trip</span>
          </Link>

          <div style={{ width:1, height:18, background:'rgba(255,255,255,0.1)', flexShrink:0 }}/>

          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <div style={{ width:26, height:26, borderRadius:7, background:'#f5c518', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="8" width="14" height="10" rx="2" fill="#0a1628"/>
                <rect x="15" y="11" width="7" height="7" rx="1.5" fill="#111e36"/>
                <circle cx="5" cy="19" r="2.5" fill="#0a1628" stroke="#f5c518" strokeWidth="1.5"/>
                <circle cx="12" cy="19" r="2.5" fill="#0a1628" stroke="#f5c518" strokeWidth="1.5"/>
                <circle cx="19" cy="19" r="2.5" fill="#0a1628" stroke="#f5c518" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="hidden sm:block" style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, color:'white', fontSize:15, letterSpacing:'-0.02em' }}>MileTrack</span>
          </div>

          {/* Breadcrumb */}
          {formData && (
            <div className="hidden md:flex" style={{ alignItems:'center', gap:6, marginLeft:8 }}>
              {[formData.current_location, formData.pickup_location, formData.dropoff_location].map((loc,i) => (
                <span key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {i>0 && <svg width="11" height="11" fill="none" stroke="#f5c518" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>}
                  <span style={{ padding:'2px 8px', background:'rgba(255,255,255,0.07)', borderRadius:6, color:'rgba(255,255,255,0.55)', fontSize:11, fontFamily:"'JetBrains Mono',monospace", maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{loc}</span>
                </span>
              ))}
            </div>
          )}

          {/* Stats + expand */}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div className="hidden sm:flex" style={{ gap:8 }}>
              {[
                { val:`${totalMiles.toLocaleString()} mi`, bg:'rgba(255,255,255,0.07)' },
                { val:`${totalDays} days`, bg:'rgba(255,255,255,0.07)' },
                { val:`${fuelStops} fuel · ${restStops} rest`, bg:'rgba(245,197,24,0.12)', color:'#f5c518' },
              ].map(({ val, bg, color }) => (
                <span key={val} style={{ padding:'4px 10px', background:bg, borderRadius:8, fontSize:12, color: color||'rgba(255,255,255,0.6)', fontFamily:"'JetBrains Mono',monospace" }}>
                  {val}
                </span>
              ))}
            </div>

            <button onClick={() => setMapFull(v=>!v)} className="hidden lg:flex"
              style={{ alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'rgba(255,255,255,0.6)', fontSize:12, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:500, transition:'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.13)';e.currentTarget.style.color='white'}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.07)';e.currentTarget.style.color='rgba(255,255,255,0.6)'}}>
              {mapFull ? (
                <><svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M15 9h4.5M15 9V4.5M9 15H4.5M9 15v4.5M15 15v4.5M15 15h4.5"/></svg> Show Logs</>
              ) : (
                <><svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg> Full Map</>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden lg:flex" style={{ flex:1, overflow:'hidden' }}>
        {/* Map panel */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          width: mapFull ? '100%' : '58%',       // ← width instead of flex
          flexShrink: 0,
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
          minWidth: 0,
        }}>
          <RouteMap route={route} />
        </div>

        {/* Right panel — fully hidden when map is fullscreen (no gray ghost) */}
        <div style={{
          flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
          borderLeft:'1px solid rgba(0,0,0,0.06)',
          opacity: mapFull?0:1,
          visibility: mapFull?'hidden':'visible',
          width: mapFull?0:undefined,
          minWidth: mapFull?0:undefined,
          pointerEvents: mapFull?'none':'auto',
          transition:'opacity 0.25s, visibility 0.25s, width 0.35s, min-width 0.35s',
        }}>
          {/* Tabs */}
          <div style={{ flexShrink:0, background:'white', borderBottom:'1px solid #f3f4f6', display:'flex' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="tab-btn" style={{ borderBottomColor: activeTab===tab.id?'#0a1628':'transparent', color: activeTab===tab.id?'#0a1628':'#9ca3af' }}>
                {tab.label}
                {tab.count > 0 && (
                  <span style={{ padding:'1px 7px', borderRadius:99, fontSize:10, fontFamily:"'JetBrains Mono',monospace", background: activeTab===tab.id?'#0a1628':'#f3f4f6', color: activeTab===tab.id?'white':'#6b7280', fontWeight:600 }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:16 }}>
            {activeTab==='logs'  && <div className="anim-fade-in"><TripSummary route={route} dailyLogs={dailyLogs}/><LogSheetList dailyLogs={dailyLogs}/></div>}
            {activeTab==='stops' && <div className="anim-fade-in"><StopsList route={route} dailyLogs={dailyLogs}/></div>}
          </div>
        </div>
      </div>

      {/* ═══ MOBILE ═══ */}
      <div className="flex lg:hidden" style={{ flex:1, flexDirection:'column', overflow:'hidden' }}>
        <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
          {[
            { id:VIEWS.MAP,   content:<RouteMap route={route} /> },
            { id:VIEWS.LOGS,  content:<div style={{padding:12,paddingBottom:32}}><TripSummary route={route} dailyLogs={dailyLogs}/><LogSheetList dailyLogs={dailyLogs}/></div> },
            { id:VIEWS.STOPS, content:<div style={{padding:12,paddingBottom:32}}><StopsList route={route} dailyLogs={dailyLogs}/></div> },
          ].map(({ id, content }) => (
            <div key={id} style={{
              position:'absolute', inset:0, overflow: id!==VIEWS.MAP?'auto':'hidden',
              background: id!==VIEWS.MAP?'#f3f5f8':'transparent',
              opacity: mobileView===id?1:0, pointerEvents: mobileView===id?'auto':'none',
              transition:'opacity 0.22s ease',
            }}>{content}</div>
          ))}
        </div>

        {/* Mobile bottom nav */}
        <div style={{ flexShrink:0, background:'white', borderTop:'1px solid #f3f4f6', boxShadow:'0 -4px 24px rgba(0,0,0,0.07)' }}>
          <div style={{ display:'flex', height:58 }}>
            {[
              { id:VIEWS.MAP,   label:'Map',        svg:<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> },
              { id:VIEWS.LOGS,  label:'Log Sheets', svg:<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
              { id:VIEWS.STOPS, label:'Stops',      svg:<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
            ].map(tab => {
              const active = mobileView===tab.id
              return (
                <button key={tab.id} onClick={() => setMobileView(tab.id)}
                  style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, border:'none', background:'none', cursor:'pointer', color: active?'#0a1628':'#9ca3af', transition:'color 0.15s', position:'relative', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  {active && <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:2, background:'#f5c518', borderRadius:'0 0 3px 3px' }}/>}
                  <div style={{ strokeWidth: active?2.5:1.75 }}>{tab.svg}</div>
                  <span style={{ fontSize:10, fontWeight: active?700:400 }}>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}