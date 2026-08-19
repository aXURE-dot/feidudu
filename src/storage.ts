import type { Entry, BackupFile } from './types';

const STORAGE_KEY = 'rhythm_diary_entries_v2';

export function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 匯出目前所有紀錄成 JSON 檔並觸發下載 */
export function exportBackup(entries: Entry[]): void {
  const backup: BackupFile = {
    app: 'rhythm-diary',
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = todayKey();
  a.href = url;
  a.download = `rhythm-diary-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type ImportMode = 'merge' | 'overwrite';

interface ImportResult {
  ok: boolean;
  message: string;
  entries?: Entry[];
}

/** 解析使用者選擇的備份檔,回傳合併/覆蓋後的結果(不直接寫入 storage,讓呼叫端決定) */
export function parseBackupFile(
  raw: string,
  existing: Entry[],
  mode: ImportMode
): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, message: '這不是有效的 JSON 檔案。' };
  }

  const backup = data as Partial<BackupFile>;
  if (!backup || backup.app !== 'rhythm-diary' || !Array.isArray(backup.entries)) {
    return { ok: false, message: '檔案格式不符,請確認是本 app 匯出的備份檔。' };
  }

  const incoming = backup.entries as Entry[];
  const validated = incoming.filter(
    (e) => e && typeof e.date === 'string' && typeof e.mood === 'number'
  );

  if (validated.length === 0) {
    return { ok: false, message: '備份檔內沒有可用的紀錄。' };
  }

  if (mode === 'overwrite') {
    return { ok: true, message: `已匯入 ${validated.length} 筆紀錄(覆蓋現有資料)。`, entries: validated };
  }

  // merge:同一天以匯入檔案為準,其餘保留原本的
  const byDate = new Map<string, Entry>();
  for (const e of existing) byDate.set(e.date, e);
  for (const e of validated) byDate.set(e.date, { ...e, id: e.id || makeId() });
  const merged = Array.from(byDate.values());

  return { ok: true, message: `已合併匯入,共 ${merged.length} 筆紀錄。`, entries: merged };
}
