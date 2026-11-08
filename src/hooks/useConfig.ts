import { useEffect, useState, useCallback } from "react"
import type { ProgressConfig } from "../domain/tipos"
import { DEFAULT_CONFIG } from "../domain/tipos"
import * as storage from "../data/storage"

export function useConfig() {
  const [config, setConfig] = useState<ProgressConfig>(() => {
    // Tenta carregar do localStorage, mas valida imediatamente
    const saved: ProgressConfig = storage.carregarConfig()
    // Se a config carregada for válida (mantém a ordem PEDIDO < IMPRESSAO < FINALIZACAO < ENTREGA < FINALIZADO), usa-se
    // Se inválida, cai no padrão
    if (isValidConfig(saved)) return saved
    return DEFAULT_CONFIG
  })

  useEffect(() => {
    // Salva no localStorage, mas garante que só salva config válida
    setConfig(prev => {
      if (isValidConfig(prev)) {
        storage.salvarConfig(prev)
        return prev
      }
      // Se inválida, não salva e usa padrão
      storage.salvarConfig(DEFAULT_CONFIG)
      return DEFAULT_CONFIG
    })
  }, [])

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG)
  }, [])

  return { config, setConfig, resetConfig, DEFAULT_CONFIG }
}

/**
 * Valida se a configuração mantém a ordem requerida:
 * PEDIDO < IMPRESSAO < PRODUCAO < ENTREGA < FINALIZADO
 */
function isValidConfig(cfg: ProgressConfig): boolean {
  // Todos os valores devem ser números finitos e manter a ordem rigorosa
  const { PEDIDO, IMPRESSAO, PRODUCAO, ENTREGA, FINALIZADO } = cfg
  return (
    Number.isFinite(PEDIDO) &&
    Number.isFinite(IMPRESSAO) &&
    Number.isFinite(PRODUCAO) &&
    Number.isFinite(ENTREGA) &&
    Number.isFinite(FINALIZADO) &&
    PEDIDO < IMPRESSAO &&
    IMPRESSAO < PRODUCAO &&
    PRODUCAO < ENTREGA &&
    ENTREGA < FINALIZADO
  )
}