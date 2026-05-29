import { createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import Pokedex from './pages/Pokedex'
import PokemonDetail from './pages/PokemonDetail'
import TeamBuilder from './pages/TeamBuilder'
import Layout from './components/Layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'pokedex', element: <Pokedex /> },
      { path: 'pokedex/:id', element: <PokemonDetail /> },
      { path: 'team', element: <TeamBuilder /> },
    ],
  },
])
