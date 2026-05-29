import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePokemonDetail, usePokemonEvolution } from '../hooks/usePokemonDetail'
import TypeBadge from '../components/TypeBadge'
import StatBar from '../components/StatBar'
import EvolutionChain from '../components/EvolutionChain'
import { useTeamStore } from '../store/teamStore'
import { getTypeColor } from '../constants/typeColors'

export default function PokemonDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: pokemon, isLoading, isError } = usePokemonDetail(id!)
  const { team, addToTeam } = useTeamStore()

  const { evolutionChain, loading: evoLoading } = usePokemonEvolution(
    pokemon?.species?.url ?? ''
  )

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-16 h-16 border-4 border-gamer-purple border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (isError || !pokemon) return (
    <div className="text-center py-20">
      <p className="text-red-400 font-mono">Pokémon no encontrado</p>
      <Link to="/pokedex" className="text-gamer-purple-light mt-4 inline-block hover:underline">← Volver al Pokédex</Link>
    </div>
  )

  const primaryType = pokemon.types[0]?.type.name
  const primaryColor = getTypeColor(primaryType)
  const sprite = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default
  const isInTeam = team.some(p => p.id === pokemon.id)
  const teamFull = team.length >= 6
  const label = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)

  const handleAdd = () => {
    addToTeam({
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types.map(t => t.type.name),
      sprite: pokemon.sprites.front_default,
    })
  }

  return (
    <div>
      <Link to="/pokedex" className="font-mono text-gamer-purple text-sm hover:underline mb-6 inline-block">
        ← Pokédex
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl p-8 text-center"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}18, #09090f)`,
            border: `1px solid ${primaryColor}44`,
            boxShadow: `0 0 30px ${primaryColor}18`,
          }}
        >
          <p className="font-mono text-gamer-purple text-sm mb-2">#{String(pokemon.id).padStart(3, '0')}</p>
          <div
            className="w-40 h-40 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: `${primaryColor}22`, boxShadow: `0 0 30px ${primaryColor}55` }}
          >
            <img src={sprite} alt={pokemon.name} className="w-36 h-36 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">{label}</h1>
          <div className="flex gap-2 justify-center mb-4 flex-wrap">
            {pokemon.types.map(t => <TypeBadge key={t.type.name} type={t.type.name} size="md" />)}
          </div>
          <div className="flex gap-4 justify-center text-sm text-slate-400 mb-6">
            <span>📏 {pokemon.height / 10}m</span>
            <span>⚖️ {pokemon.weight / 10}kg</span>
          </div>
          <button
            onClick={handleAdd}
            disabled={isInTeam || teamFull}
            className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
            style={{ background: isInTeam ? `${primaryColor}33` : '#7c3aed', color: isInTeam ? primaryColor : 'white' }}
          >
            {isInTeam ? '✓ En el equipo' : teamFull ? 'Equipo lleno' : '+ Agregar al equipo'}
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="font-mono text-gamer-purple text-xs tracking-widest uppercase mb-4">&gt; base_stats</p>
          <div className="space-y-3 mb-8">
            {pokemon.stats.map(s => (
              <StatBar key={s.stat.name} name={s.stat.name} value={s.base_stat} />
            ))}
          </div>

          <p className="font-mono text-gamer-purple text-xs tracking-widest uppercase mb-3">&gt; habilidades</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {pokemon.abilities.map(a => (
              <span
                key={a.ability.name}
                className="text-sm px-3 py-1 rounded-lg bg-gamer-purple/20 border border-gamer-purple/40 text-gamer-purple-light capitalize font-mono"
              >
                {a.ability.name.replace('-', ' ')}
                {a.is_hidden && <span className="text-xs text-slate-500 ml-1">(oculta)</span>}
              </span>
            ))}
          </div>

          <p className="font-mono text-gamer-purple text-xs tracking-widest uppercase mb-3">&gt; primeros_movimientos</p>
          <div className="grid grid-cols-2 gap-2">
            {pokemon.moves.slice(0, 10).map(m => (
              <span
                key={m.move.name}
                className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300 capitalize font-mono"
              >
                {m.move.name.replace('-', ' ')}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {!evoLoading && evolutionChain && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-gamer-purple/20 rounded-2xl p-6"
        >
          <p className="font-mono text-gamer-purple text-xs tracking-widest uppercase mb-4">&gt; evoluciones</p>
          <EvolutionChain chain={evolutionChain.chain} />
        </motion.div>
      )}
    </div>
  )
}
