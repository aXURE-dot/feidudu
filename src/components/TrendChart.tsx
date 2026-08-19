import type { Entry } from '../types';

interface Props {
  entries: Entry[];
}

function fmtDay(key: string): string {
  return key.split('-')[2];
}

export default function TrendChart({ entries }: Props) {
  const days: { key: string; mood: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const found = entries.find((e) => e.date === key);
    days.push({ key, mood: found ? found.mood : 0 });
  }

  const moods = entries.map((e) => e.mood);
  const avg = moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : '–';

  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (entries.find((e) => e.date === key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return (
    <div className="card">
      <h2>近 14 天趨勢</h2>
      <div className="trend">
        {days.map((d) => (
          <div
            key={d.key}
            className={`bar${d.mood ? ' filled' : ''}`}
            style={{ height: `${d.mood ? (d.mood / 5) * 100 : 4}%` }}
          />
        ))}
      </div>
      <div className="trend-labels">
        {days.map((d, i) => (
          <span key={d.key}>{i % 3 === 0 ? fmtDay(d.key) : ''}</span>
        ))}
      </div>
      <div className="stat-row">
        <div className="stat">
          <div className="n">{avg}</div>
          <div className="l">平均心情</div>
        </div>
        <div className="stat">
          <div className="n">{entries.length}</div>
          <div className="l">總紀錄數</div>
        </div>
        <div className="stat">
          <div className="n">{streak}</div>
          <div className="l">連續天數</div>
        </div>
      </div>
    </div>
  );
}
