import { useState, useEffect } from 'react'
import TripForm from '../components/TripForm'

function Truck() {
  return (
    <div className="relative w-full flex items-center justify-center py-6">
      <div className="absolute bottom-6 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <svg width="200" height="72" viewBox="0 0 200 72" fill="none" className="anim-float"
        style={{ filter: 'drop-shadow(0 12px 28px rgba(245,197,24,0.2))' }}>
        <rect x="2" y="18" width="118" height="40" rx="5" fill="#111e36" stroke="rgba(245,197,24,0.2)" strokeWidth="1"/>
        <rect x="8" y="23" width="106" height="28" rx="3" fill="#0a1628"/>
        <text x="61" y="41" textAnchor="middle" fill="rgba(245,197,24,0.7)" fontSize="8.5"
          style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, letterSpacing: 2 }}>MILETRACK</text>
        <rect x="120" y="24" width="58" height="34" rx="5" fill="#1a2e52" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
        <rect x="132" y="28" width="38" height="20" rx="3" fill="rgba(37,99,235,0.25)" stroke="rgba(37,99,235,0.3)" strokeWidth="0.5"/>
        <rect x="133" y="29" width="36" height="10" rx="2" fill="rgba(255,255,255,0.06)"/>
        <rect x="173" y="16" width="5" height="11" rx="2.5" fill="#1e2d4a"/>
        {[0,1,2].map(i=>(
          <ellipse key={i} cx={176} cy={12-i*4} rx={3+i*0.8} ry={2+i*0.5}
            fill="rgba(255,255,255,0.04)" style={{animation:`shimmer 2s ${i*0.4}s infinite`}}/>
        ))}
        {[18, 72, 120, 152].map((cx,i) => (
          <g key={i}>
            <circle cx={cx} cy={60} r={11} fill="#080f1e" stroke="rgba(245,197,24,0.35)" strokeWidth="1.5"/>
            <circle cx={cx} cy={60} r={5.5} fill="#111e36"/>
            <circle cx={cx} cy={60} r={2} fill="#f5c518"/>
            <line x1={cx-8} y1={60} x2={cx+8} y2={60} stroke="rgba(245,197,24,0.15)" strokeWidth="0.5"/>
            <line x1={cx} y1={52} x2={cx} y2={68} stroke="rgba(245,197,24,0.15)" strokeWidth="0.5"/>
          </g>
        ))}
        <ellipse cx="182" cy="41" rx="7" ry="4" fill="rgba(245,197,24,0.08)"/>
        <circle cx="178" cy="41" r="3" fill="#f5c518" opacity="0.9"/>
        <circle cx="195" cy="41" r="2" fill="rgba(245,197,24,0.4)"/>
      </svg>
    </div>
  )
}

function StatPill({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: 22, color: '#f5c518', letterSpacing: '-0.03em' }}>{value}</span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1, fontWeight: 500 }}>{label}</span>
    </div>
  )
}

function Rule({ rule, cite, i }) {
  return (
    <div className={`anim-fade-up delay-${(i+1)*100}`}
      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:'#f5c518', flexShrink:0 }}/>
        <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)', fontWeight:500 }}>{rule}</span>
      </div>
      <code style={{ fontSize:10, color:'rgba(245,197,24,0.5)', fontFamily:"'JetBrains Mono',monospace", flexShrink:0, marginLeft:12 }}>{cite}</code>
    </div>
  )
}

const RULES = [
  ['11-Hour Driving Limit',       '§395.3(a)(3)'],
  ['14-Hour Driving Window',      '§395.3(a)(2)'],
  ['30-Min Break after 8hrs',     '§395.3(a)(3)(ii)'],
  ['70-Hour / 8-Day Cycle',       '§395.3(b)'],
  ['34-Hour Restart Option',      '§395.3(c)(1)'],
  ['Fuel Stop / 1,000 miles',     'Operational'],
]

export default function HomePage() {
  const [ready, setReady] = useState(false)
  useEffect(() => { setTimeout(() => setReady(true), 60) }, [])

  return (
    <div className="min-h-screen hero-bg" style={{ position:'relative' }}>
      {/* Grid overlay */}
      <div className="hero-grid absolute inset-0 pointer-events-none" />

      {/* Nav */}
      <nav style={{ position:'relative', zIndex:10, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'#f5c518', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 12px rgba(245,197,24,0.35)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="8" width="14" height="10" rx="2" fill="#0a1628"/>
                <rect x="15" y="11" width="7" height="7" rx="1.5" fill="#111e36"/>
                <circle cx="5" cy="19" r="2.5" fill="#0a1628" stroke="#f5c518" strokeWidth="1.5"/>
                <circle cx="12" cy="19" r="2.5" fill="#0a1628" stroke="#f5c518" strokeWidth="1.5"/>
                <circle cx="19" cy="19" r="2.5" fill="#0a1628" stroke="#f5c518" strokeWidth="1.5"/>
              </svg>
            </div>
            <span style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:17, color:'white', letterSpacing:'-0.02em' }}>MileTrack</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)', fontFamily:"'JetBrains Mono',monospace" }}>49 CFR Part 395</span>
            <div style={{ padding:'4px 12px', borderRadius:20, border:'1px solid rgba(5,150,105,0.3)', background:'rgba(5,150,105,0.12)', fontSize:11, color:'#34d399', fontWeight:600 }}>Free to use</div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position:'relative', zIndex:10, maxWidth:1280, margin:'0 auto', padding:'48px 24px 80px' }}>
        <div style={{ display:'grid', gap:40, alignItems:'start' }}
          className="responsive-hero-grid">

          {/* Left */}
          <div style={{ opacity: ready ? 1 : 0, transition:'opacity 0.3s' }}>
            {/* Badge */}
            <div className="anim-fade-up" style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 14px', borderRadius:99, border:'1px solid rgba(245,197,24,0.2)', background:'rgba(245,197,24,0.06)', marginBottom:28 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#f5c518' }} className="animate-pulse"/>
              <span style={{ fontSize:11, color:'rgba(245,197,24,0.85)', fontWeight:600, letterSpacing:'0.05em' }}>FMCSA APRIL 2022 · 49 CFR PART 395</span>
            </div>

            {/* Headline */}
            <div className="anim-fade-up delay-100">
              <h1 style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, letterSpacing:'-0.04em', lineHeight:0.92, color:'white', marginBottom:20 }}>
                <span style={{ display:'block', fontSize:'clamp(52px,7vw,88px)' }}>ELD Trip</span>
                <span className="text-grad" style={{ display:'block', fontSize:'clamp(52px,7vw,88px)' }}>Planner</span>
                <span style={{ display:'block', fontSize:'clamp(18px,2.5vw,26px)', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:300, color:'rgba(255,255,255,0.4)', marginTop:10, letterSpacing:'-0.01em' }}>for Interstate Truckers</span>
              </h1>
            </div>

            <p className="anim-fade-up delay-200" style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.75, maxWidth:420, marginBottom:36, fontWeight:400 }}>
              Enter your route and get a fully FMCSA-compliant Hours of Service schedule with pixel-perfect ELD log sheets — ready to download in seconds.
            </p>

            {/* Truck */}
            <div className="anim-fade-up delay-300">
              <Truck />
            </div>

            {/* Stats */}
            <div className="anim-fade-up delay-400" style={{ display:'flex', gap:32, alignItems:'center', padding:'20px 0', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', margin:'8px 0 28px' }}>
              <StatPill value="6" label="HOS Rules" />
              <div style={{ width:1, height:32, background:'rgba(255,255,255,0.08)' }}/>
              <StatPill value="55mph" label="Avg Speed" />
              <div style={{ width:1, height:32, background:'rgba(255,255,255,0.08)' }}/>
              <StatPill value="70h" label="Cycle Limit" />
            </div>

            {/* Rules */}
            <div className="anim-fade-up delay-500">
              <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.2)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>Rules Enforced</p>
              <div style={{ borderRadius:14, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', padding:'2px 16px' }}>
                {RULES.map(([rule, cite], i) => <Rule key={rule} rule={rule} cite={cite} i={i}/>)}
              </div>
            </div>
          </div>

          {/* Right — Form card */}
          <div className="anim-fade-up delay-200" style={{ opacity: ready ? 1 : 0, transition:'opacity 0.3s' }}>
            <div style={{ position:'relative' }}>
              {/* Glow */}
              <div style={{ position:'absolute', inset:-2, borderRadius:22, background:'rgba(245,197,24,0.08)', filter:'blur(20px)', zIndex:0 }}/>
              <div style={{ position:'relative', zIndex:1, background:'white', borderRadius:20, padding:'28px 28px 24px', boxShadow:'0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.9)' }}>
                <div style={{ marginBottom:22 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#f5c518' }}/>
                    <h2 style={{ fontFamily:"'Clash Display',sans-serif", fontSize:24, fontWeight:700, color:'#0a1628', letterSpacing:'-0.03em' }}>Plan Your Trip</h2>
                  </div>
                  <p style={{ fontSize:13, color:'#9ca3af', paddingLeft:16, fontWeight:400 }}>Fill in your route details — results in ~15 seconds</p>
                </div>
                <TripForm />
              </div>
            </div>

            {/* Trust row */}
            <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:20, marginTop:16 }}>
              {[['🔒','No data stored'],['⚡','~15 sec results'],['📱','PNG log download'],['🆓','100% free']].map(([ico,txt])=>(
                <span key={txt} style={{ fontSize:11, color:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', gap:5, fontWeight:500 }}>
                  <span style={{ fontSize:13 }}>{ico}</span>{txt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ position:'relative', zIndex:10, borderTop:'1px solid rgba(255,255,255,0.04)', padding:'56px 24px', background:'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <p style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.18)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:36 }}>How it works</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16 }}>
            {[
              { n:'01', icon:'📍', t:'Enter Route', d:'Input your current position, pickup, and dropoff cities. We geocode automatically with OpenStreetMap.' },
              { n:'02', icon:'⏱', t:'HOS Calculated', d:'All 6 FMCSA rules enforced simultaneously. Breaks, rests, fuel stops inserted automatically.' },
              { n:'03', icon:'📋', t:'Download Logs', d:'Get pixel-perfect ELD log sheets for every day — matching the official FMCSA format exactly.' },
            ].map(({ n, icon, t, d }, i) => (
              <div key={n} className={`anim-fade-up delay-${(i+1)*100}`}
                style={{ padding:'22px 24px', borderRadius:16, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', position:'relative' }}>
                <div style={{ position:'absolute', top:18, right:18, fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.08)', fontWeight:400 }}>{n}</div>
                <div style={{ fontSize:26, marginBottom:14 }}>{icon}</div>
                <h3 style={{ fontFamily:"'Clash Display',sans-serif", fontSize:18, color:'white', fontWeight:700, marginBottom:8, letterSpacing:'-0.02em' }}>{t}</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.65, fontWeight:400 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ position:'relative', zIndex:10, borderTop:'1px solid rgba(255,255,255,0.04)', padding:'20px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.15)' }}>© 2026 MileTrack ELD</p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.1)', fontFamily:"'JetBrains Mono',monospace" }}>OSRM · OpenStreetMap · Nominatim</p>
        </div>
      </footer>
    </div>
  )
}