import { useState, useEffect, useCallback, useRef } from "react"
import {
  usePedidos,
  useConfig,
  useVisual,
  useChat,
  useToast,
} from "./hooks"
import { useAuth } from "./hooks/useAuth"
import {
  Header,
  Tabs,
  Filtros,
  PedidoList,
  PedidoModal,
  NovoPedidoModal,
  PrintOS,
  Personalizar,
  ConfigProgresso,
  Chat,
  Toast,
  CadastroUsuarios,
  PedidoPublico,
  CentroComando,
  PainelCostura,
  ModalEntrega,
} from "./components"
import type { Pedido, UserState, Role } from "./domain/tipos"
import { USUARIOS_CADASTRADOS } from "./domain/tipos"
import { fmtNumero } from "./domain/datas"
import * as storage from "./data/storage"
import { montarBackup, baixarBackup, lerBackupArquivo } from "./data/storage"

function Login({ onLogin }: { onLogin: (ok: boolean, usuario?: { id: string; nome: string; roles: string[] }) => void }) {
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [usuarioId, setUsuarioId] = useState("")
  const [usuarios, setUsuarios] = useState<{ id: string; nome: string; roles: string[] }[]>([])
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false)

  useEffect(() => {
    const salvos = storage.carregarUsuarios()
    if (salvos.length === 0) {
      const iniciais = USUARIOS_CADASTRADOS.map(u => ({
        id: u.id,
        nome: u.nome,
        roles: u.roles,
        senha: "",
        ativo: true,
      }))
      storage.salvarUsuarios(iniciais)
      setUsuarios(iniciais.map(u => ({ id: u.id, nome: u.nome, roles: u.roles })))
    } else {
      setUsuarios(salvos.map(u => ({ id: u.id, nome: u.nome, roles: u.roles })))
    }
  }, [])

  useEffect(() => {
    if (!usuarioId) { setPrimeiroAcesso(false); return }
    setPrimeiroAcesso(storage.usuarioSemSenha(usuarioId))
  }, [usuarioId])

  const tentarLogin = (id: string, senhaDigitada: string) => {
    ;(window as any).stampeLogin?.(id, senhaDigitada, primeiroAcesso, (ok: boolean, usuario?: { id: string; nome: string; roles: string[] }) => {
      if (ok && usuario) onLogin(true, usuario)
      else setErro("Usuario ou senha invalidos")
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-md">
      <div className="stampe-glass rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative">
        <div className="text-center mb-6">
          <div className="text-[30px] font-black leading-none stampe-title-glow">STAMPE</div>
          <div className="text-sm text-zinc-500 mt-1">Sistema de Gest�o de Pedidos</div>
        </div>
        {erro && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
            {erro}
          </div>
        )}
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-700">Usu�rio</label>
            <select
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/75 border border-zinc-200/80 rounded-xl outline-none font-bold text-sm"
            >
              <option value="">Selecione o usuario</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nome} ({(u.roles ?? []).join(", ")})</option>
              ))}
            </select>
          </div>
          {primeiroAcesso ? (
            <div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700">Criar sua senha (primeiro acesso)</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/75 border border-zinc-200/80 rounded-xl outline-none font-bold text-sm"
                  placeholder="Min. 4 caracteres"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700">Confirmar senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/75 border border-zinc-200/80 rounded-xl outline-none font-bold text-sm"
                  placeholder="Repita a senha"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Voce esta criando sua senha pela primeira vez.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-700">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/75 border border-zinc-200/80 rounded-xl outline-none font-bold text-sm"
                placeholder="Digite sua senha"
              />
            </div>
          )}
          <button
            onClick={() => {
              if (!usuarioId || !senha) { setErro("Preencha todos os campos"); return }
              tentarLogin(usuarioId, senha)
            }}
            className="w-full rounded-full py-3.5 font-black tracking-wide shadow-md text-white flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_24px_rgba(181,0,12,0.55)] hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "#b5000c" }}
          >
            <span>{primeiroAcesso ? "??" : "??"}</span> {primeiroAcesso ? "Criar senha e entrar" : "Acessar sistema"}
          </button>
        </form>
      </div>
    </div>
  )
}

function AppContent({ sessao, onLogout }: { sessao: UserState; onLogout: () => void }) {
  const { logout } = useAuth()
  const { config, setConfig, resetConfig } = useConfig()
  const { visual, setVisual, resetVisual } = useVisual()
  const { showChat, setShowChat, chatTexto, setChatTexto, chatNaoLidas, chatBoxRef, enviarChat } = useChat(sessao)
  const { toast, setToast } = useToast()
  const [pagina, setPagina] = useState<"PEDIDOS" | "PERSONALIZAR">("PEDIDOS")
  const [showNovoPedido, setShowNovoPedido] = useState(false)
  const [showPrintOS, setShowPrintOS] = useState<Pedido | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [showPedidoPublico, setShowPedidoPublico] = useState(false)
  const [pedidoPublicoToken, setPedidoPublicoToken] = useState<string | null>(null)
  const [showCentroComando, setShowCentroComando] = useState(false)
  const [showPainelCostura, setShowPainelCostura] = useState(false)
  const [showModalEntrega, setShowModalEntrega] = useState(false)
  const [entregaSelecionada, setEntregaSelecionada] = useState<Pedido | null>(null)
  const printScheduled = useRef(false)
  const inputBackupRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showPrintOS && !printScheduled.current) {
      printScheduled.current = true
      window.print()
      setTimeout(() => {
        setShowPrintOS(null)
        printScheduled.current = false
      }, 0)
    }
  }, [showPrintOS])

  const currentUser = sessao

  const {
    setSelectedId, selected, editMode, setEditMode,
    showHistorico, setShowHistorico, previsaoEdit,
    tempInfoImp, setTempInfoImp, tempInfoFin, setTempInfoFin,
    tempInfoEntrega, setTempInfoEntrega, tempInfoCostura, setTempInfoCostura,
    carregando,
    filtered, stats, atendentes, aba, setAba, busca, setBusca, filtroAtendente, setFiltroAtendente,
    canEditResumo, canEnviarParaArtes, canEnviarParaImpressao, canEnviarParaProducao, canEnviarParaCostura, canEnviarParaEntrega, canFinalizar,
    canEditImpressao, canEditArtes, canEditProducao, canEditEntrega, canEditArteUrl, canEditArteArte, canEditArteProducao, prog, motivoBloqueio,
    criarPedido, salvarEdicao, enviarParaArtes, enviarParaImpressao, enviarParaProducao, enviarParaCostura, enviarParaEntrega, finalizarPedido, gerarTokenAcompanhamento, revogarTokenAcompanhamento,
    voltarEtapa, reabrirPedido, cancelarPedido, podeEntregaConcluida, entregaConcluida, substituirArte, substituirArteProducao, addInfoImpressao, addInfoArtes, addInfoProducao, addInfoEntrega,
    salvarPrevisaoImp, salvarPrevisaoFin, salvarPrevisaoEntrega, editarPrevisao, setPedidos,
  } = usePedidos(currentUser, config, visual)

  const [showCadastroUsuarios, setShowCadastroUsuarios] = useState(false)
  const [usuariosSemSenha, setUsuariosSemSenha] = useState<string[]>([])
  const [showAlterarSenha, setShowAlterarSenha] = useState(false)
  const [tempInfoArtes, setTempInfoArtes] = useState("")
  const [novaSenhaPropria, setNovaSenhaPropria] = useState("")
  const [confirmarSenhaPropria, setConfirmarSenhaPropria] = useState("")
  const [erroSenhaPropria, setErroSenhaPropria] = useState("")
  const [sucessoSenhaPropria, setSucessoSenhaPropria] = useState("")

  useEffect(() => {
    const todos = storage.carregarUsuarios()
    const semSenha = todos.filter(u => u.senha === "").map(u => u.nome)
    setUsuariosSemSenha(semSenha)
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    onLogout()
  }, [logout, onLogout])

  const handleSalvarMinhaSenha = useCallback(() => {
    if (!novaSenhaPropria || novaSenhaPropria.length < 4) {
      setErroSenhaPropria("Senha deve ter no minimo 4 caracteres")
      return
    }
    if (novaSenhaPropria !== confirmarSenhaPropria) {
      setErroSenhaPropria("Senhas nao coincidem")
      return
    }
    const r = storage.alterarSenha(currentUser.id, novaSenhaPropria)
    if (r.ok) {
      setSucessoSenhaPropria("Senha alterada com sucesso")
      setNovaSenhaPropria("")
      setConfirmarSenhaPropria("")
      setErroSenhaPropria("")
      setShowAlterarSenha(false)
      setTimeout(() => setSucessoSenhaPropria(""), 3000)
    } else {
      setErroSenhaPropria(r.erro || "Erro ao alterar senha")
    }
  }, [novaSenhaPropria, confirmarSenhaPropria, currentUser.id])

  useEffect(() => {
    if (currentUser.nome && (currentUser.roles ?? []).includes("PEDIDO")) {
      const event = new Event("user-sync")
      window.dispatchEvent(event)
    }
  }, [currentUser.nome, currentUser.roles])

  const handleEnviarParaArtes = useCallback(async () => {
    if (selected) {
      await enviarParaArtes(selected, currentUser)
      setToast(`Pedido No ${fmtNumero(selected.numero)} enviado para ARTES`)
    }
  }, [selected, enviarParaArtes, currentUser, setToast])

  const handleEnviarParaImpressao = useCallback(async () => {
    if (selected) {
      await enviarParaImpressao(selected, currentUser)
      setToast(`Pedido No ${fmtNumero(selected.numero)} enviado para IMPRESSAO`)
    }
  }, [selected, enviarParaImpressao, currentUser, setToast])

  const handleEnviarParaProducao = useCallback(async () => {
    if (selected) {
      await enviarParaProducao(selected, currentUser)
      setToast(`Pedido No ${fmtNumero(selected.numero)} enviado para PRODUCAO`)
    }
  }, [selected, enviarParaProducao, currentUser, setToast])

  const handleEnviarParaCostura = useCallback(async () => {
    if (selected) {
      await enviarParaCostura(selected, currentUser)
      setToast(`Pedido No ${fmtNumero(selected.numero)} enviado para COSTURA`)
    }
  }, [selected, enviarParaCostura, currentUser, setToast])

  const handleEnviarParaEntrega = useCallback(async () => {
    if (selected) {
      await enviarParaEntrega(selected, currentUser)
      setToast(`Pedido No ${fmtNumero(selected.numero)} enviado para ENTREGA`)
    }
  }, [selected, enviarParaEntrega, currentUser, setToast])

  const handleEntregaConcluida = useCallback(async () => {
    if (selected) {
      setEntregaSelecionada(selected)
      setShowModalEntrega(true)
    }
  }, [selected])

  const handleConfirmarEntrega = useCallback(async (dados: {
    entreguePor?: string
    dataEntrega?: string
    entregaSituacao?: string
    entregaPagamento?: string
    entregaAssinatura?: string
    observacoes?: string
  }) => {
    if (selected) {
      await entregaConcluida(selected, currentUser, dados)
      setShowModalEntrega(false)
      setEntregaSelecionada(null)
      setToast(`Pedido No ${fmtNumero(selected.numero)} entrega CONCLUIDA`)
    }
  }, [selected, entregaConcluida, currentUser, setToast])

  const handleFinalizar = useCallback(async () => {
    if (selected) {
      await finalizarPedido(selected, currentUser)
      setToast(`Pedido No ${fmtNumero(selected.numero)} FINALIZADO`)
    }
  }, [selected, finalizarPedido, currentUser, setToast])

  const handleVoltarEtapa = useCallback(async () => {
    if (selected) {
      await voltarEtapa(selected, currentUser)
      setToast(`Pedido No ${fmtNumero(selected.numero)} voltou uma etapa`)
    }
  }, [selected, voltarEtapa, currentUser, setToast])

  const handleReabrir = useCallback(async () => {
    if (selected) {
      await reabrirPedido(selected, currentUser)
      setToast(`Pedido No ${fmtNumero(selected.numero)} reaberto � volta para ativo`)
    }
  }, [selected, reabrirPedido, currentUser, setToast])

  const handleCancelar = useCallback(async () => {
    if (selected) {
      await cancelarPedido(selected, currentUser)
      setToast(`Pedido No ${fmtNumero(selected.numero)} cancelado`)
    }
  }, [selected, cancelarPedido, currentUser, setToast])
  const handleGerarLink = useCallback(async () => {
    if (!selected) return
    const token = await gerarTokenAcompanhamento(selected, currentUser)
    if (token) {
      setPedidoPublicoToken(token)
      setShowPedidoPublico(true)
      setToast(`Link gerado: ${window.location.origin}/acompanhamento?token=${token}`)
    }
  }, [selected, gerarTokenAcompanhamento, currentUser, setToast])

  const handleRevogarLink = useCallback(() => {
    if (!selected) return
    revogarTokenAcompanhamento(selected)
    setShowPedidoPublico(false)
    setPedidoPublicoToken(null)
    setToast("Link de acompanhamento revogado")
  }, [selected, revogarTokenAcompanhamento, setToast])


  const handleExportarBackup = useCallback(() => {
    const pedidos = storage.carregarPedidos()
    const backup = montarBackup(pedidos, config, visual)
    baixarBackup(backup)
    setToast(`Backup exportado: ${pedidos.length} pedido(s)`)
  }, [config, visual, setToast])

  const handleImportarBackup = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dados = await lerBackupArquivo(file)
      const r = storage.salvarPedidos(dados.pedidos)
      if (!r.ok) { setToast("Erro ao importar backup: " + r.erro); return }
      setPedidos(dados.pedidos)
      setToast(`Backup importado: ${dados.pedidos.length} pedido(s)`)
    } catch (err: any) {
      setToast("Falha ao importar backup: " + err.message)
    }
    e.target.value = ""
  }, [setPedidos, setToast])

  const handleSalvarEdicao = useCallback((formData: FormData) => {
    if (selected) salvarEdicao(selected, formData, currentUser.nome)
  }, [selected, salvarEdicao, currentUser.nome])

  const handleNovoPedidoSubmit = useCallback((form: {
    cliente: string; servico: string; atendente: string; telefone: string; quantidade: string; valor: string;
    dataInicio: string; previsaoConclusao: string; observacoes: string; arteUrls: string[];
    prioridade: string; itens: string;
  }) => {
    const itens: { descricao: string; quantidade: number; unidade: string }[] = form.itens
      .split("�")
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => {
        const partes = s.split(/\s+/)
        const qtd = Number(partes[0]) || 1
        const un = partes.slice(1).join(" ") || "UN"
        const desc = partes.slice(1).join(" ") || s
        return { descricao: desc, quantidade: qtd, unidade: un }
      })
    criarPedido({
      cliente: form.cliente,
      servico: form.servico,
      atendente: form.atendente,
      telefone: form.telefone,
      quantidade: form.quantidade,
      valor: form.valor,
      dataInicio: form.dataInicio,
      previsaoConclusao: form.previsaoConclusao,
      observacoes: form.observacoes,
      arteUrls: form.arteUrls ?? [],
      prioridade: (form.prioridade || "NORMAL") as "BAIXA" | "NORMAL" | "ALTA" | "URGENTE",
      itens,
    })
    setShowNovoPedido(false)
  }, [criarPedido])

  const handleSubstituirArte = useCallback((urls: string[]) => {
    if (selected) substituirArte(selected, urls, currentUser.nome)
  }, [selected, substituirArte, currentUser.nome])

  const handleSubstituirArteArte = useCallback((urls: string[]) => {
    if (selected) {
      setPedidos(prev => prev.map(x => x.id === selected.id ? {
        ...x, arteArteUrls: [...x.arteArteUrls, ...urls], dataAtualizacao: new Date().toISOString(),
        historico: [{ id: Math.random().toString(36).slice(2), campo: "Arte preparada", anterior: x.arteArteUrls.length ? `${x.arteArteUrls.length} imagem(ens)` : "(sem arte)", novo: `${x.arteArteUrls.length + urls.length} imagem(ens)`, usuario: currentUser.nome, data: new Date().toISOString() }, ...x.historico],
      } : x))
    }
  }, [selected, currentUser.nome])

  const handleSubstituirArteProducao = useCallback((urls: string[]) => {
    if (selected) substituirArteProducao(selected, urls, currentUser.nome)
  }, [selected, substituirArteProducao, currentUser.nome])

  const onAddInfoImpressao = useCallback(() => {
    if (selected) addInfoImpressao(selected)
  }, [selected, addInfoImpressao])

  const onAddInfoArtes = useCallback(() => {
    if (selected) addInfoArtes(selected)
  }, [selected, addInfoArtes])

  const onAddInfoProducao = useCallback(() => {
    if (selected) addInfoProducao(selected)
  }, [selected, addInfoProducao])

  const onSalvarPrevisaoImp = useCallback(() => {
    if (selected) salvarPrevisaoImp(selected)
  }, [selected, salvarPrevisaoImp])

  const onSalvarPrevisaoFin = useCallback(() => {
    if (selected) salvarPrevisaoFin(selected)
  }, [selected, salvarPrevisaoFin])

  const onSalvarPrevisaoEntrega = useCallback(() => {
    if (selected) salvarPrevisaoEntrega(selected)
  }, [selected, salvarPrevisaoEntrega])

  const onAddInfoEntrega = useCallback(() => {
    if (selected) addInfoEntrega(selected)
  }, [selected, addInfoEntrega])

  const onSalvarPrevisaoCostura = useCallback(() => {
    if (selected) salvarPrevisaoCostura(selected)
  }, [selected, salvarPrevisaoCostura])

  const onAddInfoCostura = useCallback(() => {
    if (selected) addInfoCostura(selected)
  }, [selected, addInfoCostura])

  const cor2 = visual.corHeader2
  const ehAdmin = (currentUser.roles ?? []).includes("ADMIN")
  const canCriarPedido = (currentUser.roles ?? []).includes("PEDIDO") || ehAdmin

  return (
    <div className="min-h-screen text-zinc-800 print-root-reset no-print flex flex-col" style={{ background: visual.marcaUrl && visual.marcaCobrir ? `url(${visual.marcaUrl}) center / cover no-repeat` : "#ffffff" }}>
        {carregando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-zinc-200 border-t-red-600 rounded-full animate-spin" />
              <div className="font-bold text-zinc-900">Carregando pedidos...</div>
            </div>
          </div>
        )}
        {!carregando ? (
          <>
          {visual.marcaUrl && visual.marcaCobrir && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none print-hide" style={{ zIndex: -1, opacity: visual.marcaOpacidade / 100 }}>
            <img src={visual.marcaUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <Header
            user={currentUser}
            visual={visual}
            onPaginaChange={setPagina}
            onShowConfig={() => setShowConfig(true)}
            onShowNovo={() => setShowNovoPedido(true)}
            onCadastroUsuarios={ehAdmin ? () => setShowCadastroUsuarios(true) : undefined}
            onShowCentroComando={ehAdmin ? () => setShowCentroComando(true) : undefined}
            onShowPainelCostura={() => setShowPainelCostura(true)}
            onLogout={handleLogout}
            canCriarPedido={canCriarPedido}
          />
          {ehAdmin && usuariosSemSenha.length > 0 && (
            <div className="max-w-[1280px] mx-auto px-4 mb-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl mt-0.5">??</span>
                <div>
                  <div className="text-sm font-bold text-amber-800">Primeiro acesso � defina as senhas</div>
                  <div className="text-xs text-amber-700 mt-1">
                    Os seguintes funcion�rios ainda n�o t�m senha: <strong>{usuariosSemSenha.join(", ")}</strong>.
                  </div>
                  <button
                    onClick={() => setShowCadastroUsuarios(true)}
                    className="mt-2 text-xs font-bold text-amber-700 underline underline-offset-2 hover:text-amber-900"
                  >
                    Ir para Cadastro de Usuarios
                  </button>
                </div>
              </div>
            </div>
          )}
          <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 pb-10">
            {pagina === "PEDIDOS" && (
              <div>
                <Tabs
                  aba={aba}
                  pagina={pagina}
                  stats={stats}
                  cor2={cor2}
                  onAbaChange={setAba}
                  onPaginaChange={setPagina}
                />
                <Filtros
                  busca={busca}
                  onBuscaChange={setBusca}
                  filtroAtendente={filtroAtendente}
                  onFiltroAtendenteChange={setFiltroAtendente}
                  atendentes={atendentes}
                  onLimpar={() => { setBusca(""); setFiltroAtendente("") }}
                />
                <PedidoList
                  pedidos={filtered}
                  prog={prog}
                  cor2={cor2}
                  visual={{ mostrarObs: visual.mostrarObs, mostrarArte: visual.mostrarArte }}
                  onSelect={setSelectedId}
                  onNovoPedido={() => setShowNovoPedido(true)}
                  canCriarPedido={canCriarPedido}
                />
              </div>
            )}
            {pagina === "PERSONALIZAR" && (
              <Personalizar
                visual={visual}
                config={config}
                onVisualChange={setVisual}
                onConfigChange={setConfig}
                onResetVisual={resetVisual}
                onResetConfig={resetConfig}
                onClose={() => setPagina("PEDIDOS")}
              />
            )}
          </main>
          {pagina === "PEDIDOS" && (
            <div className="max-w-[1280px] mx-auto px-4 flex justify-center gap-2 mb-2">
              <button
                onClick={handleExportarBackup}
                className="text-xs md:text-sm bg-white border border-zinc-200 rounded-full px-3 py-1.5 hover:bg-zinc-50 flex items-center gap-1.5 font-bold"
              >
                <span>??</span> Exportar backup
              </button>
              <button
                onClick={() => inputBackupRef.current?.click()}
                className="text-xs md:text-sm bg-white border border-zinc-200 rounded-full px-3 py-1.5 hover:bg-zinc-50 flex items-center gap-1.5 font-bold"
              >
                <span>??</span> Importar backup
              </button>
              <input
                ref={inputBackupRef}
                type="file"
                accept=".json"
                hidden
                onChange={handleImportarBackup}
              />
            </div>
          )}
          <footer className="max-w-[1280px] mx-auto px-4 pb-6 text-center text-xs text-zinc-400 print-hide-layout">
            STAMPE � Sistema de Gest�o de Pedidos � Fuso: America/Sao_Paulo
          </footer>
          {currentUser.precisaAlterarSenha && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              {showAlterarSenha && (
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 mx-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black">Troca de senha obrigatoria</h2>
                  </div>
                  <p className="text-sm text-zinc-600 mb-6">Voce precisa definir uma nova senha para continuar.</p>
                  {erroSenhaPropria && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-bold">{erroSenhaPropria}</div>
                  )}
                  {sucessoSenhaPropria && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">{sucessoSenhaPropria}</div>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700">Nova senha</label>
                      <input
                        type="password"
                        value={novaSenhaPropria}
                        onChange={e => setNovaSenhaPropria(e.target.value)}
                        placeholder="Min. 4 caracteres"
                        className="w-full px-3 py-2.5 bg-white/75 border border-zinc-200/80 rounded-xl outline-none font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700">Confirmar nova senha</label>
                      <input
                        type="password"
                        value={confirmarSenhaPropria}
                        onChange={e => setConfirmarSenhaPropria(e.target.value)}
                        placeholder="Repita a senha"
                        className="w-full px-3 py-2.5 bg-white/75 border border-zinc-200/80 rounded-xl outline-none font-bold text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSalvarMinhaSenha}
                    className="w-full rounded-full py-2.5 font-bold tracking-wide shadow-md text-white flex items-center justify-center gap-2"
                    style={{ background: "#b5000c" }}
                    disabled={!novaSenhaPropria || !confirmarSenhaPropria}
                  >
                    <span>??</span> Definir senha e continuar
                  </button>
                </div>
              )}
              {!showAlterarSenha && (
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 mx-4 text-center">
                  <h2 className="text-xl font-black mb-2">Troca de senha obrigatoria</h2>
                  <p className="text-sm text-zinc-600 mb-6">Clique abaixo para definir sua senha e acessar o sistema.</p>
                  <button
                    onClick={() => setShowAlterarSenha(true)}
                    className="w-full rounded-full py-2.5 font-bold tracking-wide shadow-md text-white flex items-center justify-center gap-2 mx-auto max-w-xs"
                    style={{ background: "#b5000c" }}
                  >
                    <span>??</span> Definir senha
                  </button>
                </div>
              )}
            </div>
          )}
          {selected && (
            <PedidoModal
              selected={selected}
              prog={prog(selected)}
              cor2={cor2}
              visual={visual}
              config={config}
              canEditResumo={canEditResumo(selected)}
              editMode={editMode}
              setEditMode={setEditMode}
              showHistorico={showHistorico}
              setShowHistorico={setShowHistorico}
              tempInfoImp={tempInfoImp}
              setTempInfoImp={setTempInfoImp}
              tempInfoArtes={tempInfoArtes}
              setTempInfoArtes={setTempInfoArtes}
              tempInfoFin={tempInfoFin}
              setTempInfoFin={setTempInfoFin}
              tempInfoEntrega={tempInfoEntrega}
              setTempInfoEntrega={setTempInfoEntrega}
              previsaoEdit={previsaoEdit}
              canEditImpressao={canEditImpressao(selected)}
              canEditArtes={canEditArtes(selected)}
              canEditProducao={canEditProducao(selected)}
              canEditEntrega={canEditEntrega(selected)}
              canEditArteUrl={canEditArteUrl(selected)}
              canEditArteArte={canEditArteArte(selected)}
              canEditArteProducao={canEditArteProducao(selected)}
              canEnviarParaArtes={canEnviarParaArtes(selected)}
              canEnviarParaImpressao={canEnviarParaImpressao(selected)}
              canEnviarParaProducao={canEnviarParaProducao(selected)}
              canEnviarParaCostura={canEnviarParaCostura(selected)}
              canEnviarParaEntrega={canEnviarParaEntrega(selected)}
              canFinalizar={canFinalizar(selected)}
              podeVoltarEtapa={selected.etapa !== "PEDIDO" && ((currentUser.roles ?? []).includes("ADMIN") || (currentUser.roles ?? []).includes("PRODUCAO"))}
              podeReabrir={(currentUser.roles ?? []).includes("ADMIN")}
              podeCancelar={(currentUser.roles ?? []).includes("ADMIN")}
              podeEntregaConcluida={podeEntregaConcluida(selected)}
              motivoBloqueio={(p, d) => motivoBloqueio(p, d)}
              onClose={() => setSelectedId(null)}
              onPrint={() => setShowPrintOS(selected)}
              onSalvarEdicao={handleSalvarEdicao}
              onEnviarParaArtes={handleEnviarParaArtes}
              onEnviarParaImpressao={handleEnviarParaImpressao}
              onEnviarParaProducao={handleEnviarParaProducao}
              onEnviarParaCostura={handleEnviarParaCostura}
              onEnviarParaEntrega={handleEnviarParaEntrega}
              onEntregaConcluida={handleEntregaConcluida}
              onFinalizar={handleFinalizar}
              onReabrir={handleReabrir}
              onVoltarEtapa={handleVoltarEtapa}
              onCancelar={handleCancelar}
              onSubstituirArte={handleSubstituirArte}
              onSubstituirArteArte={handleSubstituirArteArte}
              onSubstituirArteProducao={handleSubstituirArteProducao}
              onAddInfoImpressao={onAddInfoImpressao}
              onAddInfoArtes={onAddInfoArtes}
              onAddInfoProducao={onAddInfoProducao}
              onAddInfoEntrega={onAddInfoEntrega}
              onSalvarPrevisaoImp={onSalvarPrevisaoImp}
              onSalvarPrevisaoFin={onSalvarPrevisaoFin}
              onSalvarPrevisaoEntrega={onSalvarPrevisaoEntrega}
              tokenAcompanhamento={selected?.tokenAcompanhamento}
              tokenAcompanhamentoAtivo={selected?.tokenAcompanhamentoAtivo}
              onGerarLink={handleGerarLink}
              onRevogarLink={handleRevogarLink}
              onEditarPrevisao={editarPrevisao}
            />
          )}
          <NovoPedidoModal
            show={showNovoPedido}
            onClose={() => setShowNovoPedido(false)}
            onSubmit={handleNovoPedidoSubmit}
            user={currentUser}
            cor2={cor2}
          />
          <ConfigProgresso
            config={config}
            onConfigChange={setConfig}
            onResetConfig={resetConfig}
            onClose={() => setShowConfig(false)}
            show={showConfig}
          />
          {showPedidoPublico && pedidoPublicoToken && (
            <PedidoPublico
              token={pedidoPublicoToken}
              pedidos={pedidos}
              onClose={() => setShowPedidoPublico(false)}
            />
          )}
          {showCentroComando && (
            <CentroComando
              user={currentUser}
              pedidos={pedidos}
              onClose={() => setShowCentroComando(false)}
            />
          )}
          {showPainelCostura && (
            <PainelCostura
              user={currentUser}
              pedidos={pedidos}
              onClose={() => setShowPainelCostura(false)}
              enviarParaEntrega={enviarParaEntrega}
              addInfoCostura={addInfoCostura}
              tempInfoCostura={tempInfoCostura}
              setTempInfoCostura={setTempInfoCostura}
            />
          )}
          {showModalEntrega && entregaSelecionada && (
            <ModalEntrega
              show={showModalEntrega}
              pedido={entregaSelecionada}
              onClose={() => { setShowModalEntrega(false); setEntregaSelecionada(null) }}
              onConfirmar={handleConfirmarEntrega}
            />
          )}
          {showPrintOS && <PrintOS selected={showPrintOS} visual={visual} cor2={cor2} />}
          <Chat
            chat={[]}
            showChat={showChat}
            setShowChat={setShowChat}
            chatTexto={chatTexto}
            setChatTexto={setChatTexto}
            chatNaoLidas={chatNaoLidas}
            chatBoxRef={chatBoxRef}
            enviarChat={enviarChat}
            user={currentUser}
          />
          {showCadastroUsuarios && (
            <CadastroUsuarios
              onClose={() => setShowCadastroUsuarios(false)}
              usuarioLogado={currentUser}
            />
          )}
          <Toast message={toast} onClose={() => setToast(null)} />
        </>
      ) : null}
      </div>
  )
}

export default function App() {
  const [sessao, setSessao] = useState<UserState | null>(null)
  const [loading, setLoading] = useState(true)

  const { login, criarSenhaPrimeiroAcesso } = useAuth()

  const handleLogout = useCallback(() => {
    setSessao(null)
  }, [])

  useEffect(() => {
    const s = storage.carregarSessao()
    setSessao(s)
    setLoading(false)
  }, [])

  // Garante que o corpo da p�gina fique branco no sistema (ap�s login)
  // e escuro apenas na tela de login. O fundo cinem�tico fica fora do #root.
  useEffect(() => {
    if (sessao) {
      document.body.style.background = '#ffffff'
      document.body.style.backgroundImage = 'none'
    } else {
      document.body.style.background = '#0a0a0a'
    }
  }, [sessao])

  useEffect(() => {
    ;(window as any).stampeLogin = (id: string, senha: string, primeiroAcesso: boolean, cb: (ok: boolean, usuario?: { id: string; nome: string; roles: string[] }) => void) => {
      if (primeiroAcesso) {
        const r = criarSenhaPrimeiroAcesso(id, senha)
        if (r.ok) {
          const s = storage.carregarSessao()
          cb(true, s ? { id: s.id, nome: s.nome, roles: s.roles } : { id, nome: "", roles: ["PEDIDO"] })
        } else {
          cb(false)
        }
      } else {
        const r = login(id, senha)
        if (r.ok && sessao) {
          cb(true, sessao)
        } else {
          cb(false)
        }
      }
    }
  }, [login, criarSenhaPrimeiroAcesso, sessao])

  if (loading || !sessao) {
    return <Login onLogin={(ok, usuario) => { if (ok && usuario) setSessao({ id: usuario.id, nome: usuario.nome, roles: usuario.roles as Role[] }) }} />
  }

  return (
    <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', background: '#ffffff' }}>
      <AppContent sessao={sessao} onLogout={handleLogout} />
    </div>
  )
}
