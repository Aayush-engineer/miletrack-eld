import LogSheet from './LogSheet'

const F = { display: "'Clash Display',system-ui,sans-serif", body: "'Plus Jakarta Sans',system-ui,sans-serif" }

export default function LogSheetList({ dailyLogs }) {
  if (!dailyLogs?.length) return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: '#d1d5db' }}>
      <svg style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <p style={{ fontSize: 14, color: '#9ca3af', fontFamily: F.body }}>No log sheets generated</p>
    </div>
  )

  return (
    <div>
      {/* Info banner */}
      <div style={{
        marginBottom: 14, padding: '10px 14px',
        background: '#f0f4fa', borderRadius: 12,
        border: '1px solid rgba(10,22,40,0.08)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>📋</span>
        <p style={{ fontSize: 12, color: '#0a1628', fontFamily: F.body, fontWeight: 500 }}>
          <strong>{dailyLogs.length}</strong> log sheet{dailyLogs.length !== 1 ? 's' : ''} generated
          · Scroll right to see full log on mobile
          · Click <strong>Download HD PNG</strong> to save
        </p>
      </div>

      {dailyLogs.map((log, idx) => (
        <LogSheet key={`${log.date}-${idx}`} log={log} dayNumber={log.day || idx + 1} />
      ))}
    </div>
  )
}