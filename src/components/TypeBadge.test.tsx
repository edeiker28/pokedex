import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TypeBadge from './TypeBadge'

describe('TypeBadge', () => {
  it('renders the type name capitalized', () => {
    render(<TypeBadge type="fire" />)
    expect(screen.getByText('Fire')).toBeInTheDocument()
  })

  it('applies color style from type', () => {
    const { container } = render(<TypeBadge type="water" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.style.backgroundColor).toBeTruthy()
  })

  it('renders unknown type without crashing', () => {
    render(<TypeBadge type="unknown" />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })
})
