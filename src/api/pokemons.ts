const BASE = import.meta.env.VITE_POKEAPI_BASE as string

export async function getPokemons(offset: number, limit: number) {
  const res = await fetch(`${BASE}/pokemon?offset=${offset}&limit=${limit}`)
  if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`)
  return res.json()
}

export async function getPokemon(idOrName: string | number) {
  const res = await fetch(`${BASE}/pokemon/${idOrName}`)
  if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`)
  return res.json()
}

export async function getPokemonSpecies(idOrName: string | number) {
  const res = await fetch(`${BASE}/pokemon-species/${idOrName}`)
  if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`)
  return res.json()
}

export async function getEvolutionChain(id: number) {
  const res = await fetch(`${BASE}/evolution-chain/${id}`)
  if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`)
  return res.json()
}

export async function getPokemonsByType(type: string) {
  const res = await fetch(`${BASE}/type/${type}`)
  if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`)
  const data = await res.json()
  return data.pokemon.map((p: { pokemon: { name: string; url: string } }) => p.pokemon) as Array<{ name: string; url: string }>
}

export function extractIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean)
  return parseInt(parts[parts.length - 1], 10)
}
