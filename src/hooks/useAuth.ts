import { useEffect, useState, useCallback } from "react"
import type { UserState, Role } from "../domain/tipos"
import { USUARIOS_CADASTRADOS } from "../domain/tipos"
import * as storage from "../data/storage"
import { carregarUsuarios, autenticarUsuario, definirSenhaPrimeiroAcesso } from "../data/storage"

export function useAuth() {
  const [user, setUser] = useState<UserState | null>(null)
  const [usuarios, setUsuarios] = useState<{ id: string; nome: string; roles: Role[] }[]>([])

  useEffect(() => {
    // Carrega lista de usuarios cadastrados (sem senha) para exibicao
    const salvos = carregarUsuarios()
    if (salvos.length > 0) {
      setUsuarios(salvos.map(u => ({ id: u.id, nome: u.nome, roles: u.roles })))
    } else {
      setUsuarios(USUARIOS_CADASTRADOS)
    }
    // Tenta restaurar sessao
    const sessao = storage.carregarSessao()
    if (sessao) {
      setUser(sessao)
    }
  }, [])

  const login = useCallback((id: string, senha: string): { ok: boolean; erro?: string } => {
    const u = autenticarUsuario(id, senha)
    if (!u) return { ok: false, erro: "Usuario ou senha invalidos" }
    const userState: UserState = { id: u.id, nome: u.nome, roles: u.roles, precisaAlterarSenha: !!u.precisaAlterarSenha }
    storage.salvarSessao(userState)
    setUser(userState)
    return { ok: true }
  }, [])

  const criarSenhaPrimeiroAcesso = useCallback((id: string, senha: string): { ok: boolean; erro?: string } => {
    const r = definirSenhaPrimeiroAcesso(id, senha)
    if (!r.ok) return r
    if (!r.usuario) return { ok: false, erro: "Erro ao definir senha" }
    const userState: UserState = { id: r.usuario.id, nome: r.usuario.nome, roles: r.usuario.roles, precisaAlterarSenha: !!r.usuario.precisaAlterarSenha }
    storage.salvarSessao(userState)
    setUser(userState)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    storage.limparSessao()
    setUser(null)
  }, [])

  const selecionarUsuario = useCallback((id: string) => {
    // Mantido para compatibilidade, nao usado mais no fluxo de login
    const usuario = usuarios.find(u => u.id === id)
    if (usuario) {
      setUser({ id: usuario.id, nome: usuario.nome, roles: usuario.roles ?? ["PEDIDO"] })
    }
  }, [usuarios])

  return {
    user,
    setUser,
    login,
    criarSenhaPrimeiroAcesso,
    logout,
    selecionarUsuario,
    usuarios,
    isAuthenticated: !!user,
  }
}
