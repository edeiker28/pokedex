import { useQuery } from '@tanstack/react-query'
import { getPokemonsByType } from '../api/pokemons'

export function usePokemonsByType(type: string) {
  return useQuery({
    queryKey: ['type', type],
    queryFn: () => getPokemonsByType(type),
    enabled: !!type,
    staleTime: Infinity,
  })
}
