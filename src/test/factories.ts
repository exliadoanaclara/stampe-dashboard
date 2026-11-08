import type { Pedido } from "../domain/tipos"

export function criarPedidoBase(extra: Partial<Pedido> = {}): Pedido {
  return {
    id: "p1",
    numero: 1,
    cliente: "CLIENTE TESTE",
    servico: "FAIXA",
    atendente: "ITALO",
    telefone: "",
    quantidade: "",
    valor: "",
    dataInicio: "2026-09-26",
    previsaoConclusao: "2026-09-26",
    observacoes: "",
    arteUrls: ["data:image/png;base64,abc"],
    /** Arte produzida/finalizada pelo arte finalista. */
    arteProducaoUrls: [],
    /** Arte preparada na etapa de artes. */
    arteArteUrls: [],
    vendedorId: "x",
    etapa: "PEDIDO",
    dataCriacao: "2026-09-26T12:00:00.000Z",
    dataAtualizacao: "2026-09-26T12:00:00.000Z",
    infosImpressao: [],
    infosArtes: [],
    infosProducao: [],
    infosCostura: [],
    infosEntrega: [],
    historico: [],
    etapaHistorico: [],
    itens: [],
    prioridade: "NORMAL",
    dataPrazo: "2026-10-30",
    statusPrazo: "VERDE",
    ...extra,
  }
}
