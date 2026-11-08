import type { Etapa, ProgressConfig } from "./tipos"

export function getProgresso(etapa: Etapa, cfg: ProgressConfig): number {
  return cfg[etapa] ?? 0
}
