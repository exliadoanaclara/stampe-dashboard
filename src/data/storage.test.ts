// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"
import { criarPedidoBase } from "../test/factories"
import { DEFAULT_CONFIG, DEFAULT_VISUAL } from "../domain/tipos"
import { diaLocal } from "../domain/datas"
import * as storage from "./storage"

beforeEach(() => {
  localStorage.clear()
  storage.pegarAvisoCarga()
  vi.restoreAllMocks()
})

describe("carregarPedidos — carga", () => {
  it("devolve lista vazia quando nunca houve dados", () => {
    expect(storage.carregarPedidos()).toEqual([])
    expect(storage.pegarAvisoCarga()).toBeNull()
  })

  it("carrega a lista quando está tudo válido", () => {
    const p = criarPedidoBase()
    localStorage.setItem(storage.LS_PEDIDOS, JSON.stringify([p]))
    expect(storage.carregarPedidos()).toHaveLength(1)
    expect(storage.carregarPedidos()[0].id).toBe("p1")
    expect(storage.pegarAvisoCarga()).toBeNull()
  })
})

describe("carregarPedidos — dados corrompidos (PROBLEMA-010)", () => {
  it("JSON inválido NÃO é sobrescrito: o bruto vai para o backup", () => {
    const bruto = "{isso nao é json"
    localStorage.setItem(storage.LS_PEDIDOS, bruto)

    expect(storage.carregarPedidos()).toEqual([])

    expect(localStorage.getItem(storage.LS_PEDIDOS_BACKUP)).toBe(bruto)
    expect(storage.pegarAvisoCarga()).toMatch(/backup/i)
  })

  it("conteúdo que não é array também é preservado", () => {
    const bruto = JSON.stringify({ cliente: "X" })
    localStorage.setItem(storage.LS_PEDIDOS, bruto)

    expect(storage.carregarPedidos()).toEqual([])
    expect(localStorage.getItem(storage.LS_PEDIDOS_BACKUP)).toBe(bruto)
  })

  it("registros inválidos são removidos, mas os válidos seguem e o bruto fica no backup", () => {
    const valido = criarPedidoBase({ id: "ok", numero: 1 })
    const invalido = { id: "quebrado" }
    const bruto = JSON.stringify([valido, invalido])
    localStorage.setItem(storage.LS_PEDIDOS, bruto)

    const lista = storage.carregarPedidos()

    expect(lista).toHaveLength(1)
    expect(lista[0].id).toBe("ok")
    expect(localStorage.getItem(storage.LS_PEDIDOS_BACKUP)).toBe(bruto)
    expect(storage.pegarAvisoCarga()).toMatch(/invalido/i)
  })

  it("o aviso é consumido na leitura (não repete para sempre)", () => {
    localStorage.setItem(storage.LS_PEDIDOS, "lixo")
    storage.carregarPedidos()
    expect(storage.pegarAvisoCarga()).not.toBeNull()
    expect(storage.pegarAvisoCarga()).toBeNull()
  })
})

describe("salvarPedidos — quota do navegador (PROBLEMA-001/013)", () => {
  it("grava normalmente quando há espaço", () => {
    const r = storage.salvarPedidos([criarPedidoBase()])
    expect(r.ok).toBe(true)
    expect(localStorage.getItem(storage.LS_PEDIDOS)).toContain("p1")
  })

  it("retorna erro claro quando o navegador está sem espaço", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError")
    })

    const r = storage.salvarPedidos([criarPedidoBase()])

    expect(r.ok).toBe(false)
    expect(r.erro).toMatch(/NAO foi salva/i)
    expect(r.erro).toMatch(/backup/i)
  })
})

describe("usuário e configuração", () => {
  it("usuário salvo é restaurado", () => {
    localStorage.setItem(storage.LS_USER, JSON.stringify({ id: "tales", nome: "TALES", roles: ["IMPRESSAO"] }))
    expect(storage.carregarUser()).toEqual({ id: "tales", nome: "TALES", roles: ["IMPRESSAO"] })
  })

  it("usuário inválido cai no padrão em vez de quebrar", () => {
    localStorage.setItem(storage.LS_USER, "{quebrado")
    expect(storage.carregarUser()).toEqual({ id: "italo", nome: "ITALO", roles: ["PEDIDO"] })

    localStorage.setItem(storage.LS_USER, JSON.stringify({ nome: 123, roles: ["ADMIN"] }))
    expect(storage.carregarUser()).toEqual({ id: "italo", nome: "ITALO", roles: ["PEDIDO"] })
  })

  it("config parcial é completada com os padrões", () => {
    localStorage.setItem(storage.LS_CONFIG, JSON.stringify({ IMPRESSAO: 30 }))
    expect(storage.carregarConfig()).toEqual({ ...DEFAULT_CONFIG, IMPRESSAO: 30 })
  })

  it("config ausente devolve o padrão", () => {
    expect(storage.carregarConfig()).toEqual(DEFAULT_CONFIG)
  })

  it("config corrompida devolve o padrão", () => {
    localStorage.setItem(storage.LS_CONFIG, "não é json")
    expect(storage.carregarConfig()).toEqual(DEFAULT_CONFIG)
  })
})

describe("numeração — calcularSeqInicial", () => {
  it("primeiro uso do dia começa em 1", () => {
    expect(storage.calcularSeqInicial()).toBe(1)
  })

  it("continua depois do último número do dia", () => {
    const lista = [
      criarPedidoBase({ id: "a", numero: 4, dataCriacao: new Date().toISOString() }),
      criarPedidoBase({ id: "b", numero: 6, dataCriacao: new Date().toISOString() }),
    ]
    localStorage.setItem(storage.LS_PEDIDOS, JSON.stringify(lista))
    localStorage.setItem(storage.LS_DIA, diaLocal())
    localStorage.setItem(storage.LS_SEQ, "6")

    expect(storage.calcularSeqInicial()).toBe(7)
  })

  it("ignora números de dias anteriores ao reiniciar a sequência", () => {
    const deOntem = criarPedidoBase({ id: "a", numero: 30, dataCriacao: "2020-01-01T12:00:00.000Z" })
    localStorage.setItem(storage.LS_PEDIDOS, JSON.stringify([deOntem]))
    localStorage.setItem(storage.LS_DIA, "2019-12-31")
    localStorage.setItem(storage.LS_SEQ, "99")

    expect(storage.calcularSeqInicial()).toBe(1)
  })
})

describe("backup", () => {
  it("monta o envelope de backup com versão, data e dados", () => {
    const b = storage.montarBackup([criarPedidoBase()], DEFAULT_CONFIG, DEFAULT_VISUAL)

    expect(b.versao).toBe(1)
    expect(b.exportadoEm).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(b.pedidos).toHaveLength(1)
    expect(b.visual).toEqual(DEFAULT_VISUAL)
  })
})
