import { useRef, useEffect, useState } from 'react'
import { timeStringToDecimalHours, formatDate, getDayOfWeek } from '../utils/timeHelpers'

const LW = 1200   
const LH = 680   

const GL  = 130          
const GR  = 1090         
const GW  = GR - GL      
const HPT = GW / 24      

const GT  = 218
const RH  = 44
const GB  = GT + RH * 4

const MC_L = GR + 2
const MC_W = 50
const HC_L = MC_L + MC_W + 2
const HC_W = 56

const RY = {
  off_duty:            GT + RH * 0 + RH / 2,
  sleeper_berth:       GT + RH * 1 + RH / 2,
  driving:             GT + RH * 2 + RH / 2,
  on_duty_not_driving: GT + RH * 3 + RH / 2,
}

const C = {
  navy:      '#0a2050',
  blue:      '#1846a0',
  blueMid:   '#2860c0',
  blueLight: '#5a90d0',
  blueTick:  '#90b8e8',
  bluePale:  '#daeaf8',
  white:     '#ffffff',
  offWhite:  '#f0f6fc',
  textDark:  '#06101e',   
  textMid:   '#183060',
  textGray:  '#3a5a88',   
  lightGray: '#6a88b8',
  black:     '#000000',
}

const F = {
  titleLg:   'bold 16px Arial',       // header title — bigger
  titleSm:   'bold 10px Arial',       // section labels
  titleXs:   '8.5px Arial',
  labelBold: 'bold 12px Arial',       // carrier name, FROM/TO labels
  labelMd:   '10px Arial',            // field values
  labelSm:   '8.5px Arial',           // small field labels
  labelXs:   '7.5px Arial',
  labelXxs:  '7px Arial',             // tiny captions
  hourBig:   'bold 10px Arial',       // Mid / Noon
  hourSm:    '9px Arial',             // 1-11 hour labels
  rowNum:    'bold 13px Arial',       // 1. 2. 3. 4.
  rowName:   'bold 11.5px Arial',     // OFF DUTY, DRIVING etc
  rowSub:    '9.5px Arial',           // (NOT DRIVING), BERTH
  valLg:     'bold 24px Arial',       // total miles
  valMd:     'bold 17px Arial',       // total hours per row
  valSm:     'bold 14px Arial',       // month/day/year box values
  italic:    'italic 11.5px Arial',   // Driver Signature
  recap:     '9px Arial',             // recap row labels
  recapBold: 'bold 11px Arial',       // recap row values
  tiny:      '7.5px Arial',
  tinyItal:  'italic 8px Arial',      // recap footer note
}

const tx = (t) => GL + (timeStringToDecimalHours(t) / 24) * GW

function hStr(h) {
  if (!h) return '0'
  return h % 1 === 0 ? String(Math.round(h)) : h.toFixed(2)
}

function R(ctx, x, y, w, h, fill, stroke, lw = 0.8) {
  if (fill)   { ctx.fillStyle = fill;     ctx.fillRect(x, y, w, h) }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h) }
}

function L(ctx, x1, y1, x2, y2, color, lw) {
  ctx.strokeStyle = color; ctx.lineWidth = lw
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
}

function T(ctx, str, x, y, font, color, align = 'left', maxW) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align
  maxW ? ctx.fillText(str, x, y, maxW) : ctx.fillText(str, x, y)
}

function underline(ctx, x1, x2, y) {
  L(ctx, x1, y, x2, y, C.blueLight, 0.8)
}

function drawHeader(ctx, log) {
  // Top navy bar
  R(ctx, 0, 0, LW, 28, C.navy)
  T(ctx, 'U.S. DEPARTMENT OF TRANSPORTATION', 10, 18, F.titleSm,  C.white, 'left')
  T(ctx, "DRIVER'S DAILY LOG",                LW / 2, 16, F.titleLg,  C.white, 'center')
  T(ctx, '(ONE CALENDAR DAY — 24 HOURS)',      LW / 2, 26, F.labelXs,  C.white, 'center')
  T(ctx, 'ORIGINAL — Submit to carrier within 13 days',          LW - 10, 13, F.labelXs,  C.white, 'right')
  T(ctx, 'DUPLICATE — Driver retains possession for eight days',  LW - 10, 24, F.labelXs,  C.white, 'right')

  R(ctx, 0, 28, LW, 186, C.offWhite)
  ;[28, 72, 116, 162, 188].forEach(y => L(ctx, 0, y, LW, y, C.blueMid, 0.7))

  // Date boxes
  const [yr, mo, dy] = (log.date || '--').split('-')
  _box(ctx,  10, 33, 62, 34, 'MONTH', mo || '__')
  _box(ctx,  80, 33, 62, 34, 'DAY',   dy || '__')
  _box(ctx, 150, 33, 80, 34, 'YEAR',  yr || '____')

  // Miles
  T(ctx, 'TOTAL MILES DRIVING TODAY', LW / 2, 45, F.labelSm,  C.textGray, 'center')
  T(ctx, String(Math.round(log.total_miles_today || 0)), LW / 2, 68, F.valLg, C.textDark, 'center')

  // Vehicle numbers
  T(ctx, 'VEHICLE NUMBERS — (SHOW EACH UNIT)', LW - 10, 46, F.labelXs,   C.textGray, 'right')
  T(ctx, log.vehicle_numbers || 'Unit #1029 / Trailer #4481', LW - 10, 64, F.labelBold, C.textDark, 'right')

  // Carrier name
  T(ctx, '(NAME OF CARRIER OR CARRIERS)',  10, 84,  F.labelXxs, C.textGray, 'left')
  T(ctx, log.carrier_name || 'MileTrack AI Logistics Inc.', 10, 103, F.labelBold, C.textDark, 'left', 340)

  // Signature
  T(ctx, 'I certify that these entries are true and correct', LW / 2, 84, F.labelXxs, C.textGray, 'center')
  underline(ctx, LW / 2 - 130, LW / 2 + 130, 108)
  T(ctx, 'Driver Signature', LW / 2, 106, F.italic, C.textGray, 'center')

  // Co-driver
  T(ctx, '(NAME OF CO-DRIVER)', LW - 10, 84,  F.labelXxs, C.textGray,  'right')
  T(ctx, log.co_driver || 'N/A', LW - 10, 103, F.labelMd,  C.textDark, 'right')

  // Office address
  T(ctx, '(MAIN OFFICE ADDRESS)',  10, 128, F.labelXxs, C.textGray, 'left')
  T(ctx, log.main_office_address || '123 Commerce Blvd, Chicago, IL 60601', 10, 147, F.labelMd, C.textDark, 'left', 400)

  // MINUTES TO BE / TOTAL HOURS — above the grid
  T(ctx, 'MINUTES',        MC_L + MC_W / 2, 197, 'bold 7.5px Arial', C.navy, 'center')
  T(ctx, 'TO BE',          MC_L + MC_W / 2, 207, 'bold 7.5px Arial', C.navy, 'center')
  T(ctx, '00, 15, 30, 45', MC_L + MC_W / 2 + 2, 216, F.labelXxs,    C.textGray, 'center')

  T(ctx, 'TOTAL', HC_L + HC_W / 2, 200, 'bold 8.5px Arial', C.navy, 'center')
  T(ctx, 'HOURS', HC_L + HC_W / 2, 211, 'bold 8.5px Arial', C.navy, 'center')

  // FROM / TO
  T(ctx, 'FROM:', 10, 179, F.labelBold, C.navy, 'left')
  T(ctx, (log.from_location || '').substring(0, 38), 62, 179, F.labelMd, C.textDark, 'left')
  underline(ctx, 62, 530, 182)

  T(ctx, 'TO:', LW / 2 + 14, 179, F.labelBold, C.navy, 'left')
  T(ctx, (log.to_location || '').substring(0, 38), LW / 2 + 50, 179, F.labelMd, C.textDark, 'left')
  underline(ctx, LW / 2 + 50, GR, 182)
}

function _box(ctx, x, y, w, h, label, value) {
  R(ctx, x, y, w, h, C.white, C.blueMid, 1)
  T(ctx, label, x + w / 2, y + 13,    F.labelXxs, C.textGray, 'center')
  T(ctx, value, x + w / 2, y + h - 5, F.valSm,    C.textDark, 'center')
}

function drawHourLabels(ctx) {
  const labels = [
    'Mid','1','2','3','4','5','6','7','8','9','10','11',
    'Noon','1','2','3','4','5','6','7','8','9','10','11','Mid',
  ]
  for (let i = 0; i <= 24; i++) {
    const x   = GL + (i / 24) * GW
    const lbl = labels[i]
    const big = lbl === 'Mid' || lbl === 'Noon'
    T(ctx, lbl, x, GT - 6,  big ? F.hourBig : F.hourSm, C.navy, 'center')
    T(ctx, lbl, x, GB + 15, big ? F.hourBig : F.hourSm, C.navy, 'center')
  }
}

function drawGrid(ctx) {
  for (let r = 0; r < 4; r++) {
    R(ctx, GL, GT + r * RH, GW, RH, r % 2 === 0 ? C.white : C.bluePale)
  }

  for (let r = 0; r <= 4; r++) {
    const y  = GT + r * RH
    const lw = (r === 0 || r === 4) ? 1.4 : 0.8
    L(ctx, GL, y, GR, y, C.blueMid, lw)
  }

  for (let h = 0; h <= 24; h++) {
    const x     = GL + (h / 24) * GW
    const isSix = h % 6 === 0
    L(ctx, x, GT, x, GB, isSix ? C.blueMid : C.blueTick, isSix ? 1.2 : 0.6)

    if (h < 24) {
      for (let q = 1; q <= 3; q++) {
        const xq   = x + (q / 4) * HPT
        const half = q === 2
        const tLen = half ? 14 : 7

        for (let r = 0; r < 4; r++) {
          const top = GT + r * RH
          const bot = top + RH
          ctx.strokeStyle = half ? C.blueLight : C.blueTick
          ctx.lineWidth   = half ? 0.7 : 0.45
          ctx.beginPath(); ctx.moveTo(xq, top); ctx.lineTo(xq, top + tLen); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(xq, bot); ctx.lineTo(xq, bot - tLen); ctx.stroke()
        }
      }
    }
  }

  L(ctx, GL, GT, GL, GB, C.navy, 1.8)
  L(ctx, GR, GT, GR, GB, C.navy, 1.8)
}

function drawRowLabels(ctx) {
  const rows = [
    { key: 'off_duty',            n: '1.', a: 'OFF DUTY',  b: '' },
    { key: 'sleeper_berth',       n: '2.', a: 'SLEEPER',   b: 'BERTH' },
    { key: 'driving',             n: '3.', a: 'DRIVING',   b: '' },
    { key: 'on_duty_not_driving', n: '4.', a: 'ON DUTY',   b: '(NOT DRIVING)' },
  ]
  for (const { key, n, a, b } of rows) {
    const cy   = RY[key]
    const yOff = b ? -5 : 4
    T(ctx, n, 6,  cy + yOff,      F.rowNum,  C.navy,     'left')
    T(ctx, a, 24, cy + yOff,      F.rowName, C.textDark, 'left')
    if (b) T(ctx, b, 24, cy + yOff + 14, F.rowSub, C.textGray, 'left')
  }
}

function drawDutyLines(ctx, segments) {
  if (!segments?.length) return

  ctx.save()
  ctx.strokeStyle = C.black
  ctx.lineWidth   = 3
  ctx.lineJoin    = 'miter'
  ctx.lineCap     = 'square'

  for (const seg of segments) {
    const y = RY[seg.status]
    if (!y) continue
    ctx.beginPath()
    ctx.moveTo(tx(seg.start), y)
    ctx.lineTo(tx(seg.end),   y)
    ctx.stroke()
  }

  for (let i = 0; i < segments.length - 1; i++) {
    const cur  = segments[i]
    const next = segments[i + 1]
    if (cur.status === next.status) continue
    const fromY = RY[cur.status]
    const toY   = RY[next.status]
    if (!fromY || !toY) continue
    ctx.beginPath()
    ctx.moveTo(tx(cur.end), fromY)
    ctx.lineTo(tx(cur.end), toY)
    ctx.stroke()
  }

  ctx.restore()
}

function drawTotalHours(ctx, totalHours) {
  const keys = ['off_duty', 'sleeper_berth', 'driving', 'on_duty_not_driving']

  for (const key of keys) {
    const cy  = RY[key]
    const top = cy - RH / 2

    // Minutes-to-be column
    R(ctx, MC_L, top, MC_W, RH, C.bluePale, C.blueMid, 0.7)
    const ticks = ['00', '15', '30', '45']
    ticks.forEach((t, i) => {
      const ty = top + 10 + i * 9.5
      T(ctx, t, MC_L + MC_W / 2, ty, '7.5px Arial', C.textMid, 'center')
    })

    // Total hours column
    R(ctx, HC_L, top, HC_W, RH, C.white, C.navy, 1.2)
    const hrs = totalHours?.[key] || 0
    T(ctx, hStr(hrs), HC_L + HC_W / 2, cy + 7, F.valMd, C.textDark, 'center')
  }

  const grand = totalHours
    ? Object.values(totalHours).reduce((a, b) => a + b, 0)
    : 0
  T(ctx, 'TOTAL',                HC_L + HC_W / 2, GB + 13, 'bold 8px Arial', C.navy,     'center')
  T(ctx, `${grand.toFixed(1)}h`, HC_L + HC_W / 2, GB + 25, F.recapBold,        C.textDark, 'center')
}

function drawRemarks(ctx, remarks, segments) {
  const TOP = GB + 28
  const H   = 110

  R(ctx, 0, TOP, LW, H, C.offWhite)
  L(ctx, 0, TOP,     LW, TOP,     C.navy, 1.4)
  L(ctx, 0, TOP + H, LW, TOP + H, C.navy, 0.7)

  T(ctx, 'REMARKS', 8, TOP + 19, 'bold 12px Arial', C.navy, 'left')
  T(ctx, 'Pro or Shipping No.: N/A', LW - 10, TOP + 17, '10px Arial', C.textGray, 'right')

  if (remarks?.length) {
    const sorted = [...remarks].sort((a, b) => {
      const tA = timeStringToDecimalHours((a.split(' - ')[0] || '').trim())
      const tB = timeStringToDecimalHours((b.split(' - ')[0] || '').trim())
      return tA - tB
    })

    let lastX = -999

    sorted.forEach(remark => {
      const parts   = remark.split(' - ')
      const timeStr = (parts[0] || '').trim()
      let loc     = (parts[2] || parts[1] || '').trim()
      const x       = timeStr ? tx(timeStr) : GL

      console.log("this is backend data bdfore parsing", loc)

      loc = loc.replace('En Route: ', '').replace(/→.*$/, '').replace(' — Pickup', ' (Pickup)').replace(' — Dropoff', ' (Dropoff)').replace(' — Fuel Stop', ' (Fuel)').replace(' — 10-Hr Rest', ' (Rest)').replace(' — 34-Hr Restart', ' (Restart)').replace(' — 30-Min Break', ' (Break)').replace('Fuel Stop — ', '').trim()

      console.log("this is backend data after parsing", loc)

      if (x - lastX < 44) return
      lastX = x

      const cleaned = loc.replace(/-+$/, '').trimEnd()
      if (!cleaned) return

      const label = cleaned.length > 12
        ? cleaned.substring(0, 11).replace(/-+$/, '').trimEnd()
        : cleaned

      // Vertical tick line down
      L(ctx, x, TOP, x, TOP + 10, C.navy, 2)

      // Short diagonal hook left
      L(ctx, x, TOP + 10, x - 5, TOP + 15, C.navy, 2)

      // Diagonal text
      ctx.save()
      ctx.translate(x - 8, TOP + 20)
      ctx.rotate(-Math.PI / 4)
      ctx.font      = 'bold 9.5px Arial'
      ctx.fillStyle = C.textDark
      ctx.textAlign = 'left'
      ctx.fillText(label, -55, 1)
      ctx.restore()
    })
  }

  T(
    ctx,
    'Enter name of place you reported and where released from work, and each change of duty status. Use time standard of home terminal.',
    10, TOP + H - 12, '11px Arial', C.textGray, 'left'
  )
}

function drawRecap(ctx, log) {
  const TOP = GB + 130
  const MID = LW / 2
  const BOT = LH - 3

  R(ctx, 0, TOP, LW, BOT - TOP, C.offWhite)
  L(ctx, 0, TOP, LW, TOP, C.navy, 1.4)

  T(ctx, 'RECAP — Complete at end of day', 10, TOP + 18, 'bold 12px Arial', C.navy, 'left')

  L(ctx, MID, TOP + 22, MID, BOT - 2, C.blueMid, 0.8)

  T(ctx, '70 Hour / 8 Day Drivers', MID / 2,       TOP + 36, 'bold 10.5px Arial', C.blueMid, 'center')
  T(ctx, '60 Hour / 7 Day Drivers', MID + MID / 2, TOP + 36, 'bold 10.5px Arial', C.blueMid, 'center')

  ;[TOP + 22, TOP + 40, TOP + 68, TOP + 96, BOT - 2].forEach(y =>
    L(ctx, 0, y, LW, y, C.blueLight, 0.6)
  )

  const cy  = log.cycle_hours_at_end_of_day || 0
  const a70 = Math.max(0, 70 - cy)
  const a60 = Math.max(0, 60 - cy)

  const lRows = [
    { label: 'A. Total hours on duty last 7 days (incl. today)', val: cy.toFixed(2),  y: TOP + 62 },
    { label: 'B. Hours available tomorrow (70 hr. minus A)',      val: a70.toFixed(2), y: TOP + 90 },
    { label: 'C. Total hours on duty last 8 days (incl. today)', val: cy.toFixed(2),  y: TOP + 118 },
  ]
  const rRows = [
    { label: 'A. Total hours on duty last 6 days (incl. today)', val: cy.toFixed(2),  y: TOP + 62 },
    { label: 'B. Hours available tomorrow (60 hr. minus A)',      val: a60.toFixed(2), y: TOP + 90 },
    { label: 'C. Total hours on duty last 7 days (incl. today)', val: cy.toFixed(2),  y: TOP + 118 },
  ]

  for (const row of lRows) {
    T(ctx, row.label, 12,       row.y - 13, F.recap,     C.textGray, 'left')
    T(ctx, row.val,   MID - 14, row.y,      F.recapBold, C.textDark, 'right')
  }
  for (const row of rRows) {
    T(ctx, row.label, MID + 14, row.y - 13, F.recap,     C.textGray, 'left')
    T(ctx, row.val,   LW - 14,  row.y,      F.recapBold, C.textDark, 'right')
  }

  T(
    ctx,
    '* If you took 34 consecutive hours off duty you have 60/70 hours available',
    LW / 2, BOT - 5, F.tinyItal, C.textGray, 'center'
  )
}

function drawBorder(ctx) {
  ctx.strokeStyle = C.navy
  ctx.lineWidth   = 3
  ctx.strokeRect(1.5, 1.5, LW - 3, LH - 3)
}

function drawLogSheet(canvas, log) {
  const dpr = window.devicePixelRatio || 2

  canvas.width  = Math.round(LW * dpr)
  canvas.height = Math.round(LH * dpr)

  canvas.style.width  = `${LW}px`
  canvas.style.height = `${LH}px`

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  // Enable font smoothing for HD
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  R(ctx, 0, 0, LW, LH, C.white)

  drawHeader(ctx, log)
  drawHourLabels(ctx)
  drawGrid(ctx)
  drawRowLabels(ctx)
  drawDutyLines(ctx, log.segments)
  drawTotalHours(ctx, log.total_hours)
  drawRemarks(ctx, log.remarks, log.segments)
  drawRecap(ctx, log)
  drawBorder(ctx)
}

export default function LogSheet({ log, dayNumber }) {
  const canvasRef = useRef(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !log) return
    const draw = () => {
      drawLogSheet(canvasRef.current, log)
      setRendered(true)
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(draw)
    } else {
      draw()
    }
  }, [log])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const a = document.createElement('a')
    a.download = `eld-log-day-${dayNumber}-${log.date}.png`
    a.href = canvasRef.current.toDataURL('image/png')
    a.click()
  }

  const totalHours = log?.total_hours || {}
  const grandTotal = Object.values(totalHours).reduce((a, b) => a + b, 0)
  const dateLabel  = formatDate(log?.date)
  const dayOfWeek  = getDayOfWeek(log?.date)

  return (
    <div className="card p-4 mb-6 animate-slide-up">

      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {dayNumber}
          </div>
          <div>
            <p className="font-display font-bold text-navy text-lg leading-tight">{dayOfWeek}</p>
            <p className="text-xs text-gray-400 font-mono">{dateLabel}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {totalHours.driving > 0 && (
            <span className="chip-driving">
              🚛 {totalHours.driving.toFixed(1)}h driving
            </span>
          )}
          {totalHours.on_duty_not_driving > 0 && (
            <span className="chip-on-duty">
              📦 {totalHours.on_duty_not_driving.toFixed(1)}h on-duty
            </span>
          )}
          {totalHours.sleeper_berth > 0 && (
            <span className="chip-sleeper">
              🛏 {totalHours.sleeper_berth.toFixed(1)}h sleeper
            </span>
          )}
          {totalHours.off_duty > 0 && (
            <span className="chip-off-duty">
              😴 {totalHours.off_duty.toFixed(1)}h off
            </span>
          )}
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 bg-fmcsa-yellow text-navy font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-yellow-400 transition-colors shadow-sm flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download HD PNG
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white shadow-inner">
        {!rendered && (
          <div className="flex items-center justify-center h-36 text-gray-400 text-sm animate-pulse">
            Rendering log sheet…
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={rendered ? 'block' : 'hidden'}
          style={{ minWidth: `${LW}px`, display: 'block' }}
        />
      </div>

      <div className="mt-2 flex justify-between items-center text-xs text-gray-400 font-mono">
        <span>
          Miles today:{' '}
          <strong className="text-navy">{Math.round(log.total_miles_today || 0)}</strong>
        </span>
        <span>
          Cycle:{' '}
          <strong className={log.cycle_hours_at_end_of_day > 65 ? 'text-red-600' : 'text-navy'}>
            {(log.cycle_hours_at_end_of_day || 0).toFixed(1)}h / 70h
          </strong>
        </span>
        <span>
          Total: <strong className="text-navy">{grandTotal.toFixed(1)}h</strong>
        </span>
      </div>
    </div>
  )
}