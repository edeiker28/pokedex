import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useQueries } from '@tanstack/react-query'
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
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(false)

  const allNamesQuery = useQuery({
    queryKey: ['all-pokemon-names'],
    queryFn: () => getPokemons(0, 1025),
    staleTime: Infinity,
  })
  const allNames: PokemonListItem[] = allNamesQuery.data?.results ?? []

  // Fetch paralelo para cada tipo seleccionado
  const typeQueries = useQueries({
    queries: selectedTypes.map(type => ({
      queryKey: ['type', type],
      queryFn: () => getPokemonsByType(type),
      staleTime: Infinity,
    })),
  })

  const listQuery = useQuery({
    queryKey: ['pokemons', offset],
    queryFn: () => getPokemons(offset, LIMIT),
    staleTime: Infinity,
    enabled: !search && selectedTypes.length === 0 && !selectedCategory,
  })

  useEffect(() => {
    if (!listQuery.data || search || selectedTypes.length > 0 || selectedCategory) return
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
  }, [listQuery.data, search, selectedTypes, selectedCategory])

  // IDs del filtro de categoría
  const categoryIdSet = useMemo(() => {
    if (!selectedCategory) return null
    if (selectedCategory === 'legendary') return LEGENDARY_IDS
    if (selectedCategory === 'mythical') return MYTHICAL_IDS
    const range = GENERATION_RANGES[selectedCategory]
    if (range) {
      const [from, to] = range
      const ids = new Set<number>()
      for (let i = from; i <= to; i++) ids.add(i)
      return ids
    }
    return null
  }, [selectedCategory])

  // IDs por intersección de tipos seleccionados
  const typeIdSets = useMemo(() => {
    return typeQueries
      .filter(q => !!q.data)
      .map(q => new Set(
        (q.data as Array<{ name: string; url: string }>)
          .map(item => extractIdFromUrl(item.url))
          .filter(id => id >= 1 && id <= 1025)
      ))
  }, [typeQueries])

  const typesLoading = typeQueries.some(q => q.isLoading)

  // IDs combinados: intersección de tipos ∩ categoría
  const filteredIds = useMemo(() => {
    const hasCategory = categoryIdSet !== null
    const hasTypes = typeIdSets.length > 0

    if (!hasCategory && !hasTypes) return []

    let result: Set<number> | null = null

    // Intersección de todos los tipos seleccionados
    if (hasTypes) {
      for (const set of typeIdSets) {
        if (result === null) {
          result = new Set(set)
        } else {
          result = new Set([...result].filter(id => set.has(id)))
        }
      }
    }

    // Intersección con categoría
    if (hasCategory && categoryIdSet) {
      if (result === null) {
        result = new Set(categoryIdSet)
      } else {
        result = new Set([...result].filter(id => categoryIdSet.has(id)))
      }
    }

    return result ? [...result].sort((a, b) => a - b) : []
  }, [categoryIdSet, typeIdSets])

  // Búsqueda local
  const searchResults = useMemo(() => {
    if (!search) return []
    const q = search.toLowerCase().trim()
    const isNumber = /^\d+$/.test(q)
    return allNames
      .filter(p => {
        if (isNumber) return String(extractIdFromUrl(p.url)).startsWith(q)
        return p.name.includes(q)
      })
      .slice(0, 40)
  }, [search, allNames])

  const mode: 'search' | 'filtered' | 'paginated' = search
    ? 'search'
    : (selectedTypes.length > 0 || selectedCategory)
    ? 'filtered'
    : 'paginated'

  const hasFilters = search || selectedTypes.length > 0 || selectedCategory

  const handleClearFilters = () => {
    setSearch('')
    setSelectedTypes([])
    setSelectedCategory('')
  }

  const handleTypeToggle = (type: string) => {
    setSearch('')
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleCategoryToggle = (cat: string) => {
    setSearch('')
    setSelectedCategory(prev => prev === cat ? '' : cat)
  }

  const filterDescription = useMemo(() => {
    const parts: string[] = []
    if (selectedCategory) {
      const label = selectedCategory === 'legendary' ? 'Legendario'
        : selectedCategory === 'mythical' ? 'Mítico'
        : GENERATION_LABELS[selectedCategory] ?? selectedCategory
      parts.push(label)
    }
    if (selectedTypes.length > 0) parts.push(selectedTypes.join(' + '))
    return parts.join(' · ')
  }, [selectedCategory, selectedTypes])

  return (
    <div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-gamer-purple text-sm mb-2 tracking-widest uppercase">
        &gt; pokedex.list()
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-6">
        Pokédex <span className="text-gamer-purple-light">completo</span>
      </motion.h1>

      {/* Búsqueda */}
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedTypes([]); setSelectedCategory('') }}
          placeholder="🔍 Buscar por nombre o número..."
          className="w-full bg-white/5 border border-gamer-purple/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gamer-purple/60 transition-colors"
        />
        {search && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
            {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Categorías */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2">Categoría</p>
        <div className="flex flex-wrap gap-2">
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

      {/* Tipos — multi-select */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2">
          Tipo <span className="normal-case text-slate-600">(puedes elegir varios)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map(type => {
            const active = selectedTypes.includes(type)
            const color = getTypeColor(type)
            return (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className="text-xs px-3 py-1 rounded-full font-mono transition-all capitalize"
                style={{
                  background: active ? `${color}55` : `${color}22`,
                  color,
                  border: `1px solid ${color}${active ? 'cc' : '44'}`,
                  boxShadow: active ? `0 0 8px ${color}44` : 'none',
                }}
              >
                {active && '✓ '}{type}
              </button>
            )
          })}
        </div>
      </div>

      {/* Info de filtros activos */}
      {hasFilters && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400 font-mono">
            {mode === 'search' && `Resultados para "${search}"`}
            {mode === 'filtered' && (
              <>
                {typesLoading ? 'Cargando...' : `${filteredIds.length} Pokémon · ${filterDescription}`}
              </>
            )}
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

      {/* Skeleton tipos cargando */}
      {typesLoading && mode === 'filtered' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {mode === 'search' && search && searchResults.length === 0 && !allNamesQuery.isLoading && (
        <p className="text-slate-500 font-mono text-sm">No hay Pokémon que coincidan con "{search}"</p>
      )}
      {mode === 'filtered' && !typesLoading && filteredIds.length === 0 && (
        <p className="text-slate-500 font-mono text-sm">Ningún Pokémon coincide con la combinación de filtros.</p>
      )}

      {/* Grid */}
      {!typesLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {mode === 'search' && searchResults.map(item => (
            <PokemonCardLoader key={item.name} nameOrId={item.name} />
          ))}
          {mode === 'filtered' && filteredIds.map(id => (
            <PokemonCardLoader key={id} nameOrId={id} />
          ))}
          {mode === 'paginated' && allCards.map(card => (
            <PokemonCard key={card.id} {...card} />
          ))}
        </div>
      )}

      {/* Cargar más */}
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
