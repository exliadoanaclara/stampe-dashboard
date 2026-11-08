import { describe, expect, it } from "vitest"
import { getProgresso } from "./progresso"
import { DEFAULT_CONFIG } from "./tipos"

describe("getProgresso", () => {
  it("usa os percentuais padrão", () => {
    expect(getProgresso("PEDIDO", DEFAULT_CONFIG)).toBe(0)
    expect(getProgresso("IMPRESSAO", DEFAULT_CONFIG)).toBe(50)
    expect(getProgresso("PRODUCAO", DEFAULT_CONFIG)).toBe(75)
    expect(getProgresso("ENTREGA", DEFAULT_CONFIG)).toBe(90)
    expect(getProgresso("FINALIZADO", DEFAULT_CONFIG)).toBe(100)
  })

  it("respeta a configuração do usuário (PEND-012)", () => {
    const custom = { PEDIDO: 10, ARTES: 20, IMPRESSAO: 40, PRODUCAO: 80, ENTREGA: 90, FINALIZADO: 100 }
    expect(getProgresso("PEDIDO", custom)).toBe(10)
    expect(getProgresso("ARTES", custom)).toBe(20)
    expect(getProgresso("IMPRESSAO", custom)).toBe(40)
    expect(getProgresso("PRODUCAO", custom)).toBe(80)
    expect(getProgresso("ENTREGA", custom)).toBe(90)
  })

  it("é sempre crescente no fluxo padrão", () => {
    const ordem = ["PEDIDO", "ARTES", "IMPRESSAO", "PRODUCAO", "ENTREGA", "FINALIZADO"] as const
    for (let i = 1; i < ordem.length; i++) {
      expect(getProgresso(ordem[i], DEFAULT_CONFIG)).toBeGreaterThanOrEqual(getProgresso(ordem[i - 1], DEFAULT_CONFIG))
    }
  })

  it("nunca retorna NaN", () => {
    const incompleto = { PEDIDO: 0, ARTES: 0 } as unknown as typeof DEFAULT_CONFIG
    expect(Number.isFinite(getProgresso("IMPRESSAO", incompleto))).toBe(true)
  })
})