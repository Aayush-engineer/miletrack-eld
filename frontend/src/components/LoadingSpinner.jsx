import { useEffect, useState } from 'react'

const STEPS = [
  { icon:'📍', text:'Geocoding locations via Nominatim…' },
  { icon:'🗺️', text:'Fetching route from OSRM…' },
  { icon:'⏱️', text:'Simulating HOS compliance…' },
  { icon:'📋', text:'Generating ELD log sheets…' },
]

export default function LoadingSpinner() {
  const [step, setStep]         = useState(0)
  const [progress, setProgress] = useState(4)

  useEffect(() => {
    const si = setInterval(() => setStep(s => Math.min(s+1, STEPS.length-1)), 4500)
    const pi = setInterval(() => setProgress(p => Math.min(p+1, 93)), 200)
    return () => { clearInterval(si); clearInterval(pi) }
  }, [])

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(6,13,26,0.97)', backdropFilter:'blur(16px)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{ width:'100%', maxWidth:360, padding:'0 32px', textAlign:'center' }}>

        {/* Animated icon */}
        <div style={{ position:'relative', width:72, height:72, margin:'0 auto 28px' }}>
          <div style={{ position:'absolute', inset:-16, borderRadius:'50%', border:'1px solid rgba(245,197,24,0.15)', animation:'ping 2s ease-out infinite' }}/>
          <div style={{ position:'absolute', inset:-8, borderRadius:'50%', border:'1px solid rgba(245,197,24,0.1)', animation:'ping 2s 0.5s ease-out infinite' }}/>
          <div style={{ width:72, height:72, borderRadius:18, background:'rgba(245,197,24,0.1)', border:'1px solid rgba(245,197,24,0.2)', display:'flex', alignItems:'center', justifyContent:'center', animation:'float 2.5s ease-in-out infinite' }}>
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
              <rect x="0" y="4" width="22" height="17" rx="2.5" fill="#1a2e52"/>
              <rect x="22" y="9" width="12" height="12" rx="2" fill="#111e36"/>
              <rect x="24" y="11" width="7" height="6" rx="1" fill="rgba(37,99,235,0.3)"/>
              <circle cx="6"  cy="23" r="3.5" fill="#060d1a" stroke="#f5c518" strokeWidth="1.2"/>
              <circle cx="16" cy="23" r="3.5" fill="#060d1a" stroke="#f5c518" strokeWidth="1.2"/>
              <circle cx="28" cy="23" r="3.5" fill="#060d1a" stroke="#f5c518" strokeWidth="1.2"/>
              <circle cx="34" cy="14" r="2" fill="#f5c518" opacity="0.9"/>
            </svg>
          </div>
        </div>

        {/* Current step text */}
        <div style={{ height:28, marginBottom:8, overflow:'hidden' }}>
          <p key={step} style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600, fontSize:15, color:'white', animation:'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
            {STEPS[step].icon} {STEPS[step].text}
          </p>
        </div>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginBottom:28, fontWeight:400 }}>This takes 10–20 seconds</p>

        {/* Progress bar */}
        <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:99, height:4, overflow:'hidden', marginBottom:28 }}>
          <div style={{ height:'100%', borderRadius:99, background:'linear-gradient(90deg,#f5c518,#fb923c)', width:`${progress}%`, transition:'width 0.25s ease' }}/>
        </div>

        {/* Step list */}
        <div style={{ textAlign:'left', display:'flex', flexDirection:'column', gap:12 }}>
          {STEPS.map((s, i) => {
            const done = i < step, active = i === step
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, opacity: i <= step ? 1 : 0.2, transition:'opacity 0.5s' }}>
                <div style={{
                  width:20, height:20, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                  background: done?'rgba(5,150,105,0.2)':active?'rgba(245,197,24,0.2)':'rgba(255,255,255,0.05)',
                  border: done?'1px solid rgba(5,150,105,0.4)':active?'1px solid rgba(245,197,24,0.4)':'1px solid rgba(255,255,255,0.08)',
                  transition:'all 0.3s',
                }}>
                  {done && <svg width="10" height="10" fill="none" stroke="#34d399" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                  {active && <div style={{ width:6, height:6, borderRadius:'50%', background:'#f5c518', animation:'shimmer 1s infinite' }}/>}
                </div>
                <span style={{ fontSize:12, color: done?'rgba(255,255,255,0.5)':active?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.2)', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight: active?600:400, transition:'all 0.3s' }}>
                  {s.text}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes ping { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}