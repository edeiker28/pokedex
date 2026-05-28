# PokéDex + Team Builder — Diseño

**Fecha:** 2026-05-28  
**Estado:** Aprobado

---

## Resumen

SPA con React que consume la PokeAPI pública. Incluye un Pokédex completo con los ~1025 Pokémon de todas las generaciones, y un Team Builder para armar equipos de 6 con análisis de cobertura de tipos. Estética gamer oscura del portafolio (negro `#09090f`, morado `#7c3aed`, rojo `#dc2626`) combinada con colores dinámicos por tipo de Pokémon.

El proyecto va a `C:\proyectos\pokedex\`, tendrá su propio repositorio en GitHub y se enlazará desde el portafolio personal.

---

## Stack

| Herramienta | Uso |
|-------------|-----|
| React 19 + Vite | Base de la SPA |
| TypeScript | Tipado de datos complejos de PokeAPI |
| TailwindCSS | Estilos con colores dinámicos por tipo |
| TanStack Query | Caché de llamadas a PokeAPI, loading/error automático |
| Zustand | Estado global del equipo, persiste en localStorage |
| React Router DOM | Navegación entre páginas |
| Framer Motion | Animaciones de entrada de cards y transiciones |
| ESLint + Prettier | Calidad y formato de código |

---

## Rutas

```
/               → Home — landing con acceso a Pokédex y Team Builder
/pokedex        → Lista paginada de Pokémon con búsqueda y filtros
/pokedex/:id    → Detalle: stats, tipos, evoluciones, movimientos, habilidades
/team           → Team Builder: equipo de 6 + análisis de cobertura
```

---

## Arquitectura

### Estructura de carpetas

```
src/
├── components/          # UI reutilizable
│   ├── PokemonCard/     # Card de la lista (grid)
│   ├── TypeBadge/       # Badge de tipo coloreado
│   ├── StatBar/         # Barra de stat con color y glow
│   ├── EvolutionChain/  # Cadena de evolución
│   └── Navbar/          # Barra de navegación con contador de equipo
├── pages/
│   ├── Home.tsx
│   ├── Pokedex.tsx
│   ├── PokemonDetail.tsx
│   └── TeamBuilder.tsx
├── hooks/
│   ├── usePokemons.ts       # Lista paginada — TanStack Query
│   └── usePokemonDetail.ts  # Detalle completo — TanStack Query
├── store/
│   └── teamStore.ts         # Zustand: equipo[], addToTeam, removeFromTeam
├── api/
│   ├── pokemons.ts          # getPokemons(offset, limit), getPokemon(id)
│   └── types.ts             # getTypeWeaknesses(types[])
├── types/
│   └── pokemon.ts           # Interfaces TypeScript: Pokemon, Stat, Type, Evolution
├── constants/
│   ├── typeColors.ts        # Map tipo → color hex (18 tipos)
│   └── typeChart.ts         # Tabla de efectividades para análisis de equipo
└── router.tsx
```

### Flujo de datos

```
PokeAPI → TanStack Query (caché) → hooks → componentes
Zustand store → teamStore → TeamBuilder + Navbar (contador)
typeChart.ts → análisis de debilidades del equipo
```

---

## Páginas y componentes

### Home (`/`)
- Hero con título animado (Framer Motion)
- Dos botones de acceso: `→ Pokédex` y `→ Team Builder`
- Contador del equipo actual si hay Pokémon guardados

### Pokédex (`/pokedex`)
- Grid responsivo: 2 cols mobile, 3 tablet, 4-5 desktop
- Paginación: carga de 20 en 20 con botón "Cargar más" (no infinite scroll — más controlado)
- Búsqueda por nombre: debounce de 300ms, llama a `getPokemon(name)` directamente
- Filtro por tipo: chips de los 18 tipos, color del tipo, selección múltiple
- Cada `PokemonCard` muestra: número, sprite oficial, nombre, tipo(s)
- Card coloreada con el color principal del tipo (border + glow + fondo sutil)
- Botón `+ Agregar al equipo` en hover de la card

### Detalle del Pokémon (`/pokedex/:id`)
- Cabecera: sprite grande con glow del color de tipo, número, nombre, tipos
- Stats: 6 barras (`StatBar`) con gradiente de color por stat y valor numérico
- Cadena de evolución: sprites clickables que navegan al detalle de cada evolución
- Movimientos: tabla simple con nombre y tipo (primeros 10)
- Habilidades: lista con nombre
- Botón `+ Agregar al equipo` (deshabilitado si ya está en el equipo o equipo lleno)

### Team Builder (`/team`)
- 6 slots: ocupados muestran sprite + nombre + tipo, vacíos muestran `+` con borde morado punteado
- Botón `✕` en cada slot para quitar del equipo
- Buscador para agregar Pokémon directamente desde esta página
- Sección de análisis: debilidades del equipo (tipo + multiplicador) y coberturas confirmadas
- El análisis se recalcula en tiempo real al cambiar el equipo

### Navbar
- Logo `⚡ PokéDex` en monospace morado
- Links: Pokédex | Team Builder
- Badge rojo con contador `Equipo (N/6)` — se actualiza con Zustand

---

## Estado global (Zustand)

```ts
// store/teamStore.ts
interface TeamStore {
  team: Pokemon[]            // máximo 6
  addToTeam: (p: Pokemon) => void
  removeFromTeam: (id: number) => void
  clearTeam: () => void
}
// persist middleware → localStorage key: 'pokedex-team'
```

---

## Colores por tipo

Los 18 tipos de Pokémon tienen colores oficiales usados en los juegos. Se aplican a: border de card, badge de tipo, glow del sprite, barra de stats activa.

```ts
// constants/typeColors.ts
const TYPE_COLORS = {
  fire:     '#ee8130',
  water:    '#6390f0',
  grass:    '#7ac74c',
  electric: '#f7d02c',
  ice:      '#96d9d6',
  fighting: '#c22e28',
  poison:   '#a33ea1',
  ground:   '#e2bf65',
  flying:   '#a98ff3',
  psychic:  '#f95587',
  bug:      '#a6b91a',
  rock:     '#b6a136',
  ghost:    '#735797',
  dragon:   '#6f35fc',
  dark:     '#705746',
  steel:    '#b7b7ce',
  fairy:    '#d685ad',
  normal:   '#a8a77a',
}
```

---

## Análisis de tipos (Team Builder)

- `constants/typeChart.ts` — tabla de efectividades completa (18×18)
- Para cada Pokémon del equipo se obtienen sus tipos defensivos
- Se acumulan los multiplicadores de daño recibido por tipo atacante
- Se muestran: debilidades (×2, ×4), resistencias (×0.5, ×0.25), inmunidades (×0)

---

## Fuera de scope (esta versión)

- Backend propio — solo consumo de PokeAPI
- Autenticación o cuentas de usuario
- Compartir equipo por URL — se agrega después del deploy
- Batalla simulada entre Pokémon

---

## Consideraciones técnicas

- **Rate limiting:** PokeAPI es pública y generosa, pero TanStack Query con `staleTime: Infinity` evita refetches innecesarios
- **Sprites:** se usan los sprites oficiales de PokeAPI (`sprites.front_default`, `sprites.other['official-artwork'].front_default`)
- **TypeScript estricto:** interfaces definidas para `Pokemon`, `PokemonStat`, `PokemonType`, `EvolutionChain`
- **No hay backend:** todo el estado persiste en localStorage via Zustand persist

---

## Deploy futuro

- Vercel (free tier) — frontend estático, sin backend
- Variable de entorno: `VITE_POKEAPI_BASE=https://pokeapi.co/api/v2`
