import { useState, useCallback, useEffect } from "react"

export function useToast() {
  const [toast, setToast] = useState<string | null>(null)

  const notify = useCallback((msg: string) => setToast(msg), [])

  // setState síncrono dentro de efeito é proibido pelo lint (set-state-in-effect);
  // o aviso é agendado para depois do commit do efeito.
  const avisar = useCallback((msg: string) => { queueMicrotask(() => setToast(msg)) }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  return { toast, setToast, notify, avisar }
}