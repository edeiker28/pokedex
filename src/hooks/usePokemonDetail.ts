import { useQuery } from '@tanstack/react-query'
import { getPokemon, getPokemonSpecies, getEvolutionChain } from '../api/pokemons'
import type { Pokemon, EvolutionChain } from '../types/pokemon'

export function usePokemonDetail(id: string | number) {
  return useQuery<Pokemon>({
    queryKey: ['pokemon', id],
    queryFn: () => getPokemon(id),
    staleTime: Infinity,
  })
}

export function usePokemonEvolution(speciesUrl: string) {
  const speciesId = speciesUrl.split('/').filter(Boolean).pop()

  const speciesQuery = useQuery({
    queryKey: ['species', speciesId],
    queryFn: () => getPokemonSpecies(speciesId!),
    enabled: !!speciesId,
    staleTime: Infinity,
  })

  const evolutionChainId = speciesQuery.data?.evolution_chain?.url
    ? speciesQuery.data.evolution_chain.url.split('/').filter(Boolean).pop()
    : null

  const evolutionQuery = useQuery<EvolutionChain>({
    queryKey: ['evolution', evolutionChainId],
    queryFn: () => getEvolutionChain(Number(evolutionChainId)),
    enabled: !!evolutionChainId,
    staleTime: Infinity,
  })

  return { evolutionChain: evolutionQuery.data, loading: speciesQuery.isLoading || evolutionQuery.isLoading }
}
