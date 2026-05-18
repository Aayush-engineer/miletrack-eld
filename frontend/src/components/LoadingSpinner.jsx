import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const STEPS = [
  { icon: '📍', label: 'Geocoding',  text: 'Geocoding locations via Nominatim…' },
  { icon: '🗺️', label: 'Routing',    text: 'Fetching route from OSRM…'          },
  { icon: '⏱️', label: 'HOS Calc',   text: 'Simulating HOS compliance…'         },
  { icon: '📋', label: 'ELD Logs',   text: 'Generating ELD log sheets…'         },
]

function LoadTruck({ scale = 1 }) {
  const uid = 'ld'
  return (
    <svg width={48 * scale} height={18 * scale} viewBox="0 0 48 18" fill="none"
      style={{ display: 'block', overflow: 'visible',
        filter: 'drop-shadow(0 0 6px rgba(245,197,24,0.4)) drop-shadow(0 3px 8px rgba(0,0,0,0.7))' }}>
      <defs>
        <linearGradient id={`lt${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3260"/>
          <stop offset="100%" stopColor="#0b1830"/>
        </linearGradient>
        <linearGradient id={`lh${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c0392b"/>
          <stop offset="100%" stopColor="#7b241c"/>
        </linearGradient>
        <linearGradient id={`lc${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8e8"/>
          <stop offset="100%" stopColor="#888"/>
        </linearGradient>
      </defs>
      <rect x="1" y="3" width="26" height="10" rx="1" fill={`url(#lt${uid})`} stroke="rgba(245,197,24,0.25)" strokeWidth="0.5"/>
      <rect x="1.5" y="3.3" width="25" height="1.8" rx="0.4" fill="rgba(255,255,255,0.06)"/>
      {[5,10,15,20].map(x=><line key={x} x1={x} y1="3.5" x2={x} y2="12.5" stroke="rgba(245,197,24,0.07)" strokeWidth="0.4"/>)}
      <rect x="1" y="4" width="1" height="2" rx="0.2" fill="#ff3333" opacity="0.9"/>
      <rect x="26" y="8" width="3" height="1.2" rx="0.3" fill="#0a1420"/>
      <rect x="29" y="4" width="11" height="9" rx="1.2" fill="#c0392b" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4"/>
      <rect x="30" y="2.5" width="8" height="3" rx="1" fill="#b03027" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3"/>
      <rect x="36" y="5" width="3.5" height="4.5" rx="0.8" fill="rgba(140,200,255,0.2)" stroke="rgba(140,200,255,0.4)" strokeWidth="0.4"/>
      <line x1="36.5" y1="5.5" x2="38" y2="9" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4"/>
      <line x1="35.5" y1="4.2" x2="35.5" y2="12.5" stroke="rgba(0,0,0,0.2)" strokeWidth="0.3"/>
      <path d="M40 5.5 L47 6.5 L47 12 L40 13 Z" fill={`url(#lh${uid})`} stroke="rgba(0,0,0,0.2)" strokeWidth="0.4"/>
      <line x1="40.5" y1="5.8" x2="46.5" y2="6.8" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5"/>
      <rect x="46.2" y="6.8" width="1.5" height="4.5" rx="0.3" fill={`url(#lc${uid})`}/>
      <rect x="46.8" y="7" width="1.2" height="3" rx="0.5" fill="#f5c518" opacity="0.95"/>
      <rect x="29.5" y="0" width="1.2" height="5.5" rx="0.4" fill={`url(#lc${uid})`}/>
      <rect x="31.2" y="0.5" width="1.1" height="5" rx="0.4" fill={`url(#lc${uid})`}/>
      <rect x="29.1" y="0" width="2" height="0.8" rx="0.3" fill="#c8c8c8"/>
      <rect x="40" y="11" width="4.5" height="2" rx="0.5" fill={`url(#lc${uid})`} opacity="0.6"/>
      <rect x="46.5" y="11.5" width="1.5" height="1.2" rx="0.3" fill={`url(#lc${uid})`}/>
      <circle cx="30.1" cy="-0.5" r="1.2" fill="rgba(180,180,190,0.35)">
        <animate attributeName="cy" values="-0.5;-3.5;-6" dur="1.0s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.35;0.15;0" dur="1.0s" repeatCount="indefinite"/>
        <animate attributeName="r" values="1;1.8;2.8" dur="1.0s" repeatCount="indefinite"/>
      </circle>
      {[8,17,32,41].map((cx,i)=>(
        <g key={cx}>
          <circle cx={cx} cy="15" r="3.2" fill="#060d1a" stroke="rgba(245,197,24,0.45)" strokeWidth="0.8"/>
          <circle cx={cx} cy="15" r="1.5" fill="#0e1c34"/>
          <g style={{ transformOrigin:`${cx}px 15px`, animation:'ldSpin 1.1s linear infinite' }}>
            {[0,60,120,180,240,300].map(deg=>{
              const r=deg*Math.PI/180
              return <line key={deg} x1={cx} y1={15} x2={cx+Math.cos(r)*1.3} y2={15+Math.sin(r)*1.3} stroke="rgba(245,197,24,0.5)" strokeWidth="0.5"/>
            })}
          </g>
          <circle cx={cx} cy="15" r="0.7" fill="#f5c518"/>
        </g>
      ))}
    </svg>
  )
}

function OverlayContent() {
  const [step, setStep]         = useState(0)
  const [progress, setProgress] = useState(3)
  const [tick, setTick]         = useState(0)

  useEffect(() => {
    const si = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 4000)
    const pi = setInterval(() => setProgress(p => Math.min(p + 1, 92)), 200)
    const ti = setInterval(() => setTick(t => t + 1), 600)
    return () => { clearInterval(si); clearInterval(pi); clearInterval(ti) }
  }, [])

  const dots = '.'.repeat((tick % 3) + 1).padEnd(3, '\u00a0')

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 2147483647,
      background: 'rgba(5,10,20,0.96)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>

      <div style={{
        width: '100%', maxWidth: 380,
        margin: '0 24px',
        background: 'rgba(15,25,48,0.9)',
        border: '1px solid rgba(245,197,24,0.12)',
        borderRadius: 20,
        padding: '28px 28px 24px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
        position: 'relative',
        overflow: 'hidden',
      }}>

        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 140, height: 140, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: '#f5c518',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(245,197,24,0.35)',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="1" y="8" width="14" height="10" rx="2" fill="#0a1628"/>
              <rect x="15" y="11" width="7" height="7" rx="1.5" fill="#111e36"/>
              <circle cx="5"  cy="19" r="2.5" fill="#0a1628" stroke="#f5c518" strokeWidth="1.5"/>
              <circle cx="12" cy="19" r="2.5" fill="#0a1628" stroke="#f5c518" strokeWidth="1.5"/>
              <circle cx="19" cy="19" r="2.5" fill="#0a1628" stroke="#f5c518" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'white', fontFamily: "'Clash Display', sans-serif", letterSpacing: '-0.02em' }}>
              Planning your route{dots}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 1 }}>
              FMCSA · HOS · ELD
            </p>
          </div>
        </div>

        <div style={{
          height: 4, borderRadius: 99,
          background: 'rgba(255,255,255,0.07)',
          overflow: 'hidden', marginBottom: 20,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, #f5c518, #fb923c)',
            borderRadius: 99,
            width: `${progress}%`,
            transition: 'width 0.3s ease',
          }}/>
          {/* Shimmer */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            width: 60,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
            animation: 'ldShimmer 1.6s ease-in-out infinite',
          }}/>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {STEPS.map((s, i) => {
            const done   = i < step
            const active = i === step
            const future = i > step
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 10px', borderRadius: 10,
                background: active ? 'rgba(245,197,24,0.07)' : 'transparent',
                border: active ? '1px solid rgba(245,197,24,0.12)' : '1px solid transparent',
                opacity: future ? 0.2 : 1,
                transition: 'all 0.35s',
              }}>
                {/* Status dot */}
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? 'rgba(5,150,105,0.18)' : active ? 'rgba(245,197,24,0.15)' : 'rgba(255,255,255,0.04)',
                  border: done ? '1.5px solid rgba(5,150,105,0.5)' : active ? '1.5px solid rgba(245,197,24,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.3s',
                }}>
                  {done && (
                    <svg width="10" height="10" fill="none" stroke="#34d399" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                  {active && (
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#f5c518',
                      animation: 'ldBlink 0.9s ease-in-out infinite',
                    }}/>
                  )}
                  {future && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}/>
                  )}
                </div>

                {/* Label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontSize: 12,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: active ? 600 : done ? 400 : 400,
                    color: done ? 'rgba(255,255,255,0.38)' : active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.2)',
                    display: 'block',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    transition: 'color 0.3s',
                  }}>
                    {s.text}
                  </span>
                </div>

                {done && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                    color: '#34d399', background: 'rgba(5,150,105,0.12)',
                    border: '1px solid rgba(5,150,105,0.25)',
                    padding: '2px 6px', borderRadius: 99,
                    flexShrink: 0,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>DONE</span>
                )}
              </div>
            )
          })}
        </div>

        <p style={{
          textAlign: 'center', marginTop: 16, marginBottom: 0,
          fontSize: 10, color: 'rgba(255,255,255,0.18)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '0.04em',
        }}>
          ⏱ &nbsp;Typically takes 10–20 seconds
        </p>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 56,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 38,
          background: 'rgba(8,16,30,0.9)',
          borderTop: '1px solid rgba(245,197,24,0.08)',
        }}>
          <div style={{
            position: 'absolute', top: '42%', left: 0,
            width: '300%', height: 2,
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(245,197,24,0.18) 0px, rgba(245,197,24,0.18) 14px, transparent 14px, transparent 32px)',
            animation: 'ldDash 1.2s linear infinite',
          }}/>
        </div>

        <div style={{
          position: 'absolute',
          bottom: 20,
          animation: 'ldTruck 16s linear infinite',
          willChange: 'transform',
        }}>
          <LoadTruck scale={0.9}/>
        </div>

        <div style={{
          position: 'absolute',
          bottom: 27,
          width: 90, height: 12,
          background: 'linear-gradient(90deg, rgba(245,197,24,0.18), transparent)',
          borderRadius: '0 50% 50% 0',
          animation: 'ldTruck 16s linear infinite',
        }}/>
      </div>

      <style>{`
        @keyframes ldSpin     { to { transform: rotate(360deg) } }
        @keyframes ldTruck    { 0% { transform: translateX(-80px) } 100% { transform: translateX(calc(100vw + 60px)) } }
        @keyframes ldDash     { from { transform: translateX(0) } to { transform: translateX(calc(100% / 3)) } }
        @keyframes ldBlink    { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:0.25; transform:scale(0.7) } }
        @keyframes ldShimmer  { 0% { left:-60px } 100% { left:calc(100% + 60px) } }

        body.is-loading .anim-float      { opacity:0 !important; pointer-events:none !important; }
        body.is-loading .trip-form-card  { opacity:0 !important; pointer-events:none !important; }
        body.is-loading .trip-form-trust { opacity:0 !important; pointer-events:none !important; }
      `}</style>
    </div>
  )
}

export default function LoadingSpinner() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.classList.add('is-loading')
    return () => document.body.classList.remove('is-loading')
  }, [])

  if (!mounted) return null
  return createPortal(<OverlayContent />, document.body)
}