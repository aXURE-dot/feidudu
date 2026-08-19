import { useRef, useState } from 'react';
import type { Entry } from '../types';
import { exportBackup, parseBackupFile, type ImportMode } from '../storage';

interface Props {
  entries: Entry[];
  onImport: (entries: Entry[]) => void;
}

export default function ExportImport({ entries, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<ImportMode>('merge');
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  function handleExport() {
    if (entries.length === 0) {
      setMessage({ text: '目前還沒有紀錄可以匯出。', ok: false });
      return;
    }
    exportBackup(entries);
    setMessage({ text: '已下載備份檔。', ok: true });
  }

  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || '');
      const result = parseBackupFile(raw, entries, mode);
      if (result.ok && result.entries) {
        onImport(result.entries);
      }
      setMessage({ text: result.message, ok: result.ok });
    };
    reader.onerror = () => {
      setMessage({ text: '讀取檔案失敗,請再試一次。', ok: false });
    };
    reader.readAsText(file);

    // 讓同一個檔案可以再次被選取觸發 onChange
    e.target.value = '';
  }

  return (
    <div className="card">
      <h2>備份與還原</h2>
      <div className="sub" style={{ marginBottom: 14 }}>
        資料只存在這台裝置。建議定期匯出備份,換裝置或重灌時可以匯入還原。
      </div>

      <button className="save-btn" onClick={handleExport}>
        匯出備份(JSON)
      </button>

      <label className="field-label" style={{ marginTop: 18 }}>
        匯入方式
      </label>
      <div className="tag-row">
        <div
          className={`tag${mode === 'merge' ? ' active' : ''}`}
          onClick={() => setMode('merge')}
        >
          合併(保留現有紀錄)
        </div>
        <div
          className={`tag${mode === 'overwrite' ? ' active' : ''}`}
          onClick={() => setMode('overwrite')}
        >
          覆蓋(取代全部紀錄)
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleFileChosen}
      />
      <button
        className="save-btn secondary"
        style={{ marginTop: 12 }}
        onClick={() => fileInputRef.current?.click()}
      >
        選擇備份檔匯入
      </button>

      {message && (
        <div className={`import-msg${message.ok ? '' : ' error'}`}>{message.text}</div>
      )}
    </div>
  );
}
