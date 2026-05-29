import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-64 text-center px-4">
          <p className="font-mono text-gamer-red text-sm mb-2">&gt; error.caught()</p>
          <p className="text-slate-400 mb-4">Algo salió mal cargando esta página.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-gamer-purple-light font-mono text-sm hover:underline"
          >
            → Intentar de nuevo
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
