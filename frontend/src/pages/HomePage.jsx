import TripForm from '../components/TripForm'

function HowItWorksStep({ number, icon, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-fmcsa-yellow flex items-center justify-center font-display font-bold text-navy text-lg">
        {number}
      </div>
      <div>
        <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
        <p className="text-white/60 text-sm mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function HosRuleBadge({ rule, citation }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-white/10 last:border-0">
      <div className="w-1.5 h-1.5 rounded-full bg-fmcsa-yellow mt-1.5 flex-shrink-0" />
      <div>
        <p className="text-white/90 text-xs font-medium">{rule}</p>
        <p className="text-white/40 text-xs font-mono">{citation}</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy">
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-fmcsa-yellow rounded-lg flex items-center justify-center">
              <span className="text-navy font-display font-black text-sm">ELD</span>
            </div>
            <div>
              <span className="font-display font-bold text-white text-lg leading-none">miletrack</span>
              <span className="text-white/40 text-xs block leading-none">Trip Planner</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span className="text-white/50 text-xs">FMCSA Compliant</span>
            <span className="text-white/50 text-xs">49 CFR Part 395</span>
            <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-medium">Free</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fmcsa-yellow/15 border border-fmcsa-yellow/30 mb-6">
              <div className="w-2 h-2 rounded-full bg-fmcsa-yellow animate-pulse" />
              <span className="text-fmcsa-yellow text-xs font-semibold tracking-wide">
                FMCSA-Compliant · April 2022 Guide
              </span>
            </div>

            <h1 className="font-display font-black text-white text-5xl lg:text-6xl leading-none mb-4">
              ELD Trip
              <span className="block text-fmcsa-yellow">Planner</span>
            </h1>

            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-md">
              Plan your interstate route with pixel-perfect FMCSA Hours of Service calculations.
              Get auto-generated ELD log sheets you can download instantly.
            </p>

            <div className="space-y-5 mb-8">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">How it works</p>
              <HowItWorksStep
                number="1"
                icon="📍"
                title="Enter Your Locations"
                description="Input your current position, pickup, and dropoff destinations. We geocode everything automatically using OpenStreetMap."
              />
              <HowItWorksStep
                number="2"
                icon="⏱️"
                title="HOS Rules Applied"
                description="Our engine enforces all 5 FMCSA rules simultaneously: 11-hour driving limit, 14-hour window, 30-min breaks, 70-hour cycle, and 34-hour restart."
              />
              <HowItWorksStep
                number="3"
                icon="📋"
                title="Download Log Sheets"
                description="Get pixel-perfect Driver's Daily Log sheets for each day of your trip, matching the official FMCSA format exactly. Download as PNG."
              />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
                HOS Rules Implemented
              </p>
              <HosRuleBadge rule="11-Hour Driving Limit" citation="§395.3(a)(3)" />
              <HosRuleBadge rule="14-Hour Driving Window" citation="§395.3(a)(2)" />
              <HosRuleBadge rule="30-Minute Rest Break (after 8 hrs)" citation="§395.3(a)(3)(ii)" />
              <HosRuleBadge rule="70-Hour / 8-Day Cycle Limit" citation="§395.3(b)" />
              <HosRuleBadge rule="34-Hour Restart Option" citation="§395.3(c)(1)" />
              <HosRuleBadge rule="10-Hour Off-Duty Reset" citation="§395.3(a)" />
              <HosRuleBadge rule="Fuel Stop Every 1,000 Miles" citation="Operational" />
            </div>
          </div>

          <div className="animate-slide-up stagger-2">
            <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="font-display font-bold text-navy text-2xl">Plan Your Trip</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Enter your route details below to generate your HOS schedule and ELD logs.
                </p>
              </div>
              <TripForm />
            </div>

            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {[
                { icon: '🔒', text: 'No data stored' },
                { icon: '⚡', text: 'Results in ~10 seconds' },
                { icon: '📱', text: 'Download ELD logs as PNG' },
                { icon: '🆓', text: 'Completely free' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-white/50 text-xs">
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/30 text-xs">
              © 2026 miletrack ELD — Built for interstate truck drivers
            </p>
            <div className="flex items-center gap-4">
              <span className="text-white/30 text-xs">
                Routing: OSRM · Maps: OpenStreetMap · Geocoding: Nominatim
              </span>
            </div>
          </div>
          <p className="text-white/20 text-xs mt-3 text-center">
            Disclaimer: This tool is for planning purposes only. Always verify HOS compliance with your carrier and consult official FMCSA regulations.
          </p>
        </div>
      </footer>
    </div>
  )
}