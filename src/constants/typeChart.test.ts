import { describe, it, expect } from 'vitest'
import { calcMultiplier, analyzeTeamWeaknesses } from './typeChart'

describe('calcMultiplier', () => {
  it('returns 2 when attacking type is a weakness', () => {
    expect(calcMultiplier(['fire'], 'water')).toBe(2)
  })

  it('returns 0.5 when attacking type is resisted', () => {
    expect(calcMultiplier(['fire'], 'grass')).toBe(0.5)
  })

  it('returns 0 when attacking type is immune', () => {
    expect(calcMultiplier(['normal'], 'ghost')).toBe(0)
  })

  it('returns 4 for double weakness (dual type)', () => {
    expect(calcMultiplier(['fire', 'flying'], 'rock')).toBe(4)
  })

  it('returns 1 for neutral matchup', () => {
    expect(calcMultiplier(['water'], 'normal')).toBe(1)
  })
})

describe('analyzeTeamWeaknesses', () => {
  it('returns empty object for empty team', () => {
    expect(analyzeTeamWeaknesses([])).toEqual({})
  })

  it('counts weakness for single pokemon', () => {
    const result = analyzeTeamWeaknesses([['fire']])
    expect(result['water']).toBe(1)
    expect(result['rock']).toBe(1)
    expect(result['ground']).toBe(1)
    expect(result['grass']).toBeUndefined()
  })

  it('counts 2 when two pokemon share a weakness', () => {
    const result = analyzeTeamWeaknesses([['fire'], ['fire']])
    expect(result['water']).toBe(2)
  })
})
