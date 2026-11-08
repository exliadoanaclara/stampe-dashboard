# 📋 RESUMO DA SESSÃO - STAMPE Dashboard
**Data:** 25/10/2026  
**Projeto:** E:\ruan (Vite + React + Supabase/LocalStorage)  
**Objetivo:** Ajustes no fluxo de entrega, finalização, arte múltipla, fila e prioridade URGENTE

---

## 🗂️ Estrutura do projeto (relevante)

```
src/
├── domain/
│   ├── tipos.ts          # Tipos: Etapa, Role, Pedido, Aba, etc.
│   ├── regras.ts         # semArte(), ETAPA_ANTERIOR, etc.
│   ├── permissoes.ts     # canEdit*, canEnviar*, podeFinalizar, etc.
│   ├── fila.ts           # motivoBloqueio() - regras de fila
│   └── progresso.ts      # getProgresso()
├── hooks/
│   └── usePedidos.ts     # Lógica principal de pedidos e permissões
├── data/
│   ├── repo.ts           # LocalRepo - movimentar(), voltarEtapa(), salvar no LS
│   ├── storage.ts        # localStorage helpers
│   └── supabase.ts       # SupabaseRepo (mapeamento DB)
├── components/
│   ├── PedidoModal.tsx   # Modal detalhado do pedido (arte, botões, seções)
│   ├── NovoPedidoModal.tsx # Criação de pedido (vários arquivos de arte)
│   ├── PedidoCard.tsx    # Card do pedido na lista
│   ├── PrintOS.tsx       # Comprovante de impressão
│   ├── Tabs.tsx          # Abas de navegação (inclui HISTORICO)
│   └── Filtros.tsx       # Filtros de busca
└── test/
    └── factories.ts      # criarPedidoBase() para testes
```

---

## ✅ O que foi implementado nesta sessão

### 1. Entrega depois de finalizado (FINALIZADO → ENTREGA)
**Problema:** Quando o pedido ia direto para FINALIZADO (pulando a entrega), não havia como colocá-lo para entrega depois. O modal só mostrava "Pedido concluído".

**Arquivos alterados:**
- `src/domain/permissoes.ts` — `canEnviarParaEntrega()` agora aceita etapa `FINALIZADO` além de `FINALIZACAO` (para PEDIDO/ADMIN)
- `src/data/repo.ts` — Transição `FINALIZADO → ENTREGA` liberada na validação de `movimentar()`
- `src/components/PedidoModal.tsx` — Quando `etapa === "FINALIZADO"`, exibe botão "🚚 ENVIAR PARA ENTREGA • 90%" em vez de rótulo estático
- `src/domain/permissoes.test.ts` — Novos testes cobrindo `canEnviarParaEntrega` para `FINALIZADO`

**Fluxo resultante:** Pedido finalizado → clica em "Enviar para entrega" (vai para ENTREGA, 90%) → conclui entrega (vai para FINALIZADO, 100%).

---

### 2. Aba HISTÓRICO (pedidos finalizados separados dos ativos)
**Problema:** Pedidos finalizados ficavam misturados com os ativos nas abas PEDIDO/IMPRESSÃO/FINALIZAÇÃO/ENTREGA.

**Arquivos alterados:**
- `src/domain/tipos.ts` — Novo tipo `Aba = "TODOS" | "PEDIDO" | "IMPRESSAO" | "FINALIZACAO" | "ENTREGA" | "HISTORICO"`
- `src/hooks/usePedidos.ts` — State `aba` agora é `Aba`; filtro `filtered` separa FINALIZADO apenas na aba HISTORICO; TODOS exclui FINALIZADO
- `src/components/Tabs.tsx` — Troca aba "FINALIZADOS" por "HISTORICO" (cor #0f766e); tipos atualizados

**Resultado:** Pedidos finalizados (cliente pegou ou entregue) aparecem apenas na aba HISTORICO, saindo da lista de ativos.

---

### 3. Múltiplas imagens de arte (arteUrls e arteProducaoUrls)
**Problema:** Só era possível anexar 1 imagem de arte. O usuário queria colocar 3 ou mais.

**Arquivos alterados:**
- `src/domain/tipos.ts` — `arteUrl: string | null` → `arteUrls: string[]`; novo `arteProducaoUrls: string[]`
- `src/test/factories.ts` — `arteUrls: ["data:image/png;base64,abc"]`, `arteProducaoUrls: []`
- `src/hooks/usePedidos.ts` — `criarPedido()` inicializa arrays; `substituirArte()` e `substituirArteProducao()` aceitam `string[]`; novas permissões `canEditArteUrl`, `canEditArteProducao`
- `src/domain/permissoes.ts` — `canEditArteUrl()` (vendedor/admin, etapa PEDIDO); `canEditArteProducao()` (impressão/admin, etapas IMPRESSAO/FINALIZACAO)
- `src/data/supabase.ts` — Mapeamento `arte_urls` / `arte_producao_urls` (com fallback para campos antigos)
- `src/components/NovoPedidoModal.tsx` — Input `multiple`, galeria de preview, remover imagens individuais antes de criar
- `src/components/PedidoModal.tsx` — Duas galerias separadas: ARTE ORIGINAL DO CLIENTE (etapa PEDIDO/IMPRESSÃO) e ARTE DE PRODUÇÃO (etapa IMPRESSÃO/FINALIZAÇÃO/FINALIZADO); download individual por imagem; botão excluir (✕) em cada imagem; estados vazios corrigidos para mostrar botão de envio em IMPRESSÃO
- `src/components/PedidoCard.tsx` — Mostra primeira arte com selo "+N" quando há várias
- `src/components/PrintOS.tsx` — Mostra arte original ou de produção com selo "+N"
- `src/domain/regras.ts` — `semArte()` agora checa `arteUrls.length === 0`
- `src/data/repo.ts` — `novoPedidoPadrao()` garante `arteUrls ?? []` e `arteProducaoUrls ?? []` (correção de erro `Cannot read properties of undefined`)

**Resultado:** Vendedor pode anexar várias imagens na criação; impressão/arte finalista pode enviar várias imagens de produção; cada uma tem download e excluir individual.

---

### 4. Fila liberada para múltiplos pedidos simultâneos
**Problema:** A fila era "estrita" — só permitia 1 pedido por etapa (Impressão, Finalização, Entrega). Se já tinha um pedido na Impressão, o vendedor não podia enviar outro.

**Arquivos alterados:**
- `src/domain/fila.ts` — Removidos bloqueios de `ocupado` (estação ocupada) para IMPRESSÃO, FINALIZAÇÃO e ENTREGA. Mantidas verificações de ordem numérica (não pular a fila) e de pedido cancelado.

**Resultado:** Vários pedidos podem estar simultaneamente em IMPRESSÃO, FINALIZAÇÃO e ENTREGA. Só bloqueia se houver pedido com número menor esperando na etapa anterior.

---

### 5. Prioridade URGENTE passa na frente
**Problema:** Pedidos urgentes ficavam na ordem normal de número.

**Arquivos alterados:**
- `src/domain/fila.ts` — Nova função `pedidoNaFrente()`: se o pedido atual é URGENTE, só fica atrás de outro URGENTE com número menor. Se não é urgente, respeita ordem normal.

**Resultado:** Pedidos URGENTE pulam na frente de BAIXA/NORMAL/ALTA com número menor.

---

## 🧪 Testes
- **91 testes passando** (7 arquivos de teste)
- Único teste que falha sempre: `src/print.test.ts` (requer servidor puppeteer em localhost:3030, não relacionado às alterações)
- TypeScript: `tsc -b --noEmit` → sem erros
- Build: `vite build` → compilado com sucesso

---

## 🎯 Fluxo completo atual

```
CRIAR PEDIDO (PEDIDO, 0%)
  ↓ Vendedor anexa arteUrls (várias imagens)
ENVIAR PARA IMPRESSÃO (IMPRESSÃO, 50%)
  ↓ Impressão vê arte original do cliente; arte finalista envia arteProducaoUrls (várias imagens)
ENVIAR PARA FINALIZAÇÃO (FINALIZAÇÃO, 75%)
  ↓ Finalização trabalha (vários simultâneos)
FINALIZAR PEDIDO (FINALIZADO, 100%)  ← pode pular entrega se cliente buscar
  ↓ Se precisar entregar depois:
ENVIAR PARA ENTREGA (ENTREGA, 90%)    ← liberado de FINALIZADO
ENTREGA CONCLUÍDA (FINALIZADO, 100%)
  ↓ Pedido vai para aba HISTÓRICO
```

---

## 🔄 Como continuar amanhã

1. **Abra o projeto:** `E:\ruan`
2. **Rode o dev:** `npm run dev` (ou `yarn dev` / `pnpm dev`)
3. **Teste as funcionalidades** listadas acima
4. **Possíveis melhorias futuras:**
   - Limite máximo de pedidos simultâneos por etapa (usuário mencionou "até 4 na finalização")
   - Limite máximo de imagens por pedido
   - Botão para reabrir pedido do histórico de volta para ativo
   - Notificações quando muda de etapa
   - Export/backup de pedidos (já existe em storage.ts)

---

## 📁 Arquivos modificados nesta sessão

| Arquivo | O que mudou |
|---|---|
| `src/domain/tipos.ts` | Tipo `Aba`, campos `arteUrls`, `arteProducaoUrls` |
| `src/domain/fila.ts` | `motivoBloqueio` sem bloqueio de ocupação; `pedidoNaFrente` com prioridade URGENTE |
| `src/domain/permissoes.ts` | `canEnviarParaEntrega` aceita FINALIZADO; `canEditArteUrl`; `canEditArteProducao` |
| `src/domain/regras.ts` | `semArte()` usa `arteUrls.length` |
| `src/hooks/usePedidos.ts` | Arrays de arte, novas permissões, `substituirArteProducao`, filtro HISTORICO |
| `src/data/repo.ts` | Transição FINALIZADO→ENTREGA; defaults `arteUrls`/`arteProducaoUrls` |
| `src/data/supabase.ts` | Mapeamento `arte_urls` / `arte_producao_urls` |
| `src/components/PedidoModal.tsx` | Galerias de arte, botão entrega em FINALIZADO, excluir imagem, estados vazios |
| `src/components/NovoPedidoModal.tsx` | Upload múltiplo, preview galeria, remover antes de criar |
| `src/components/PedidoCard.tsx` | Mostra arte com selo +N |
| `src/components/PrintOS.tsx` | Mostra arte com selo +N |
| `src/components/Tabs.tsx` | Aba HISTORICO no lugar de FINALIZADOS |
| `src/test/factories.ts` | `arteUrls` / `arteProducaoUrls` |
| `src/domain/permissoes.test.ts` | Testes para FINALIZADO → ENTREGA |
| `src/domain/fila.test.ts` | Testes atualizados para múltiplos simultâneos |
| `src/domain/regras.test.ts` | Testes semArte atualizados |
| `RESUMO_SESSAO.md` | Este arquivo |

---

**Último build:** `dist/` compilado com sucesso em 27/10/2026.

---

## 🆕 Sessão 27/10/2026 — Requisitos do Cliente Implementados (Fase 1 & 2)

### Requisitos consolidados em `REQUISITOS_CLIENTE.md`
Salvo todos os requisitos da gravação do cliente, incluindo:
- Lista definitiva de funcionários por função (Ruan/Henrique ADMIN; Juan, Grazielli, Ítalo, Teles, Leonardo Vendas; Teles, Henrique Impressão; Magno, Bia, Reinaldo Produção)
- Prazo de 3 dias úteis com cores Verde/Laranja/Vermelho
- Formatos de arte: PDF, CDR, TIF + imagens
- Renomear FINALIZAÇÃO → PRODUÇÃO
- Histórico de auditoria (quem, quando, o que mudou)
- Acesso por vendedor (só vê seus pedidos; Admin vê todos)

### 1. Login por funcionário com senha
**Arquivos alterados:**
- `src/domain/tipos.ts` — Novo tipo `UsuarioAcesso`, `UserState` com senha, `USUARIOS_CADASTRADOS` atualizado com senhas e lista completa
- `src/data/storage.ts` — `salvarSessao()`, `carregarSessao()`, `limparSessao()`, chave `stampe_user_session_v1`
- `src/App.tsx` — Tela de `Login` component, verificação de sessão ao iniciar, logout
- `src/components/Header.tsx` — Botão "Sair" para admin

### 2. Renomear FINALIZAÇÃO → PRODUÇÃO
**Arquivos alterados:**
- `src/domain/tipos.ts` — `Etapa`, `Role`, `Aba`, `ProgressConfig` usam `PRODUCAO`
- `src/domain/regras.ts` — `ETAPA_ANTERIOR`, `ehPedidoValido` usam `PRODUCAO` e `infosProducao`
- `src/domain/fila.ts` — `motivoBloqueio` usa `PRODUCAO`
- `src/domain/permissoes.ts` — Todas as funções usam `PRODUCAO` e `userId` para controle de dono
- `src/data/repo.ts` — `movimentar`, `novoPedidoPadrao` usam `PRODUCAO`, `infosProducao`
- `src/hooks/usePedidos.ts` — Todas as operações usam `PRODUCAO`
- `src/components/PedidoModal.tsx`, `PedidoCard.tsx`, `Tabs.tsx`, `Personalizar.tsx`, `ConfigProgresso.tsx`, `PrintOS.tsx` — Todos atualizados

### 3. Controle de acesso por vendedor (dono do pedido)
- `src/domain/permissoes.ts` — `podeAcessarPedido()` verifica se `vendedorId === userId` ou role é ADMIN
- Cada vendedor vê SO SEUS pedidos; Admin (Ruan) vê TODOS
- `src/hooks/usePedidos.ts` — Filtra `pedidosVisiveis` por `vendedorId` quando não é admin

### 4. Prazo de 3 dias úteis com cores Verde/Laranja/Vermelho
- `src/domain/regras.ts` — `calcularPrazo()` (3 dias úteis, pula finais de semana), `calcularStatusPrazo()` (VERDE/LARANJA/Vermelho)
- `src/domain/tipos.ts` — `Pedido` ganha `dataPrazo`, `prazoDias`, `statusPrazo`, `StatusPrazo` type
- `src/hooks/usePedidos.ts` — `statusPrazo()` callback, `criarPedido` calcula `dataPrazo` automaticamente

### 5. Suporte a arquivos PDF, CDR, TIF nas artes
**Arquivos alterados:**
- `src/domain/tipos.ts` — Nova constante `ARTE_ACEITOS` (`.pdf,.cdr,.tif,.tiff,image/*,...`)
- `src/components/NovoPedidoModal.tsx` — Input de upload aceita `ARTE_ACEITOS`; preview mostra ícone 📄 para não-imagens; texto mudou de "imagem(ns)" para "arquivo(s)"
- `src/components/PedidoModal.tsx` — Inputs de upload (4 locais) aceitam `ARTE_ACEITOS`; galerias de arte original e de produção mostram ícone 📄 + extensão para PDF/CDR/TIF; download usa extensão real do arquivo
- `src/components/PedidoCard.tsx` — Pré-visualização do card mostra ícone 📄 + extensão para não-imagens

**Resultado:** O usuário pode anexar arquivos PDF, CDR (CorelDRAW), TIF, TIFF e imagens nas artes do pedido. A galeria exibe preview da imagem quando for imagem, ou um ícone de documento com a extensão quando for PDF/CDR/TIF. O download preserva a extensão original do arquivo.

### 6. Histórico de alterações de admin
- `permissoes.podeAlterarAposFinalizado()` — Só ADMIN pode alterar após finalizado
- `repo.ts` — `etapaHistorico` e `historico` preservam quem, quando e o que mudou

**Testes:** 96 passando (7 arquivos). Único falha preexistente: `src/print.test.ts` (requer puppeteer em localhost:3030, não relacionado).
TypeScript: `tsc --noEmit` → sem erros. Build: `vite build` → compilado com sucesso.

---

## 🆕 Sessão 27/10/2026 (cont.) — Fase 3: Suporte a arquivos PDF/CDR/TIF nas artes

### 1. Formatos de arquivo aceitos nas artes
**Arquivos alterados:**
- `src/domain/tipos.ts` — Nova constante `ARTE_ACEITOS` (`.pdf,.cdr,.tif,.tiff,image/*,...`)
- `src/components/NovoPedidoModal.tsx` — Input de upload aceita `ARTE_ACEITOS`; preview mostra ícone 📄 para não-imagens; texto mudou de "imagem(ns)" para "arquivo(s)"
- `src/components/PedidoModal.tsx` — Inputs de upload (4 locais) aceitam `ARTE_ACEITOS`; galerias de arte original e de produção mostram ícone 📄 + extensão para PDF/CDR/TIF; download usa extensão real do arquivo
- `src/components/PedidoCard.tsx` — Pré-visualização do card mostra ícone 📄 + extensão para não-imagens

### Resultado
O usuário pode anexar arquivos PDF, CDR, CDR (CorelDRAW), TIF, TIFF e imagens nas artes do pedido. A galeria exibe preview da imagem quando for imagem, ou um ícone de documento com a extensão quando for PDF/CDR/TIF. O download preserva a extensão original do arquivo.

---

**Próximos passos sugeridos (Fases 4-5):**
- Fase 4: Ajustes visuais (pedidos maiores, interface mais limpa), personalização restrita a admin
- Fase 5: Link individual do cliente, etapa de costura, relatórios gerenciais

---

## 🆕 Sessão 27/10/2026 (cont.) — Fase 4: Interface mais limpa e pedidos maiores

### 1. Cards de pedido maiores e mais legíveis
**Arquivos alterados:**
- `src/components/PedidoCard.tsx` — Cards aumentados:
  - Padding: p-4 → p-6 (mais espaço interno)
  - Barra de etapa: h-1.5 → h-2 (mais visível)
  - Barra de progresso: h-1.5 → h-2
  - Textos: text-xs/text-[10px] → text-sm/text-[11px]/text-[12px] (mais legíveis em monitores grandes)
  - Prévia da arte: h-[92px] → h-[120px] (maior)
  - Ícones e badges aumentados
  - Hover: shadow-lg → shadow-xl (mais destaque)
  - Rodapé: py-2.5 → py-3, texto text-xs → text-sm

### Resultado
Os cards de pedido ficam maiores, com mais espaço entre as informações e textos mais legíveis, atendendo ao pedido do cliente de "pedidos maiores e mais visíveis" em monitores grandes.

---

**Próximos passos sugeridos (Fase 5):**
- Link individual do cliente
- Etapa de costura (celular)
- Relatórios gerenciais
- Personalização restrita a admin (interface)

---

## 🆕 Sessão 27/10/2026 (cont.) — Sistema de Usuários e Senhas

### 1. Login com senha obrigatória
**Arquivos alterados:**
- `src/App.tsx` — Tela de `Login` refeita para usar autenticação com senha via `useAuth`
- `src/hooks/useAuth.ts` — Reescrito para usar `login(id, senha)`, `logout()`, `isAuthenticated`, `carregarUsuarios()`
- `src/data/storage.ts` — Novas funções: `carregarUsuarios()`, `salvarUsuarios()`, `criarOuAtualizarUsuario()`, `autenticarUsuario()`, `alterarSenha()`, chave `stupe_usuarios_v1`
- `src/domain/tipos.ts` — `UsuarioCadastrado` agora sem senha hardcoded (senhas são gerenciadas pelo storage)
- `src/components/Header.tsx` — Dropdown de troca de usuário **removido** (era inseguro). Usuário logado mostrado como informação estática. Botão "Usuarios" (somente admin) para acessar o cadastro.

### 2. Cadastro de usuários (somente admin)
**Novo arquivo:**
- `src/components/CadastroUsuarios.tsx` — Tela modal onde o admin pode:
  - Cadastrar novos usuários com nome, função e senha
  - Editar usuário existente
  - Redefinir senha de qualquer usuário
  - Excluir usuários (exceto o próprio)
  - Ver lista de todos os usuários cadastrados

### 3. Primeiro acesso
- Nenhum usuário tem senha cadastrada inicialmente
- O admin (Ruan ou Henrique) deve fazer o primeiro login, ir em "👥 Usuarios" e definir a senha de cada funcionário
- Cada funcionário então faz login com seu próprio usuário e senha

### 4. Nomes e cargos corretos (conforme lista do cliente)
- **ADMIN:** RUAN, HENRIQUE
- **VENDAS:** JUAN, GRAZIELLI, ITALO, TELES, LEONARDO
- **IMPRESSÃO:** HENRIQUE (Impressao), TELES (Impressao)
- **PRODUÇÃO:** MAGNO, BIA, REYNALDO

### 5. Forçar troca de senha (bloqueio até definir senha)
**Arquivos alterados:**
- `src/domain/tipos.ts` — `UserState` ganha `precisaAlterarSenha?: boolean`; `UsuarioCadastro` ganha `precisaAlterarSenha?: boolean`
- `src/data/storage.ts` — `definirSenhaPrimeiroAcesso()` e `alterarSenha()` limpam `precisaAlterarSenha`; nova função `marcarParaAlterarSenha(id, obrigatorio)`
- `src/hooks/useAuth.ts` — `login()` e `criarSenhaPrimeiroAcesso()` carregam `precisaAlterarSenha` no estado do usuário
- `src/App.tsx` — Se `currentUser.precisaAlterarSenha === true`, o sistema é **bloqueado** e mostra modal obrigatório de troca de senha (não pode ser fechado sem definir); após sucesso, limpa o flag e libera o acesso
- `src/components/Header.tsx` — Botão "🔑 Minha senha" para qualquer usuário logado alterar sua própria senha
- `src/components/CadastroUsuarios.tsx` — Checkbox "Obrigar este usuario a alterar a senha no proximo login" ao cadastrar/editar; contador e barra de progresso de usuarios com senha definida; mensagem "✅ Todos os usuarios tem senha definida" quando completo

### 6. Correcao de erros de build (FINALIZACAO → PRODUCAO)
**Arquivos alterados:**
- `src/domain/tipos.ts` — `LimitesEtapa` ganha `FINALIZADO?: number | null`; `LIMITES_PADRAO` atualizado
- `src/hooks/useConfig.ts` — `isValidConfig` usa `PRODUCAO` em vez de `FINALIZACAO`
- `src/data/storage.ts` — `carregarLimites` itera `["PEDIDO", "IMPRESSAO", "PRODUCAO", "ENTREGA"]`
- `src/components/Tabs.tsx` — `stats` tipagem usa `producao` em vez de `finalizacao`
- `src/components/PrintOS.tsx` — `previsaoFinalizacao` → `previsaoProducao`; `infosFinalizacao` → `infosProducao`
- `src/data/supabase.ts` — `previsaoFinalizacao` → `previsaoProducao`; `infosFinalizacao` → `infosProducao`; ordem de etapas usa `PRODUCAO`; `mapPedidoFromDB` inclui `vendedorId`
- `src/components/PedidoModal.tsx` — Remove import unused `StatusPrazo`
- `src/hooks/usePedidos.ts` — Remove import unused `podeAcessar`; `setLimites` removido (não usado)
- `src/test/factories.ts` — Remove `vendedorId` duplicado
- `src/App.tsx` — `canEditFinalizacao` → `canEditProducao`; `canEnviarParaFinalizacao` → `canEnviarParaProducao`; `onEnviarParaFinalizacao` → `onEnviarParaProducao`; `onAddInfoFinalizacao` → `onAddInfoProducao`; `setPedidos` adicionado ao destructuring

**Testes:** 96 passando (7 arquivos). Único falha preexistente: `src/print.test.ts` (requer puppeteer em localhost:3030, não relacionado).
TypeScript: `tsc -b --noEmit` → sem erros. Build: `vite build` → compilado com sucesso em dist/.

---

## 🎯 Próximos passos sugeridos (guardados para sessão futura)

- **Link individual do cliente** — consumidor acessa somente o próprio pedido por link individual, sem ver a fila inteira (prioridade baixa)
- **Relatórios gerenciais** — relatórios de produção, prazos e desempenho
- **Etapa de costura (celular)** — acesso pela etapa própria via celular

---

## 🆕 Sessão 04/11/2026 — Correções de Build, Prioridade de Reposição e Permissões

### 1. Correção de parse/build errors no `PedidoModal.tsx`
**Problema:** O parser rolldown (Vite) não aceitava o fragment/condicional `visual.mostrarArtes` com múltiplos elementos irmãos, gerando erro `"Adjacent JSX elements must be wrapped in an enclosing tag"` e falha no `vite build`.

**Arquivo alterado:** `src/components/PedidoModal.tsx`

**Solução:** Reescrito o bloco `visual.mostrarArtes` para usar um array de seções renderizado via IIFE, retornando um único `<div className="space-y-4">{sections}</div>`. Código duplicado removido. Layout de arte ajustado para eliminar espaço em branco (gap reduzido, padding compacto, overflow-auto removido, aspect ratio ajustado).

### 2. Sistema de Priority Lock (Reposição) — implementação completa
**Requisito:** Quando um pedido retorna de PRODUÇÃO → IMPRESSÃO e o usuário confirma "É REPOSIÇÃO?", o pedido ganha prioridade e bloqueia outros pedidos de avançar.

**Arquivos alterados:**
- `src/domain/tipos.ts` — Campo `prioridadeLock` na interface `Pedido`
- `src/domain/permissoes.ts` — `getPedidoPrioritario`, `podeAvancarParaArtes/Impressao/Producao`, `existePrioridadeAtiva`
- `src/data/repo.ts` — `voltarEtapa` ativa lock em PRODUCAO→IMPRESSAO; `movimentar` limpa lock ao avançar para PRODUCAO/FINALIZADO
- `src/hooks/usePedidos.ts` — Integração de `motivoBloqueio`, `canEnviar*` com prioridade; confirmação "É REPOSIÇÃO?" no `voltarEtapa`
- `src/components/PedidoCard.tsx` — Badges de prioridade (🔴 PRIORIDADE REPOSIÇÃO, ✅ Reposição concluída)
- `src/components/PedidoModal.tsx` — Botão "🔄 REPOSIÇÃO" quando etapa é PRODUCAO; indicador de prioridade ativa no header
- `src/App.tsx` — Passa `currentUser` para o hook

**Comportamento:** Lock ativa só em PRODUCAO→IMPRESSAO com confirmação explícita. Bloqueia outros pedidos de avançar para ARTES/IMPRESSAO/PRODUCAO. Limpa automaticamente quando o pedido prioritário retorna a PRODUCAO ou chega a FINALIZADO.

### 3. "Arte de Produção" removida completamente
**Arquivo alterado:** `src/components/PedidoModal.tsx`

A seção "ARTE DE PRODUCAO" foi removida inteiramente do modal (produção não faz upload de arte). Restou apenas a função utilitária `removerArteProducaoUrl` (linha ~163), sem UI associada.

### 4. Botão "Criar pedido" / "Novo Pedido" restrito a vendedores e admin
**Requisito:** Usuários de Produção (ex: Magno) não devem ver o botão de criar pedido. Só aparece para quem tem role `PEDIDO` (Cadastro/Vendas) ou `ADMIN`.

**Arquivos alterados:**
- `src/components/Header.tsx` — Prop `canCriarPedido`; botão "Novo Pedido" só renderiza se `true`
- `src/components/EmptyState.tsx` — Prop `canCriarPedido`; botão "Criar pedido" só renderiza se `true`
- `src/components/PedidoList.tsx` — Prop `canCriarPedido` repassado para `EmptyState`
- `src/App.tsx` — Cálculo `canCriarPedido = roles.includes("PEDIDO") || admin`; repassado para `Header` e `PedidoList`

### 5. Usuários de PRODUCAO veem todos os pedidos (não apenas próprios)
**Problema:** Magno (produção) não via nenhum pedido porque o filtro por `vendedorId` restringia a apenas pedidos criados por ele. Produção não cria pedidos, então via "Nenhum pedido encontrado".

**Arquivos alterados:**
- `src/hooks/usePedidos.ts` — `pedidosVisiveis` agora filtra por `vendedorId` apenas quando o usuário tem role `PEDIDO`. Outros roles (ARTES, PRODUCAO, IMPRESSAO, ENTREGA) veem todos os pedidos.
- `src/domain/permissoes.ts` — `podeAcessarPedido` não restringe por `vendedorId` para roles não-PEDIDO.

### 6. Usuários de PRODUCAO podem voltar etapa
**Arquivos alterados:**
- `src/domain/permissoes.ts` — `podeVoltarEtapa` agora aceita `ADMIN` e `PRODUCAO`
- `src/App.tsx` — Condição de exibição do botão "↩ VOLTAR UMA ETAPA" atualizada para aceitar `ADMIN` ou `PRODUCAO`
- `src/components/PedidoModal.tsx` — Botão mostra "🔄 REPOSIÇÃO" quando etapa é PRODUCAO, "↩ VOLTAR UMA ETAPA" nas demais

### 7. Botão "PERSONALIZAR" duplicado removido da linha de fluxo
**Arquivo alterado:** `src/components/Tabs.tsx`

Removido o segundo botão "🎨 PERSONALIZAR" que aparecia na linha de abas do fluxo. Mantido apenas o do Header (linha de cima).

### Resultado verificado
- `tsc --noEmit` → sem erros
- `vite build` → compilado com sucesso
- `git diff` → somente alterações autorizadas, sem arquivos adicionais não relacionados

---
