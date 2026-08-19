import type { Mood } from '../types';

const MOODS: { value: Mood; emoji: string }[] = [
  { value: 1, emoji: '😞' },
  { value: 2, emoji: '😐' },
  { value: 3, emoji: '🙂' },
  { value: 4, emoji: '😊' },
  { value: 5, emoji: '✨' },
];

interface Props {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

export default function MoodPicker({ value, onChange }: Props) {
  return (
    <div className="mood-row">
      {MOODS.map((m) => (
        <button
          key={m.value}
          type="button"
          className={`mood-btn${value === m.value ? ' active' : ''}`}
          onClick={() => onChange(m.value)}
          aria-pressed={value === m.value}
        >
          {m.emoji}
        </button>
      ))}
    </div>
  );
}

export { MOODS };
