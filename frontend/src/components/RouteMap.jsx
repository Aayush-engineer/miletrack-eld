import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function circleIcon(color, size = 14, pulse = false) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2.5px solid rgba(255,255,255,0.95);
      border-radius:50%;
      box-shadow:0 2px 10px rgba(0,0,0,0.3),0 0 0 ${pulse?'4px':'0'} ${color}33;
      position:relative;
    ">${pulse ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};opacity:0.4;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 6)],
  })
}

const COLORS = {
  start:   '#1e6eb5',
  pickup:  '#10b981',
  dropoff: '#ef4444',
  rest:    '#f97316',
  fuel:    '#f5c518',
}

function popupHtml(title, lines = []) {
  return `
    <div style="font-family:'DM Sans',system-ui,sans-serif;min-width:170px;padding:14px 16px;">
      <p style="font-weight:700;color:#0f1c35;font-size:13px;margin:0 0 6px;">${title}</p>
      ${lines.map(l => `<p style="color:#6b7280;font-size:11px;margin:2px 0;">${l}</p>`).join('')}
    </div>`
}

function fmt(mins) {
  if (!mins) return ''
  const h = Math.floor(mins / 60), m = mins % 60
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`
}

function fmtTime(str) {
  if (!str) return ''
  try {
    const [dp, tp] = str.split('T')
    const [y, mo, d] = dp.split('-').map(Number)
    const [h, mi] = tp.split(':').map(Number)
    return new Date(y, mo - 1, d, h, mi).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    })
  } catch { return str }
}

export default function RouteMap({ route }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const layersRef    = useRef([])

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapRef.current = L.map(containerRef.current, {
      center: [39.5, -98.35], zoom: 4,
      zoomControl: true, attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current)

    const ro = new ResizeObserver(() => {
      mapRef.current?.invalidateSize()
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [])

  // Update layers when route changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !route) return

    layersRef.current.forEach(l => { try { map.removeLayer(l) } catch (_) {} })
    layersRef.current = []

    const bounds = []

    // Polyline
    if (route.polyline?.length > 1) {
      const pl = L.polyline(route.polyline, {
        color: '#1e6eb5', weight: 4.5, opacity: 0.85,
        smoothFactor: 1.5,
      }).addTo(map)
      // Shadow polyline for depth
      const shadow = L.polyline(route.polyline, {
        color: '#0f1c35', weight: 7, opacity: 0.15, smoothFactor: 1.5,
      }).addTo(map)
      layersRef.current.push(pl, shadow)
      route.polyline.forEach(([lat, lng]) => bounds.push([lat, lng]))
    }

    // Waypoints
    const wpConfig = {
      start:   { label: '📍 Current Location', extra: '' },
      pickup:  { label: '📦 Pickup',   extra: '<span style="color:#10b981;font-size:10px;">1 hour on-duty (not driving)</span>' },
      dropoff: { label: '🏁 Dropoff',  extra: '<span style="color:#ef4444;font-size:10px;">1 hour on-duty (not driving)</span>' },
    }

    for (const wp of route.waypoints || []) {
      const cfg = wpConfig[wp.type] || { label: wp.name, extra: '' }
      const marker = L.marker([wp.lat, wp.lng], {
        icon: circleIcon(COLORS[wp.type] || '#888', 18, wp.type === 'start'),
        zIndexOffset: 1000,
      })
        .bindPopup(popupHtml(cfg.label, [
          `<strong style="color:#0f1c35">${wp.name}</strong>`,
          cfg.extra,
        ]), { maxWidth: 260 })
        .addTo(map)
      layersRef.current.push(marker)
      bounds.push([wp.lat, wp.lng])
    }

    // Stops
    for (const stop of route.stops || []) {
      if (!stop.lat || !stop.lng) continue
      const isFuel = stop.type === 'fuel'
      const isRestart = (stop.duration_minutes || 0) >= 34 * 60
      const label = isFuel ? '⛽ Fuel Stop' : isRestart ? '🔄 34-Hr Restart' : '🛏 Rest Stop'
      const marker = L.marker([stop.lat, stop.lng], {
        icon: circleIcon(COLORS[stop.type] || '#888', isFuel ? 12 : 14),
        zIndexOffset: 500,
      })
        .bindPopup(popupHtml(label, [
          stop.arrival_time ? `Arrival: ${fmtTime(stop.arrival_time)}` : '',
          stop.duration_minutes ? `Duration: <strong>${fmt(stop.duration_minutes)}</strong>` : '',
        ].filter(Boolean)), { maxWidth: 240 })
        .addTo(map)
      layersRef.current.push(marker)
    }

    // Fit bounds
    if (bounds.length > 0) {
      try { map.fitBounds(L.latLngBounds(bounds), { padding: [44, 44] }) }
      catch (_) { map.setView([39.5, -98.35], 4) }
    }
  }, [route])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-5 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-black/5 p-3.5 text-xs">
        <p className="font-semibold text-[#0f1c35] text-[10px] uppercase tracking-wider mb-2.5">Legend</p>
        {[
          [COLORS.start,   'Current Location'],
          [COLORS.pickup,  'Pickup'],
          [COLORS.dropoff, 'Dropoff'],
          [COLORS.rest,    'Rest / Restart'],
          [COLORS.fuel,    'Fuel Stop'],
        ].map(([color, label]) => (
          <div key={label} className="flex items-center gap-2 mb-1.5 last:mb-0">
            <div className="w-3 h-3 rounded-full border-2 border-white shadow flex-shrink-0" style={{ background: color }} />
            <span className="text-gray-600 text-[11px]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}