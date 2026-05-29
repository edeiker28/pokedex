import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import TypeBadge from './TypeBadge'
import { useTeamStore } from '../store/teamStore'
import { getTypeColor } from '../constants/typeColors'

interface Props {
  id: number
  name: string
  types: string[]
  sprite: string
}

export default function PokemonCard({ id, name, types, sprite }: Props) {
  const { team, addToTeam } = useTeamStore()
  const primaryColor = getTypeColor(types[0])
  const isInTeam = team.some(p => p.id === id)
  const teamFull = team.length >= 6
  const label = name.charAt(0).toUpperCase() + name.slice(1)
  const number = String(id).padStart(3, '0')

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addToTeam({ id, name, types, sprite })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/pokedex/${id}`}
        className="group block rounded-2xl p-5 text-center transition-all"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}22, #09090f)`,
          border: `1px solid ${primaryColor}55`,
          boxShadow: `0 0 16px ${primaryColor}18`,
        }}
      >
        <p className="font-mono text-xs text-gamer-purple mb-2">#{number}</p>
        <div
          className="w-24 h-24 mx-auto mb-3 rounded-full flex items-center justify-center"
          style={{ background: `${primaryColor}22`, boxShadow: `0 0 18px ${primaryColor}66` }}
        >
          <img
            src={sprite}
            alt={name}
            className="w-20 h-20 object-contain drop-shadow-lg"
            loading="lazy"
          />
        </div>
        <p className="text-base font-bold text-white mb-2">{label}</p>
        <div className="flex gap-1 justify-center flex-wrap mb-4">
          {types.map(t => <TypeBadge key={t} type={t} size="md" />)}
        </div>
        <button
          onClick={handleAdd}
          disabled={isInTeam || teamFull}
          className="text-xs px-3 py-1.5 rounded-lg transition-all w-full disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          style={{
            background: isInTeam ? `${primaryColor}22` : `#7c3aed`,
            color: isInTeam ? primaryColor : 'white',
          }}
        >
          {isInTeam ? '✓ En equipo' : teamFull ? 'Equipo lleno' : '+ Agregar'}
        </button>
      </Link>
    </motion.div>
  )
}
