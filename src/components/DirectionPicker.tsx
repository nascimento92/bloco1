type Direction = 'cima' | 'baixo' | 'lado'

interface Props {
  value: Direction | null
  onChange: (v: Direction) => void
}

const OPTIONS: { value: Direction; icon: string; label: string }[] = [
  { value: 'cima',  icon: '⬆️', label: 'De cima'  },
  { value: 'baixo', icon: '⬇️', label: 'De baixo' },
  { value: 'lado',  icon: '↔️', label: 'Do lado'  },
]

export default function DirectionPicker({ value, onChange }: Props) {
  return (
    <div className="direction-grid">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`direction-card${value === opt.value ? ' selected' : ''}`}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
        >
          <span className="dir-icon">{opt.icon}</span>
          <span className="dir-label">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
