import { useState, useEffect } from "react"
import type { Role } from "../domain/tipos"
import { ROLES } from "../domain/tipos"
import { USUARIOS_CADASTRADOS } from "../domain/tipos"
import {
  carregarUsuarios,
  salvarUsuarios,
  criarOuAtualizarUsuario,
  alterarSenha,
  type UsuarioCadastro,
} from "../data/storage"

interface CadastroUsuariosProps {
  onClose: () => void
  usuarioLogado: { id: string; nome: string; roles: string[] }
}

export function CadastroUsuarios({ onClose, usuarioLogado }: CadastroUsuariosProps) {
  const [usuarios, setUsuarios] = useState<UsuarioCadastro[]>([])
  const [editando, setEditando] = useState<string | null>(null)
  const [novoNome, setNovoNome] = useState("")
  const [novoRoles, setNovoRoles] = useState<Role[]>(["PEDIDO"])
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [precisaAlterarSenha, setPrecisaAlterarSenha] = useState(false)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [redefinindoId, setRedefinindoId] = useState<string | null>(null)
  const [novaSenhaRedef, setNovaSenhaRedef] = useState("")

  useEffect(() => {
    carregarUsuariosIniciais()
  }, [])

  function carregarUsuariosIniciais() {
    const salvos = carregarUsuarios()
    if (salvos.length === 0) {
      const iniciais = USUARIOS_CADASTRADOS.map(u => ({
        id: u.id,
        nome: u.nome,
        roles: u.roles,
        senha: "",
        ativo: true,
      }))
      salvarUsuarios(iniciais)
      setUsuarios(iniciais)
    } else {
      setUsuarios(salvos)
    }
  }

  function cadastrarOuAtualizar() {
    if (!novoNome.trim()) { setErro("Nome e obrigatorio"); return }
    if (!novaSenha || novaSenha.length < 4) { setErro("Senha deve ter no minimo 4 caracteres"); return }
    if (novaSenha !== confirmarSenha) { setErro("Senhas nao coincidem"); return }

    const idExistente = usuarios.find(u => u.nome.toUpperCase() === novoNome.trim().toUpperCase() && u.id !== editando)
    if (idExistente) { setErro("Ja existe um usuario com este nome"); return }

    const resultado = criarOuAtualizarUsuario({
      id: editando || novoNome.trim().toUpperCase().replace(/\s+/g, "_"),
      nome: novoNome.trim().toUpperCase(),
      roles: novoRoles,
      senha: novaSenha,
      ativo: true,
      precisaAlterarSenha,
    })

    if (resultado.ok) {
      setSucesso("Usuario salvo com sucesso")
      setNovoNome("")
      setNovoRoles(["PEDIDO"])
      setNovaSenha("")
      setConfirmarSenha("")
      setPrecisaAlterarSenha(false)
      setEditando(null)
      setErro("")
      setUsuarios(carregarUsuarios())
    } else {
      setErro(resultado.erro || "Erro ao salvar")
    }
  }

  function editarUsuario(u: UsuarioCadastro) {
    setEditando(u.id)
    setNovoNome(u.nome)
    setNovoRoles(u.roles)
    setNovaSenha("")
    setConfirmarSenha("")
    setPrecisaAlterarSenha(!!u.precisaAlterarSenha)
    setErro("")
    setSucesso("")
  }

  function excluirUsuario(id: string) {
    if (id === usuarioLogado.id) { setErro("Nao pode excluir o proprio usuario"); return }
    if (!confirm("Tem certeza que deseja excluir este usuario?")) return
    const lista = usuarios.filter(u => u.id !== id)
    salvarUsuarios(lista)
    setUsuarios(lista)
    setSucesso("Usuario excluido")
  }

  function redefinirSenha(id: string) {
    setRedefinindoId(id)
    setNovaSenhaRedef("")
    setErro("")
    setSucesso("")
  }

  function salvarNovaSenha(id: string) {
    if (!novaSenhaRedef || novaSenhaRedef.length < 4) {
      setErro("Senha deve ter no minimo 4 caracteres")
      return
    }
    const r = alterarSenha(id, novaSenhaRedef)
    if (r.ok) {
      setSucesso("Senha redefinida com sucesso")
      setRedefinindoId(null)
      setNovaSenhaRedef("")
    } else {
      setErro(r.erro || "Erro ao redefinir senha")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 md:p-8 mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black">Cadastro de Usuarios</h2>
            <p className="text-xs text-zinc-500">Somente administrador pode cadastrar e alterar senhas</p>
          </div>
          <div className="text-xs font-bold text-zinc-400 mt-1">
            {usuarios.filter(u => u.senha).length}/{usuarios.length} com senha definida
          </div>
          {usuarios.length > 0 && (
            <div className="w-full bg-zinc-200 rounded-full h-1.5 mt-1">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(usuarios.filter(u => u.senha).length / usuarios.length) * 100}%`,
                }}
              ></div>
            </div>
          )}
          {usuarios.length > 0 && usuarios.every(u => u.senha) && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 text-sm font-bold">
              ✅ Todos os usuarios tem senha definida
            </div>
          )}
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">✕</button>
        </div>

        {erro && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-bold">{erro}</div>
        )}
        {sucesso && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">{sucesso}</div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">Nome do Usuario</label>
            <input
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              placeholder="Ex: RUAN"
              className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">Funcao</label>
            <select
              multiple
              value={novoRoles}
              onChange={e => setNovoRoles(Array.from(e.target.selectedOptions, o => o.value as Role))}
              className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm"
              size={Math.min(ROLES.length, 4)}
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">Senha</label>
            <input
              type="password"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              placeholder="Min. 4 caracteres"
              className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">Confirmar Senha</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
              placeholder="Repita a senha"
              className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={precisaAlterarSenha}
                onChange={e => setPrecisaAlterarSenha(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
              />
              Obrigar este usuario a alterar a senha no proximo login
            </label>
          </div>
        </div>

        <button
          onClick={cadastrarOuAtualizar}
          className="w-full rounded-full py-3 font-black tracking-wide shadow-md text-white flex items-center justify-center gap-2 md:gap-4"
          style={{ background: "#b5000c" }}
        >
          {editando ? "💾 Atualizar Usuario" : "👤 Cadastrar Usuario"}
        </button>

        <div className="mt-6">
          <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-3">Usuarios Cadastrados</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {usuarios.map(u => (
              <div key={u.id} className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-black">
                    {u.nome.charAt(0)}
                  </span>
                  <div>
                    <div className="text-sm font-bold">{u.nome}</div>
                    <div className="text-[10px] text-zinc-500 uppercase">{ (u.roles ?? []).join(", ") }</div>
                    {u.ativo ? <span className="text-[10px] text-emerald-600 font-bold">• Ativo</span> : <span className="text-[10px] text-red-600 font-bold">• Inativo</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editarUsuario(u)}
                    className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center text-xs"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  {redefinindoId === u.id ? (
                    <>
                      <input
                        type="password"
                        value={novaSenhaRedef}
                        onChange={e => setNovaSenhaRedef(e.target.value)}
                        placeholder="Nova senha"
                        className="w-24 px-2 py-1.5 text-xs border border-amber-200 rounded-md focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                      <button
                        onClick={() => salvarNovaSenha(u.id)}
                        className="w-7 h-7 rounded-full bg-amber-600 text-white hover:bg-amber-700 flex items-center justify-center text-xs"
                        title="Salvar senha"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => setRedefinindoId(null)}
                        className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-600 hover:bg-zinc-300 flex items-center justify-center text-xs"
                        title="Cancelar"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => redefinirSenha(u.id)}
                      className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center text-xs"
                      title="Redefinir senha"
                    >
                      🔑
                    </button>
                  )}
                  {u.id !== usuarioLogado.id && (
                    <button
                      onClick={() => excluirUsuario(u.id)}
                      className="w-7 h-7 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center text-xs"
                      title="Excluir"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-200">
          <button
            onClick={onClose}
            className="w-full rounded-full py-2.5 font-bold text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
