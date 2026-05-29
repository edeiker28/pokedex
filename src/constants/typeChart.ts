interface TypeDefense {
  weak: string[]
  resist: string[]
  immune: string[]
}

export const TYPE_DEFENSE: Record<string, TypeDefense> = {
  normal:   { weak: ['fighting'], resist: [], immune: ['ghost'] },
  fire:     { weak: ['water', 'ground', 'rock'], resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [] },
  water:    { weak: ['electric', 'grass'], resist: ['fire', 'water', 'ice', 'steel'], immune: [] },
  grass:    { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resist: ['water', 'grass', 'electric', 'ground'], immune: [] },
  electric: { weak: ['ground'], resist: ['electric', 'flying', 'steel'], immune: [] },
  ice:      { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'], immune: [] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], resist: ['bug', 'rock', 'dark'], immune: [] },
  poison:   { weak: ['ground', 'psychic'], resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immune: [] },
  ground:   { weak: ['water', 'grass', 'ice'], resist: ['poison', 'rock'], immune: ['electric'] },
  flying:   { weak: ['electric', 'ice', 'rock'], resist: ['grass', 'fighting', 'bug'], immune: ['ground'] },
  psychic:  { weak: ['bug', 'ghost', 'dark'], resist: ['fighting', 'psychic'], immune: [] },
  bug:      { weak: ['fire', 'flying', 'rock'], resist: ['grass', 'fighting', 'ground'], immune: [] },
  rock:     { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resist: ['normal', 'fire', 'poison', 'flying'], immune: [] },
  ghost:    { weak: ['ghost', 'dark'], resist: ['poison', 'bug'], immune: ['normal', 'fighting'] },
  dragon:   { weak: ['ice', 'dragon', 'fairy'], resist: ['fire', 'water', 'grass', 'electric'], immune: [] },
  dark:     { weak: ['fighting', 'bug', 'fairy'], resist: ['ghost', 'dark'], immune: ['psychic'] },
  steel:    { weak: ['fire', 'fighting', 'ground'], resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immune: ['poison'] },
  fairy:    { weak: ['poison', 'steel'], resist: ['fighting', 'bug', 'dark'], immune: ['dragon'] },
}

export function calcMultiplier(defTypes: string[], attackingType: string): number {
  return defTypes.reduce((multiplier, defType) => {
    const chart = TYPE_DEFENSE[defType]
    if (!chart) return multiplier
    if (chart.immune.includes(attackingType)) return multiplier * 0
    if (chart.weak.includes(attackingType)) return multiplier * 2
    if (chart.resist.includes(attackingType)) return multiplier * 0.5
    return multiplier
  }, 1)
}

export function analyzeTeamWeaknesses(teamTypes: string[][]): Record<string, number> {
  const ALL_TYPES = Object.keys(TYPE_DEFENSE)
  const counts: Record<string, number> = {}

  for (const defTypes of teamTypes) {
    for (const attackingType of ALL_TYPES) {
      const multiplier = calcMultiplier(defTypes, attackingType)
      if (multiplier > 1) {
        counts[attackingType] = (counts[attackingType] ?? 0) + 1
      }
    }
  }

  return counts
}
