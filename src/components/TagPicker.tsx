const AVAILABLE_TAGS = ['睡眠', '運動', '工作', '社交', '壓力', '放鬆'];

interface Props {
  selected: string[];
  onToggle: (tag: string) => void;
}

export default function TagPicker({ selected, onToggle }: Props) {
  return (
    <div className="tag-row">
      {AVAILABLE_TAGS.map((tag) => (
        <div
          key={tag}
          className={`tag${selected.includes(tag) ? ' active' : ''}`}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </div>
      ))}
    </div>
  );
}
