import { describe, it, expect, beforeEach } from 'vitest'
import { useTeamStore } from './teamStore'

const mockPokemon = (id: number) => ({
  id,
  name: `pokemon-${id}`,
  types: ['fire'],
  sprite: `https://example.com/${id}.png`,
})

beforeEach(() => {
  useTeamStore.setState({ team: [] })
})

describe('teamStore', () => {
  it('starts with empty team', () => {
    expect(useTeamStore.getState().team).toHaveLength(0)
  })

  it('adds a pokemon to the team', () => {
    useTeamStore.getState().addToTeam(mockPokemon(1))
    expect(useTeamStore.getState().team).toHaveLength(1)
    expect(useTeamStore.getState().team[0].id).toBe(1)
  })

  it('does not add duplicate pokemon', () => {
    useTeamStore.getState().addToTeam(mockPokemon(1))
    useTeamStore.getState().addToTeam(mockPokemon(1))
    expect(useTeamStore.getState().team).toHaveLength(1)
  })

  it('does not add more than 6 pokemon', () => {
    for (let i = 1; i <= 7; i++) {
      useTeamStore.getState().addToTeam(mockPokemon(i))
    }
    expect(useTeamStore.getState().team).toHaveLength(6)
  })

  it('removes a pokemon by id', () => {
    useTeamStore.getState().addToTeam(mockPokemon(1))
    useTeamStore.getState().addToTeam(mockPokemon(2))
    useTeamStore.getState().removeFromTeam(1)
    expect(useTeamStore.getState().team).toHaveLength(1)
    expect(useTeamStore.getState().team[0].id).toBe(2)
  })

  it('clears the team', () => {
    useTeamStore.getState().addToTeam(mockPokemon(1))
    useTeamStore.getState().addToTeam(mockPokemon(2))
    useTeamStore.getState().clearTeam()
    expect(useTeamStore.getState().team).toHaveLength(0)
  })
})
