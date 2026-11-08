# Relatório de Alterações — STAMPE

## Resumo Executivo

Foram realizadas as seguintes alterações no sistema:

1. **Remoção do botão "Minha senha" do Header** — usuários comuns não podem mais alterar a própria senha pelo botão 🔑 no cabeçalho. Apenas o administrador pode redefinir senhas de funcionários.
2. **Remoção do modal voluntário "Minha Senha"** do `App.tsx`.
3. **Correção do erro de hooks condicionais** ("Rendered more hooks than during the previous render") no `App.tsx` e `NovoPedidoModal.tsx`.
4. **Correção e ajuste do teste E2E `print.test.ts`** (impressão via PDF com Puppeteer).
5. **Adição de `data-testid` no `PedidoModal.tsx`** para suporte ao teste de automação.

Todos os **97 testes** (8 arquivos) estão passando após as alterações.

---

## 1. Remoção do botão "Minha senha" do Header

**Arquivo:** `src/components/Header.tsx`

- Removido o prop `onAlterarSenha?: () => void` da interface `HeaderProps`.
- Removido o parâmetro `onAlterarSenha` da assinatura do componente.
- Removido o botão 🔑 "Minha senha" (linha com `<span>🔑</span> Minha senha`).

**Motivo:** O usuário comum não deve alterar a própria senha. Somente o administrador pode redefinir senhas de funcionários.

---

## 2. Remoção do modal voluntário "Minha Senha" do App.tsx

**Arquivo:** `src/App.tsx`

- Removido `onAlterarSenha={() => setShowAlterarSenha(true)}` da chamada ao `<Header>`.
- Removido o estado `showAlterarSenha`, `novaSenhaPropria`, `confirmarSenhaPropria`, `erroSenhaPropria`, `sucessoSenhaPropria` e o callback `handleSalvarMinhaSenha` relacionados à autotroca de senha do usuário comum.
- Removido todo o bloco JSX do modal "Minha Senha" que permitia ao usuário alterar a própria senha.

**O que foi mantido:**
- O fluxo obrigatório de troca de senha (`precisaAlterarSenha`), onde o administrador marca o usuário para trocar a senha no próximo login ("Troca de senha obrigatória").
- O mecanismo de redefinição de senha pelo admin via `CadastroUsuarios.tsx` (botão 👥 "Usuarios" → 🔑 "Redefinir senha" por funcionário).

---

## 3. Correção do erro de hooks condicionais

### 3.1 App.tsx

**Problema:** O componente `App` executava `if (loading || !sessao) return <Login />` **antes** de chamar hooks como `usePedidos`, `useAuth`, `useConfig`, `useVisual`, `useChat`, `useToast`. Isso violava as Regras de Hooks do React (número diferente de hooks entre renders), causando o erro:

> Error: Rendered more hooks than during the previous render.

**Solução:** Separação em dois componentes:

- **`App`**: gerencia apenas a sessão (`loading`, `sessao`) e renderiza `<Login />` ou `<AppContent />`.
- **`AppContent`**: chama todos os hooks de negócio (`usePedidos`, `useAuth`, `useConfig`, `useVisual`, `useChat`, `useToast`) e renderiza toda a interface principal.

Dessa forma, cada componente sempre chama o mesmo número de hooks, independentemente do estado.

### 3.2 NovoPedidoModal.tsx

**Arquivo:** `src/components/NovoPedidoModal.tsx`

**Problema:** `if (!show) return null` estava **antes** do `useState<string[]>([])`, violando as Regras de Hooks.

**Solução:** Movido o `const [artePreviews, setArtePreviews] = useState<string[]>([])` **antes** do `if (!show) return null`.

---

## 4. Correção e ajuste do teste E2E print.test.ts

**Arquivo:** `src/print.test.ts`

O teste de impressão via PDF (Puppeteer) falhava por dois motivos:

### 4.1 Dados do pedido incompletos

O objeto `pedido` injetado no `localStorage` faltava campos obrigatórios da interface `Pedido`, fazendo com que `ehPedidoValido()` retornasse `false` e o pedido não fosse renderizado.

**Campos adicionados:**
- `vendedorId`
- `arteUrls` (substituiu `arteUrl` singular)
- `arteProducaoUrls`
- `dataPrazo`
- `prazoDias`
- `statusPrazo`

### 4.2 Sessão ausente no localStorage

O teste não injetava sessão (`stampe_user_session_v1`), então o aplicativo permanecia na tela de login e nunca renderizava os pedidos.

**Solução:** Adicionada sessão válida:
```js
localStorage.setItem('stampe_user_session_v1', JSON.stringify({ id: 'ITALO', nome: 'ITALO', roles: ['PEDIDO'] }));
```

### 4.3 Limpeza do teste

- Removido código de debug (`console.log`, `page.evaluate` de inspeção).
- Removido seletor desnecessário `[data-testid="print-os"]` (não era mais necessário após o fluxo ser simplificado).
- Mantido o timeout de 60s para o teste.

---

## 5. Adição de data-testid no PedidoModal.tsx

**Arquivo:** `src/components/PedidoModal.tsx`

Adicionados seletores de teste para automação:

- `data-testid="pedido-modal"` — elemento raiz do modal do pedido.
- `data-testid="modal-print-button"` — botão de impressão dentro do modal.

Isso permite que o teste E2E clique no pedido, abra o modal e acione a impressão de forma confiável.

---

## Resultado dos Testes

```
Test Files  8 passed (8)
Tests       97 passed (97)
```

Todos os testes passaram, incluindo:
- `print.test.ts` — Impressão via PDF (Puppeteer)
- `storage.test.ts` — Testes de persistência localStorage
- `repo.test.ts` — Testes do repositório de pedidos
- Outros 5 arquivos de teste unitário

---

## Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/components/Header.tsx` | Removido prop `onAlterarSenha` e botão 🔑 "Minha senha" |
| `src/App.tsx` | Removido modal "Minha Senha"; refatorado para `App` + `AppContent` (correção de hooks) |
| `src/components/NovoPedidoModal.tsx` | Movido `useState` antes do `if (!show) return null` |
| `src/components/PedidoModal.tsx` | Adicionado `data-testid="pedido-modal"` e `data-testid="modal-print-button"` |
| `src/print.test.ts` | Corrigido injeção de dados do pedido, sessão e fluxo do teste |

---

## Como executar os testes

```powershell
# Rodar todos os testes
npx vitest run

# Rodar apenas o teste de impressão (requer servidor na porta 3030)
npx vite --port 3030   # em um terminal
npx vitest run src/print.test.ts  # em outro terminal
```

---

## 6. Correção de parse/build errors no `PedidoModal.tsx` (04/11/2026)

**Arquivo:** `src/components/PedidoModal.tsx`

**Problema:** O parser rolldown (Vite) rejeitava a estrutura JSX do bloco `visual.mostrarArtes` com erro `"Adjacent JSX elements must be wrapped in an enclosing tag"`, impedindo o `vite build`.

**Solução:** Reescrito o bloco para usar um array de seções renderizado via IIFE, retornando um único elemento raiz `<div className="space-y-4">{sections}</div>`. Código duplicado removido. Layout de arte ajustado para eliminar espaço em branco (gap reduzido, padding compacto, overflow-auto removido, aspect-ratio ajustado de 16/10 para 4/3).

---

## 7. Priority Lock — Sistema de Reposição (04/11/2026)

**Requisito:** Quando um pedido retorna de PRODUÇÃO → IMPRESSÃO e o usuário confirma "É REPOSIÇÃO?", ele ganha prioridade e bloqueia outros pedidos de avançar.

**Arquivos alterados:**

| Arquivo | Alteração |
|---------|-----------|
| `src/domain/tipos.ts` | Campo `prioridadeLock` na interface `Pedido` |
| `src/domain/permissoes.ts` | `getPedidoPrioritario`, `podeAvancarParaArtes/Impressao/Producao`, `existePrioridadeAtiva` |
| `src/data/repo.ts` | `voltarEtapa` ativa lock em PRODUCAO→IMPRESSAO; `movimentar` limpa lock ao avançar para PRODUCAO/FINALIZADO |
| `src/hooks/usePedidos.ts` | Integração de `motivoBloqueio`, `canEnviar*` com prioridade; confirmação "É REPOSIÇÃO?" no `voltarEtapa` |
| `src/components/PedidoCard.tsx` | Badges de prioridade (🔴 PRIORIDADE REPOSIÇÃO, ✅ Reposição concluída) |
| `src/components/PedidoModal.tsx` | Botão "🔄 REPOSIÇÃO" quando etapa é PRODUCAO; indicador de prioridade ativa no header |
| `src/App.tsx` | Passa `currentUser` para o hook |

**Comportamento:** Lock ativa só em PRODUCAO→IMPRESSAO com confirmação explícita. Bloqueia outros pedidos de avançar para ARTES/IMPRESSAO/PRODUCAO. Limpa automaticamente quando o pedido prioritário retorna a PRODUCAO ou chega a FINALIZADO.

---

## 8. Remoção da seção "Arte de Produção" (04/11/2026)

**Arquivo:** `src/components/PedidoModal.tsx`

A seção "ARTE DE PRODUCAO" foi removida inteiramente do modal (produção não faz upload de arte). Restou apenas a função utilitária `removerArteProducaoUrl`, sem UI associada.

---

## 9. Botão "Criar pedido" / "Novo Pedido" restrito (04/11/2026)

**Requisito:** Usuários de Produção (ex: Magno) não devem ver o botão de criar pedido. Só aparece para role `PEDIDO` (Cadastro/Vendas) ou `ADMIN`.

**Arquivos alterados:**

| Arquivo | Alteração |
|---------|-----------|
| `src/components/Header.tsx` | Prop `canCriarPedido`; botão "Novo Pedido" só renderiza se `true` |
| `src/components/EmptyState.tsx` | Prop `canCriarPedido`; botão "Criar pedido" só renderiza se `true` |
| `src/components/PedidoList.tsx` | Prop `canCriarPedido` repassado para `EmptyState` |
| `src/App.tsx` | Cálculo `canCriarPedido = roles.includes("PEDIDO") || admin`; repassado para `Header` e `PedidoList` |

---

## 10. Usuários de PRODUCAO veem todos os pedidos e podem voltar etapa (04/11/2026)

**Arquivos alterados:**

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/usePedidos.ts` | `pedidosVisiveis` filtra por `vendedorId` apenas quando role é `PEDIDO` |
| `src/domain/permissoes.ts` | `podeAcessarPedido` não restringe por `vendedorId` para não-PEDIDO; `podeVoltarEtapa` aceita `ADMIN` e `PRODUCAO` |
| `src/App.tsx` | Condição de exibição do botão "↩ VOLTAR UMA ETAPA" atualizada para aceitar `ADMIN` ou `PRODUCAO` |
| `src/components/PedidoModal.tsx` | Botão mostra "🔄 REPOSIÇÃO" quando etapa é PRODUCAO, "↩ VOLTAR UMA ETAPA" nas demais |

---

## 11. Botão "PERSONALIZAR" duplicado removido da linha de fluxo (04/11/2026)

**Arquivo:** `src/components/Tabs.tsx`

Removido o segundo botão "🎨 PERSONALIZAR" que aparecia na linha de abas do fluxo. Mantido apenas o do Header (linha de cima).

---

## Resultado dos Testes (04/11/2026)

```
tsc --noEmit  → sem erros
vite build    → compilado com sucesso
```

Todos os **48 módulos** transformados e renderizados sem erro.
