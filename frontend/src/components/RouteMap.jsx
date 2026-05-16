import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createCircleMarker(color, size = 14) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background: ${color};
        border: 2.5px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  })
}

const MARKER_COLORS = {
  start: '#1e6eb5',    
  pickup: '#22c55e',   
  dropoff: '#ef4444',  
  rest: '#f97316',     
  fuel: '#f5c400',     
}

const STOP_TYPE_LABELS = {
  rest: '🛏 Rest Stop',
  fuel: '⛽ Fuel Stop',
}

function formatDuration(minutes) {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatArrival(datetimeStr) {
  if (!datetimeStr) return ''
  try {
    const [datePart, timePart] = datetimeStr.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)
    const date = new Date(year, month - 1, day, hour, minute)
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  } catch {
    return datetimeStr
  }
}

export default function RouteMap({ route }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layersRef = useRef([])

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [39.5, -98.35], // Center of US
        zoom: 4,
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    }

    return () => {
      // Don't destroy map on re-render — just clear layers
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !route) return

    layersRef.current.forEach(layer => {
      try { map.removeLayer(layer) } catch (_) {}
    })
    layersRef.current = []

    const bounds = []

    if (route.polyline && route.polyline.length > 1) {
      const polyline = L.polyline(route.polyline, {
        color: '#1e6eb5',
        weight: 4,
        opacity: 0.85,
        smoothFactor: 1.5,
      }).addTo(map)
      layersRef.current.push(polyline)

      route.polyline.forEach(([lat, lng]) => bounds.push([lat, lng]))
    }

    if (route.waypoints) {
      for (const wp of route.waypoints) {
        const color = MARKER_COLORS[wp.type] || '#888'
        const marker = L.marker([wp.lat, wp.lng], {
          icon: createCircleMarker(color, 18),
          zIndexOffset: 1000,
        })

        const typeLabel = {
          start: '📍 Current Location',
          pickup: '📦 Pickup',
          dropoff: '🏁 Dropoff',
        }[wp.type] || wp.type

        marker.bindPopup(`
          <div style="font-family: 'IBM Plex Sans', sans-serif; min-width: 160px;">
            <div style="font-weight: 700; color: #1a2744; font-size: 13px; margin-bottom: 4px;">
              ${typeLabel}
            </div>
            <div style="color: #374151; font-size: 12px;">${wp.name}</div>
            ${wp.type === 'pickup' ? '<div style="color: #6b7280; font-size: 11px; margin-top:4px;">1 hour on-duty (not driving)</div>' : ''}
            ${wp.type === 'dropoff' ? '<div style="color: #6b7280; font-size: 11px; margin-top:4px;">1 hour on-duty (not driving)</div>' : ''}
          </div>
        `, { maxWidth: 240 })

        marker.addTo(map)
        layersRef.current.push(marker)
        bounds.push([wp.lat, wp.lng])
      }
    }

    if (route.stops) {
      for (const stop of route.stops) {
        if (!stop.lat || !stop.lng) continue

        const color = MARKER_COLORS[stop.type] || '#888'
        const size = stop.type === 'rest' ? 14 : 12

        const marker = L.marker([stop.lat, stop.lng], {
          icon: createCircleMarker(color, size),
          zIndexOffset: 500,
        })

        const typeLabel = STOP_TYPE_LABELS[stop.type] || stop.label

        marker.bindPopup(`
          <div style="font-family: 'IBM Plex Sans', sans-serif; min-width: 150px;">
            <div style="font-weight: 700; color: #1a2744; font-size: 12px; margin-bottom: 4px;">
              ${typeLabel}
            </div>
            ${stop.arrival_time ? `
              <div style="color: #6b7280; font-size: 11px;">
                Arrival: ${formatArrival(stop.arrival_time)}
              </div>` : ''}
            ${stop.duration_minutes ? `
              <div style="color: #374151; font-size: 11px; margin-top: 2px;">
                Duration: <strong>${formatDuration(stop.duration_minutes)}</strong>
              </div>` : ''}
          </div>
        `, { maxWidth: 220 })

        marker.addTo(map)
        layersRef.current.push(marker)
      }
    }

    if (bounds.length > 0) {
      try {
        map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] })
      } catch (_) {
        map.setView([39.5, -98.35], 4)
      }
    }
  }, [route])

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        layersRef.current.forEach(layer => {
          try { mapInstanceRef.current.removeLayer(layer) } catch (_) {}
        })
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />

      {/* Legend */}
      <div className="absolute bottom-6 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-100">
        <p className="text-[10px] font-bold text-navy mb-2 uppercase tracking-wider">Map Legend</p>
        {[
          { color: MARKER_COLORS.start, label: 'Current Location' },
          { color: MARKER_COLORS.pickup, label: 'Pickup' },
          { color: MARKER_COLORS.dropoff, label: 'Dropoff' },
          { color: MARKER_COLORS.rest, label: 'Rest Stop' },
          { color: MARKER_COLORS.fuel, label: 'Fuel Stop' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0"
              style={{ background: color }}
            />
            <span className="text-[10px] text-gray-700">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}