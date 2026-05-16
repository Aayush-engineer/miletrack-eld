export default function LoadingSpinner({ message = 'Planning your route...', subMessage }) {
  return (
    <div className="fixed inset-0 bg-navy/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center px-8 max-w-sm">
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto">
            <svg viewBox="0 0 80 80" className="w-full h-full">
              <rect x="0" y="62" width="80" height="4" fill="#f5c400" opacity="0.3" rx="2" />
              <g className="animate-pulse">
                <rect x="8" y="30" width="44" height="30" rx="3" fill="#1e6eb5" />
                <rect x="52" y="38" width="20" height="22" rx="3" fill="#2563eb" />
                <rect x="54" y="40" width="14" height="12" rx="2" fill="#93c5fd" opacity="0.8" />
                {/* Exhaust */}
                <rect x="66" y="34" width="4" height="6" rx="2" fill="#374151" />
              </g>
              {/* Wheels */}
              <circle cx="20" cy="64" r="7" fill="#1a2744" />
              <circle cx="20" cy="64" r="4" fill="#374151" />
              <circle cx="20" cy="64" r="2" fill="#6b7280" />
              <circle cx="58" cy="64" r="7" fill="#1a2744" />
              <circle cx="58" cy="64" r="4" fill="#374151" />
              <circle cx="58" cy="64" r="2" fill="#6b7280" />
              <circle cx="20" cy="62" r="1.5" fill="#f5c400" className="animate-spin-slow" style={{ transformOrigin: '20px 64px' }} />
              <circle cx="58" cy="62" r="1.5" fill="#f5c400" className="animate-spin-slow" style={{ transformOrigin: '58px 64px' }} />
            </svg>
          </div>

          {/* Spinning ring */}
          <div className="absolute -inset-4 border-2 border-fmcsa-yellow/20 rounded-full animate-spin-slow" />
          <div className="absolute -inset-8 border border-fmcsa-yellow/10 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-fmcsa-yellow animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <h2 className="font-display font-bold text-white text-2xl mb-2">{message}</h2>

        {subMessage && (
          <p className="text-white/60 text-sm">{subMessage}</p>
        )}

        {/* Steps */}
        <div className="mt-8 space-y-2 text-left">
          {[
            { icon: '📍', text: 'Geocoding locations via Nominatim' },
            { icon: '🗺️', text: 'Fetching route from OSRM' },
            { icon: '⏱️', text: 'Calculating HOS compliance' },
            { icon: '📋', text: 'Generating ELD log sheets' },
          ].map((step, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 text-white/50 text-sm animate-pulse"
              style={{ animationDelay: `${idx * 0.3}s` }}
            >
              <span className="text-base">{step.icon}</span>
              <span>{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}