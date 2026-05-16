import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const COLORS = { start: '#2563eb', pickup: '#059669', dropoff: '#dc2626', rest: '#ea580c', fuel: '#f5c518' }
const F = "'Plus Jakarta Sans',system-ui,sans-serif"
const FM = "'JetBrains Mono',ui-monospace,monospace"
const FD = "'Clash Display',system-ui,sans-serif"

// Teardrop pin for main waypoints
function pinIcon(color, emoji, size = 36) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size}px;height:${size+10}px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.3));">
        <div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${color};border:3px solid white;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);font-size:${Math.round(size*0.4)}px;line-height:1;">${emoji}</span>
        </div>
      </div>`,
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 10],
    popupAnchor: [0, -(size + 12)],
    tooltipAnchor: [size / 2 + 4, -(size / 2)],
  })
}

// Small circle for fuel/rest stops
function circleIcon(color, size = 14) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 8)],
    tooltipAnchor: [size / 2 + 4, 0],
  })
}

function popup(color, title, emoji, badge, rows) {
  return `
    <div style="font-family:${F};min-width:190px;max-width:240px;">
      <div style="background:${color};padding:11px 14px;display:flex;align-items:center;gap:9px;">
        <span style="font-size:20px;">${emoji}</span>
        <div>
          <div style="font-family:${FD};font-weight:700;color:white;font-size:14px;letter-spacing:-0.02em;">${title}</div>
          ${badge ? `<div style="font-size:10px;color:rgba(255,255,255,0.7);margin-top:1px;font-family:${FM};">${badge}</div>` : ''}
        </div>
      </div>
      <div style="padding:11px 14px;background:white;">
        ${rows.map(([l, v]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:11px;color:#9ca3af;font-family:${F};">${l}</span>
            <span style="font-size:12px;font-weight:600;color:#0a1628;font-family:${F};">${v}</span>
          </div>`).join('')}
      </div>
    </div>`
}

function tooltip(text) {
  return `<div style="font-family:${F};font-size:12px;font-weight:600;color:#0a1628;white-space:nowrap;padding:5px 10px;">${text}</div>`
}

function fmtDur(mins) {
  if (!mins) return ''
  const h = Math.floor(mins / 60), m = mins % 60
  return h === 0 ? `${m} min` : m === 0 ? `${h}h` : `${h}h ${m}m`
}

function fmtTime(str) {
  if (!str) return ''
  try {
    const [dp, tp] = str.split('T')
    const [y, mo, d] = dp.split('-').map(Number)
    const [h, mi] = tp.split(':').map(Number)
    return new Date(y, mo-1, d, h, mi).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    })
  } catch { return str }
}

export default function RouteMap({ route }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const layersRef    = useRef([])

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
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !route) return

    layersRef.current.forEach(l => { try { map.removeLayer(l) } catch (_) {} })
    layersRef.current = []
    const bounds = []

    // Polyline with shadow
    if (route.polyline?.length > 1) {
      const shadow = L.polyline(route.polyline, { color: '#0a1628', weight: 8, opacity: 0.1, smoothFactor: 1.5 }).addTo(map)
      const line   = L.polyline(route.polyline, { color: '#2563eb', weight: 4.5, opacity: 0.88, smoothFactor: 1.5 }).addTo(map)
      layersRef.current.push(shadow, line)
      route.polyline.forEach(([lat, lng]) => bounds.push([lat, lng]))
    }

    // Waypoints
    const WP_CFG = {
      start:   { emoji: '📍', label: 'Current Location', badge: 'Starting point',            color: COLORS.start   },
      pickup:  { emoji: '📦', label: 'Pickup Location',  badge: '1 hr on-duty not driving',  color: COLORS.pickup  },
      dropoff: { emoji: '🏁', label: 'Dropoff Location', badge: '1 hr on-duty not driving',  color: COLORS.dropoff },
    }

    for (const wp of route.waypoints || []) {
      const cfg = WP_CFG[wp.type] || { emoji: '📍', label: wp.name, badge: '', color: '#6b7280' }
      L.marker([wp.lat, wp.lng], { icon: pinIcon(cfg.color, cfg.emoji, 36), zIndexOffset: 1000 })
        .bindTooltip(tooltip(wp.name), { permanent: false, direction: 'right', opacity: 1, className: 'mt-tooltip' })
        .bindPopup(popup(cfg.color, cfg.label, cfg.emoji, cfg.badge, [['Location', wp.name]]), { maxWidth: 260, className: 'mt-popup' })
        .addTo(map)
        .on('add', function() { layersRef.current.push(this) })
      layersRef.current.push({ remove: () => {} }) // placeholder to avoid issues
      bounds.push([wp.lat, wp.lng])
    }

    // Re-add correctly
    layersRef.current = []
    if (route.polyline?.length > 1) {
      const shadow = L.polyline(route.polyline, { color: '#0a1628', weight: 8, opacity: 0.1, smoothFactor: 1.5 }).addTo(map)
      const line   = L.polyline(route.polyline, { color: '#2563eb', weight: 4.5, opacity: 0.88, smoothFactor: 1.5 }).addTo(map)
      layersRef.current.push(shadow, line)
    }
    for (const wp of route.waypoints || []) {
      const cfg = WP_CFG[wp.type] || { emoji: '📍', label: wp.name, badge: '', color: '#6b7280' }
      const m = L.marker([wp.lat, wp.lng], { icon: pinIcon(cfg.color, cfg.emoji, 36), zIndexOffset: 1000 })
        .bindTooltip(tooltip(wp.name), { permanent: false, direction: 'right', opacity: 1, className: 'mt-tooltip' })
        .bindPopup(popup(cfg.color, cfg.label, cfg.emoji, cfg.badge, [['Location', wp.name]]), { maxWidth: 260, className: 'mt-popup' })
        .addTo(map)
      layersRef.current.push(m)
      bounds.push([wp.lat, wp.lng])
    }

    // Stops
    for (const stop of route.stops || []) {
      if (!stop.lat || !stop.lng) continue
      const isFuel    = stop.type === 'fuel'
      const isRestart = (stop.duration_minutes || 0) >= 34 * 60
      const label     = isFuel ? 'Fuel Stop' : isRestart ? '34-Hr Restart' : '10-Hr Rest'
      const emoji     = isFuel ? '⛽' : isRestart ? '🔄' : '🛏'
      const color     = isFuel ? COLORS.fuel : COLORS.rest
      const rows      = isFuel
        ? [['Duration', fmtDur(stop.duration_minutes)], ['Rule', 'Every 1,000 miles (FMCSA)']]
        : [['Duration', fmtDur(stop.duration_minutes)], ['Rule', isRestart ? '§395.3(c)(1) 34-hr restart' : '§395.3(a) 10-hr off-duty']]
      const ttText    = `${emoji} ${label}${stop.arrival_time ? ' · ' + fmtTime(stop.arrival_time) : ''}`

      const m = L.marker([stop.lat, stop.lng], { icon: circleIcon(color, isFuel ? 13 : 15), zIndexOffset: 500 })
        .bindTooltip(tooltip(ttText), { permanent: false, direction: 'top', opacity: 1, className: 'mt-tooltip' })
        .bindPopup(popup(color, label, emoji, stop.arrival_time ? `Arrival: ${fmtTime(stop.arrival_time)}` : '', rows), { maxWidth: 240, className: 'mt-popup' })
        .addTo(map)
      layersRef.current.push(m)
    }

    if (bounds.length > 0) {
      try { map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] }) }
      catch (_) { map.setView([39.5, -98.35], 4) }
    }
  }, [route])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <style>{`
        .mt-tooltip {
          background: white !important; border: none !important;
          border-radius: 10px !important; padding: 5px 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.14) !important;
          font-family: ${F} !important;
        }
        .mt-tooltip::before { display: none !important; }
        .mt-popup .leaflet-popup-content-wrapper { border-radius: 14px !important; padding: 0 !important; overflow: hidden !important; box-shadow: 0 8px 40px rgba(0,0,0,0.2) !important; }
        .mt-popup .leaflet-popup-content { margin: 0 !important; }
        .mt-popup .leaflet-popup-tip-container { margin-top: -1px; }
        .leaflet-control-attribution { font-family: ${FM} !important; font-size: 10px !important; }
      `}</style>

      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 24, left: 12, zIndex: 1000,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
        borderRadius: 16, boxShadow: '0 4px 28px rgba(0,0,0,0.12)',
        border: '1px solid rgba(0,0,0,0.06)', padding: '14px 16px',
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#0a1628', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, fontFamily: F }}>
          LEGEND
        </p>
        {[
          [COLORS.start,   '📍', 'Current Location'],
          [COLORS.pickup,  '📦', 'Pickup'],
          [COLORS.dropoff, '🏁', 'Dropoff'],
          [COLORS.rest,    '🛏', 'Rest / Restart'],
          [COLORS.fuel,    '⛽', 'Fuel Stop'],
        ].map(([color, emoji, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#374151', fontFamily: F }}>{emoji} {label}</span>
          </div>
        ))}
        <p style={{ fontSize: 9, color: '#9ca3af', marginTop: 10, borderTop: '1px solid #f3f4f6', paddingTop: 8, fontFamily: FM }}>
          Hover markers for details
        </p>
      </div>
    </div>
  )
}