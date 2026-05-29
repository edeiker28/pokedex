import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPokemon } from '../api/pokemons'
import type { EvolutionChainLink } from '../types/pokemon'

interface Props {
  chain: EvolutionChainLink
}

function flattenChain(link: EvolutionChainLink): string[] {
  const names: string[] = [link.species.name]
  if (link.evolves_to.length > 0) {
    names.push(...flattenChain(link.evolves_to[0]))
  }
  return names
}

function EvolutionNode({ name }: { name: string }) {
  const { data } = useQuery({
    queryKey: ['pokemon', name],
    queryFn: () => getPokemon(name),
    staleTime: Infinity,
  })

  const sprite = data?.sprites?.front_default
  const id = data?.id
  const label = name.charAt(0).toUpperCase() + name.slice(1)

  return (
    <Link
      to={`/pokedex/${id ?? name}`}
      className="flex flex-col items-center gap-1 hover:scale-105 transition-transform"
    >
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-gamer-purple/30">
        {sprite && <img src={sprite} alt={name} className="w-14 h-14 object-contain" />}
      </div>
      <span className="text-xs text-slate-300 font-mono">{label}</span>
    </Link>
  )
}

export default function EvolutionChain({ chain }: Props) {
  const names = flattenChain(chain)

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {names.map((name, i) => (
        <div key={name} className="flex items-center gap-3">
          <EvolutionNode name={name} />
          {i < names.length - 1 && (
            <span className="text-gamer-purple text-lg">→</span>
          )}
        </div>
      ))}
    </div>
  )
}
