import type { Pedido, Role, UserState } from "./tipos"

/** Verifica se o usuario pode ver/editar o pedido. */
export function podeAcessarPedido(p: Pedido, userId: string, roles: Role[]): boolean {
  if (roles.includes("ADMIN")) return true
  // Somente vendedor (PEDIDO) restringe por vendedorId; outros veem qualquer pedido
  if ((roles ?? []).includes("PEDIDO")) {
    return p.vendedorId === userId
  }
  return true
}

export function canEditResumo(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && (p.etapa === "PEDIDO" || p.etapa === "ARTES") && (roles.includes("PEDIDO") || roles.includes("ADMIN"))
}

export function canEnviarParaArtes(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && p.etapa === "PEDIDO" && (roles.includes("PEDIDO") || roles.includes("ADMIN"))
}

export function canEnviarParaImpressao(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && p.etapa === "ARTES" && (roles.includes("ARTES") || roles.includes("ADMIN"))
}

export function canEnviarParaProducao(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && p.etapa === "IMPRESSAO" && (roles.includes("IMPRESSAO") || roles.includes("ADMIN"))
}

export function canEnviarParaEntrega(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && (p.etapa === "PRODUCAO" || p.etapa === "FINALIZADO") && (roles.includes("PEDIDO") || roles.includes("ADMIN"))
}

export function canFinalizar(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && p.etapa === "PRODUCAO" && (roles.includes("PRODUCAO") || roles.includes("ADMIN"))
}

export function canEditImpressao(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && p.etapa === "IMPRESSAO" && (roles.includes("IMPRESSAO") || roles.includes("ADMIN"))
}

export function canEditProducao(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && p.etapa === "PRODUCAO" && (roles.includes("PRODUCAO") || roles.includes("ADMIN"))
}

export function canEditEntrega(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && p.etapa === "ENTREGA" && (roles.includes("PRODUCAO") || roles.includes("ADMIN"))
}

/** Somente producao/admin envia para costura, e so enquanto esta em PRODUCAO. */
export function canEnviarParaCostura(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && p.etapa === "PRODUCAO" && (roles.includes("PRODUCAO") || roles.includes("ADMIN"))
}

/** Somente producao/admin edita durante a etapa de costura. */
export function canEditCostura(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && p.etapa === "COSTURA" && (roles.includes("PRODUCAO") || roles.includes("ADMIN"))
}

/** Somente vendedor/admin edita a arte original do cliente, e so enquanto esta em PEDIDO. */
export function canEditArteUrl(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && (p.etapa === "PEDIDO" || p.etapa === "ARTES") && (roles.includes("PEDIDO") || roles.includes("ADMIN") || roles.includes("ARTES"))
}

export function canEditArteArte(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && p.etapa === "ARTES" && (roles.includes("ARTES") || roles.includes("ADMIN"))
}

/** Somente impressao/admin edita a arte de producao, e so enquanto esta em IMPRESSAO ou PRODUCAO. */
export function canEditArteProducao(p: Pedido, roles: Role[], userId: string): boolean {
  if (!podeAcessarPedido(p, userId, roles)) return false
  return !p.canceladoEm && (p.etapa === "IMPRESSAO" || p.etapa === "PRODUCAO") && (roles.includes("IMPRESSAO") || roles.includes("ADMIN"))
}

export function podeEntregaConcluida(p: Pedido): boolean {
  return !p.canceladoEm && p.etapa === "ENTREGA"
}

export function podeCancelar(roles: Role[]): boolean {
  return roles.includes("ADMIN")
}

export function podeVoltarEtapa(roles: Role[]): boolean {
  return roles.includes("ADMIN") || roles.includes("PRODUCAO")
}

/** Somente admin pode alterar pedido apos finalizado. Registra auditoria. */
export function podeAlterarAposFinalizado(roles: Role[]): boolean {
  return roles.includes("ADMIN")
}

/** Verifica se o pedido tem lock de reposicao ativo */
export function temReposicaoLock(p: Pedido): boolean {
  return !!p.reposicaoLock && p.etapa !== "FINALIZADO"
}

/** Verifica se o usuario esta bloqueado em outro pedido (reposicao ativa) */
export function usuarioTemReposicaoAtiva(pedidos: Pedido[], userId: string): Pedido | null {
  for (const p of pedidos) {
    if (p.reposicaoLock?.usuarioId === userId && p.etapa !== "FINALIZADO") {
      return p
    }
  }
  return null
}

/** Verifica se o usuario pode acessar/mexer no pedido considerando lock de reposicao */
export function podeAcessarComLock(p: Pedido, user: UserState, todosPedidos: Pedido[]): boolean {
  // Admin ignora lock
  if (user.roles.includes("ADMIN")) return true
  
  // Se o proprio pedido tem lock desse usuario, permite
  if (p.reposicaoLock?.usuarioId === user.id) return true
  
  // Se usuario tem reposicao ativa em OUTRO pedido, bloqueia
  const outroLock = usuarioTemReposicaoAtiva(todosPedidos, user.id)
  if (outroLock && outroLock.id !== p.id) return false
  
  return true
}

/** Verifica se o usuario pode AÇÃO (editar, avançar, etc) no pedido considerando lock */
export function podeAcaoComLock(p: Pedido, user: UserState, todosPedidos: Pedido[]): boolean {
  // Admin ignora lock
  if (user.roles.includes("ADMIN")) return true
  
  // Se o proprio pedido tem lock desse usuario, permite
  if (p.reposicaoLock?.usuarioId === user.id) return true
  
  // Se usuario tem reposicao ativa em OUTRO pedido, bloqueia qualquer acao
  const outroLock = usuarioTemReposicaoAtiva(todosPedidos, user.id)
  if (outroLock && outroLock.id !== p.id) return false
  
  return true
}

/** ===== PRIORIDADE DE FILA (REPOSIÇÃO) ===== */

/** Verifica se existe algum pedido com prioridadeLock ativo na lista */
export function existePrioridadeAtiva(pedidos: Pedido[]): Pedido | null {
  for (const p of pedidos) {
    if (p.prioridadeLock?.ativo && p.etapa !== "FINALIZADO") {
      return p
    }
  }
  return null
}

/** Retorna o pedido prioritário (menor número) com lock ativo */
export function getPedidoPrioritario(pedidos: Pedido[]): Pedido | null {
  let prioritario: Pedido | null = null
  for (const p of pedidos) {
    if (p.prioridadeLock?.ativo && p.etapa !== "FINALIZADO") {
      if (!prioritario || p.numero < prioritario.numero) {
        prioritario = p
      }
    }
  }
  return prioritario
}

/** Verifica se um pedido pode avançar para IMPRESSAO respeitando prioridade */
export function podeAvancarParaImpressao(p: Pedido, todosPedidos: Pedido[]): { ok: boolean; motivo?: string } {
  const prioritario = getPedidoPrioritario(todosPedidos)
  if (!prioritario) return { ok: true }
  
  // Se é o próprio pedido prioritário, permite
  if (p.id === prioritario.id) return { ok: true }
  
  // Se o pedido prioritário está em IMPRESSAO ou PRODUCAO, bloqueia outros
  if (prioritario.etapa === "IMPRESSAO" || prioritario.etapa === "PRODUCAO") {
    return { 
      ok: false, 
      motivo: `Prioridade ativa: Pedido Nº ${prioritario.numero} está em ${prioritario.etapa} (reposição). Aguarde conclusão.` 
    }
  }
  
  return { ok: true }
}

/** Verifica se um pedido pode avançar para PRODUCAO respeitando prioridade */
export function podeAvancarParaProducao(p: Pedido, todosPedidos: Pedido[]): { ok: boolean; motivo?: string } {
  const prioritario = getPedidoPrioritario(todosPedidos)
  if (!prioritario) return { ok: true }
  
  // Se é o próprio pedido prioritário, permite
  if (p.id === prioritario.id) return { ok: true }
  
  // Se o pedido prioritário está em PRODUCAO, bloqueia outros
  if (prioritario.etapa === "PRODUCAO") {
    return { 
      ok: false, 
      motivo: `Prioridade ativa: Pedido Nº ${prioritario.numero} está em PRODUÇÃO (reposição). Aguarde conclusão.` 
    }
  }
  
  return { ok: true }
}

/** Verifica se um pedido pode avançar para COSTURA respeitando prioridade */
export function podeAvancarParaCostura(p: Pedido, todosPedidos: Pedido[]): { ok: boolean; motivo?: string } {
  const prioritario = getPedidoPrioritario(todosPedidos)
  if (!prioritario) return { ok: true }
  
  // Se é o próprio pedido prioritário, permite
  if (p.id === prioritario.id) return { ok: true }
  
  // Se o pedido prioritário está em COSTURA ou PRODUCAO, bloqueia outros (cascata)
  if (prioritario.etapa === "COSTURA" || prioritario.etapa === "PRODUCAO") {
    return { 
      ok: false, 
      motivo: `Prioridade ativa: Pedido Nº ${prioritario.numero} está em ${prioritario.etapa} (reposição). Aguarde conclusão.` 
    }
  }
  
  return { ok: true }
}

/** Verifica se um pedido pode avançar para ARTES respeitando prioridade */
export function podeAvancarParaArtes(p: Pedido, todosPedidos: Pedido[]): { ok: boolean; motivo?: string } {
  const prioritario = getPedidoPrioritario(todosPedidos)
  if (!prioritario) return { ok: true }
  
  // Se é o próprio pedido prioritário, permite
  if (p.id === prioritario.id) return { ok: true }
  
  // Se o pedido prioritário está em IMPRESSAO ou PRODUCAO, bloqueia outros (cascata)
  if (prioritario.etapa === "IMPRESSAO" || prioritario.etapa === "PRODUCAO") {
    return { 
      ok: false, 
      motivo: `Prioridade ativa: Pedido Nº ${prioritario.numero} está em ${prioritario.etapa} (reposição). Aguarde conclusão.` 
    }
  }
  
  return { ok: true }
}
