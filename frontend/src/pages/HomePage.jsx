import { useState, useEffect } from 'react'
import TripForm from '../components/TripForm'

function AnimatedTruck() {
  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
      <div className="absolute bottom-6 left-0 right-0 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent animate-pulse" />
      </div>
      <div className="absolute bottom-5.5 left-0 right-0 flex gap-6 px-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-0.5 flex-1 bg-white/20 rounded-full"
            style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      {/* Truck SVG */}
      <svg width="180" height="80" viewBox="0 0 180 80" fill="none"
        className="anim-float" style={{ filter: 'drop-shadow(0 8px 24px rgba(245,197,24,0.3))' }}>
        {/* Trailer */}
        <rect x="2" y="22" width="110" height="42" rx="4" fill="#1a2e52" stroke="rgba(245,197,24,0.3)" strokeWidth="1"/>
        <rect x="8" y="28" width="96" height="30" rx="2" fill="#0f1c35"/>
        {/* MileTrack text on trailer */}
        <text x="56" y="47" textAnchor="middle" fill="rgba(245,197,24,0.8)" fontSize="9" fontFamily="Syne, sans-serif" fontWeight="800" letterSpacing="2">MileTrack</text>
        {/* Cab */}
        <rect x="112" y="28" width="52" height="36" rx="4" fill="#1e6eb5" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        {/* Windshield */}
        <rect x="124" y="32" width="32" height="18" rx="2" fill="rgba(255,255,255,0.15)"/>
        {/* Exhaust */}
        <rect x="158" y="20" width="5" height="12" rx="2" fill="#374151"/>
        {[0,1,2].map(i => (
          <circle key={i} cx={160 + i * 3} cy={14 - i * 4} r={2 + i} fill="rgba(255,255,255,0.05)"
            style={{ animation: `shimmer 1.5s ${i * 0.3}s infinite` }}/>
        ))}
        {/* Wheels */}
        {[22, 68, 108, 135].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy="66" r="10" fill="#0f1c35" stroke="rgba(245,197,24,0.4)" strokeWidth="1.5"/>
            <circle cx={cx} cy="66" r="5" fill="#1a2e52"/>
            <circle cx={cx} cy="66" r="2" fill="#f5c518"/>
          </g>
        ))}
        {/* Headlight */}
        <circle cx="164" cy="48" r="3" fill="#fbbf24" opacity="0.9"/>
        <ellipse cx="172" cy="48" rx="6" ry="3" fill="rgba(251,191,36,0.15)"/>
      </svg>
    </div>
  )
}

function StatBadge({ value, label, delay = '' }) {
  return (
    <div className={`anim-fade-up ${delay} text-center`}>
      <div className="text-2xl font-display font-bold text-amber-400">{value}</div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
    </div>
  )
}

function RulePill({ rule, citation }) {
  return (
    <div className="flex items-center gap-2.5 py-2.5 border-b border-white/5 last:border-0 group">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 group-hover:scale-150 transition-transform" />
      <div className="flex-1 min-w-0">
        <span className="text-white/80 text-xs">{rule}</span>
      </div>
      <code className="text-amber-400/60 text-[10px] font-mono flex-shrink-0">{citation}</code>
    </div>
  )
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  return (
    <div className="min-h-screen hero-pattern noise relative">

      {/* ── Nav ── */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="8" width="14" height="10" rx="1.5" fill="#0f1c35"/>
                <rect x="15" y="11" width="7" height="7" rx="1" fill="#1a2e52"/>
                <circle cx="5" cy="19" r="2.5" fill="#0f1c35"/>
                <circle cx="12" cy="19" r="2.5" fill="#0f1c35"/>
                <circle cx="19" cy="19" r="2.5" fill="#0f1c35"/>
              </svg>
            </div>
            <span className="font-display text-white text-lg tracking-tight">MileTrack</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-white/30 text-xs font-mono">49 CFR Part 395</span>
            <div className="h-4 w-px bg-white/10" />
            <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/20">
              Free to use
            </span>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* Left: Copy */}
          <div className={mounted ? '' : 'opacity-0'}>

            {/* Badge */}
            <div className="anim-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/8 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-300 text-xs font-medium tracking-wide">FMCSA April 2022 · 49 CFR Part 395</span>
            </div>

            {/* Headline */}
            <h1 className="anim-fade-up delay-100 text-white leading-[0.95] mb-6">
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-display">ELD Trip</span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl text-gradient font-display">Planner</span>
              <span className="block text-xl sm:text-2xl font-sans font-light text-white/50 mt-3">for Interstate Truckers</span>
            </h1>

            <p className="anim-fade-up delay-200 text-white/60 text-base leading-relaxed mb-10 max-w-md">
              Enter your route, get a fully compliant Hours of Service schedule with pixel-perfect ELD log sheets — ready to download instantly.
            </p>

            {/* Animated truck */}
            <div className="anim-fade-up delay-300 mb-10">
              <AnimatedTruck />
            </div>

            {/* Stats row */}
            <div className="anim-fade-up delay-400 flex items-center gap-6 mb-10 p-4 rounded-2xl border border-white/5 bg-white/3">
              <StatBadge value="6"     label="HOS Rules" />
              <div className="w-px h-8 bg-white/10" />
              <StatBadge value="55mph" label="Avg Speed" delay="delay-100" />
              <div className="w-px h-8 bg-white/10" />
              <StatBadge value="70h"   label="Cycle Limit" delay="delay-200" />
            </div>

            {/* HOS Rules */}
            <div className="anim-fade-up delay-500">
              <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">Rules enforced</p>
              <div className="rounded-xl border border-white/8 bg-white/3 px-4 divide-y divide-white/5">
                <RulePill rule="11-Hour Driving Limit"        citation="§395.3(a)(3)" />
                <RulePill rule="14-Hour Driving Window"       citation="§395.3(a)(2)" />
                <RulePill rule="30-Minute Break after 8hrs"   citation="§395.3(a)(3)(ii)" />
                <RulePill rule="70-Hour / 8-Day Cycle"        citation="§395.3(b)" />
                <RulePill rule="34-Hour Restart Option"       citation="§395.3(c)(1)" />
                <RulePill rule="Fuel Stop every 1,000 miles"  citation="Operational" />
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className={`anim-fade-up delay-200 ${mounted ? '' : 'opacity-0'}`}>
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-1 bg-amber-400/10 rounded-3xl blur-xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-navy/40 p-6 sm:p-8 border border-white/80">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <h2 className="font-display text-[#0f1c35] text-2xl">Plan Your Trip</h2>
                  </div>
                  <p className="text-gray-500 text-sm pl-4">
                    Fill in your route details — results in ~15 seconds
                  </p>
                </div>
                <TripForm />
              </div>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-5">
              {[
                ['🔒','No data stored'],
                ['⚡','~15 sec results'],
                ['📱','PNG log download'],
                ['🆓','100% free'],
              ].map(([icon, text]) => (
                <span key={text} className="text-white/35 text-xs flex items-center gap-1.5">
                  <span>{icon}</span>{text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="relative z-10 border-t border-white/5 bg-[#0f1c35]/50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-white/25 text-xs font-mono uppercase tracking-widest mb-10">How it works</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n:'01', icon:'📍', t:'Enter Route', d:'Input your current position, pickup, and dropoff cities. We geocode them automatically via OpenStreetMap.' },
              { n:'02', icon:'⏱', t:'HOS Calculated', d:'All 6 FMCSA rules enforced simultaneously. Breaks, rests, fuel stops, pickup/dropoff inserted automatically.' },
              { n:'03', icon:'📋', t:'Download Logs', d:'Get pixel-perfect ELD log sheets for every day — matching the official FMCSA format. Download as PNG.' },
            ].map(({ n, icon, t, d }, i) => (
              <div key={n} className={`anim-fade-up delay-${(i+2)*100} relative p-6 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 transition-colors`}>
                <div className="absolute top-4 right-4 font-mono text-xs text-white/10">{n}</div>
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-display text-white text-lg mb-2">{t}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">© 2026 MileTrackELD — Built for interstate drivers</p>
          <p className="text-white/15 text-xs font-mono">OSRM · OpenStreetMap · Nominatim</p>
        </div>
      </footer>
    </div>
  )
}