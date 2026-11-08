import { describe, expect, it } from "vitest"
import { criarPedidoBase } from "../test/factories"
import {
  ETAPA_ANTERIOR,
  ehPedidoValido,
  maxNumeroDoDia,
  proximoNumero,
  semArte,
  sequenciaDoDia,
} from "./regras"

const HOJE = "2026-09-26"
const ONTEM = "2026-09-25"

describe("ETAPA_ANTERIOR", () => {
  it("cadeia completa do fluxo", () => {
    expect(ETAPA_ANTERIOR.PEDIDO).toBeNull()
    expect(ETAPA_ANTERIOR.ARTES).toBe("PEDIDO")
    expect(ETAPA_ANTERIOR.IMPRESSAO).toBe("ARTES")
    expect(ETAPA_ANTERIOR.PRODUCAO).toBe("IMPRESSAO")
    expect(ETAPA_ANTERIOR.COSTURA).toBe("PRODUCAO")
    expect(ETAPA_ANTERIOR.ENTREGA).toBe("COSTURA")
    expect(ETAPA_ANTERIOR.FINALIZADO).toBe("ENTREGA")
  })
})

describe("semArte", () => {
  it("detecta pedido sem arte", () => {
    expect(semArte(criarPedidoBase({ arteUrls: [] }))).toBe(true)
    expect(semArte(criarPedidoBase({ arteUrls: [] }))).toBe(true)
    expect(semArte(criarPedidoBase({ arteUrls: ["data:image/png;base64,abc"] }))).toBe(false)
  })
})

describe("ehPedidoValido", () => {
  it("aceita um pedido montado pela fábrica", () => {
    expect(ehPedidoValido(criarPedidoBase())).toBe(true)
  })

  it("rejeita null, string e objeto vazio", () => {
    expect(ehPedidoValido(null)).toBe(false)
    expect(ehPedidoValido("pedido")).toBe(false)
    expect(ehPedidoValido({})).toBe(false)
    expect(ehPedidoValido([])).toBe(false)
  })

  it("rejeita etapa desconhecida", () => {
    expect(ehPedidoValido(criarPedidoBase({ etapa: "DESCONHECIDO" as never }))).toBe(false)
  })

  it("rejeita numero não numérico ou id vazio", () => {
    expect(ehPedidoValido(criarPedidoBase({ numero: Number.NaN }))).toBe(false)
    expect(ehPedidoValido(criarPedidoBase({ id: "" }))).toBe(false)
  })

  it("rejeita quando os arrays obrigatórios faltam", () => {
    const p = criarPedidoBase()
    const semHistorico = { ...p } as Record<string, unknown>
    delete semHistorico.historico
    expect(ehPedidoValido(semHistorico)).toBe(false)
    expect(ehPedidoValido({ ...p, infosImpressao: "nao" })).toBe(false)
  })

  it("rejeita cliente/servico não-string", () => {
    expect(ehPedidoValido({ ...criarPedidoBase(), cliente: 123 })).toBe(false)
  })
})

describe("maxNumeroDoDia", () => {
  it("ignora pedidos de outros dias", () => {
    const lista = [
      criarPedidoBase({ id: "a", numero: 9, dataCriacao: "2026-09-25T12:00:00.000Z" }),
      criarPedidoBase({ id: "b", numero: 3, dataCriacao: "2026-09-26T12:00:00.000Z" }),
      criarPedidoBase({ id: "c", numero: 7, dataCriacao: "2026-09-26T12:00:00.000Z" }),
    ]
    expect(maxNumeroDoDia(lista, HOJE)).toBe(7)
    expect(maxNumeroDoDia(lista, ONTEM)).toBe(9)
    expect(maxNumeroDoDia([], HOJE)).toBe(0)
  })

  it("considera tambem pedidos cancelados (o numero ja foi usado)", () => {
    const lista = [criarPedidoBase({ id: "a", numero: 5, canceladoEm: "2026-09-26T12:00:00.000Z", dataCriacao: "2026-09-26T12:00:00.000Z" })]
    expect(maxNumeroDoDia(lista, HOJE)).toBe(5)
  })
})

describe("sequenciaDoDia", () => {
  it("novo dia reinicia a sequencia a partir do maximo do dia", () => {
    const lista = [criarPedidoBase({ id: "a", numero: 12, dataCriacao: "2026-09-26T12:00:00.000Z" })]
    expect(sequenciaDoDia(lista, HOJE, ONTEM, 40)).toBe(13)
  })

  it("mesmo dia preserva a sequencia armazenada", () => {
    const lista = [criarPedidoBase({ id: "a", numero: 3, dataCriacao: "2026-09-26T12:00:00.000Z" })]
    expect(sequenciaDoDia(lista, HOJE, HOJE, 5)).toBe(5)
  })

  it("nunca devolve sequencia menor que 1", () => {
    expect(sequenciaDoDia([], HOJE, HOJE, 0)).toBe(1)
    expect(sequenciaDoDia([], HOJE, null, 0)).toBe(1)
  })

  it("numeros duplicados entre dias diferentes são aceitos", () => {
    const ontem = [criarPedidoBase({ id: "a", numero: 1, dataCriacao: "2026-09-25T12:00:00.000Z" })]
    expect(sequenciaDoDia(ontem, HOJE, ONTEM, 1)).toBe(1)
  })
})

describe("proximoNumero", () => {
  it("é o maior entre a sequencia atual e max+1", () => {
    const lista = [criarPedidoBase({ id: "a", numero: 4, dataCriacao: "2026-09-26T12:00:00.000Z" })]
    expect(proximoNumero(lista, 4, HOJE)).toBe(5)
    expect(proximoNumero(lista, 9, HOJE)).toBe(9)
    expect(proximoNumero([], 1, HOJE)).toBe(1)
  })
})
