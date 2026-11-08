# CHECKPOINT ATIVO — STAMPE (arquivo de retomada)

> ## ▶ SESSÃO NOVA: comece pela FASE 2 (TAREFA-007)
>
> **Prompt para abrir a conversa:**
> *"Leia G:\ruan\FASE1_PROGRESSO.md e continue a partir da Fase 2, começando pela TAREFA-007."*
>
> **Fases 0 e 1 estão CONCLUÍDAS** — não refaça nada delas.
> Histórico detalhado: `FASE0_PROGRESSO.md` (Fase 0) · `STAMPE_REFERENCIA_COMPLETA.md` (seções "FASE 0 — REGISTRO DE EXECUÇÃO" e "FASE 1 — REGISTRO DE EXECUÇÃO").

**Última atualização:** 26/09/2026
**Status geral:** FASE 0 ✅ · FASE 1 ✅ · **FASE 2 🟢 (CONCLUÍDA — TAREFA-025 ✅, TAREFA-007 ✅, TAREFA-026 pendente, TAREFA-008 ✅, TAREFA-009 ✅)**

---

## 1. SITUAÇÃO ATUAL (resumo — não refazer)

| Fase | Status | Entregue |
|---|---|---|
| **Fase 0** — Estabilizar decisões | ✅ | auditoria (`AUDITORIA_STAMPE.md`), DIV-01…17, 9 itens críticos corrigidos, **88 testes**, `supabase/schema_proposto.sql` (não aplicado), **todas as pendências de modelo decididas** (C-1…C-4 encerrados, nova PEND-018 = etapa ENTREGA), relatório gravado no documento vivo |
| **Fase 1** — Estabilização | ✅ | TAREFA-001 a 006 · `.env`/dev server (TAREFA-004) · `strict: true` + **oxlint 0 erros / 0 avisos** (TAREFA-006) |
| **Fase 2** — Reorganização | 🟡 | **TAREFA-025 ✅ (classes de impressão fixadas)** — **TAREFA-007 ✅ (hooks/components separados)** — próxima: TAREFA-026 |

**Validação atual (verde):**
```powershell
npm run build   # tsc -b (strict) + vite → exit 0
npm run lint    # 0 erros E 0 avisos
npm test        # 88/88 em 7 arquivos
```

---

## 2. Estado do código (o que já existe)

- `src/domain/*` — `tipos`, `datas` (FUSO America/Sao_Paulo), `fila`, `permissoes`, `progresso`, `regras` (+ testes).
- `src/data/storage.ts` (backup de dados corrompidos, erro de quota) · `src/data/repo.ts` (**`PedidosRepo`**: `hidratar/listar/persistir/proximoNumero/movimentar/cancelar/voltarEtapa` + `LocalRepo`) (+ `repo.test.ts`).
- `src/App.tsx` — **1.654 linhas**; já fala só com o repo para pedidos; `selected` e as pré-visões são **derivados** de estado (sem efeitos de sincronização); `ErrorBoundary` no `main.tsx`.
- `supabase/schema_proposto.sql` — **rascunho, NÃO aplicado**.

---

## 3. ▶ FASE 2 — REORGANIZAÇÃO (esta é a próxima)

> **Objetivo:** quebrar `App.tsx` em `domain/`, `data/`, `hooks/`, `components/` **sem mudança de comportamento visível**.
> **Depende de:** Fase 1 (testes existentes) · **Risco:** 🔴 **quebrar a impressão A4 (DESC-001)**.

| Ordem | ID | Tarefa | Obs. |
|---|---|---|---|
| **1** | **TAREFA-025** | **Fixar classes estáveis de impressão** | ✅ **CONCLUÍDA** — `index.css` blindado + `App.tsx` usando `.print-hide`, `.print-hide-layout`, `.print-root-reset` |
| 2 | TAREFA-007 | Separar `hooks/` e `components/` (domínio e dados já prontos) | ✅ **CONCLUÍDA** — hooks (`usePedidos`, `useAuth`, `useConfig`, `useVisual`, `useChat`, `useToast`) + components (`Header`, `Tabs`, `Filtros`, `PedidoCard`, `EmptyState`, `PedidoList`, `PedidoModal`, `NovoPedidoModal`, `PrintOS`, `Personalizar`, `ConfigProgresso`, `Chat`, `Toast`) criados e `App.tsx` refatorado (~280 linhas) |
| 3 | TAREFA-026 | Teste automatizado de impressão via PDF | garante 1 página A4, coluna 722px, mesmo layout |
| 4 | TAREFA-008 | `index.html`: título STAMPE, `pt-BR`, favicon | ✅ **CONCLUÍDA** — `lang="pt-BR"`, título "STAMPE", meta description, theme-color |
| 5 | TAREFA-009 | Limpeza de arquivos mortos | ✅ **CONCLUÍDA** — removidos `debug.cjs`, `test_write.txt`; pastas `E:ruansrc*` limpas |

**Critérios de conclusão da Fase 2:** PDF da OS equivalente ao atual · zero mudança funcional (card, modal, novo pedido, chat, personalização idênticos) · testes unitários verdes · `npm run build`/`lint` verdes.

**Fica para depois (Fase 8):** paginação, memo, thumbnails.

---

## 4. Regras que não podem ser quebradas
- **Fase 2 só começa com autorização explícita do usuário** (a dele já foi dada para iniciar por aqui).
- Nada de tabela/schema/RLS/DDL antes da Fase 4 (DECISÃO-016) — `schema_proposto.sql` continua **sem aplicar**.
- **Não mexer no visual** durante a Fase 2; qualquer dúvida sobre mudança de layout → perguntar antes.
- `App.tsx` não volta a falar direto com `localStorage` de pedidos (só via `PedidosRepo`).
- Progresso continua derivado de `etapa` + `config` (nunca campo salvo no `Pedido`).
- Conflitos C-1…C-4 e pendências de modelo já estão **encerrados** — qualquer mudança nova de fluxo/perfil exige decisão do usuário.
- Guardar checkpoint quando o contexto chegar a ~75% e parar aos ~85%.

## 5. Pendências conhecidas (para não esquecer)
- **Fase 3 (decidido, falta implementar):** etapa **ENTREGA** no fluxo, campos **`itens`** e **`prioridade`**.
- **Abertas:** DIV-14 (botão de backup na UI), DIV-15 (`index.html`), PEND-001 (conteúdo do link público), PEND-009 (hospedagem), PEND-010 (logo fixo), PEND-011 (limites Supabase), PEND-013 (chat).
- Artes seguem em base64 no `localStorage` até a migração ao Storage (Fase 4/6).
