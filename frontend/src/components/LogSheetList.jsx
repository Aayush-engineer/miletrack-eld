import LogSheet from './LogSheet'

export default function LogSheetList({ dailyLogs }) {
  if (!dailyLogs || dailyLogs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-medium">No log sheets generated</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 p-3 bg-navy/5 rounded-lg border border-navy/10">
        <p className="text-xs text-navy font-medium">
          📋 {dailyLogs.length} day log sheet{dailyLogs.length !== 1 ? 's' : ''} generated · Click "Download PNG" on any sheet to save it
        </p>
      </div>
      {dailyLogs.map((log, idx) => (
        <LogSheet
          key={`${log.date}-${idx}`}
          log={log}
          dayNumber={log.day || idx + 1}
        />
      ))}
    </div>
  )
}