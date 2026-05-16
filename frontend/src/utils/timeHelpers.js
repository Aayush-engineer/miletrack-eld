
export function timeStringToDecimalHours(timeStr) {
  if (!timeStr) return 0
  if (timeStr === '24:00') return 24

  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours + minutes / 60
}


export function decimalHoursToTimeString(decimalHours) {
  if (decimalHours >= 24) return '24:00'
  const hours = Math.floor(decimalHours)
  const minutes = Math.round((decimalHours - hours) * 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function formatDuration(decimalHours) {
  if (!decimalHours && decimalHours !== 0) return '—'
  const hours = Math.floor(decimalHours)
  const minutes = Math.round((decimalHours - hours) * 60)

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatArrivalTime(datetimeStr) {
  if (!datetimeStr) return ''
  try {
    const date = new Date(datetimeStr)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch {
    return datetimeStr
  }
}

export function getDayOfWeek(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

export function getStatusLabel(status) {
  const labels = {
    off_duty: 'Off Duty',
    sleeper_berth: 'Sleeper Berth',
    driving: 'Driving',
    on_duty_not_driving: 'On Duty (Not Driving)',
  }
  return labels[status] || status
}

export function getStatusChipClass(status) {
  const classes = {
    off_duty: 'chip-off-duty',
    sleeper_berth: 'chip-sleeper',
    driving: 'chip-driving',
    on_duty_not_driving: 'chip-on-duty',
  }
  return classes[status] || 'chip-off-duty'
}

export function getStatusRow(status) {
  const rows = {
    off_duty: 0,
    sleeper_berth: 1,
    driving: 2,
    on_duty_not_driving: 3,
  }
  return rows[status] ?? 0
}