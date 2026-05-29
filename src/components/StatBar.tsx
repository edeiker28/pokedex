const STAT_COLORS: Record<string, string> = {
  hp: '#ff5959',
  attack: '#ee8130',
  defense: '#7c3aed',
  'special-attack': '#6390f0',
  'special-defense': '#7ac74c',
  speed: '#f95587',
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Sp. Ataque',
  'special-defense': 'Sp. Defensa',
  speed: 'Velocidad',
}

interface Props {
  name: string
  value: number
}

export default function StatBar({ name, value }: Props) {
  const color = STAT_COLORS[name] ?? '#94a3b8'
  const label = STAT_LABELS[name] ?? name
  const percentage = Math.min((value / 255) * 100, 100)

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 font-mono w-24 shrink-0">{label}</span>
      <span className="text-xs font-mono text-white w-8 text-right shrink-0">{value}</span>
      <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}bb)`,
            boxShadow: `0 0 6px ${color}88`,
          }}
        />
      </div>
    </div>
  )
}
