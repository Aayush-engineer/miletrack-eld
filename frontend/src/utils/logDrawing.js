
export function roundedRect(ctx, x, y, w, h, r = 4) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY)
  }
  return currentY
}

export function drawHRule(ctx, y, x1, x2, color = '#1a2744', width = 0.5) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x1, y)
  ctx.lineTo(x2, y)
  ctx.stroke()
  ctx.restore()
}

export function drawVRule(ctx, x, y1, y2, color = '#1a2744', width = 0.5) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x, y1)
  ctx.lineTo(x, y2)
  ctx.stroke()
  ctx.restore()
}


export function drawAngledText(ctx, text, x, y, angleDegrees = -45, font = '7px sans-serif', color = '#555') {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((angleDegrees * Math.PI) / 180)
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.fillText(text, 0, 0)
  ctx.restore()
}

export function computeTotalHours(segments) {
  const totals = {
    off_duty: 0,
    sleeper_berth: 0,
    driving: 0,
    on_duty_not_driving: 0,
  }
  for (const seg of segments) {
    if (totals[seg.status] !== undefined) {
      totals[seg.status] += seg.duration_hours || 0
    }
  }
  // Round each to 2 decimal places
  for (const key of Object.keys(totals)) {
    totals[key] = Math.round(totals[key] * 100) / 100
  }
  return totals
}

export function validateDayTotal(segments) {
  return segments.reduce((sum, seg) => sum + (seg.duration_hours || 0), 0)
}