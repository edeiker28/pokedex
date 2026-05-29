import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTeamStore } from '../store/teamStore'

export default function Home() {
  const teamCount = useTeamStore(s => s.team.length)

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-mono text-gamer-purple text-sm tracking-widest uppercase mb-4"
      >
        &gt; pokedex.init()
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-5xl md:text-7xl font-bold mb-4"
      >
        <span className="text-white">Poké</span>
        <span className="text-gamer-purple" style={{ textShadow: '0 0 30px rgba(124,58,237,0.6)' }}>Dex</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-slate-400 text-lg mb-10 max-w-md"
      >
        Explora los {'>'}1000 Pokémon de todas las generaciones. Arma tu equipo y analiza coberturas de tipo.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link
          to="/pokedex"
          className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
        >
          → Explorar Pokédex
        </Link>
        <Link
          to="/team"
          className="px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105 border border-gamer-red/50 text-red-300 hover:bg-gamer-red/10"
        >
          ⚔ Team Builder {teamCount > 0 && `(${teamCount}/6)`}
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 font-mono text-xs text-slate-600"
      >
        Powered by <a href="https://pokeapi.co" target="_blank" rel="noreferrer" className="text-gamer-purple hover:underline">PokéAPI</a>
      </motion.p>
    </div>
  )
}
