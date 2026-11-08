import { describe, expect, it } from "vitest"
import type { Role } from "./tipos"
import { criarPedidoBase } from "../test/factories"
import {
  canEditProducao,
  canEditImpressao,
  canEditResumo,
  canEnviarParaEntrega,
  canEnviarParaProducao,
  canEnviarParaImpressao,
  canFinalizar,
  podeCancelar,
  podeVoltarEtapa,
} from "./permissoes"

const EM_PEDIDO = criarPedidoBase({ etapa: "PEDIDO" })
const EM_ARTES = criarPedidoBase({ etapa: "ARTES" })
const EM_IMPRESSAO = criarPedidoBase({ etapa: "IMPRESSAO" })
const EM_PRODUCAO = criarPedidoBase({ etapa: "PRODUCAO" })
const FINALIZADO = criarPedidoBase({ etapa: "FINALIZADO" })
const CANCELADO = criarPedidoBase({ etapa: "PEDIDO", canceladoEm: "2026-09-26T12:00:00.000Z" })

const PEDIDO: Role[] = ["PEDIDO"]
const ARTES: Role[] = ["ARTES"]
const ADMIN: Role[] = ["ADMIN"]
const IMPRESSAO: Role[] = ["IMPRESSAO"]
const PRODUCAO: Role[] = ["PRODUCAO"]

describe("edicao do resumo", () => {
  it("só Cadastro e Admin editam, e só enquanto está em PEDIDO", () => {
    expect(canEditResumo(EM_PEDIDO, PEDIDO, "x")).toBe(true)
    expect(canEditResumo(EM_PEDIDO, ADMIN, "x")).toBe(true)
    expect(canEditResumo(EM_PEDIDO, IMPRESSAO, "x")).toBe(false)
    expect(canEditResumo(EM_PEDIDO, PRODUCAO, "x")).toBe(false)
    expect(canEditResumo(EM_IMPRESSAO, PEDIDO, "x")).toBe(false)
    expect(canEditResumo(CANCELADO, ADMIN, "x")).toBe(false)
  })
})

describe("avançar de etapa", () => {
  it("Impressão só recebe de Artes", () => {
    expect(canEnviarParaImpressao(EM_ARTES, ARTES, "x")).toBe(true)
    expect(canEnviarParaImpressao(EM_ARTES, ADMIN, "x")).toBe(true)
    expect(canEnviarParaImpressao(EM_ARTES, IMPRESSAO, "x")).toBe(false)
    expect(canEnviarParaImpressao(EM_PEDIDO, ARTES, "x")).toBe(false)
    expect(canEnviarParaImpressao(EM_IMPRESSAO, ARTES, "x")).toBe(false)
    expect(canEnviarParaImpressao(CANCELADO, ADMIN, "x")).toBe(false)
  })

  it("Produção só recebe de Impressão", () => {
    expect(canEnviarParaProducao(EM_IMPRESSAO, IMPRESSAO, "x")).toBe(true)
    expect(canEnviarParaProducao(EM_IMPRESSAO, ADMIN, "x")).toBe(true)
    expect(canEnviarParaProducao(EM_IMPRESSAO, PEDIDO, "x")).toBe(false)
    expect(canEnviarParaProducao(EM_PEDIDO, IMPRESSAO, "x")).toBe(false)
  })

  it("concluir só quem está em Produção", () => {
    expect(canFinalizar(EM_PRODUCAO, PRODUCAO, "x")).toBe(true)
    expect(canFinalizar(EM_PRODUCAO, ADMIN, "x")).toBe(true)
    expect(canFinalizar(EM_PRODUCAO, IMPRESSAO, "x")).toBe(false)
    expect(canFinalizar(FINALIZADO, ADMIN, "x")).toBe(false)
    expect(canFinalizar(EM_PRODUCAO, PEDIDO, "x")).toBe(false)
  })
})

describe("envio para entrega", () => {
  it("sai de Produção para Entrega (Vendedor/Admin)", () => {
    expect(canEnviarParaEntrega(EM_PRODUCAO, PEDIDO, "x")).toBe(true)
    expect(canEnviarParaEntrega(EM_PRODUCAO, ADMIN, "x")).toBe(true)
    expect(canEnviarParaEntrega(EM_PRODUCAO, PRODUCAO, "x")).toBe(false)
    expect(canEnviarParaEntrega(EM_PRODUCAO, IMPRESSAO, "x")).toBe(false)
  })

  it("volta de Finalizado para Entrega (Vendedor/Admin)", () => {
    expect(canEnviarParaEntrega(FINALIZADO, PEDIDO, "x")).toBe(true)
    expect(canEnviarParaEntrega(FINALIZADO, ADMIN, "x")).toBe(true)
    expect(canEnviarParaEntrega(FINALIZADO, PRODUCAO, "x")).toBe(false)
    expect(canEnviarParaEntrega(FINALIZADO, IMPRESSAO, "x")).toBe(false)
  })

  it("não envia pedido cancelado", () => {
    expect(canEnviarParaEntrega(CANCELADO, PEDIDO, "x")).toBe(false)
    expect(canEnviarParaEntrega(CANCELADO, ADMIN, "x")).toBe(false)
  })
})

describe("edição por etapa", () => {
  it("Impressão edita só a etapa Impressão", () => {
    expect(canEditImpressao(EM_IMPRESSAO, IMPRESSAO, "x")).toBe(true)
    expect(canEditImpressao(EM_PEDIDO, IMPRESSAO, "x")).toBe(false)
    expect(canEditImpressao(CANCELADO, ADMIN, "x")).toBe(false)
  })

  it("Produção edita só a etapa Produção", () => {
    expect(canEditProducao(EM_PRODUCAO, PRODUCAO, "x")).toBe(true)
    expect(canEditProducao(EM_PRODUCAO, ADMIN, "x")).toBe(true)
    expect(canEditProducao(EM_IMPRESSAO, PRODUCAO, "x")).toBe(false)
  })
})

describe("ações administrativas", () => {
  it("cancelar é exclusivo do Administrador", () => {
    expect(podeCancelar(ADMIN)).toBe(true)
    expect(podeCancelar(PEDIDO)).toBe(false)
    expect(podeCancelar(IMPRESSAO)).toBe(false)
    expect(podeCancelar(PRODUCAO)).toBe(false)
  })

  it("voltar etapa e permitido para Administrador e Producao", () => {
    expect(podeVoltarEtapa(ADMIN)).toBe(true)
    expect(podeVoltarEtapa(PRODUCAO)).toBe(true)
    expect(podeVoltarEtapa(PEDIDO)).toBe(false)
    expect(podeVoltarEtapa(IMPRESSAO)).toBe(false)
    expect(podeVoltarEtapa(ARTES)).toBe(false)
  })
})
