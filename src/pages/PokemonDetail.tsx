import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePokemonDetail, usePokemonEvolution } from '../hooks/usePokemonDetail'
import TypeBadge from '../components/TypeBadge'
import StatBar from '../components/StatBar'
import EvolutionChain from '../components/EvolutionChain'
import { useTeamStore } from '../store/teamStore'
import { getTypeColor } from '../constants/typeColors'

const GENERATION_MAP: Record<string, string> = {
  'generation-i':    'Gen I',
  'generation-ii':   'Gen II',
  'generation-iii':  'Gen III',
  'generation-iv':   'Gen IV',
  'generation-v':    'Gen V',
  'generation-vi':   'Gen VI',
  'generation-vii':  'Gen VII',
  'generation-viii': 'Gen VIII',
  'generation-ix':   'Gen IX',
}

const MAX_ID = 1025

export default function PokemonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: pokemon, isLoading, isError } = usePokemonDetail(id!)
  const { team, addToTeam } = useTeamStore()

  const { evolutionChain, speciesData, loading: evoLoading } = usePokemonEvolution(
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
  const sprite = pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default
  const isInTeam = team.some(p => p.id === pokemon.id)
  const teamFull = team.length >= 6
  const label = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)

  // Datos de especie
  const generation = speciesData ? GENERATION_MAP[speciesData.generation?.name] ?? speciesData.generation?.name : null
  const isLegendary = speciesData?.is_legendary
  const isMythical = speciesData?.is_mythical
  const isBaby = speciesData?.is_baby
  const genus = speciesData?.genera?.find((g: { language: { name: string }; genus: string }) => g.language.name === 'en')?.genus ?? null
  const flavorText = speciesData?.flavor_text_entries
    ?.find((e: { language: { name: string }; flavor_text: string }) => e.language.name === 'en')
    ?.flavor_text
    ?.replace(/\f/g, ' ')
    ?? null

  const rarityLabel = isMythical ? { text: '✨ Mítico', color: '#f95587' }
    : isLegendary ? { text: '⭐ Legendario', color: '#f7d02c' }
    : isBaby ? { text: '🍼 Baby', color: '#96d9d6' }
    : null

  const handleAdd = () => {
    addToTeam({
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types.map(t => t.type.name),
      sprite: pokemon.sprites.front_default,
    })
  }

  const goTo = (targetId: number) => navigate(`/pokedex/${targetId}`)

  return (
    <div>
      {/* Navegación superior */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/pokedex" className="font-mono text-gamer-purple text-sm hover:underline">
          ← Pokédex
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(pokemon.id - 1)}
            disabled={pokemon.id <= 1}
            className="px-3 py-1.5 rounded-lg border border-gamer-purple/40 text-gamer-purple-light text-sm font-mono hover:bg-gamer-purple/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← #{String(pokemon.id - 1).padStart(3, '0')}
          </button>
          <span className="text-slate-600 font-mono text-xs">#{String(pokemon.id).padStart(3, '0')}</span>
          <button
            onClick={() => goTo(pokemon.id + 1)}
            disabled={pokemon.id >= MAX_ID}
            className="px-3 py-1.5 rounded-lg border border-gamer-purple/40 text-gamer-purple-light text-sm font-mono hover:bg-gamer-purple/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            #{String(pokemon.id + 1).padStart(3, '0')} →
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Lado izquierdo */}
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
          <p className="font-mono text-gamer-purple text-sm mb-1">#{String(pokemon.id).padStart(3, '0')}</p>

          {/* Género y generación */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
            {genus && (
              <span className="text-xs text-slate-400 font-mono italic">{genus}</span>
            )}
            {genus && generation && <span className="text-slate-600">·</span>}
            {generation && (
              <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                style={{ background: '#7c3aed22', color: '#a78bfa', border: '1px solid #7c3aed44' }}>
                {generation}
              </span>
            )}
            {rarityLabel && (
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold"
                style={{ background: `${rarityLabel.color}22`, color: rarityLabel.color, border: `1px solid ${rarityLabel.color}55` }}>
                {rarityLabel.text}
              </span>
            )}
          </div>

          <div
            className="w-44 h-44 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: `${primaryColor}22`, boxShadow: `0 0 40px ${primaryColor}55` }}
          >
            <img src={sprite} alt={pokemon.name} className="w-40 h-40 object-contain" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">{label}</h1>

          <div className="flex gap-2 justify-center mb-4 flex-wrap">
            {pokemon.types.map(t => <TypeBadge key={t.type.name} type={t.type.name} size="md" />)}
          </div>

          {/* Descripción Pokédex */}
          {flavorText && (
            <p className="text-xs text-slate-400 italic mb-4 px-2 leading-relaxed">
              "{flavorText}"
            </p>
          )}

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

        {/* Lado derecho */}
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
                {a.ability.name.replace(/-/g, ' ')}
                {a.is_hidden && <span className="text-xs text-slate-500 ml-1">(oculta)</span>}
              </span>
            ))}
          </div>

          <p className="font-mono text-gamer-purple text-xs tracking-widest uppercase mb-3">&gt; movimientos_por_nivel</p>
          <div className="grid grid-cols-2 gap-2">
            {pokemon.moves
              .flatMap(m => {
                const detail = m.version_group_details?.find(d => d.move_learn_method.name === 'level-up')
                if (!detail) return []
                return [{ name: m.move.name, level: detail.level_learned_at }]
              })
              .sort((a, b) => a.level - b.level)
              .slice(0, 16)
              .map(m => (
                <span
                  key={m.name}
                  className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-white/5 text-slate-300 font-mono"
                >
                  <span className="text-gamer-purple shrink-0 w-7 text-right">{m.level === 0 ? '—' : `${m.level}`}</span>
                  <span className="capitalize truncate">{m.name.replace(/-/g, ' ')}</span>
                </span>
              ))
            }
          </div>
        </motion.div>
      </div>

      {/* Cadena de evolución */}
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

      {/* Navegación inferior */}
      <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
        <button
          onClick={() => goTo(pokemon.id - 1)}
          disabled={pokemon.id <= 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gamer-purple/30 text-gamer-purple-light font-mono text-sm hover:bg-gamer-purple/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← #{String(pokemon.id - 1).padStart(3, '0')}
        </button>
        <button
          onClick={() => goTo(pokemon.id + 1)}
          disabled={pokemon.id >= MAX_ID}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gamer-purple/30 text-gamer-purple-light font-mono text-sm hover:bg-gamer-purple/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          #{String(pokemon.id + 1).padStart(3, '0')} →
        </button>
      </div>
    </div>
  )
}
