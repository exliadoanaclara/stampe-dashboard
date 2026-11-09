export type Etapa = "PEDIDO" | "ARTES" | "IMPRESSAO" | "PRODUCAO" | "COSTURA" | "ENTREGA" | "FINALIZADO"
export type Role = "PEDIDO" | "ARTES" | "IMPRESSAO" | "PRODUCAO" | "ADMIN"

/** Abas de navegacao da lista de pedidos. HISTORICO agrupa os pedidos ja finalizados. */
export type Aba = "TODOS" | "PEDIDO" | "ARTES" | "IMPRESSAO" | "PRODUCAO" | "COSTURA" | "ENTREGA" | "HISTORICO"

export type Prioridade = "BAIXA" | "NORMAL" | "ALTA" | "URGENTE"

export type StatusPrazo = "VERDE" | "LARANJA" | "VERMELHO"

export interface ItemPedido {
  descricao: string
  quantidade: number
  unidade: string
}

export interface InfoItem { id: string; texto: string; usuario: string; data: string }
export interface HistoricoItem { id: string; campo: string; anterior: string; novo: string; usuario: string; data: string }
export interface EtapaHist { de: Etapa; para: Etapa; usuario: string; data: string; motivo?: string }

export interface UsuarioAcesso {
  id: string
  nome: string
  roles: Role[]
  senha: string
  ativo: boolean
}

export interface Pedido {
  id: string
  numero: number
  cliente: string
  servico: string
  atendente: string          /** Nome do funcionario que cadastrou */
  vendedorId: string          /** ID do funcionario dono do pedido (para filtrar por vendedor) */
  telefone?: string
  quantidade?: string
  valor?: string
  dataInicio: string
  previsaoConclusao: string
  observacoes: string
  /** Arte original que o cliente pediu (anexada pelo vendedor na criacao do pedido). Pode haver varias imagens. */
  arteUrls: string[]
  /** Arte produzida/finalizada pelo arte finalista (anexada na impressao/producao). Pode haver varias imagens. */
  arteProducaoUrls: string[]
  /** Arte preparada na etapa de artes (anexada pelo arte finalista na etapa ARTES). Pode haver varias imagens. */
  arteArteUrls: string[]
  etapa: Etapa
  dataCriacao: string
  dataAtualizacao: string
  dataFinalizacao?: string
  usuarioFinalizacao?: string
  previsaoImpressao?: string
  previsaoProducao?: string
  previsaoCostura?: string
  previsaoEntrega?: string
  dataEntrega?: string
  entreguePor?: string
  /** FASE 07 - Campos opcionais de entrega (extensíveis, não bloqueiam o fluxo) */
  entregaSituacao?: string    /** situacao da entrega: Entregue, Parcial, Retirada na loja, etc. */
  entregaPagamento?: string   /** informacao de pagamento quando disponível (opcional) */
  entregaAssinatura?: string  /** assinatura opcional (base64 ou texto) */
  canceladoEm?: string
  canceladoMotivo?: string
  canceladoPor?: string
  infosImpressao: InfoItem[]
  infosArtes: InfoItem[]          /** informacoes da etapa de artes */
  infosProducao: InfoItem[]       /** antes infosFinalizacao */
  infosCostura: InfoItem[]        /** informacoes da etapa de costura */
  infosEntrega: InfoItem[]
  historico: HistoricoItem[]
  etapaHistorico: EtapaHist[]
  itens: ItemPedido[]
  prioridade: Prioridade
  /** Prazo de 3 dias uteis a partir da criacao */
  dataPrazo?: string            /** data limite calculada */
  prazoDias?: number            /** quantidade de dias uteis (padrao 3) */
  statusPrazo?: StatusPrazo     /** VERDE / LARANJA / VERMELHO calculado dinamicamente */
  /** Alteracoes solicitadas pelo cliente - reinicia prazo e volta na fila */
  alteracaoSolicitada?: boolean
  dataUltimaAlteracao?: string
  usuarioUltimaAlteracao?: string
  /** Lock de reposicao: quando um pedido volta de etapa, o usuario que fez o retorno fica travado so neste pedido ate FINALIZADO */
  reposicaoLock?: {
    usuarioId: string
    usuarioNome: string
    data: string
  }
  /** Link individual de acompanhamento do cliente (FASE 08) */
  tokenAcompanhamento?: string          /** token nao previsivel para o link publico */
  tokenAcompanhamentoAtivo?: boolean    /** se o link esta ativo (pode ser revogado) */
  tokenAcompanhamentoCriadoEm?: string  /** data de criacao do token */
  tokenAcompanhamentoCriadoPor?: string /** usuario que gerou o link */
}

export interface ProgressConfig { PEDIDO: number; ARTES: number; IMPRESSAO: number; PRODUCAO: number; COSTURA: number; ENTREGA: number; FINALIZADO: number }
export interface UserState { id: string; nome: string; roles: Role[]; precisaAlterarSenha?: boolean }

export interface VisualConfig {
  corHeader: string
  corHeader2: string
  corHeader3: string
  corFundo: string
  logoUrl: string | null
  logoRodapeUrl: string | null
  logoImgAlt: number
  marcaUrl: string | null
  marcaOpacidade: number
  marcaTamanho: number
  marcaCobrir: boolean
  bannerUrl: string | null
  bannerEsq: boolean
  bannerDir: boolean
  bannerLarg: number
  titulo: string
  subtitulo: string
  nomeEmpresa: string
  subLogo: string
  logoTam: number
  ordemVisao: "MAIOR" | "MENOR"
  mostrarArte: boolean
  mostrarHistorico: boolean
  mostrarObs: boolean
  mostrarArtes: boolean
}

export interface ChatMsg { id: string; user: string; texto: string; data: string; pedidoId?: string }

export const DEFAULT_CONFIG: ProgressConfig = { PEDIDO: 0, ARTES: 25, IMPRESSAO: 50, PRODUCAO: 75, COSTURA: 80, ENTREGA: 90, FINALIZADO: 100 }

export const DEFAULT_VISUAL: VisualConfig = {
  corHeader: "#b5000c",
  corHeader2: "#c1121f",
  corHeader3: "#8f0e19",
  corFundo: "#fafafa",
  logoUrl: "/logo-stampe.png",
  logoRodapeUrl: null,
  logoImgAlt: 40,
  marcaUrl: null,
  marcaOpacidade: 18,
  marcaTamanho: 65,
  marcaCobrir: false,
  bannerUrl: "/banner-stampe.png",
  bannerEsq: false,
  bannerDir: false,
  bannerLarg: 160,
  titulo: "Pedido",
  subtitulo: "Documento interno",
  nomeEmpresa: "STAMPE",
  subLogo: "personalizado",
  logoTam: 18,
  ordemVisao: "MAIOR",
  mostrarArte: true,
  mostrarArtes: true,
  mostrarHistorico: true,
  mostrarObs: true,
}

/** Limite maximo de pedidos simultaneos por etapa. null/undefined = sem limite. */
export interface LimitesEtapa {
  PEDIDO?: number | null
  IMPRESSAO?: number | null
  PRODUCAO?: number | null
  COSTURA?: number | null
  ENTREGA?: number | null
  FINALIZADO?: number | null
}

export const LIMITES_PADRAO: LimitesEtapa = {
  PEDIDO: null,
  IMPRESSAO: 4,
  PRODUCAO: 4,
  COSTURA: 4,
  ENTREGA: 4,
  FINALIZADO: null,
}

/** Tipos de arquivo aceitos para anexar em artes (PDF, CDR do CorelDRAW, TIF, imagens). */
export const ARTE_ACEITOS = ".pdf,.cdr,.tif,.tiff,image/*,image/png,image/jpeg,image/jpg,image/svg+xml"

export const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: "PEDIDO", label: "Cadastro / Vendas", desc: "Cria e edita proprios pedidos" },
  { value: "ARTES", label: "Artes", desc: "Prepara e anexa as artes do pedido" },
  { value: "PRODUCAO", label: "Producao", desc: "Acompanha e atualiza producao" },
  { value: "ADMIN", label: "Administrador", desc: "Acesso total - ve todos os pedidos" },
]

export interface UsuarioCadastrado { id: string; nome: string; roles: Role[] }

export const USUARIOS_CADASTRADOS: UsuarioCadastrado[] = [
  // ADMIN - acesso total, ve todos os pedidos
  { id: "ruan", nome: "RUAN", roles: ["ADMIN"] },
  { id: "henrique", nome: "HENRIQUE", roles: ["ADMIN", "IMPRESSAO"] },
  // CADASTRO / VENDAS - ve so proprios pedidos
  { id: "grazielli", nome: "GRAZIELLI", roles: ["PEDIDO"] },
  { id: "italo", nome: "ITALO", roles: ["PEDIDO"] },
  { id: "tales", nome: "TALES", roles: ["PEDIDO", "IMPRESSAO"] },
  { id: "leonardo", nome: "LEONARDO", roles: ["PEDIDO", "IMPRESSAO"] },
  // ARTES - prepara as artes
  { id: "arte1", nome: "ARTE 1", roles: ["ARTES"] },
  // PRODUCAO
  { id: "magno", nome: "MAGNO", roles: ["PRODUCAO"] },
  { id: "bia", nome: "BIA", roles: ["PRODUCAO"] },
  { id: "reinaldo", nome: "REYNALDO", roles: ["PRODUCAO"] },
]