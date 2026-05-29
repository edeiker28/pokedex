import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import PokemonCard from './PokemonCard'
import { useTeamStore } from '../store/teamStore'

const mockPokemon = {
  id: 25,
  name: 'pikachu',
  types: ['electric'],
  sprite: 'https://example.com/pikachu.png',
}

beforeEach(() => {
  useTeamStore.setState({ team: [] })
})

const renderCard = () =>
  render(
    <MemoryRouter>
      <PokemonCard {...mockPokemon} />
    </MemoryRouter>
  )

describe('PokemonCard', () => {
  it('renders pokemon name capitalized', () => {
    renderCard()
    expect(screen.getByText('Pikachu')).toBeInTheDocument()
  })

  it('renders pokemon number', () => {
    renderCard()
    expect(screen.getByText('#025')).toBeInTheDocument()
  })

  it('renders type badge', () => {
    renderCard()
    expect(screen.getByText('Electric')).toBeInTheDocument()
  })

  it('adds pokemon to team on button click', () => {
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: /agregar/i }))
    expect(useTeamStore.getState().team).toHaveLength(1)
    expect(useTeamStore.getState().team[0].id).toBe(25)
  })
})
