export interface PokemonListItem {
  name: string
  url: string
}

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: PokemonListItem[]
}

export interface PokemonType {
  slot: number
  type: { name: string; url: string }
}

export interface PokemonStat {
  base_stat: number
  stat: { name: string }
}

export interface PokemonAbility {
  ability: { name: string }
  is_hidden: boolean
}

export interface PokemonMoveVersionGroupDetail {
  level_learned_at: number
  move_learn_method: { name: string }
  version_group: { name: string }
}

export interface PokemonMove {
  move: { name: string }
  version_group_details: PokemonMoveVersionGroupDetail[]
}

export interface PokemonSprites {
  front_default: string
  front_shiny: string
  other: {
    'official-artwork': {
      front_default: string
      front_shiny: string
    }
  }
}

export interface Pokemon {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  sprites: PokemonSprites
  types: PokemonType[]
  stats: PokemonStat[]
  abilities: PokemonAbility[]
  moves: PokemonMove[]
  species: { url: string }
}

export interface EvolutionChainLink {
  species: { name: string; url: string }
  evolves_to: EvolutionChainLink[]
}

export interface EvolutionChain {
  id: number
  chain: EvolutionChainLink
}

export interface TeamPokemon {
  id: number
  name: string
  types: string[]
  sprite: string
}
