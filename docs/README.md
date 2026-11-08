# STAMPE - Sistema de Pedidos

Sistema web completo para gerenciamento de pedidos - Setor Agro/Estampas
Baseado no documento interno fornecido.

## Como iniciar

1. Abra o projeto: `E:\ruan`
2. No terminal: `npm run dev` (ou `yarn dev` / `pnpm dev`)
3. Abra http://localhost:5173

## Build de producao

```
npm run build
npm run preview  -> http://localhost:4173
```

## Fluxo atual

```
PEDIDO (0%) -> IMPRESSAO (50%) -> PRODUCAO (75%) -> ENTREGA (90%) -> FINALIZADO (100%) -> HISTORICO
```

**📍 Ponto de parada atual: Artes a fazer (ARTE)**
O vendedor cria o pedido e anexa os arquivos de arte (PDF, CDR, TIF, imagens). A etapa ARTE é onde o pedido fica aguardando a preparação da arte antes de seguir para Impressão.

## Etapas

| Etapa | Percentual | Responsável |
|-------|-----------|-------------|
| PEDIDO | 0% | Vendas |
| IMPRESSAO | 50% | Impressão |
| PRODUCAO | 75% | Produção |
| ENTREGA | 90% | Entrega |
| FINALIZADO | 100% | — |
| HISTORICO | — | Consulta de finalizados |

## Permissoes

- **Admin (Ruan, Henrique):** vê todos os pedidos, gerencia usuários, configurações, pode alterar após finalizado
- **Vendas (Juan, Grazielli, Italo, Teles, Leonardo):** cria e edita só seus pedidos, envia para Impressao
- **Impressao (Teles, Henrique):** acessa pedidos e arquivos para imprimir, baixa arte
- **Producao (Magno, Bia, Reynaldo):** acompanha e atualiza etapas de producao

Cada login acessa somente seus pedidos (exceto Admin que vê todos).

## Funcionalidades implementadas

- Fluxo PEDIDO → IMPRESSAO → PRODUCAO → ENTREGA → FINALIZADO → HISTORICO
- Múltiplas imagens/arquivos de arte (arteUrls, arteProducaoUrls) com upload múltiplo, preview e download individual
- Suporte a PDF, CDR, TIF, TIFF e imagens nas artes
- Aba HISTORICO separada (pedidos finalizados saem da lista ativa)
- Entrega depois de finalizado (FINALIZADO → ENTREGA)
- Fila com múltiplos pedidos simultâneos por etapa
- Prioridade URGENTE passa na frente
- Login por funcionário com senha; cadastro de usuários (somente admin)
- Prazo de 3 dias úteis com cores Verde/Laranja/Vermelho
- Auditoria de alterações (quem, quando, o que mudou) — somente admin pode alterar após finalizado
- Forçar troca de senha no primeiro acesso
- Cards de pedido maiores e mais legíveis (monitores grandes)
- Export/backup de pedidos (storage.ts)
- Progresso por etapa personalizavel (ConfigProgresso)
- Modal com header sticky (fixo no topo), conteúdo scrollável e padding para barra de tarefas
- PDF preview inline via `<iframe>` nas galerias de arte
- Download de arquivos preservando extensão original (hash `#ext` em blob URLs)
- Fullscreen viewer ao clicar em qualquer imagem/PDF do modal
- Priority lock (Reposição): pedido volta de PRODUCAO → IMPRESSAO com confirmação "É REPOSIÇÃO?", ganha prioridade e bloqueia outros pedidos de avançar até concluir; lock limpa ao voltar a PRODUCAO ou chegar a FINALIZADO
- Botão "Criar pedido"/"Novo Pedido" restrito a vendedores (role PEDIDO) e ADMIN
- Usuários de PRODUCAO veem todos os pedidos (não apenas próprios) e podem voltar etapa
- Seção "Arte de Produção" removida do modal (produção não faz upload de arte)
- Botão "Personalizar" duplicado removido da linha de fluxo

## Testes

```
npx vitest run
```

- **97 testes passando** (8 arquivos)
- TipoScript: `tsc --noEmit` sem erros
- Build: `vite build` compilado com sucesso
- Único teste com falha pré-existente: `src/print.test.ts` (requer servidor Puppeteer em localhost:3030, não relacionado ao código)

## Estrutura do projeto

```
src/
├── domain/       tipos.ts, datas.ts, fila.ts, permissoes.ts, progresso.ts, regras.ts
├── data/         repo.ts, storage.ts, supabase.ts
├── hooks/        useAuth.ts, useChat.ts, useConfig.ts, usePedidos.ts, useToast.ts, useVisual.ts
├── components/   Header, Tabs, Filtros, PedidoCard, PedidoList, PedidoModal, NovoPedidoModal,
│                 PrintOS, Personalizar, ConfigProgresso, ErrorBoundary, EmptyState, Toast,
│                 CadastroUsuarios, index.ts
└── test/         factories.ts
```

## Documentos (pasta docs/)

| Arquivo | Conteúdo |
|---------|----------|
| README.md | Este arquivo |
| RESUMO_SESSAO.md | Resumo da última sessão (25/10/2026 + continuações 27/10/2026) |
| REQUISITOS_CLIENTE.md | Requisitos do cliente e o que foi implementado/falta |
| RELATORIO_ALTERACOES.md | Relatório detalhado de alterações |
| FASE0_PROGRESSO.md | Checkpoint Fase 0 (concluída) |
| FASE1_PROGRESSO.md | Checkpoint Fase 1 (concluída) |
| FASE2_PROGRESSO.md | Checkpoint Fase 2 (concluída) |
| APRESENTACAO_PROJETO_STAMPE.md | Apresentação do projeto de migração Supabase |
| AUDITORIA_STAMPE.md | Auditoria técnica (snapshot congelado 26/09/2026) |
| CONVERSA.md | Resumo da conversa inicial (25/09/2026) |
| PROMPT_MESTRE.md | Documento mestre de continuidade (snapshot congelado) |
| STAMPE_REFERENCIA_COMPLETA.md | Referência consolidada do projeto |
| stampe-flow-philosophy.md | Filosofia de design do Stampe Flow |

## Proximo passo sugerido

### Continuar fluxo de Artes (ARTE)

**Status recente (04/11/2026):** Correções de build, sistema de priority lock (Reposição), permissões de criar pedido e visualização de pedidos para Produção implementadas e testadas.

**O que foi corrigido:**
- Seletor de arquivo: substituído `document.querySelector('input[type="file"]')` por `ref`s próprios em cada input — antes pegava o input de backup `.json` e mostrava apenas JSON
- Arte original do cliente: condição de agora inclui `"ARTES"` na etapa, assim a arte enviada pelo vendedor aparece na etapa ARTES
- Botão "Enviar arte preparada": agora aparece disponível sem precisar clicar em `Editar` (usa `canEditArteArte` sem `editMode`)
- Extensão de arquivo: `extensaoDeArte()` lê o MIME type do data URL para mostrar `.pdf`, `.cdr`, `.png`, `.tif` corretamente em vez de base64 gigante
- Modal: posicionado com `max-h-[95dvh]` + `overflow-y-auto` no container

**Resultado:**
- `tsc --noEmit` → sem erros
- `vitest run` → 101 testes passando (única falha: `print.test.ts` pré-existente, requer servidor Puppeteer em localhost:3030)
- Tipos de arquivo suportados: PDF, CDR, TIF, TIFF e imagens (PNG, JPEG, SVG)

**Próximo passo:** Testar se artes aparecem corretamente ao criar um novo pedido e enviar para a etapa ARTES, e verificar se o botão "Enviar arte preparada" funciona com PDF, CDR, TIF e PNG.

Continuar a partir da etapa **Artes a fazer (ARTE)** — validar anexos, prévias e downloads de arquivos de arte antes de enviar para Impressão.

Desenvolvido com Vite + React + TypeScript + Tailwind
