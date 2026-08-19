import type { Entry } from '../types';
import { MOODS } from './MoodPicker';

interface Props {
  entries: Entry[];
  onDelete: (id: string) => void;
}

const EMOJI: Record<number, string> = Object.fromEntries(MOODS.map((m) => [m.value, m.emoji]));

function fmtDate(key: string): string {
  const [, m, d] = key.split('-');
  return `${m}/${d}`;
}

export default function EntriesList({ entries, onDelete }: Props) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="card">
      <h2>歷史紀錄</h2>
      {sorted.length === 0 ? (
        <div className="empty">還沒有紀錄,今天寫下第一篇吧。</div>
      ) : (
        <div>
          {sorted.map((e) => (
            <div className="entry" key={e.id}>
              <div className="entry-top">
                <span className="entry-date">{fmtDate(e.date)}</span>
                <span className="entry-mood">{EMOJI[e.mood]}</span>
                <button className="entry-del" onClick={() => onDelete(e.id)} aria-label="刪除這筆紀錄">
                  刪除
                </button>
              </div>
              {e.note && <div className="entry-note">{e.note}</div>}
              {e.tags.length > 0 && (
                <div className="entry-tags">
                  {e.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
