export type Mood = 1 | 2 | 3 | 4 | 5;

export interface Entry {
  id: string;
  date: string;      // YYYY-MM-DD
  mood: Mood;
  tags: string[];
  note: string;
  ts: number;         // 建立時間戳,用於排序/備份比對
}

export interface BackupFile {
  app: 'rhythm-diary';
  version: 1;
  exportedAt: string;
  entries: Entry[];
}
