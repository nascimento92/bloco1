type Intensity = 1 | 2 | 3 | 4 | 5

interface Props {
  value: Intensity | null
  onChange: (v: Intensity) => void
}

const COLORS = ['#4caf50', '#8bc34a', '#ffc107', '#ff7043', '#f44336']
const LABELS = ['Fraco', 'Leve', 'Médio', 'Alto', 'Muito alto']

export default function IntensityPicker({ value, onChange }: Props) {
  return (
    <div className="intensity-row">
      {([1, 2, 3, 4, 5] as Intensity[]).map((n) => (
        <button
          key={n}
          type="button"
          className={`intensity-btn${value === n ? ' selected' : ''}`}
          style={{ '--intensity-color': COLORS[n - 1] } as React.CSSProperties}
          onClick={() => onChange(n)}
          aria-pressed={value === n}
          title={LABELS[n - 1]}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
