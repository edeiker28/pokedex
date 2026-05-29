import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTeamStore } from '../store/teamStore'
import { analyzeTeamWeaknesses } from '../constants/typeChart'
import { getTypeColor } from '../constants/typeColors'
import { usePokemonSearch } from '../hooks/usePokemons'
import TypeBadge from '../components/TypeBadge'

export default function TeamBuilder() {
  const { team, removeFromTeam, clearTeam, addToTeam } = useTeamStore()
  const [searchQuery, setSearchQuery] = useState('')

  const searchResult = usePokemonSearch(searchQuery)

  const teamTypes = team.map(p => p.types)
  const weaknesses = analyzeTeamWeaknesses(teamTypes)

  const sortedWeaknesses = Object.entries(weaknesses)
    .sort((a, b) => b[1] - a[1])

  const handleAddFromSearch = () => {
    if (!searchResult.data) return
    const p = searchResult.data
    addToTeam({
      id: p.id,
      name: p.name,
      types: p.types.map((t: { type: { name: string } }) => t.type.name),
      sprite: p.sprites.front_default,
    })
    setSearchQuery('')
  }

  return (
    <div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-gamer-red text-sm mb-2 tracking-widest uppercase" style={{ textShadow: '0 0 6px rgba(220,38,38,0.5)' }}>
        &gt; team.analyze()
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-8">
        Team <span className="text-gamer-red">Builder</span>
      </motion.h1>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => {
          const pokemon = team[i]
          return (
            <AnimatePresence key={i} mode="wait">
              {pokemon ? (
                <motion.div
                  key={pokemon.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative rounded-xl p-3 text-center"
                  style={{
                    background: `linear-gradient(135deg, ${getTypeColor(pokemon.types[0])}18, #09090f)`,
                    border: `1px solid ${getTypeColor(pokemon.types[0])}55`,
                    boxShadow: `0 0 10px ${getTypeColor(pokemon.types[0])}22`,
                  }}
                >
                  <button
                    onClick={() => removeFromTeam(pokemon.id)}
                    className="absolute top-1 right-1 text-gamer-red/60 hover:text-gamer-red text-xs transition-colors"
                  >
                    ✕
                  </button>
                  <Link to={`/pokedex/${pokemon.id}`}>
                    <div
                      className="w-12 h-12 mx-auto mb-1 rounded-full flex items-center justify-center"
                      style={{ background: `${getTypeColor(pokemon.types[0])}22` }}
                    >
                      <img src={pokemon.sprite} alt={pokemon.name} className="w-10 h-10 object-contain" />
                    </div>
                  </Link>
                  <p className="text-xs text-white font-semibold capitalize">{pokemon.name}</p>
                  <p className="text-xs font-mono capitalize mt-1" style={{ color: getTypeColor(pokemon.types[0]) }}>
                    {pokemon.types[0]}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={`empty-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl p-3 text-center border border-dashed border-gamer-purple/30 flex flex-col items-center justify-center min-h-[100px] text-gamer-purple/40"
                >
                  <span className="text-2xl">＋</span>
                  <span className="text-xs font-mono mt-1">vacío</span>
                </motion.div>
              )}
            </AnimatePresence>
          )
        })}
      </div>

      {team.length < 6 && (
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar Pokémon para agregar..."
            className="flex-1 bg-white/5 border border-gamer-purple/30 rounded-xl px-4 py-2 text-sm outline-none focus:border-gamer-purple/60 transition-colors font-mono"
          />
          {searchResult.data && (
            <button
              onClick={handleAddFromSearch}
              className="px-4 py-2 bg-gamer-purple rounded-xl text-sm font-semibold text-white hover:bg-gamer-purple/80 transition-colors capitalize"
            >
              + {searchResult.data.name}
            </button>
          )}
        </div>
      )}

      {team.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-gamer-purple/20 rounded-2xl p-6"
        >
          <p className="font-mono text-gamer-purple text-xs tracking-widest uppercase mb-4">&gt; cobertura_de_tipos</p>

          {sortedWeaknesses.length === 0 ? (
            <p className="text-slate-500 text-sm font-mono">Agrega más Pokémon para ver el análisis.</p>
          ) : (
            <>
              <p className="text-xs text-slate-500 font-mono mb-4">Número de Pokémon débiles a cada tipo atacante:</p>
              <div className="flex flex-wrap gap-2">
                {sortedWeaknesses.map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                    style={{
                      background: count >= 2 ? `${getTypeColor(type)}22` : '#ffffff08',
                      border: `1px solid ${count >= 2 ? getTypeColor(type) + '55' : '#ffffff15'}`,
                    }}
                  >
                    <span style={{ color: getTypeColor(type) }} className="capitalize font-mono text-xs">{type}</span>
                    <span
                      className="font-bold text-xs"
                      style={{ color: count >= 3 ? '#dc2626' : count === 2 ? '#f59e0b' : '#94a3b8' }}
                    >
                      ×{count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      ) : (
        <div className="text-center py-16 border border-dashed border-gamer-purple/20 rounded-2xl">
          <p className="text-slate-500 font-mono text-sm mb-4">Tu equipo está vacío.</p>
          <Link to="/pokedex" className="text-gamer-purple-light hover:underline text-sm font-mono">
            → Ir al Pokédex a agregar Pokémon
          </Link>
        </div>
      )}

      {team.length > 0 && (
        <div className="mt-6 text-right">
          <button
            onClick={clearTeam}
            className="text-xs text-gamer-red/60 hover:text-gamer-red font-mono transition-colors"
          >
            ✕ Limpiar equipo
          </button>
        </div>
      )}
    </div>
  )
}
