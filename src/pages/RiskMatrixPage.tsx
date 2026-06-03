import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Grid3X3, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppContext } from '../context'
import type { TestCase, RiskItem } from '../types/models'
import { Button } from '../components/ui/button'

// ─── Constants ────────────────────────────────────────────────────────────────

const LIKELIHOOD = [
  { value: 5, label: 'Almost Certain', description: '>1 in 10' },
  { value: 4, label: 'Likely',          description: '1 in 20' },
  { value: 3, label: 'Occasional',      description: '1 in 200' },
  { value: 2, label: 'Unlikely',        description: '1 in 2,000' },
  { value: 1, label: 'Rare',            description: '<1 in 10,000' },
]

const IMPACT = [
  { value: 1, label: 'Insignificant' },
  { value: 2, label: 'Minor' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Major' },
  { value: 5, label: 'Catastrophic' },
]

const RISK_BANDS = [
  { label: 'Critical', min: 15, max: 25,
    textClass:  'text-red-700',
    badgeClass: 'bg-red-100    text-red-700    border border-red-300',
    tileClass:  'bg-red-50     border-red-200',
    cellClass:  'bg-red-100 hover:bg-red-200 border-red-300' },
  { label: 'High',     min: 10, max: 14,
    textClass:  'text-orange-700',
    badgeClass: 'bg-orange-100 text-orange-700 border border-orange-300',
    tileClass:  'bg-orange-50  border-orange-200',
    cellClass:  'bg-orange-100 hover:bg-orange-200 border-orange-300' },
  { label: 'Medium',   min: 5,  max: 9,
    textClass:  'text-yellow-700',
    badgeClass: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    tileClass:  'bg-yellow-50  border-yellow-200',
    cellClass:  'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  { label: 'Low',      min: 1,  max: 4,
    textClass:  'text-green-700',
    badgeClass: 'bg-green-100  text-green-700  border border-green-300',
    tileClass:  'bg-green-50   border-green-200',
    cellClass:  'bg-green-100 hover:bg-green-200 border-green-300' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBand(score: number) {
  return RISK_BANDS.find(b => score >= b.min && score <= b.max) ?? RISK_BANDS[3]
}

function cellClass(score: number, isSelected: boolean) {
  const band = getBand(score)
  return `${band.cellClass} cursor-pointer transition-colors select-none${isSelected ? ' ring-2 ring-offset-1 ring-slate-700' : ''}`
}

function recBadge(rec: string) {
  if (rec === 'AUTOMATE')       return 'bg-green-100 text-green-700'
  if (rec === "DON'T AUTOMATE") return 'bg-red-100   text-red-700'
  return 'bg-yellow-100 text-yellow-700'
}

// ─── Risk Item Row (inline-editable) ─────────────────────────────────────────

function RiskItemRow({ item, index, onUpdate, onDelete }: {
  item: RiskItem
  index: number
  onUpdate: (u: Partial<RiskItem>) => void
  onDelete: () => void
}) {
  const band = getBand(item.riskScore)

  const inp = (field: keyof RiskItem, placeholder: string) => (
    <input
      className="w-full text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-slate-300 rounded px-1 py-0.5"
      value={(item[field] as string) ?? ''}
      onChange={e => onUpdate({ [field]: e.target.value } as Partial<RiskItem>)}
      placeholder={placeholder}
    />
  )

  return (
    <tr className="border-b hover:bg-slate-50 group">
      <td className="p-2 text-slate-400 text-xs text-center w-8">{index}</td>
      <td className="p-1 min-w-[140px]">{inp('failureMode',       'What can go wrong?')}</td>
      <td className="p-1 min-w-[140px]">{inp('causeOfFailure',    'Root cause...')}</td>
      <td className="p-1 w-36">
        <select
          className="text-sm border border-slate-200 rounded px-1 py-0.5 w-full bg-white"
          value={item.likelihood}
          onChange={e => onUpdate({ likelihood: parseInt(e.target.value) })}
        >
          {LIKELIHOOD.slice().reverse().map(l => (
            <option key={l.value} value={l.value}>{l.value} – {l.label}</option>
          ))}
        </select>
      </td>
      <td className="p-1 min-w-[140px]">{inp('effectOfFailure',   'Consequence...')}</td>
      <td className="p-1 w-36">
        <select
          className="text-sm border border-slate-200 rounded px-1 py-0.5 w-full bg-white"
          value={item.impact}
          onChange={e => onUpdate({ impact: parseInt(e.target.value) })}
        >
          {IMPACT.map(i => (
            <option key={i.value} value={i.value}>{i.value} – {i.label}</option>
          ))}
        </select>
      </td>
      <td className="p-2 w-20 text-center">
        <span className={`text-sm font-bold px-2 py-0.5 rounded ${band.badgeClass}`}>
          {item.riskScore}
        </span>
      </td>
      <td className="p-1 min-w-[160px]">{inp('recommendedActions','Mitigation...')}</td>
      <td className="p-1 min-w-[100px]">{inp('actionOwner',       'Owner...')}</td>
      <td className="p-1 w-32">
        <input
          type="date"
          className="text-sm border border-slate-200 rounded px-1 py-0.5 w-full bg-white"
          value={item.actionDueDate}
          onChange={e => onUpdate({ actionDueDate: e.target.value })}
        />
      </td>
      <td className="p-1 w-28">
        <div className="flex items-center gap-1.5">
          <input
            type="number" min={0} max={100}
            className="w-12 text-sm border border-slate-200 rounded px-1 py-0.5 bg-white"
            value={item.percentComplete}
            onChange={e => onUpdate({ percentComplete: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
          />
          <div className="flex-1 bg-slate-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${item.percentComplete >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${item.percentComplete}%` }}
            />
          </div>
        </div>
      </td>
      <td className="p-1 min-w-[120px]">{inp('notes', 'Notes...')}</td>
      <td className="p-2 w-8">
        <button
          onClick={onDelete}
          className="text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RiskMatrixPage() {
  const { appState, addRiskItem, updateRiskItem, deleteRiskItem } = useAppContext()
  const [selectedCell, setSelectedCell]       = useState<{ likelihood: number; impact: number } | null>(null)
  const [isMatrixCollapsed, setIsMatrixCollapsed] = useState(false)
  const [isTableCollapsed,  setIsTableCollapsed]  = useState(false)

  // Map test cases and risk items to grid cells
  const testCasesByCell = useMemo(() => {
    const map = new Map<string, TestCase[]>()
    appState.testCases.forEach(tc => {
      if (tc.probOfUse != null && tc.impact != null) {
        const key = `${tc.probOfUse}-${tc.impact}`
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(tc)
      }
    })
    return map
  }, [appState.testCases])

  const riskItemsByCell = useMemo(() => {
    const map = new Map<string, RiskItem[]>()
    appState.riskItems.forEach(ri => {
      const key = `${ri.likelihood}-${ri.impact}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ri)
    })
    return map
  }, [appState.riskItems])

  const totalPlottedTests = useMemo(
    () => appState.testCases.filter(tc => tc.probOfUse != null && tc.impact != null).length,
    [appState.testCases]
  )

  // Per-band counts (used in both collapsed headers and summary tiles)
  const bandCounts = useMemo(() => RISK_BANDS.map(b => {
    const tc = appState.testCases.filter(tc => {
      if (tc.probOfUse == null || tc.impact == null) return false
      const s = tc.probOfUse * tc.impact
      return s >= b.min && s <= b.max
    }).length
    const ri = appState.riskItems.filter(ri => ri.riskScore >= b.min && ri.riskScore <= b.max).length
    return { ...b, tcCount: tc, riCount: ri }
  }), [appState.testCases, appState.riskItems])

  const selectedKey       = selectedCell ? `${selectedCell.likelihood}-${selectedCell.impact}` : null
  const selectedTestCases = selectedKey ? (testCasesByCell.get(selectedKey) ?? []) : []
  const selectedRiskItems = selectedKey ? (riskItemsByCell.get(selectedKey) ?? []) : []
  const selectedScore     = selectedCell ? selectedCell.likelihood * selectedCell.impact : 0

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Page header ── */}
      <header className="bg-slate-100 border-b border-slate-300">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Grid3X3 className="w-6 h-6" />
              Risk Assessment Matrix
            </h1>
            <p className="text-sm text-slate-600">
              {appState.projectName}
              {' · '}{totalPlottedTests} test case{totalPlottedTests !== 1 ? 's' : ''}
              {' · '}{appState.riskItems.length} risk item{appState.riskItems.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">

        {/* ── Matrix card (centred, max-w-5xl) ── */}
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          <div className="border rounded-lg bg-white shadow overflow-hidden">

            {/* Collapsible header */}
            <button
              className="w-full flex items-start gap-2 px-4 py-3 border-b bg-slate-50 text-left group"
              onClick={() => { setIsMatrixCollapsed(c => !c); setSelectedCell(null) }}
            >
              {isMatrixCollapsed
                ? <ChevronDown className="w-4 h-4 mt-0.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                : <ChevronUp   className="w-4 h-4 mt-0.5 text-slate-400 group-hover:text-slate-600 shrink-0" />}
              <div className="flex-1 min-w-0">
                <span className="text-base font-bold text-slate-800">5×5 Risk Matrix</span>
                {isMatrixCollapsed ? (
                  // Collapsed: show per-band totals (tests + risk items combined)
                  <div className="flex flex-wrap gap-2 mt-1">
                    {bandCounts.map(b => (
                      <span key={b.label} className={`text-xs font-semibold px-2 py-0.5 rounded ${b.badgeClass}`}>
                        {b.label}: {b.tcCount + b.riCount}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Score = Likelihood × Impact
                    <span className="inline-flex items-center gap-1 ml-3">
                      <span className="inline-block w-2 h-2 rounded-full bg-slate-600 opacity-60" /> test case
                    </span>
                    <span className="inline-flex items-center gap-1 ml-2">
                      <span className="inline-block w-2 h-2 rounded bg-orange-500 opacity-70" /> risk item
                    </span>
                  </p>
                )}
              </div>
            </button>

            {/* Expanded content */}
            {!isMatrixCollapsed && (
              <div className="p-4 space-y-6">

                {/* Legend */}
                <div className="flex flex-wrap gap-2 text-sm">
                  {RISK_BANDS.map(b => (
                    <span key={b.label} className={`px-2 py-1 rounded font-medium ${b.badgeClass}`}>
                      {b.label} ({b.min}–{b.max})
                    </span>
                  ))}
                </div>

                {/* 5×5 grid */}
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-5 shrink-0">
                    <span
                      className="text-xs font-bold text-slate-400 uppercase tracking-widest select-none"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      Likelihood
                    </span>
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Impact (Consequence)
                    </div>
                    <div className="flex">
                      <div className="w-36 shrink-0" />
                      {IMPACT.map(imp => (
                        <div key={imp.value} className="flex-1 min-w-[80px] text-center px-1 pb-1">
                          <div className="text-xs font-semibold text-slate-700 leading-tight">{imp.label}</div>
                          <div className="text-xs text-slate-400">({imp.value})</div>
                        </div>
                      ))}
                    </div>

                    {LIKELIHOOD.map(lh => (
                      <div key={lh.value} className="flex">
                        <div className="w-36 shrink-0 flex flex-col justify-center pr-3 py-1">
                          <div className="text-xs font-semibold text-slate-700 text-right">{lh.label}</div>
                          <div className="text-xs text-slate-400 text-right">{lh.description}</div>
                        </div>

                        {IMPACT.map(imp => {
                          const score     = lh.value * imp.value
                          const isSelected = selectedCell?.likelihood === lh.value && selectedCell?.impact === imp.value
                          const tcs       = testCasesByCell.get(`${lh.value}-${imp.value}`) ?? []
                          const ris       = riskItemsByCell.get(`${lh.value}-${imp.value}`) ?? []
                          const band      = getBand(score)
                          const totalDots = tcs.length + ris.length

                          return (
                            <div
                              key={imp.value}
                              className={`flex-1 min-w-[80px] min-h-[80px] border p-2 ${cellClass(score, isSelected)}`}
                              onClick={() => setSelectedCell(isSelected ? null : { likelihood: lh.value, impact: imp.value })}
                            >
                              <div className="text-sm font-bold text-slate-700">{score}</div>
                              <div className={`text-xs font-semibold mt-0.5 ${band.textClass}`}>{band.label}</div>
                              {totalDots > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {tcs.slice(0, 4).map(tc => (
                                    <div key={tc.id} className="w-2.5 h-2.5 rounded-full bg-slate-600 opacity-60" title={`Test: ${tc.testName || '(unnamed)'}`} />
                                  ))}
                                  {ris.slice(0, 4).map(ri => (
                                    <div key={ri.id} className="w-2.5 h-2.5 rounded bg-orange-500 opacity-70" title={`Risk: ${ri.failureMode || '(unnamed)'}`} />
                                  ))}
                                  {totalDots > 8 && <span className="text-xs text-slate-500">+{totalDots - 8}</span>}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected cell panel */}
                {selectedCell && (
                  <div className="border rounded-lg bg-slate-50 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-slate-800">
                          {LIKELIHOOD.find(l => l.value === selectedCell.likelihood)?.label}
                          {' × '}
                          {IMPACT.find(i => i.value === selectedCell.impact)?.label}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm text-slate-600">Score: {selectedScore}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${getBand(selectedScore).badgeClass}`}>
                            {getBand(selectedScore).label}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedCell(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none px-1">×</button>
                    </div>

                    {selectedTestCases.length === 0 && selectedRiskItems.length === 0 ? (
                      <p className="text-slate-400 text-sm italic">No items in this cell.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedTestCases.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Test Cases</p>
                            <ul className="space-y-1.5">
                              {selectedTestCases.map(tc => (
                                <li key={tc.id} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                                  <span className="text-sm font-medium text-slate-800 truncate mr-2">
                                    {tc.testName || <span className="text-slate-400 italic">(unnamed)</span>}
                                  </span>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${recBadge(tc.recommendation)}`}>
                                    {tc.recommendation}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedRiskItems.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Risk Items</p>
                            <ul className="space-y-1.5">
                              {selectedRiskItems.map(ri => (
                                <li key={ri.id} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                                  <div className="truncate mr-2">
                                    <span className="text-sm font-medium text-slate-800">
                                      {ri.failureMode || <span className="text-slate-400 italic">(unnamed)</span>}
                                    </span>
                                    {ri.causeOfFailure && <span className="text-xs text-slate-500 ml-2">— {ri.causeOfFailure}</span>}
                                  </div>
                                  {ri.percentComplete > 0 && (
                                    <span className="text-xs font-semibold text-slate-500 shrink-0">{ri.percentComplete}%</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Summary tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {bandCounts.map(b => (
                    <div key={b.label} className={`rounded-lg border p-3 ${b.tileClass}`}>
                      <div className={`text-2xl font-bold ${b.textClass}`}>{b.tcCount + b.riCount}</div>
                      <div className={`text-sm font-semibold ${b.textClass}`}>{b.label} risk</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {b.tcCount} test{b.tcCount !== 1 ? 's' : ''} · {b.riCount} risk item{b.riCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Risk Items table (full page width) ── */}
        <div className="px-4 lg:px-8 pb-8">
          <div className="border rounded-lg bg-white shadow overflow-hidden">

            {/* Collapsible header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50">
              <button
                className="flex items-start gap-2 text-left group flex-1 min-w-0"
                onClick={() => setIsTableCollapsed(c => !c)}
              >
                {isTableCollapsed
                  ? <ChevronDown className="w-4 h-4 mt-0.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                  : <ChevronUp   className="w-4 h-4 mt-0.5 text-slate-400 group-hover:text-slate-600 shrink-0" />}
                <div className="min-w-0">
                  <span className="text-base font-bold text-slate-800">
                    Risk Items
                    <span className="ml-2 text-sm font-normal text-slate-500">({appState.riskItems.length})</span>
                  </span>
                  {isTableCollapsed ? (
                    // Collapsed: show risk-items-only counts per band
                    <div className="flex flex-wrap gap-2 mt-1">
                      {bandCounts.map(b => (
                        <span key={b.label} className={`text-xs font-semibold px-2 py-0.5 rounded ${b.badgeClass}`}>
                          {b.label}: {b.riCount}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Standalone risks and mitigations — scored independently of test cases
                    </p>
                  )}
                </div>
              </button>

              <Button onClick={addRiskItem} size="sm" className="gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                Add Risk Item
              </Button>
            </div>

            {/* Table */}
            {!isTableCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left">
                      <th className="p-2 font-semibold text-slate-600 text-xs w-8 text-center">#</th>
                      <th className="p-2 font-semibold text-slate-600 text-xs min-w-[140px]">Failure Mode</th>
                      <th className="p-2 font-semibold text-slate-600 text-xs min-w-[140px]">Cause of Failure</th>
                      <th className="p-2 font-semibold text-slate-600 text-xs w-36">Likelihood</th>
                      <th className="p-2 font-semibold text-slate-600 text-xs min-w-[140px]">Effect of Failure</th>
                      <th className="p-2 font-semibold text-slate-600 text-xs w-36">Impact</th>
                      <th className="p-2 font-semibold text-slate-600 text-xs w-20 text-center">Score</th>
                      <th className="p-2 font-semibold text-slate-600 text-xs min-w-[160px]">Recommended Actions</th>
                      <th className="p-2 font-semibold text-slate-600 text-xs min-w-[100px]">Action Owner</th>
                      <th className="p-2 font-semibold text-slate-600 text-xs w-32">Due Date</th>
                      <th className="p-2 font-semibold text-slate-600 text-xs w-28">% Complete</th>
                      <th className="p-2 font-semibold text-slate-600 text-xs min-w-[120px]">Notes</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {appState.riskItems.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="p-10 text-center text-slate-400 italic text-sm">
                          No risk items yet. Click "Add Risk Item" to enter your first failure mode.
                        </td>
                      </tr>
                    ) : (
                      appState.riskItems.map((item, idx) => (
                        <RiskItemRow
                          key={item.id}
                          item={item}
                          index={idx + 1}
                          onUpdate={u => updateRiskItem(item.id, u)}
                          onDelete={() => deleteRiskItem(item.id)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
