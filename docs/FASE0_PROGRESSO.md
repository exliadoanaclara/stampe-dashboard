# CHECKPOINT — FASE 0 DO STAMPE (arquivo de retomada)

> ⚠️ **Fase 0 CONCLUÍDA.** O checkpoint ativo é **`FASE1_PROGRESSO.md`** — leia esse arquivo para continuar.

> **Como usar numa conversa nova:** peça "leia `G:\ruan\FASE0_PROGRESSO.md` e continue de onde parou".
> Este arquivo é **atualizado a cada bloco concluído**. Quando ele existir, ele — e não a conversa — é a fonte da verdade do progresso.

**Última atualização:** 26/09/2026

---

## 1. Onde paramos (status das 10 etapas)

| # | Etapa | Status |
|---|---|---|
| 1 | Cruzar fontes | ✅ concluída |
| 2 | Auditar código atual | ✅ concluída (`AUDITORIA_STAMPE.md`) |
| 3 | Listar divergências código × documentação | ✅ **DIV-01…DIV-17** gravadas em `STAMPE_REFERENCIA_COMPLETA.md` (seção "FASE 0 — REGISTRO DE EXECUÇÃO") |
| 4 | Corrigir problemas críticos | ✅ **todos os 9 itens** — ver tabela da seção "ETAPA 4" no documento vivo |
| 5 | Testes Vitest | ✅ **88 testes** em 7 arquivos (`npm test`) — datas, fila, regras/numeração, progresso, permissões, storage, **repo** |
| 6 | Schema proposto em arquivo (sem aplicar) | ✅ `supabase/schema_proposto.sql` — **não aplicado**, atualizado com as decisões da ETAPA 7 |
| 7 | Conflitos C-1..C-4 + pendências de modelo | ✅ **todas decididas com o usuário** (PEND-002/003/004/005/006/007/008/012/014/015 + **PEND-018**) — ver "DECISÕES DE FASE 0 — 2ª LEVA" |
| 8 | Camada de dados e contratos | ✅ **App fala só com `PedidosRepo`** — `hidratar/listar/persistir/proximoNumero/movimentar/cancelar/voltarEtapa` (LocalRepo); 19 testes novos em `repo.test.ts` |
| 9 | Validar (build, lint, testes) | ✅ build ✅ · lint 0 erros (7 avisos, era 8) · testes ✅ 88/88 |
| 10 | Relatório da Fase 0 no documento vivo | ✅ **ETAPA 10 gravada** em `STAMPE_REFERENCIA_COMPLETA.md` (seção "FASE 0 — REGISTRO DE EXECUÇÃO") |

> **FASE 0 CONCLUÍDA.** Nenhuma tabela criada, nenhum schema aplicado, nenhum corte feito.
> **A Fase seguinte não começa sem autorização explícita (DECISÃO-016).**

---

## 2. O que foi FEITO (não refazer)

### Estrutura criada (26/09)
- `src/domain/tipos.ts` — `Pedido` **sem campo `progresso`** (progresso agora é DERIVADO de `etapa`).
  - Campos novos já no tipo: `telefone?`, `quantidade?`, `valor?`.
- `src/domain/datas.ts` — `FUSO = "America/Sao_Paulo"`, `diaLocal()`, `hojeISO()` (data local única — resolve o bug de fuso PROBLEMA-014).
- `src/domain/fila.ts` — `ativoNaFila()`, `motivoBloqueio(pedidos, p, destino)` (assinatura com **3 argumentos**).
- `src/domain/permissoes.ts` — `canEditResumo/Impressao/Finalizacao`, `canEnviarParaImpressao/Finalizacao`, `canFinalizar`, `podeCancelar`, `podeVoltarEtapa` (todos recebem `role`).
- `src/domain/progresso.ts` — `getProgresso(etapa, cfg)`.
- `src/domain/regras.ts` — `ETAPA_ANTERIOR`, `ehPedidoValido()` (validação de shape), `maxNumeroDoDia`, `sequenciaDoDia`, `proximoNumero`, `semArte`.
- `src/data/storage.ts` — todas as chaves `LS_*`; **dados corrompidos vão para `stampe_pedidos_backup_v1`** em vez de serem sobrescritos; `gravar()` reporta erro de quota; `montarBackup`/`baixarBackup`/`lerBackupArquivo` (funções **prontas mas sem botão na UI**).
- `src/data/repo.ts` — contrato `PedidosRepo` + `LocalRepo` (operações transacionais retornam erro explicando que exigem SupabaseRepo).
- `src/components/ErrorBoundary.tsx` — **já montado no `main.tsx`**.

### Correções no App.tsx
- Reset diário: `apagarPedidosDoDia` **removido** — agora só reinicia a numeração e avisa "Histórico preservado" (C-1 resolvido no código).
- Arte passa por `otimizarImagem()`; aviso se passar de 4MB; confirmação se for enviar **sem arte**.
- `REYNALDON` no datalist da equipe.
- **Bloco A (26/09, nesta sessão):**
  1. 10 usos de `p.progresso`/`selected.progresso` trocados por `prog(p)`/`prog(selected)` (build estava quebrado com 14 erros TS);
  2. barras e rótulos de percentual agora usam `config.*` em vez de 0/50/75/100 fixos;
  3. **botões religados no modal**: `⬅ VOLTAR UMA ETAPA` e `✕ CANCELAR PEDIDO` (ADMIN) + faixa vermelha quando o pedido está cancelado;
  4. **`🖼️ Substituir/Enviar arte`** no modo edição (resolve PROBLEMA-002) — novo ref `arteEditRef`;
  5. `<ErrorBoundary>` envolvendo `<App/>` no `main.tsx`.

---

## 3. Blocos da Fase 0 — TODOS CONCLUÍDOS

### ✅ Bloco B — ETAPA 4 terminada
- [x] `telefone`/`quantidade`/`valor` agora têm input no **cadastro** e na **edição** (antes a edição **apagava** os 3 campos) e aparecem no **card**, no **modal** e na **OS impressa** (grid 3×3).
- [x] Textos de percentual do card/modal/dica do fluxo migraram dos fixos 0/50/75/100 para `config.*`.

### ✅ Bloco C — ETAPA 3 gravada
- [x] Tabela **DIV-01…DIV-17** em `STAMPE_REFERENCIA_COMPLETA.md`. Abertas: DIV-14 (botão de backup), DIV-15 (index.html), DIV-16 (.env/host), DIV-17 (doc desatualizado).

### ✅ Bloco D — ETAPA 5 concluída
- [x] `vitest` + `jsdom` instalados; `vitest.config.ts`; scripts `npm test` e `npm run test:watch`.
- [x] `src/test/factories.ts` + 6 arquivos de teste (69 casos) — **hoje 7 arquivos / 88 casos** (entrou `repo.test.ts`).
- [x] **Correções de código que os testes pegaram:** aviso de registro parcialmente inválido estava trocado (dizia "lista reaberta vazia"); `carregarConfig` agora faz merge campo a campo em vez de descartar configuração parcial.

### ✅ Bloco E — ETAPA 6 concluída
- [x] `supabase/schema_proposto.sql` criado **sem aplicar** — 10 seções (enums, perfis, pedidos, eventos, infos, configs, chat, RPCs, storage, RLS).
- [x] Atualizado com as decisões da ETAPA 7: `etapa` com **ENTREGA**, `perfil` sem Arte, `itens`/`prioridade` novos, `config_progresso.entrega`, `perfis.email`, `UNIQUE(dia, numero)`.

### ✅ Bloco F — ETAPA 7 concluída (decisões do usuário)
- [x] Perguntado e respondido: **PEND-002, 003, 004, 005, 006, 007, 008, 012, 014, 015** + **PEND-018 (nova — etapa ENTREGA: SIM)**.
- [x] Conflitos **C-1, C-2, C-3, C-4 encerrados**; registro em `STAMPE_REFERENCIA_COMPLETA.md` → "DECISÕES DE FASE 0 — 2ª LEVA".
- [x] Continuam abertas (não alteram estrutura): PEND-001 (link público), 009 (hospedagem), 010 (logo), 011 (limites Supabase), 013 (chat).

### ✅ Bloco G — ETAPA 8 concluída
- [x] `src/data/repo.ts`: contrato `PedidosRepo` = `hidratar()` (snapshot síncrono do 1º render) + `listar` + `persistir` + `proximoNumero(dia, seqAtual)` + `movimentar` + `cancelar` + `voltarEtapa`.
- [x] `LocalRepo` implementa as operações com as **mesmas regras do domínio** (`motivoBloqueio`, `ETAPA_ANTERIOR`) e grava em `storage`; nº não atômico e escrita *last-write-wins* ficam documentados (viram RPC/transação no `SupabaseRepo`, Fase 5).
- [x] `App.tsx` **não chama mais `storage.carregarPedidos`/`salvarPedidos`**: carga via `repo.hidratar()`, gravação via `repo.persistir()` no effect, e envio/finalização/cancelar/voltar passam por `repo.movimentar|cancelar|voltarEtapa` (com retorno de erro na tela).
- [x] `src/data/repo.test.ts` — 19 casos (fila, conflito de etapa, salto inválido, quota, motivo obrigatório, histórico).

### ✅ Bloco H — ETAPA 9 validada
- [x] `npm run build` ✅ · `npm run lint` **0 erros** (7 avisos, eram 8 — o aviso do effect de gravação sumiu ao virar assíncrono) · `npm test` ✅ **88/88**.

### ✅ Bloco I — ETAPA 10 concluída
- [x] Relatório de fechamento da Fase 0 gravado em `STAMPE_REFERENCIA_COMPLETA.md` (ETAPA 10), incluindo DIV-10/11/17 atualizadas e a lista do que ficou em aberto.
- [x] **Sem avançar para a fase seguinte sem autorização** (DECISÃO-016).

---

## 4. Comandos de verificação

```powershell
npm run build   # precisa terminar com "✓ built"
npm run lint    # 0 errors (7 warnings de set-state-in-effect/exhaustive-deps)
npm test        # 88 testes em 7 arquivos
```

## 5. Regras que não podem ser quebradas
- Não criar tabela nem aplicar schema antes das pendências de modelo (DECISÃO-016) — **pendências de modelo encerradas em 26/09; DDL continua proibido até a Fase 4**.
- C-1..C-4 **já estão encerrados** — qualquer mudança nova de fluxo/perfil exige decisão explícita do usuário.
- Progresso **nunca** volta a ser campo salvo no `Pedido` (é derivado de `etapa` + `config`).
- Guardar checkpoint quando o contexto chegar a ~75% e parar aos ~85%.

## 6. Pendências de código para a Fase 3 (decididas, ainda não implementadas)
- **Etapa ENTREGA** no fluxo (enum, percentual `config_progresso.entrega`, permissão/fila, quem entrega).
- Campos **`itens`** e **`prioridade`** no `Pedido` (forma a definir).
- DIV-14 (botão de backup na UI), DIV-15 (`index.html`), DIV-16 (`iniciar.bat`/`.gitignore`).
