import { useEffect, useState } from 'react'

const STEPS = [
  { icon: '📍', text: 'Geocoding locations via Nominatim…' },
  { icon: '🗺️', text: 'Fetching route from OSRM…' },
  { icon: '⏱️', text: 'Simulating HOS compliance…' },
  { icon: '📋', text: 'Generating ELD log sheets…' },
]

export default function LoadingSpinner({ message, subMessage }) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const si = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 4500)
    const pi = setInterval(() => setProgress(p => Math.min(p + 1, 92)), 180)
    return () => { clearInterval(si); clearInterval(pi) }
  }, [])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(8,14,27,0.97)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-sm px-8 text-center">

        {/* Truck animation */}
        <div className="relative mb-10 flex justify-center">
          {/* Outer rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border border-amber-400/15 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border border-amber-400/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          </div>

          {/* Truck icon */}
          <div className="relative w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/20 flex items-center justify-center" style={{ animation: 'float 2s ease-in-out infinite' }}>
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
              <rect x="0" y="5" width="22" height="17" rx="2" fill="#1e6eb5"/>
              <rect x="22" y="10" width="12" height="12" rx="1.5" fill="#1a2e52"/>
              <rect x="24" y="12" width="7" height="6" rx="1" fill="rgba(255,255,255,0.2)"/>
              <circle cx="6"  cy="23" r="3.5" fill="#0f1c35" stroke="#f5c518" strokeWidth="1"/>
              <circle cx="16" cy="23" r="3.5" fill="#0f1c35" stroke="#f5c518" strokeWidth="1"/>
              <circle cx="28" cy="23" r="3.5" fill="#0f1c35" stroke="#f5c518" strokeWidth="1"/>
              <circle cx="34" cy="15" r="2" fill="#fbbf24"/>
            </svg>
          </div>
        </div>

        {/* Step text */}
        <div className="mb-2 h-6">
          <p className="text-white font-semibold text-base anim-fade-in" key={step}>
            {STEPS[step].icon} {STEPS[step].text}
          </p>
        </div>
        <p className="text-white/35 text-sm mb-8">{subMessage || 'This takes 10–20 seconds'}</p>

        {/* Progress bar */}
        <div className="w-full bg-white/8 rounded-full h-1.5 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps list */}
        <div className="mt-8 space-y-2.5 text-left">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-500 ${i <= step ? 'text-white/70' : 'text-white/20'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                i < step ? 'bg-green-500/20 border border-green-500/40' :
                i === step ? 'bg-amber-400/20 border border-amber-400/40' :
                'border border-white/10'
              }`}>
                {i < step && <svg className="w-2.5 h-2.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                {i === step && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
              </div>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}