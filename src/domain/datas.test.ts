import { describe, expect, it } from "vitest"
import { diaLocal, fmtData, fmtDataHora, fmtNumero, hojeISO } from "./datas"

describe("diaLocal", () => {
  it("usa os componentes LOCAIS da data, nunca o dia em UTC", () => {
    expect(diaLocal(new Date(2026, 8, 26, 23, 59, 59))).toBe("2026-09-26")
    expect(diaLocal(new Date(2026, 0, 1, 0, 0, 0))).toBe("2026-01-01")
    expect(diaLocal(new Date(2026, 11, 31, 23, 59, 59))).toBe("2026-12-31")
  })

  it("devolve AAAA-MM-DD com zero-pad, sem T nem Z", () => {
    const d = diaLocal(new Date(2026, 2, 5, 13, 45))
    expect(d).toBe("2026-03-05")
    expect(d).not.toContain("T")
    expect(d).not.toContain("Z")
  })

  it("nao pula de dia ao cruzar a meia-noite local", () => {
    expect(diaLocal(new Date(2026, 8, 26, 0, 0, 0))).toBe("2026-09-26")
    expect(diaLocal(new Date(2026, 8, 25, 23, 59, 59))).toBe("2026-09-25")
  })
})

describe("hojeISO", () => {
  it("é exatamente diaLocal de agora (fuso único do sistema)", () => {
    expect(hojeISO()).toBe(diaLocal(new Date()))
  })

  it("sempre tem formato AAAA-MM-DD", () => {
    expect(hojeISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe("fmtNumero", () => {
  it("preenche com 3 dígitos", () => {
    expect(fmtNumero(1)).toBe("001")
    expect(fmtNumero(9)).toBe("009")
    expect(fmtNumero(42)).toBe("042")
    expect(fmtNumero(100)).toBe("100")
  })

  it("nao quebra com numeros grandes", () => {
    expect(fmtNumero(1234)).toBe("1234")
  })
})

describe("fmtData", () => {
  it("formata AAAA-MM-DD no padrão pt-BR", () => {
    expect(fmtData("2026-09-26")).toBe(new Date("2026-09-26T12:00:00").toLocaleDateString("pt-BR"))
  })

  it("devolve o valor original quando a data é inválida", () => {
    expect(fmtData("abc")).toBe("abc")
    expect(fmtData("31/02/2026")).toBe("31/02/2026")
  })

  it("devolve hífen quando vazio", () => {
    expect(fmtData("")).toBe("-")
  })
})

describe("fmtDataHora", () => {
  it("nunca lança exceção, mesmo com lixo", () => {
    expect(() => fmtDataHora("não é data")).not.toThrow()
    expect(typeof fmtDataHora("não é data")).toBe("string")
  })

  it("formata um ISO válido", () => {
    expect(fmtDataHora("2026-09-26T12:00:00.000Z")).toContain("26")
  })
})
