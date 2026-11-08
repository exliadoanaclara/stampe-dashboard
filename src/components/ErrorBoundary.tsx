import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"

interface Props { children: ReactNode }
interface State { erro: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null }

  static getDerivedStateFromError(erro: Error): State {
    return { erro }
  }

  componentDidCatch(erro: Error, info: ErrorInfo): void {
    console.error("STAMPE — erro de render:", erro, info.componentStack)
  }

  render() {
    if (this.state.erro) {
      return (
        <div className="min-h-screen grid place-items-center p-6" style={{ background: "#fafafa" }}>
          <div className="max-w-[520px] w-full bg-white border border-red-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="text-4xl mb-3">⚠️</div>
            <h1 className="text-xl font-black text-zinc-900">Ocorreu um erro no STAMPE</h1>
            <p className="text-sm text-zinc-600 mt-2">
              Os dados não foram apagados. Recarregue a página; se o erro persistir, exporte um backup
              pelo navegador (stampe_pedidos_v3) e informe a equipe técnica.
            </p>
            <pre className="mt-3 text-left text-[11px] bg-zinc-50 border border-zinc-200 rounded-lg p-3 overflow-auto max-h-[160px]">
              {String(this.state.erro)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-zinc-900 text-white rounded-full py-3 font-black text-sm"
            >
              Recarregar sistema
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
