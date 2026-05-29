import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TeamPokemon } from '../types/pokemon'

interface TeamStore {
  team: TeamPokemon[]
  addToTeam: (pokemon: TeamPokemon) => void
  removeFromTeam: (id: number) => void
  clearTeam: () => void
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      team: [],
      addToTeam: (pokemon) => {
        const { team } = get()
        if (team.length >= 6) return
        if (team.some(p => p.id === pokemon.id)) return
        set({ team: [...team, pokemon] })
      },
      removeFromTeam: (id) =>
        set({ team: get().team.filter(p => p.id !== id) }),
      clearTeam: () => set({ team: [] }),
    }),
    { name: 'pokedex-team' }
  )
)
