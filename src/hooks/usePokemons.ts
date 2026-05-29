import { useQuery } from '@tanstack/react-query'
import { getPokemons, getPokemon } from '../api/pokemons'
import type { Pokemon } from '../types/pokemon'

const LIMIT = 20

export function usePokemons(offset: number) {
  return useQuery({
    queryKey: ['pokemons', offset],
    queryFn: () => getPokemons(offset, LIMIT),
    staleTime: Infinity,
  })
}

export function usePokemonSearch(name: string) {
  return useQuery<Pokemon>({
    queryKey: ['pokemon-search', name],
    queryFn: () => getPokemon(name.toLowerCase().trim()),
    enabled: name.length > 2,
    staleTime: Infinity,
    retry: false,
  })
}
