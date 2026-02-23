interface FunnelItem {
  stage:  string
  count:  number
  value:  number
  color:  string
}

export function ConversionChart({ data }: { data: FunnelItem[] }) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 className="font-semibold text-gray-900 mb-4">Funnel de conversion</h2>
      <div className="space-y-3">
        {data.map(item => {
          const pct = Math.max(8, (item.value / maxVal) * 100)
          return (
            <div key={item.stage} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-24 text-right shrink-0">{item.stage}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                <div className="h-full rounded-lg flex items-center pl-2 transition-all"
                     style={{ width: `${pct}%`, background: item.color }}>
                  <span className="text-xs font-semibold text-white">{item.count}</span>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-700 w-20 shrink-0 text-right">
                {item.value.toLocaleString('fr-FR')} €
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
