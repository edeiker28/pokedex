import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import PokemonCard from '../components/PokemonCard'
import { getPokemons, getPokemonsByType, extractIdFromUrl, getPokemon } from '../api/pokemons'
import { ALL_TYPES, getTypeColor } from '../constants/typeColors'
import { GENERATION_RANGES, GENERATION_LABELS, LEGENDARY_IDS, MYTHICAL_IDS } from '../constants/categories'
import type { PokemonListItem } from '../types/pokemon'

const LIMIT = 20

interface CardData {
  id: number
  name: string
  types: string[]
  sprite: string
}

// Carga el detalle de un Pokémon por nombre/id y renderiza su card
function PokemonCardLoader({ nameOrId }: { nameOrId: string | number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['pokemon', String(nameOrId)],
    queryFn: () => getPokemon(nameOrId),
    staleTime: Infinity,
  })

  if (isLoading || !data) {
    return <div className="bg-white/5 rounded-xl h-48 animate-pulse" />
  }

  return (
    <PokemonCard
      id={data.id}
      name={data.name}
      types={data.types.map((t: { type: { name: string } }) => t.type.name)}
      sprite={data.sprites.front_default}
    />
  )
}

export default function Pokedex() {
  const [offset, setOffset] = useState(0)
  const [allCards, setAllCards] = useState<CardData[]>([])
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(false)

  // Todos los nombres (una sola llamada al iniciar) — para búsqueda local
  const allNamesQuery = useQuery({
    queryKey: ['all-pokemon-names'],
    queryFn: () => getPokemons(0, 1025),
    staleTime: Infinity,
  })
  const allNames: PokemonListItem[] = allNamesQuery.data?.results ?? []

  // Tipo filter
  const typeQuery = useQuery({
    queryKey: ['type', selectedType],
    queryFn: () => getPokemonsByType(selectedType),
    enabled: !!selectedType,
    staleTime: Infinity,
  })

  // Carga paginada (modo normal sin filtros)
  const listQuery = useQuery({
    queryKey: ['pokemons', offset],
    queryFn: () => getPokemons(offset, LIMIT),
    staleTime: Infinity,
    enabled: !search && !selectedType && !selectedCategory,
  })

  useEffect(() => {
    if (!listQuery.data || search || selectedType || selectedCategory) return
    setLoading(true)
    const items: PokemonListItem[] = listQuery.data.results
    Promise.all(items.map((item) => getPokemon(extractIdFromUrl(item.url))))
      .then(pokemons => {
        const cards: CardData[] = pokemons.map((p: { id: number; name: string; types: Array<{ type: { name: string } }>; sprites: { front_default: string } }) => ({
          id: p.id,
          name: p.name,
          types: p.types.map((t: { type: { name: string } }) => t.type.name),
          sprite: p.sprites.front_default,
        }))
        setAllCards(prev => {
          const ids = new Set(prev.map(c => c.id))
          return [...prev, ...cards.filter(c => !ids.has(c.id))]
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [listQuery.data, search, selectedType, selectedCategory])

  // IDs del filtro de categoría activo
  const categoryIds = useMemo(() => {
    if (!selectedCategory) return []
    if (selectedCategory === 'legendary') return [...LEGENDARY_IDS]
    if (selectedCategory === 'mythical') return [...MYTHICAL_IDS]
    const range = GENERATION_RANGES[selectedCategory]
    if (range) {
      const [from, to] = range
      return Array.from({ length: to - from + 1 }, (_, i) => from + i)
    }
    return []
  }, [selectedCategory])

  // Resultados de búsqueda local — filtra por nombre (letra a letra) o por número
  const searchResults = useMemo(() => {
    if (!search) return []
    const q = search.toLowerCase().trim()
    const isNumber = /^\d+$/.test(q)
    return allNames
      .filter(p => {
        if (isNumber) {
          const id = extractIdFromUrl(p.url)
          return String(id).startsWith(q)
        }
        return p.name.includes(q)
      })
      .slice(0, 40)
  }, [search, allNames])

  // IDs para filtro de tipo (máx 80)
  const typeIds = useMemo(() => {
    if (!selectedType || !typeQuery.data) return []
    return (typeQuery.data as Array<{ name: string; url: string }>)
      .slice(0, 80)
      .map(item => extractIdFromUrl(item.url))
  }, [selectedType, typeQuery.data])

  // Modo activo
  const mode = search ? 'search'
    : selectedCategory ? 'category'
    : selectedType ? 'type'
    : 'paginated'

  const handleClearFilters = () => {
    setSearch('')
    setSelectedType('')
    setSelectedCategory('')
  }

  const handleTypeToggle = (type: string) => {
    setSelectedType(prev => prev === type ? '' : type)
    setSearch('')
    setSelectedCategory('')
  }

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategory(prev => prev === cat ? '' : cat)
    setSearch('')
    setSelectedType('')
  }

  const hasFilters = search || selectedType || selectedCategory

  return (
    <div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-gamer-purple text-sm mb-2 tracking-widest uppercase">
        &gt; pokedex.list()
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-6">
        Pokédex <span className="text-gamer-purple-light">completo</span>
      </motion.h1>

      {/* Búsqueda en tiempo real */}
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedType(''); setSelectedCategory('') }}
          placeholder="🔍 Buscar Pokémon por nombre..."
          className="w-full bg-white/5 border border-gamer-purple/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gamer-purple/60 transition-colors"
        />
        {search && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
            {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filtros de categoría */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2">Categoría</p>
        <div className="flex flex-wrap gap-2">
          {/* Especiales */}
          {[
            { key: 'legendary', label: '⭐ Legendario', color: '#f7d02c' },
            { key: 'mythical', label: '✨ Mítico', color: '#f95587' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => handleCategoryToggle(key)}
              className="text-xs px-3 py-1 rounded-full font-mono transition-all"
              style={{
                background: selectedCategory === key ? `${color}44` : `${color}18`,
                color,
                border: `1px solid ${color}${selectedCategory === key ? 'aa' : '44'}`,
              }}
            >
              {label}
            </button>
          ))}

          {/* Generaciones */}
          {Object.entries(GENERATION_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleCategoryToggle(key)}
              className="text-xs px-3 py-1 rounded-full font-mono transition-all"
              style={{
                background: selectedCategory === key ? '#7c3aed44' : '#7c3aed18',
                color: '#a78bfa',
                border: `1px solid #7c3aed${selectedCategory === key ? 'aa' : '44'}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros de tipo */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2">Tipo</p>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map(type => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className="text-xs px-3 py-1 rounded-full font-mono transition-all capitalize"
              style={{
                background: selectedType === type ? `${getTypeColor(type)}55` : `${getTypeColor(type)}22`,
                color: getTypeColor(type),
                border: `1px solid ${getTypeColor(type)}${selectedType === type ? 'aa' : '44'}`,
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Limpiar filtros */}
      {hasFilters && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400 font-mono">
            {mode === 'search' && `Mostrando resultados para "${search}"`}
            {mode === 'category' && `Categoría: ${selectedCategory === 'legendary' ? 'Legendario' : selectedCategory === 'mythical' ? 'Mítico' : GENERATION_LABELS[selectedCategory]}`}
            {mode === 'type' && `Tipo: ${selectedType}`}
          </p>
          <button
            onClick={handleClearFilters}
            className="text-xs text-gamer-red/60 hover:text-gamer-red font-mono transition-colors"
          >
            ✕ Limpiar filtros
          </button>
        </div>
      )}

      {/* Skeleton */}
      {loading && mode === 'paginated' && allCards.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {mode === 'search' && search && searchResults.length === 0 && !allNamesQuery.isLoading && (
        <p className="text-slate-500 font-mono text-sm">No hay Pokémon que coincidan con "{search}"</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {mode === 'search' && searchResults.map(item => (
          <PokemonCardLoader key={item.name} nameOrId={item.name} />
        ))}

        {mode === 'category' && categoryIds.map(id => (
          <PokemonCardLoader key={id} nameOrId={id} />
        ))}

        {mode === 'type' && typeIds.map(id => (
          <PokemonCardLoader key={id} nameOrId={id} />
        ))}

        {mode === 'paginated' && allCards.map(card => (
          <PokemonCard key={card.id} {...card} />
        ))}
      </div>

      {/* Cargar más (solo modo paginado) */}
      {mode === 'paginated' && !loading && (
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500 font-mono mb-3">Mostrando {allCards.length} de 1025</p>
          <button
            onClick={() => setOffset(prev => prev + LIMIT)}
            className="px-6 py-2 border border-gamer-red/50 text-red-300 rounded-xl hover:bg-gamer-red/10 transition-all font-mono text-sm"
          >
            ▸ Cargar más
          </button>
        </div>
      )}
    </div>
  )
}
