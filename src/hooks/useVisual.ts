import { useEffect, useState, useCallback } from "react"
import type { VisualConfig } from "../domain/tipos"
import { DEFAULT_VISUAL } from "../domain/tipos"
import * as storage from "../data/storage"

export function useVisual() {
  const [visual, setVisual] = useState<VisualConfig>(() => storage.carregarVisual())

  useEffect(() => {
    const r = storage.salvarVisual(visual)
    if (!r.ok) console.error("Falha ao salvar visual:", r.erro)
  }, [visual])

  const resetVisual = useCallback(() => {
    setVisual(DEFAULT_VISUAL)
  }, [])

  return { visual, setVisual, resetVisual, DEFAULT_VISUAL }
}