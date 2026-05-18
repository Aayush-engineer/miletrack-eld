import { useState, useEffect, useRef } from 'react'
import TripForm from '../components/TripForm'

function AmericanTruck({ flipped = false, speed = 1, smoking = false, dimmed = false, scale = 1 }) {
  const uid = useRef(Math.random().toString(36).slice(2)).current
  const spinDur = `${Math.max(0.3, 0.8 / Math.max(speed, 0.1))}s`

  return (
    <svg
      width={48 * scale}
      height={18 * scale}
      viewBox="0 0 48 18"
      fill="none"
      style={{
        display: 'block',
        transform: flipped ? 'scaleX(-1)' : 'none',
        opacity: dimmed ? 0.45 : 1,
        transition: 'opacity 0.4s',
        overflow: 'visible',
        filter: dimmed
          ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 0 4px rgba(245,197,24,0.35)) drop-shadow(0 2px 5px rgba(0,0,0,0.65))',
      }}
    >
      <defs>
        <linearGradient id={`trail${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3260" />
          <stop offset="55%" stopColor="#152545" />
          <stop offset="100%" stopColor="#0b1830" />
        </linearGradient>
        <linearGradient id={`hood${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c0392b" />
          <stop offset="40%" stopColor="#a93226" />
          <stop offset="100%" stopColor="#7b241c" />
        </linearGradient>
        <linearGradient id={`cab${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c0392b" />
          <stop offset="100%" stopColor="#922b21" />
        </linearGradient>
        <linearGradient id={`chrome${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="50%" stopColor="#b0b0b0" />
          <stop offset="100%" stopColor="#888" />
        </linearGradient>
      </defs>

      <rect x="1" y="3" width="26" height="10" rx="1"
        fill={`url(#trail${uid})`} stroke="rgba(245,197,24,0.25)" strokeWidth="0.5" />
      <rect x="1.5" y="3.3" width="25" height="1.8" rx="0.4"
        fill="rgba(255,255,255,0.06)" />
      {[5, 10, 15, 20].map(x => (
        <line key={x} x1={x} y1="3.5" x2={x} y2="12.5"
          stroke="rgba(245,197,24,0.08)" strokeWidth="0.4" />
      ))}
      <rect x="1" y="4" width="1" height="2" rx="0.2" fill="#ff3333" opacity="0.9" />
      <rect x="1" y="7.5" width="1" height="1.5" rx="0.2" fill="#ff8800" opacity="0.7" />
      <rect x="1" y="12.5" width="26" height="1" rx="0.3" fill="rgba(0,0,0,0.5)" />
      <rect x="26" y="8" width="3" height="1.2" rx="0.3" fill="#0a1420" />

      <rect x="29" y="4" width="11" height="9" rx="1.2"
        fill={`url(#cab${uid})`} stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
      <rect x="30" y="2.5" width="8" height="3" rx="1"
        fill="#b03027" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
      <rect x="36" y="5" width="3.5" height="4.5" rx="0.8"
        fill="rgba(140,200,255,0.2)" stroke="rgba(140,200,255,0.4)" strokeWidth="0.4" />
      <line x1="36.5" y1="5.5" x2="38" y2="9" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
      <line x1="35.5" y1="4.2" x2="35.5" y2="12.5" stroke="rgba(0,0,0,0.2)" strokeWidth="0.3" />
      <rect x="36.5" y="9" width="2.5" height="0.6" rx="0.3" fill="rgba(255,255,255,0.3)" />

      <path d="M40 5.5 L47 6.5 L47 12 L40 13 Z"
        fill={`url(#hood${uid})`} stroke="rgba(0,0,0,0.2)" strokeWidth="0.4" />
      <line x1="40.5" y1="5.8" x2="46.5" y2="6.8" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      {[43, 45].map(x => (
        <line key={x} x1={x} y1="7" x2={x} y2="11.5" stroke="rgba(0,0,0,0.25)" strokeWidth="0.4" />
      ))}

      <rect x="46.2" y="6.8" width="1.5" height="4.5" rx="0.3"
        fill={`url(#chrome${uid})`} />
      {[7.5, 8.5, 9.5, 10.5].map(y => (
        <line key={y} x1="46.2" y1={y} x2="47.7" y2={y} stroke="rgba(0,0,0,0.3)" strokeWidth="0.25" />
      ))}

      <rect x="46.8" y="7" width="1.2" height="3" rx="0.5" fill="#f5c518" opacity="0.95" />
      <ellipse cx="48.2" cy="8.5" rx="2.5" ry="1.5" fill="rgba(245,197,24,0.1)" />

      <rect x="29.5" y="0" width="1.2" height="5.5" rx="0.4"
        fill={`url(#chrome${uid})`} stroke="rgba(180,180,180,0.3)" strokeWidth="0.3" />
      <rect x="31.2" y="0.5" width="1.1" height="5" rx="0.4"
        fill={`url(#chrome${uid})`} stroke="rgba(180,180,180,0.3)" strokeWidth="0.3" />
      <rect x="29.1" y="0" width="2" height="0.8" rx="0.3" fill="#c8c8c8" />
      <rect x="30.9" y="0.5" width="1.8" height="0.7" rx="0.3" fill="#c8c8c8" />

      {smoking && (
        <g>
          <circle cx="30.1" cy="-0.5" r="1.2" fill="rgba(180,180,190,0.35)">
            <animate attributeName="cy" values="-0.5;-3.5;-6" dur="1.0s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0.15;0" dur="1.0s" repeatCount="indefinite" />
            <animate attributeName="r" values="1;1.8;2.8" dur="1.0s" repeatCount="indefinite" />
          </circle>
          <circle cx="31.8" cy="-1" r="0.9" fill="rgba(160,160,170,0.3)">
            <animate attributeName="cy" values="-1;-4;-7" dur="1.3s" repeatCount="indefinite" begin="0.2s" />
            <animate attributeName="opacity" values="0.3;0.1;0" dur="1.3s" repeatCount="indefinite" begin="0.2s" />
          </circle>
        </g>
      )}

      <rect x="40" y="11" width="4.5" height="2" rx="0.5"
        fill={`url(#chrome${uid})`} opacity="0.7" />

      <rect x="46.5" y="11.5" width="1.5" height="1.2" rx="0.3"
        fill={`url(#chrome${uid})`} />

      {[8, 17].map((cx, i) => (
        <g key={`tw${i}`}>
          <circle cx={cx} cy="15" r="3.2" fill="#060d1a" stroke="rgba(245,197,24,0.45)" strokeWidth="0.8" />
          <circle cx={cx} cy="15" r="1.5" fill="#0e1c34" />
          <g style={{ transformOrigin: `${cx}px 15px`, animation: `wheel-spin ${spinDur} linear infinite` }}>
            {[0, 60, 120, 180, 240, 300].map(deg => {
              const r = deg * Math.PI / 180
              return <line key={deg} x1={cx} y1={15}
                x2={cx + Math.cos(r) * 1.3} y2={15 + Math.sin(r) * 1.3}
                stroke="rgba(245,197,24,0.5)" strokeWidth="0.5" />
            })}
          </g>
          <circle cx={cx} cy="15" r="0.7" fill="#f5c518" />
        </g>
      ))}
      {[32, 41].map((cx, i) => (
        <g key={`cw${i}`}>
          <circle cx={cx} cy="15" r="3.2" fill="#060d1a" stroke="rgba(245,197,24,0.45)" strokeWidth="0.8" />
          <circle cx={cx} cy="15" r="1.5" fill="#0e1c34" />
          <g style={{ transformOrigin: `${cx}px 15px`, animation: `wheel-spin ${spinDur} linear infinite` }}>
            {[0, 60, 120, 180, 240, 300].map(deg => {
              const r = deg * Math.PI / 180
              return <line key={deg} x1={cx} y1={15}
                x2={cx + Math.cos(r) * 1.3} y2={15 + Math.sin(r) * 1.3}
                stroke="rgba(245,197,24,0.5)" strokeWidth="0.5" />
            })}
          </g>
          <circle cx={cx} cy="15" r="0.7" fill="#f5c518" />
        </g>
      ))}
    </svg>
  )
}

const TRUCK_W = 48
const SAFE = TRUCK_W + 16

const INIT_TRUCKS = [
  { id: 0, x: 80,  baseSpeed: 1.3, smoking: false },
  { id: 1, x: 210, baseSpeed: 0.9, smoking: true  },
  { id: 2, x: 360, baseSpeed: 1.6, smoking: false },
]

function NavTruckLane({ containerWidth, scale = 1 }) {
  const W = containerWidth || 500
  const stateRef = useRef(INIT_TRUCKS.map(t => ({ ...t, speed: t.baseSpeed, parked: false })))
  const [positions, setPositions] = useState(stateRef.current.map(t => ({ ...t })))
  const rafRef = useRef(null)
  const lastRef = useRef(performance.now())

  useEffect(() => {
    const tick = (now) => {
      const dt = Math.min(now - lastRef.current, 40)
      lastRef.current = now
      const ts = stateRef.current
      const sorted = [...ts].sort((a, b) => a.x - b.x)

      for (let i = 0; i < sorted.length; i++) {
        const t = sorted[i]
        if (t.parked) continue
        const ahead = sorted[i + 1]
        if (ahead && !ahead.parked) {
          const gap = ahead.x - t.x
          if (gap < SAFE) t.speed = Math.max(0, ahead.speed * 0.9)
          else if (gap < SAFE * 2) t.speed = t.baseSpeed * 0.8 + t.speed * 0.2
          else t.speed = t.baseSpeed
        } else {
          t.speed = t.baseSpeed
        }
        t.x -= t.speed * (dt / 16)
        if (t.x < -TRUCK_W * scale - 4) {
          if (!t.parked) {
            t.parked = true; t.speed = 0
            setTimeout(() => {
              t.x = W + TRUCK_W * scale + Math.random() * 100
              t.parked = false; t.speed = t.baseSpeed
            }, 700 + Math.random() * 400)
          }
        }
      }
      setPositions(ts.map(t => ({ ...t })))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [W, scale])

  const TH = 18 * scale
  const roadY = TH - 1

  return (
    <div style={{ position: 'relative', width: '100%', height: TH + 6, overflow: 'hidden' }}>

      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: roadY,
        height: 3,
        background: 'rgba(255,255,255,0.055)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: roadY + 1,   
        height: 1,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '300%',
          height: '100%',
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(245,197,24,0.18) 0px, rgba(245,197,24,0.18) 12px, transparent 12px, transparent 28px)',
          animation: 'road-dash 1.4s linear infinite',
        }}/>
      </div>

      {positions.map(t => (
        <div key={t.id} style={{ position: 'absolute', left: t.x, top: 0, willChange: 'transform' }}>
          <AmericanTruck flipped={true} speed={t.speed} smoking={t.smoking} dimmed={t.parked} scale={scale} />
        </div>
      ))}
    </div>
  )
}

function Navbar() {
  const laneRef = useRef(null)
  const [laneW, setLaneW] = useState(500)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const update = () => {
      setMobile(window.innerWidth < 640)
      if (laneRef.current) setLaneW(laneRef.current.offsetWidth)
    }
    update()
    const obs = new ResizeObserver(update)
    if (laneRef.current) obs.observe(laneRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <nav style={{
      position: 'relative', zIndex: 30,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(5,10,22,0.95)',
      backdropFilter: 'blur(14px)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 20px',
        height: 52, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, position: 'relative', zIndex: 2 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: '#f5c518',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(245,197,24,0.4)', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="1" y="8" width="14" height="10" rx="2" fill="#0a1628"/>
              <rect x="15" y="11" width="7" height="7" rx="1.5" fill="#111e36"/>
              <circle cx="5"  cy="19" r="2.5" fill="#0a1628" stroke="#f5c518" strokeWidth="1.5"/>
              <circle cx="12" cy="19" r="2.5" fill="#0a1628" stroke="#f5c518" strokeWidth="1.5"/>
              <circle cx="19" cy="19" r="2.5" fill="#0a1628" stroke="#f5c518" strokeWidth="1.5"/>
            </svg>
          </div>
          <span style={{ fontFamily:"'Clash Display',sans-serif", fontWeight: 700, fontSize: 15, color: 'white', letterSpacing: '-0.02em' }}>MileTrack</span>
        </div>

        {/* Truck Lane */}
        <div ref={laneRef} style={{
          flex: 1, position: 'relative', height: 52,
          display: 'flex', alignItems: 'center',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0px, black 14px, black calc(100% - 10px), transparent 100%)',
          maskImage: 'linear-gradient(90deg, transparent 0px, black 14px, black calc(100% - 10px), transparent 100%)',
          overflow: 'hidden',
        }}>
          <NavTruckLane containerWidth={laneW} scale={mobile ? 0.78 : 1} />
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {!mobile && (
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>
              49 CFR Part 395
            </span>
          )}
          <div style={{
            padding: '4px 10px', borderRadius: 20,
            border: '1px solid rgba(5,150,105,0.3)', background: 'rgba(5,150,105,0.12)',
            fontSize: 10, color: '#34d399', fontWeight: 600, whiteSpace: 'nowrap',
          }}>Free to use</div>
        </div>
      </div>
    </nav>
  )
}

function HeroTruck() {
  return (
    <div className="relative w-full flex items-center justify-center py-6">
      <div className="absolute bottom-6 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"/>
      <svg width="200" height="72" viewBox="0 0 200 72" fill="none" className="anim-float"
        style={{ filter: 'drop-shadow(0 12px 28px rgba(245,197,24,0.2))' }}>
        <rect x="2"   y="18" width="118" height="40" rx="5" fill="#111e36" stroke="rgba(245,197,24,0.2)" strokeWidth="1"/>
        <rect x="8"   y="23" width="106" height="28" rx="3" fill="#0a1628"/>
        <text x="61"  y="41" textAnchor="middle" fill="rgba(245,197,24,0.7)" fontSize="8.5"
          style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, letterSpacing:2 }}>MILETRACK</text>
        <rect x="120" y="24" width="58"  height="34" rx="5" fill="#1a2e52" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
        <rect x="132" y="28" width="38"  height="20" rx="3" fill="rgba(37,99,235,0.25)" stroke="rgba(37,99,235,0.3)" strokeWidth="0.5"/>
        {[18,72,120,152].map((cx,i) => (
          <g key={i}>
            <circle cx={cx} cy={60} r={11}   fill="#080f1e" stroke="rgba(245,197,24,0.35)" strokeWidth="1.5"/>
            <circle cx={cx} cy={60} r={5.5}  fill="#111e36"/>
            <circle cx={cx} cy={60} r={2}    fill="#f5c518"/>
          </g>
        ))}
        <circle cx="178" cy="41" r="3" fill="#f5c518" opacity="0.9"/>
      </svg>
    </div>
  )
}

function StatPill({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:22, color:'#f5c518', letterSpacing:'-0.03em' }}>{value}</span>
      <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:1, fontWeight:500 }}>{label}</span>
    </div>
  )
}

function Rule({ rule, cite }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:5, height:5, borderRadius:'50%', background:'#f5c518', flexShrink:0 }}/>
        <span style={{ fontSize:13, color:'rgba(255,255,255,0.65)', fontWeight:500 }}>{rule}</span>
      </div>
      <code style={{ fontSize:10, color:'rgba(245,197,24,0.45)', fontFamily:"'JetBrains Mono',monospace", flexShrink:0, marginLeft:12 }}>{cite}</code>
    </div>
  )
}

const RULES = [
  ['11-Hour Driving Limit',   '§395.3(a)(3)'],
  ['14-Hour Driving Window',  '§395.3(a)(2)'],
  ['30-Min Break after 8hrs', '§395.3(a)(3)(ii)'],
  ['70-Hour / 8-Day Cycle',   '§395.3(b)'],
  ['34-Hour Restart Option',  '§395.3(c)(1)'],
  ['Fuel Stop / 1,000 miles', 'Operational'],
]

function MobilePlanCTA() {
  const scrollToForm = () => {
    const el = document.getElementById('trip-form-section')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{
      display: 'none',
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
    }} className="mobile-plan-cta">
      <button
        onClick={scrollToForm}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '9px 18px 9px 14px',
          borderRadius: 50,
          background: 'rgba(10,22,40,0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(245,197,24,0.28)',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(245,197,24,0.08)',
          color: '#f5c518',
          fontFamily: "'Clash Display',sans-serif",
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          animation: 'cta-pulse 3s ease-in-out infinite',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        Plan Trip
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(245,197,24,0.55)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </div>
  )
}

export default function HomePage() {
  const [ready, setReady] = useState(false)
  useEffect(() => { setTimeout(() => setReady(true), 60) }, [])

  return (
    <div className="min-h-screen hero-bg" style={{ position: 'relative' }}>
      <style>{`
        @keyframes wheel-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes road-dash { from { transform: translateX(0) } to { transform: translateX(calc(100% / 3)) } }
        @keyframes anim-float {
          0%,100% { transform: translateY(0px) }
          50%     { transform: translateY(-6px) }
        }
        @keyframes cta-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(245,197,24,0.08); }
          50%       { box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,197,24,0.22), 0 0 12px rgba(245,197,24,0.12); }
        }
        .anim-float { animation: anim-float 3.5s ease-in-out infinite; }

        /* Mobile CTA — only show on small screens */
        @media (max-width: 767px) {
          .mobile-plan-cta { display: block !important; }
        }
        @media (min-width: 768px) {
          .mobile-plan-cta { display: none !important; }
        }
      `}</style>

      <div className="hero-grid absolute inset-0 pointer-events-none"/>
      <Navbar/>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '48px 24px 100px' }}>
        <div style={{ display: 'grid', gap: 40, alignItems: 'start' }} className="responsive-hero-grid">

          {/* Left */}
          <div style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.3s' }}>
            <div className="anim-fade-up" style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 14px', borderRadius:99, border:'1px solid rgba(245,197,24,0.2)', background:'rgba(245,197,24,0.06)', marginBottom:28 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#f5c518' }} className="animate-pulse"/>
              <span style={{ fontSize:11, color:'rgba(245,197,24,0.85)', fontWeight:600, letterSpacing:'0.05em' }}>FMCSA APRIL 2022 · 49 CFR PART 395</span>
            </div>

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

            <div className="anim-fade-up delay-300"><HeroTruck/></div>

            <div className="anim-fade-up delay-400" style={{ display:'flex', gap:32, alignItems:'center', padding:'20px 0', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', margin:'8px 0 28px' }}>
              <StatPill value="6"     label="HOS Rules"/>
              <div style={{ width:1, height:32, background:'rgba(255,255,255,0.08)' }}/>
              <StatPill value="55mph" label="Avg Speed"/>
              <div style={{ width:1, height:32, background:'rgba(255,255,255,0.08)' }}/>
              <StatPill value="70h"   label="Cycle Limit"/>
            </div>

            <div className="anim-fade-up delay-500">
              <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.2)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>Rules Enforced</p>
              <div style={{ borderRadius:14, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', padding:'2px 16px' }}>
                {RULES.map(([rule,cite]) => <Rule key={rule} rule={rule} cite={cite}/>)}
              </div>
            </div>
          </div>

          {/* Right — Trip Form */}
          <div id="trip-form-section" className="anim-fade-up delay-200" style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.3s' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position:'absolute', inset:-2, borderRadius:22, background:'rgba(245,197,24,0.08)', filter:'blur(20px)', zIndex:0 }}/>
              <div className="trip-form-card" style={{ position:'relative', zIndex:1, background:'white', borderRadius:20, padding:'28px 28px 24px', boxShadow:'0 24px 80px rgba(0,0,0,0.35),0 0 0 1px rgba(255,255,255,0.9)' }}>
                <div style={{ marginBottom:22 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#f5c518' }}/>
                    <h2 style={{ fontFamily:"'Clash Display',sans-serif", fontSize:24, fontWeight:700, color:'#0a1628', letterSpacing:'-0.03em' }}>Plan Your Trip</h2>
                  </div>
                  <p style={{ fontSize:13, color:'#9ca3af', paddingLeft:16, fontWeight:400 }}>Fill in your route details — results in ~15 seconds</p>
                </div>
                <TripForm/>
              </div>
            </div>
            <div className="trip-form-trust" style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:20, marginTop:16 }}>
              {[['🔒','No data stored'],['⚡','~15 sec results'],['📱','PNG log download'],['🆓','100% free']].map(([ico,txt]) => (
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
              { n:'01', icon:'📍', t:'Enter Route',    d:'Input your current position, pickup, and dropoff cities. We geocode automatically with OpenStreetMap.' },
              { n:'02', icon:'⏱',  t:'HOS Calculated', d:'All 6 FMCSA rules enforced simultaneously. Breaks, rests, fuel stops inserted automatically.' },
              { n:'03', icon:'📋', t:'Download Logs',  d:'Get pixel-perfect ELD log sheets for every day — matching the official FMCSA format exactly.' },
            ].map(({ n, icon, t, d }) => (
              <div key={n} style={{ padding:'22px 24px', borderRadius:16, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', position:'relative' }}>
                <div style={{ position:'absolute', top:18, right:18, fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.08)' }}>{n}</div>
                <div style={{ fontSize:26, marginBottom:14 }}>{icon}</div>
                <h3 style={{ fontFamily:"'Clash Display',sans-serif", fontSize:18, color:'white', fontWeight:700, marginBottom:8, letterSpacing:'-0.02em' }}>{t}</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.65 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ position:'relative', zIndex:10, borderTop:'1px solid rgba(255,255,255,0.04)', padding:'20px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.15)' }}>© 2026 MileTrack ELD</p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.1)', fontFamily:"'JetBrains Mono',monospace" }}>OSRM · OpenStreetMap · Nominatim</p>
        </div>
      </footer>

      <MobilePlanCTA />
    </div>
  )
}