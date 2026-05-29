import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import PokemonCard from '../components/PokemonCard'
import { getPokemons, getPokemonsByType, extractIdFromUrl, getPokemon } from '../api/pokemons'
import { ALL_TYPES, getTypeColor } from '../constants/typeColors'
import type { PokemonListItem } from '../types/pokemon'

const LIMIT = 20

interface CardData {
  id: number
  name: string
  types: string[]
  sprite: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function Pokedex() {
  const [offset, setOffset] = useState(0)
  const [allCards, setAllCards] = useState<CardData[]>([])
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [loading, setLoading] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  const listQuery = useQuery({
    queryKey: ['pokemons', offset],
    queryFn: () => getPokemons(offset, LIMIT),
    staleTime: Infinity,
    enabled: !debouncedSearch && !selectedType,
  })

  const typeQuery = useQuery({
    queryKey: ['type', selectedType],
    queryFn: () => getPokemonsByType(selectedType),
    enabled: !!selectedType && !debouncedSearch,
    staleTime: Infinity,
  })

  const searchQuery = useQuery({
    queryKey: ['pokemon-search', debouncedSearch],
    queryFn: () => getPokemon(debouncedSearch.toLowerCase().trim()),
    enabled: debouncedSearch.length > 2,
    staleTime: Infinity,
    retry: false,
  })

  useEffect(() => {
    if (!listQuery.data || debouncedSearch || selectedType) return
    setLoading(true)

    const items: PokemonListItem[] = listQuery.data.results
    Promise.all(
      items.map((item: PokemonListItem) => getPokemon(extractIdFromUrl(item.url)))
    ).then(pokemons => {
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
    }).catch(() => setLoading(false))
  }, [listQuery.data, debouncedSearch, selectedType])

  const handleLoadMore = () => setOffset(prev => prev + LIMIT)

  const handleTypeToggle = (type: string) => {
    setSelectedType(prev => prev === type ? '' : type)
    setSearch('')
  }

  let displayCards: CardData[] = []

  if (debouncedSearch.length > 2 && searchQuery.data) {
    const p = searchQuery.data as { id: number; name: string; types: Array<{ type: { name: string } }>; sprites: { front_default: string } }
    displayCards = [{
      id: p.id,
      name: p.name,
      types: p.types.map((t: { type: { name: string } }) => t.type.name),
      sprite: p.sprites.front_default,
    }]
  } else if (selectedType && typeQuery.data) {
    displayCards = (typeQuery.data as Array<{ name: string; url: string }>).slice(0, 60).map((item) => {
      const id = extractIdFromUrl(item.url)
      return {
        id,
        name: item.name,
        types: [selectedType],
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      }
    })
  } else {
    displayCards = allCards
  }

  const isListMode = !debouncedSearch && !selectedType

  return (
    <div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-gamer-purple text-sm mb-2 tracking-widest uppercase">
        &gt; pokedex.list()
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-6">
        Pokédex <span className="text-gamer-purple-light">completo</span>
      </motion.h1>

      <input
        type="text"
        value={search}
        onChange={e => { setSearch(e.target.value); setSelectedType('') }}
        placeholder="🔍 Buscar Pokémon por nombre..."
        className="w-full bg-white/5 border border-gamer-purple/30 rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:border-gamer-purple/60 transition-colors"
      />

      <div className="flex flex-wrap gap-2 mb-6">
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

      {(loading && displayCards.length === 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      )}

      {searchQuery.isError && debouncedSearch.length > 2 && (
        <p className="text-red-400 font-mono text-sm">No se encontró "{debouncedSearch}"</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayCards.map(card => (
          <PokemonCard key={card.id} {...card} />
        ))}
      </div>

      {isListMode && !loading && (
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500 font-mono mb-3">Mostrando {allCards.length} de 1025</p>
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 border border-gamer-red/50 text-red-300 rounded-xl hover:bg-gamer-red/10 transition-all font-mono text-sm"
          >
            &#9654; Cargar más
          </button>
        </div>
      )}
    </div>
  )
}
