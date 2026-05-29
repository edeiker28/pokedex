import { getTypeColor } from '../constants/typeColors'

interface Props {
  type: string
  size?: 'sm' | 'md'
}

export default function TypeBadge({ type, size = 'sm' }: Props) {
  const color = getTypeColor(type)
  const label = type.charAt(0).toUpperCase() + type.slice(1)

  return (
    <span
      className={`inline-block rounded-full font-mono font-medium capitalize ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
      style={{
        backgroundColor: `${color}33`,
        color,
        border: `1px solid ${color}66`,
      }}
    >
      {label}
    </span>
  )
}
