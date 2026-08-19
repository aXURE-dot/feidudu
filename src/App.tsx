import { useEffect, useMemo, useState, type ReactNode } from 'react'

type Period = { start: string; end: string }
type Settings = { cycleLength: number; periodLength: number; theme: 'rose' | 'lavender' | 'mint' }
type Store = { periods: Period[]; notes: Record<string, string>; settings: Settings }

const key = 'cycle-focus-data-v1'
const initial: Store = { periods: [], notes: {}, settings: { cycleLength: 28, periodLength: 5, theme: 'rose' } }
const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const parse = (value: string) => new Date(`${value}T12:00:00`)
const addDays = (date: Date, days: number) => { const next = new Date(date); next.setDate(next.getDate() + days); return next }
const sameDay = (a: string, b: string) => a === b
const between = (day: string, start: string, end: string) => day >= start && day <= end
const monthLabel = new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'long' })

function load(): Store { try { return { ...initial, ...JSON.parse(localStorage.getItem(key) || '') } } catch { return initial } }

export default function App() {
  const [data, setData] = useState<Store>(load)
  const [cursor, setCursor] = useState(() => new Date())
  const [selected, setSelected] = useState(iso(new Date()))
  const [panel, setPanel] = useState<'record' | 'settings' | 'backup' | null>(null)

  useEffect(() => localStorage.setItem(key, JSON.stringify(data)), [data])
  const today = iso(new Date())
  const predicted = useMemo(() => predictions(data.periods, data.settings), [data.periods, data.settings])
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const gridStart = addDays(first, -first.getDay())
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
  const currentPeriod = data.periods.find((p) => between(selected, p.start, p.end))
  const predictedPeriod = predicted.find((p) => between(selected, p.start, p.end))
  const dayNote = data.notes[selected] || ''

  const update = (next: Partial<Store>) => setData((value) => ({ ...value, ...next }))
  const addPeriod = (start: string, length: number) => {
    const end = iso(addDays(parse(start), Math.max(1, length) - 1))
    update({ periods: [...data.periods.filter((p) => p.start !== start), { start, end }].sort((a, b) => a.start.localeCompare(b.start)) })
    setPanel(null)
  }
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a')
    link.href = url; link.download = `cycle-focus-backup-${today}.json`; link.click(); URL.revokeObjectURL(url)
  }
  const importBackup = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { try { setData(JSON.parse(String(reader.result))); setPanel(null) } catch { alert('備份檔格式不正確') } }
    reader.readAsText(file)
  }

  return <main className={`app ${data.settings.theme}`}>
    <header><div><p className="eyebrow">今天 · {new Intl.DateTimeFormat('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date())}</p><h1>Cycle Focus</h1></div><button className="avatar" aria-label="設定" onClick={() => setPanel('settings')}>◌</button></header>
    <section className="insight"><span className="spark">✦</span><div><p>{data.periods.length ? (predicted[0] ? `下次預測生理期：${new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric' }).format(parse(predicted[0].start))}` : '持續記錄，讓預測更貼近你') : '從記錄第一天開始認識你的週期'}</p><small>預測僅供生活規劃參考，非醫療建議。</small></div></section>
    <section className="calendar-card"><div className="month-nav"><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</button><h2>{monthLabel.format(cursor)}</h2><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</button></div><div className="weekdays">{['日','一','二','三','四','五','六'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar">{days.map((date) => { const dateIso = iso(date); const recorded = data.periods.some((p) => between(dateIso, p.start, p.end)); const forecast = predicted.some((p) => between(dateIso, p.start, p.end)); return <button key={dateIso} className={`day ${date.getMonth() !== cursor.getMonth() ? 'muted' : ''} ${sameDay(dateIso, selected) ? 'selected' : ''} ${sameDay(dateIso, today) ? 'today' : ''} ${recorded ? 'recorded' : forecast ? 'forecast' : ''}`} onClick={() => setSelected(dateIso)}><span>{date.getDate()}</span>{data.notes[dateIso] && <i />}</button> })}</div></section>
    <section className="day-summary"><div><p className="eyebrow">{new Intl.DateTimeFormat('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' }).format(parse(selected))}</p><h2>{currentPeriod ? '已記錄生理期' : predictedPeriod ? '預測生理期' : '留下一筆今日記錄'}</h2><p className="note-preview">{dayNote || (currentPeriod ? '這天屬於你記錄的週期。' : predictedPeriod ? '依你設定的平均週期推估。' : '可記下心情、專注狀態或重要事情。')}</p></div><button className="round-add" onClick={() => setPanel('record')}>＋</button></section>
    <nav><button className="active">▦<span>月曆</span></button><button onClick={() => setPanel('record')}>＋<span>記錄</span></button><button onClick={() => setPanel('backup')}>⇧<span>備份</span></button></nav>
    {panel === 'record' && <RecordSheet selected={selected} note={dayNote} defaultLength={data.settings.periodLength} onClose={() => setPanel(null)} onSave={(start, length, note) => { addPeriod(start, length); update({ notes: { ...data.notes, [selected]: note } }) }} />}
    {panel === 'settings' && <SettingsSheet settings={data.settings} onClose={() => setPanel(null)} onSave={(settings) => { update({ settings }); setPanel(null) }} />}
    {panel === 'backup' && <BackupSheet onClose={() => setPanel(null)} onExport={exportBackup} onImport={importBackup} />}
  </main>
}

function predictions(periods: Period[], settings: Settings): Period[] {
  const last = periods.length ? periods[periods.length - 1] : undefined; if (!last) return []
  return Array.from({ length: 4 }, (_, index) => { const start = iso(addDays(parse(last.start), settings.cycleLength * (index + 1))); return { start, end: iso(addDays(parse(start), settings.periodLength - 1)) } })
}
function Sheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="overlay" onMouseDown={onClose}><section className="sheet" onMouseDown={(event) => event.stopPropagation()}><div className="handle" /><div className="sheet-head"><h2>{title}</h2><button onClick={onClose}>×</button></div>{children}</section></div> }
function RecordSheet({ selected, note, defaultLength, onClose, onSave }: { selected: string; note: string; defaultLength: number; onClose: () => void; onSave: (start: string, length: number, note: string) => void }) { const [start, setStart] = useState(selected); const [length, setLength] = useState(defaultLength); const [text, setText] = useState(note); return <Sheet title="記錄週期與今天" onClose={onClose}><label>生理期開始日<input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label><label>預計天數<input type="number" min="1" max="14" value={length} onChange={(e) => setLength(Number(e.target.value))} /></label><label>今日筆記<textarea placeholder="心情、能量、專注事項…" value={text} onChange={(e) => setText(e.target.value)} /></label><button className="primary" onClick={() => onSave(start, length, text)}>儲存記錄</button></Sheet> }
function SettingsSheet({ settings, onClose, onSave }: { settings: Settings; onClose: () => void; onSave: (settings: Settings) => void }) { const [value, setValue] = useState(settings); return <Sheet title="偏好設定" onClose={onClose}><label>平均週期長度<input type="number" min="20" max="45" value={value.cycleLength} onChange={(e) => setValue({ ...value, cycleLength: Number(e.target.value) })} /></label><label>平均生理期天數<input type="number" min="1" max="14" value={value.periodLength} onChange={(e) => setValue({ ...value, periodLength: Number(e.target.value) })} /></label><div className="theme-choice"><span>主題色系</span><div>{(['rose','lavender','mint'] as const).map((theme) => <button key={theme} className={`${theme} ${value.theme === theme ? 'chosen' : ''}`} onClick={() => setValue({ ...value, theme })} aria-label={theme} />)}</div></div><button className="primary" onClick={() => onSave(value)}>儲存設定</button></Sheet> }
function BackupSheet({ onClose, onExport, onImport }: { onClose: () => void; onExport: () => void; onImport: (file?: File) => void }) { return <Sheet title="資料備份" onClose={onClose}><p className="backup-copy">目前資料安全儲存在這台裝置。下載備份檔後，可放到 iCloud Drive、Google Drive 或其他雲端空間。</p><button className="primary" onClick={onExport}>下載備份檔</button><label className="file-label">還原備份<input type="file" accept="application/json" onChange={(e) => onImport(e.target.files?.[0])} /></label><p className="muted-copy">要自動跨裝置同步，下一步可串接 Supabase 或 Firebase。</p></Sheet> }
