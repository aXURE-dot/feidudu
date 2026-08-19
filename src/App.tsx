import { useEffect, useState } from 'react';
import type { Entry, Mood } from './types';
import { loadEntries, saveEntries, todayKey, makeId } from './storage';
import MoodPicker from './components/MoodPicker';
import TagPicker from './components/TagPicker';
import TrendChart from './components/TrendChart';
import EntriesList from './components/EntriesList';
import ExportImport from './components/ExportImport';

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [mood, setMood] = useState<Mood | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  function persist(next: Entry[]) {
    setEntries(next);
    saveEntries(next);
  }

  function handleSave() {
    if (!mood) {
      alert('請先選擇今天的心情');
      return;
    }
    const key = todayKey();
    const existingIdx = entries.findIndex((e) => e.date === key);
    const entry: Entry = {
      id: existingIdx >= 0 ? entries[existingIdx].id : makeId(),
      date: key,
      mood,
      tags,
      note: note.trim(),
      ts: Date.now(),
    };

    const next = [...entries];
    if (existingIdx >= 0) next[existingIdx] = entry;
    else next.push(entry);

    persist(next);
    setMood(null);
    setTags([]);
    setNote('');
  }

  function handleDelete(id: string) {
    persist(entries.filter((e) => e.id !== id));
  }

  function handleImport(imported: Entry[]) {
    persist(imported);
  }

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">私密 · 只留在這台裝置</div>
        <h1>膽子真是肥嘟嘟的</h1>
        <div className="sub">記錄今天的狀態,覺察屬於自己的節奏。所有資料只存在這個瀏覽器裡,不會上傳。</div>
      </header>

      <div className="card">
        <h2>今天感覺如何</h2>
        <MoodPicker value={mood} onChange={setMood} />

        <label className="field-label">標籤(可複選)</label>
        <TagPicker selected={tags} onToggle={toggleTag} />

        <label className="field-label">筆記(選填)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="今天發生了什麼,或有什麼想記下的..."
        />

        <button className="save-btn" onClick={handleSave}>
          儲存今天的紀錄
        </button>
      </div>

      <TrendChart entries={entries} />

      <ExportImport entries={entries} onImport={handleImport} />

      <EntriesList entries={entries} onDelete={handleDelete} />

      <footer>
        資料儲存於瀏覽器 localStorage,清除瀏覽器資料會一併清除紀錄。
        <br />
        僅供個人使用,不會傳送到任何伺服器。記得定期用「匯出備份」存一份 JSON 到雲端硬碟。
      </footer>
    </div>
  );
}
