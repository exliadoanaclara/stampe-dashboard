import { diaLocal } from "../domain/datas"
import { ehPedidoValido, sequenciaDoDia } from "../domain/regras"
import type { ChatMsg, LimitesEtapa, Pedido, ProgressConfig, Role, UserState, VisualConfig } from "../domain/tipos"
import { DEFAULT_CONFIG, DEFAULT_VISUAL, LIMITES_PADRAO, USUARIOS_CADASTRADOS } from "../domain/tipos"

export const LS_PEDIDOS = "stampe_pedidos_v3"
export const LS_PEDIDOS_BACKUP = "stampe_pedidos_backup_v1"
export const LS_SEQ = "stampe_seq_v3"
export const LS_USER = "stampe_user_v3"
export const LS_CONFIG = "stampe_config_v3"
export const LS_VISUAL = "stampe_visual_v3"
export const LS_CHAT = "stampe_chat_v1"
export const LS_DIA = "stampe_dia_reset_v1"
export const CHAT_CANAL = "stampe_chat_canal"
export const LS_LIMITES = "stampe_limites_v1"
export const LS_USER_SESSION = "stampe_user_session_v1"

let ultimoAvisoCarga: string | null = null

export function pegarAvisoCarga(): string | null {
  const a = ultimoAvisoCarga
  ultimoAvisoCarga = null
  return a
}

function ler(chave: string): string | null {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}

function gravar(chave: string, valor: string): { ok: boolean; erro?: string } {
  try {
    localStorage.setItem(chave, valor)
    return { ok: true }
  } catch {
    return { ok: false, erro: "Sem espaco no navegador: a alteracao NAO foi salva. Exporte um backup e libere espaco." }
  }
}

function preservarBruto(raw: string): void {
  const r = gravar(LS_PEDIDOS_BACKUP, raw)
  if (!r.ok) {
    ultimoAvisoCarga = "Dados ilegiveis e o backup NAO pôde ser gravado (armazenamento cheio)."
  } else {
    ultimoAvisoCarga = "Dados corrompidos preservados em backup (stampe_pedidos_backup_v1). A lista foi reaberta vazia — importe o backup se necessario."
  }
}

export function carregarPedidos(): Pedido[] {
  const raw = ler(LS_PEDIDOS)
  if (!raw) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    preservarBruto(raw)
    return []
  }
  if (!Array.isArray(parsed)) {
    preservarBruto(raw)
    return []
  }
  const validos = parsed.filter(ehPedidoValido)
  if (validos.length !== parsed.length) {
    preservarBruto(raw)
    ultimoAvisoCarga = `${parsed.length - validos.length} registro(s) invalido(s) preservados em backup (stampe_pedidos_backup_v1); ${validos.length} pedido(s) seguiram na lista normalmente.`
  }
  return validos
}

export function salvarPedidos(pedidos: Pedido[]): { ok: boolean; erro?: string } {
  return gravar(LS_PEDIDOS, JSON.stringify(pedidos))
}

export function lerDiaSalvo(): string | null {
  return ler(LS_DIA)
}

export function salvarDia(dia: string): void {
  gravar(LS_DIA, dia)
}

function lerInteiro(chave: string, padrao: number): number {
  const s = ler(chave)
  if (!s) return padrao
  const n = parseInt(s, 10)
  return Number.isFinite(n) ? n : padrao
}

export function salvarSeq(n: number): void {
  gravar(LS_SEQ, String(n))
}

export function calcularSeqInicial(): number {
  const hoje = diaLocal()
  const raw = ler(LS_PEDIDOS)
  let lista: Pedido[] = []
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) lista = parsed.filter(ehPedidoValido)
    } catch {
      lista = []
    }
  }
  return sequenciaDoDia(lista, hoje, ler(LS_DIA), lerInteiro(LS_SEQ, 1))
}

export function carregarUser(): UserState {
  const raw = ler(LS_USER)
  if (raw) {
    try {
      const u = JSON.parse(raw) as UserState
      if (u && typeof u.nome === "string" && Array.isArray(u.roles) && typeof u.id === "string") return u
    } catch {
      /* estado invalido — usar padrao */
    }
  }
  return { id: "italo", nome: "ITALO", roles: ["PEDIDO"] }
}

export function salvarUser(u: UserState): void {
  gravar(LS_USER, JSON.stringify(u))
}

export function carregarConfig(): ProgressConfig {
  const raw = ler(LS_CONFIG)
  if (raw) {
    try {
      const c = JSON.parse(raw) as Record<string, unknown>
      if (c && typeof c === "object" && !Array.isArray(c)) {
        const limpo: Partial<ProgressConfig> = {}
        for (const chave of Object.keys(DEFAULT_CONFIG) as (keyof ProgressConfig)[]) {
          const v = c[chave]
          if (typeof v === "number" && Number.isFinite(v)) limpo[chave] = v
        }
        if (Object.keys(limpo).length > 0) return { ...DEFAULT_CONFIG, ...limpo }
      }
    } catch {
      /* estado invalido — usar padrao */
    }
  }
  return DEFAULT_CONFIG
}

export function salvarConfig(c: ProgressConfig): void {
  gravar(LS_CONFIG, JSON.stringify(c))
}

export function carregarVisual(): VisualConfig {
  const raw = ler(LS_VISUAL)
  if (raw) {
    try {
      return { ...DEFAULT_VISUAL, ...JSON.parse(raw) }
    } catch {
      return DEFAULT_VISUAL
    }
  }
  return DEFAULT_VISUAL
}

export function salvarVisual(v: VisualConfig): { ok: boolean; erro?: string } {
  return gravar(LS_VISUAL, JSON.stringify(v))
}

export function carregarLimites(): LimitesEtapa {
  const raw = ler(LS_LIMITES)
  if (!raw) return { ...LIMITES_PADRAO }
  try {
    const c = JSON.parse(raw) as Record<string, unknown>
    if (c && typeof c === "object" && !Array.isArray(c)) {
      const limpo: LimitesEtapa = {}
      for (const chave of ["PEDIDO", "IMPRESSAO", "PRODUCAO", "ENTREGA"] as const) {
        const v = c[chave]
        if (v === null || v === undefined) limpo[chave] = null
        else if (typeof v === "number" && Number.isFinite(v)) limpo[chave] = v
      }
      return { ...LIMITES_PADRAO, ...limpo }
    }
  } catch {
    /* estado invalido — usar padrao */
  }
  return { ...LIMITES_PADRAO }
}

export function salvarLimites(l: LimitesEtapa): { ok: boolean; erro?: string } {
  return gravar(LS_LIMITES, JSON.stringify(l))
}

export function carregarChat(): ChatMsg[] {
  const raw = ler(LS_CHAT)
  if (raw) {
    try {
      const c = JSON.parse(raw)
      if (Array.isArray(c)) return c as ChatMsg[]
    } catch {
      return []
    }
  }
  return []
}

export function salvarChat(c: ChatMsg[]): { ok: boolean; erro?: string } {
  return gravar(LS_CHAT, JSON.stringify(c))
}

export interface BackupStampe {
  versao: number
  exportadoEm: string
  pedidos: Pedido[]
  config: ProgressConfig
  visual: VisualConfig
}

export function montarBackup(pedidos: Pedido[], config: ProgressConfig, visual: VisualConfig): BackupStampe {
  return { versao: 1, exportadoEm: new Date().toISOString(), pedidos, config, visual }
}

export function baixarBackup(backup: BackupStampe): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `stampe-backup-${diaLocal()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function lerBackupArquivo(file: File): Promise<BackupStampe> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("nao foi possivel ler o arquivo"))
    reader.onload = () => {
      try {
        const dados = JSON.parse(String(reader.result)) as BackupStampe
        if (!dados || !Array.isArray(dados.pedidos)) {
          reject(new Error("arquivo de backup invalido"))
          return
        }
        const invalidos = dados.pedidos.filter(p => !ehPedidoValido(p))
        if (invalidos.length > 0) {
          reject(new Error(`backup contem ${invalidos.length} registro(s) invalido(s)`))
          return
        }
        resolve(dados)
      } catch {
        reject(new Error("arquivo JSON invalido"))
      }
    }
    reader.readAsText(file)
  })
}

/* -------------------- Sessao de usuario -------------------- */

export function salvarSessao(user: UserState): void {
  gravar(LS_USER_SESSION, JSON.stringify(user))
}

export function carregarSessao(): UserState | null {
  const raw = ler(LS_USER_SESSION)
  if (!raw) return null
  try {
    const u = JSON.parse(raw) as UserState
    if (u && typeof u.id === "string" && typeof u.nome === "string" && Array.isArray(u.roles)) return u
  } catch {
    return null
  }
  return null
}

export function limparSessao(): void {
  try {
    localStorage.removeItem(LS_USER_SESSION)
  } catch {
    /* ignora */
  }
}

/* -------------------- Cadastro de usuarios com senha -------------------- */

export const LS_USUARIOS = "stupe_usuarios_v1"

export interface UsuarioCadastro {
  id: string
  nome: string
  roles: Role[]
  senha: string
  ativo: boolean
  precisaAlterarSenha?: boolean
  criadoEm?: string
}

export function carregarUsuarios(): UsuarioCadastro[] {
  const raw = ler(LS_USUARIOS)
  if (!raw) return []
  try {
    const dados = JSON.parse(raw) as UsuarioCadastro[]
    if (Array.isArray(dados)) {
      // Migracao: usuarios antigos salvam 'role' (string unica), novo usa 'roles' (array)
      const migrados = dados.map(u => {
        const antigo = u as { role?: string }
        if (!Array.isArray(u.roles) && typeof antigo.role === "string") {
          return { ...u, roles: [antigo.role as Role] }
        }
        if (!Array.isArray(u.roles)) {
          return { ...u, roles: ["PEDIDO" as Role] }
        }
        return u
      })

      // IDs validos da lista atual (sem Juan, Henrique separado, Teles, etc.)
      const idsValidos = new Set(USUARIOS_CADASTRADOS.map(u => u.id))

      // Detecta se ha usuarios antigos que nao existem mais na lista (juan, teles, henrique_imp, etc.)
      const temAntigo = migrados.some(u => !idsValidos.has(u.id))

      if (temAntigo) {
        // Substitui pela lista nova correta, sem senha (primeiro acesso absoluto)
        const iniciais = USUARIOS_CADASTRADOS.map(u => ({
          id: u.id,
          nome: u.nome,
          roles: u.roles,
          senha: "",
          ativo: true,
        }))
        salvarUsuarios(iniciais)
        return iniciais
      }

      return migrados
    }
  } catch {
    /* ignora */
  }
  return []
}

export function salvarUsuarios(usuarios: UsuarioCadastro[]): { ok: boolean; erro?: string } {
  return gravar(LS_USUARIOS, JSON.stringify(usuarios))
}

export function criarOuAtualizarUsuario(usuario: UsuarioCadastro): { ok: boolean; erro?: string } {
  const lista = carregarUsuarios()
  const existente = lista.findIndex(u => u.id === usuario.id)
  const agora = new Date().toISOString()
  const novo: UsuarioCadastro = {
    ...usuario,
    criadoEm: existente >= 0 ? lista[existente].criadoEm : agora,
  }
  if (existente >= 0) {
    lista[existente] = novo
  } else {
    lista.push(novo)
  }
  return salvarUsuarios(lista)
}

export function autenticarUsuario(id: string, senha: string): UsuarioCadastro | null {
  const lista = carregarUsuarios()
  const u = lista.find(x => x.id === id && x.ativo !== false)
  if (u && u.senha === senha) return u
  return null
}

export function usuarioSemSenha(id: string): boolean {
  const lista = carregarUsuarios()
  const u = lista.find(x => x.id === id && x.ativo !== false)
  return !!u && u.senha === ""
}

export function definirSenhaPrimeiroAcesso(id: string, senha: string): { ok: boolean; erro?: string; usuario?: UsuarioCadastro } {
  if (!senha || senha.length < 4) {
    return { ok: false, erro: "Senha deve ter no minimo 4 caracteres" }
  }
  const lista = carregarUsuarios()
  const u = lista.find(x => x.id === id && x.ativo !== false)
  if (!u) return { ok: false, erro: "Usuario nao encontrado" }
  if (u.senha !== "") {
    return { ok: false, erro: "Usuario ja possui senha cadastrada" }
  }
  u.senha = senha
  u.precisaAlterarSenha = false
  const r = salvarUsuarios(lista)
  if (!r.ok) return { ok: false, erro: r.erro || "Erro ao salvar senha" }
  return { ok: true, usuario: u }
}

export function alterarSenha(id: string, novaSenha: string): { ok: boolean; erro?: string } {
  const lista = carregarUsuarios()
  const u = lista.find(x => x.id === id)
  if (!u) return { ok: false, erro: "Usuario nao encontrado" }
  u.senha = novaSenha
  u.precisaAlterarSenha = false
  return salvarUsuarios(lista)
}

export function marcarParaAlterarSenha(id: string, obrigatorio: boolean): { ok: boolean; erro?: string } {
  const lista = carregarUsuarios()
  const u = lista.find(x => x.id === id)
  if (!u) return { ok: false, erro: "Usuario nao encontrado" }
  u.precisaAlterarSenha = obrigatorio
  return salvarUsuarios(lista)
}
