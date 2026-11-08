# STAMPE — REFERÊNCIA COMPLETA DO PROJETO

> **Documento consolidado.** Reúne em um único arquivo as três fontes de referência do STAMPE mais o Plano Mestre de Execução, na ordem em que devem ser lidas.

**Consolidado em:** 26/09/2026

---

## ÍNDICE

1. **[AUDITORIA TÉCNICA DO STAMPE](#auditoria-técnica--stampe-pré-migração-supabase)** — diagnóstico do sistema no estado atual (ponto de partida técnico): 13 seções de análise, 50 problemas, listas A–E.
2. **[PROMPT MESTRE — CONTINUIDADE E EVOLUÇÃO](#prompt-mestre--continuidade-e-evolução-do-stampe)** — documento mestre / memória viva: regras de raciocínio + decisões, pendências, problemas, tarefas, ideias e histórico.
3. **[COMANDO MESTRE — INTELIGÊNCIA, CONTINUIDADE E EXECUÇÃO](#comando-mestre--inteligência-continuidade-e-execução-do-stampe)** — define como trabalhar cruzando as três fontes.
4. **[PLANO MESTRE DE EXECUÇÃO](#plano-mestre-de-execução-do-stampe--v1)** — ordem de trabalho em 9 fases, derivada do cruzamento (para revisão/aprovação).

---

## ⚠️ REGRAS DE USO DESTE ARQUIVO

- Este é um arquivo de **planejamento e contexto**. Alterações nele **não** devem ser feitas para "atualizar memória" sem que exista uma tarefa real de desenvolvimento.
- Quando uma decisão mudar, registrar a alteração (decisão anterior → nova decisão → motivo) **sem apagar a anterior**.
- **Fonte única (DECISÃO-014):** este arquivo é a única fonte viva a partir de 26/09/2026. As seções 1 e 4 são, respectivamente, o diagnóstico inicial (26/09/2026) e o plano em revisão — se divergirem da seção 2, **a seção 2 prevalece**.
- **`AUDITORIA_STAMPE.md` e `PROMPT_MESTRE.md` estão CONGELADOS** como snapshots históricos de 26/09/2026. **Não editá-los.** Toda atualização acontece apenas aqui.
- Nenhum arquivo de código do projeto deve ser alterado em função deste documento.

---
---
# AUDITORIA TÉCNICA — STAMPE (pré-migração Supabase)

**Data:** 26/09/2026
**Escopo:** avaliação completa do sistema atual antes da migração para o Supabase.
**Estado atual:** Vite 8 + React 19 + TypeScript + Tailwind 4 · 1 arquivo de 1.725 linhas · dados só em `localStorage` · 0 testes · `build` ✅ · `lint` ⚠️ 7 warnings · TS **sem `strict`** · sem rotas, sem auth, sem backend.

**Legenda de prioridade:** `[A]` crítico antes da migração · `[B]` antes/durante · `[C]` recomendado · `[D]` visual/UX · `[E]` futuro
**Complexidade:** 🟢 baixa · 🟡 média · 🔴 alta

---

## 1. ERROS E BUGS ATUAIS

**[A] 1.1 — Arte não pode ser trocada depois de criada (botão que deveria existir)**
- **Onde:** `App.tsx:1230` (texto *"(pode substituir)"*) vs `App.tsx:1497` (único `<input type=file>`, dentro do modal de novo pedido). `fileRef.current?.click()` só existe em `App.tsx:1492`.
- **Problema:** o sistema avisa que dá pra substituir a arte no modo edição, mas não existe nenhum botão de upload na tela de edição. Na prática a arte é **imutável** após a criação.
- **Risco:** arte errada ou desatualizada = o pedido vai pra impressão com a arte errada, ou o vendedor recria pedido só pra trocar imagem (número novo, histórico sujo).
- **Como deveria existir:** botão "📁 Substituir arte" na seção Prévia da Arte quando `editMode && canEditResumo`, apontando pro mesmo fluxo de otimização.
- **Antes da migração?** Sim. **Complexidade:** 🟢

**[A] 1.2 — Pedido sem arte pode ser enviado pra Impressão**
- **Onde:** `criarPedido` (`App.tsx:368`) não exige `arteUrl`; `enviarParaImpressao` (`App.tsx:428`) não valida nada além de permissão + fila.
- **Problema:** `arteUrl` é opcional em todo o fluxo. A etapa seguinte recebe pedido sem arte.
- **Risco:** produção/impressão descobre o problema depois que o pedido entrou na fila — como a fila é estrita, tirar pra corrigir exige voltar a etapa, **que não existe** (ver 1.4). Travamento operacional.
- **Como deveria:** validação no envio: *"Pedido Nº 003 sem arte — envie a arte ou confirme que não terá"* (bloqueio ou alerta confirmável).
- **Antes da migração?** Sim (regra de negócio, vai virar constraint). **Complexidade:** 🟢

**[A] 1.3 — Upload da arte não passa pela otimização → perda de dados silenciosa**
- **Onde:** `handleFile` (`App.tsx:359-366`) aceita 4MB e faz `readAsDataURL` cru. Já `carregarDecorativa` (`App.tsx:554`) otimiza. Arte usa o `handleFile`.
- **Problema:** 4MB em PNG vira **~5,3MB de string base64** (infla 33%). A cota do `localStorage` é ~5MB **por origem, compartilhada por todas as chaves** (`stampe_pedidos_v3` + `stampe_visual_v3` + chat…).
- **Risco:** `setItem` lança quota exceeded → o `catch` só mostra toast (`App.tsx:226`) → **o pedido existe na tela mas não está salvo**; ao recarregar, some. É perda real de informação hoje, sem Supabase nenhum.
- **Como deveria:** arte passar por `otimizarImagem` (como a decorativa) + checagem de cota antes de salvar + aviso explícito "não foi possível salvar".
- **Antes da migração?** Sim. **Complexidade:** 🟢

**[A] 1.4 — Sem cancelar, sem excluir, sem voltar etapa: a fila não tem saída**
- **Onde:** não existe nenhuma função de excluir/cancelar/retroceder em todo o arquivo (grep confirma). `motivoBloqueio` (`App.tsx:341`) não tem bypass nem pra ADMIN.
- **Problema:** pedido travado em IMPRESSÃO (cliente sumiu, arte errada, pedido cancelado) bloqueia todos os de número menor por até 24h — e **ninguém**, nem admin, consegue destravá-lo. O único "reset" é o apagamento à meia-noite.
- **Risco:** linha de produção parada por horas; pedido cancelado continua ocupando a fila; sem correção de erro (etapa errada).
- **Como deveria:** ações `CANCELAR`, `VOLTAR UMA ETAPA` (com motivo + registro em histórico) e override de Admin.
- **Antes da migração?** Sim (virar RPC transacional). **Complexidade:** 🟡

**[A] 1.5 — Numeração duplicável**
- **Onde:** `seq` é estado local por navegador (`App.tsx:174`) + `LS_SEQ`.
- **Problema:** duas abas do mesmo navegador (ou dois PCs, depois) leem o mesmo `seq` e criam o **mesmo número**. Nada detecta colisão. Detalhe: o modal mostra `fmtNumero(seq)` no título e no botão (`App.tsx:1437,1504`) — dois "Nº 005" idênticos, e o rodapé promete *"Pedido unico nunca duplicado"* (`App.tsx:1622`).
- **Risco:** número repetido = cliente e produção confundem pedidos; relatório e busca errados.
- **Como deveria:** número gerado por transação atômica no servidor (`UPDATE sequencias SET ultimo = ultimo+1 ... RETURNING`), com `UNIQUE (dia, numero)`.
- **Antes da migração?** Sim (desenhar agora, implementar no Supabase). **Complexidade:** 🟡

**[B] 1.6 — Data padrão errada depois das 21h (fuso)**
- **Onde:** `hojeISO()` = `toISOString().slice(0,10)` → **UTC** (`App.tsx:136`); `diaLocal()` → **horário local** (`App.tsx:77`). Usados em lugares diferentes.
- **Problema:** às 22h (Brasil, UTC-3) `hojeISO()` devolve **amanhã**. `dataInicio`/`previsaoConclusao` do pedido novo saem com um dia a mais, enquanto o corte diário usa a data local — inconsistência entre os dois.
- **Risco:** previsão de entrega errada; pedido criado "amanhã"; confusão no filtro por dia depois que virar histórico.
- **Como deveria:** uma única função de data local (ou colunas `date` do banco com fuso definido).
- **Antes da migração?** Sim (decidir fuso antes de criar as colunas). **Complexidade:** 🟢

**[B] 1.7 — Reset diário sobrescreve dados corrompidos sem recuperação**
- **Onde:** `App.tsx:150-153` (`JSON.parse` em `try` → `lista = []`) e o `catch` externo (`App.tsx:172` → `return []`), depois o effect `App.tsx:226` salva `[]`.
- **Problema:** se o `localStorage` vier truncado/corrompido, o estado vira `[]` e **na sequência grava `[]` por cima**. Sem backup, sem aviso, sem recuperação.
- **Risco:** perda total de pedidos em um evento de corrupção.
- **Como deveria:** validar o shape antes de aceitar; em caso de erro, **preservar** o bruto numa chave `..._backup` e avisar. (Depois da migração, o banco assume isso.)
- **Antes da migração?** Sim (é 10 linhas). **Complexidade:** 🟢

**[B] 1.8 — Uma exceção de render derruba o sistema inteiro (tela branca)**
- **Onde:** `main.tsx` — sem ErrorBoundary; sem validação de schema (zod) em `JSON.parse`.
- **Problema:** qualquer registro com campo faltando (`historico` undefined → `selected.historico.length` em `App.tsx:1259`) quebra o React e não há como recuperar sem Ctrl+Shift+R.
- **Risco:** com dados de vários PCs/bancos no futuro, um registro inválido derruba o app pra todos.
- **Como deveria:** ErrorBoundary global + validação na leitura.
- **Antes da migração?** Recomendado. **Complexidade:** 🟢

**[B] 1.9 — `salvarEdicao` grava a partir de um snapshot**
- **Onde:** `App.tsx:391-426` (`{...selected}` + FormData).
- **Problema:** a gravação parte do objeto `selected` no momento do clique, não do dado mais recente. Hoje o effect `App.tsx:235` mantém sincronizado (1 PC). Com banco, vira **last-write-wins**: duas pessoas editando o mesmo pedido → a segunda sobrescreve a primeira sem avisar.
- **Risco:** perda silenciosa de alterações.
- **Como deveria:** coluna `atualizado_em` + revalidação no servidor (rejeitar se mudou) ou `versao INT` com lock otimista.
- **Antes da migração?** Sim (desenhar). **Complexidade:** 🟡

**[C] 1.10 — Botão "Progresso" inacessível no celular**
- **Onde:** `App.tsx:704` (`hidden sm:flex`). Em telas <640px o botão some e não há outro caminho pro modal de percentuais.
- **Risco:** impossível configurar progresso pelo celular. **Complexidade:** 🟢 — pode ser depois.

**[C] 1.11 — Resquícios de código**
- `seqAposReset` é **variável global mutável no escopo do módulo** (`App.tsx:75`) — frágil e incompatível com camada de dados assíncrona.
- Indentação quebrada (`App.tsx:103`, `217-218`), `tsconfig` sem `strict`, arquivos mortos: `src/App.css`, `src/assets/hero.png|react.svg|vite.svg`, `test_write.txt`, `debug.cjs`.
- Download da arte força extensão `.png` mesmo sendo WebP/JPEG (`App.tsx:845`, `1247`) → arquivo com extensão errada.
- Nenhum `maxLength` em cliente/serviço/observações → payload gigante possível.
- **Complexidade:** 🟢–🟡 — arrumar junto com a reorganização.

---

## 2. FLUXO COMPLETO DOS PEDIDOS (Venda → Arte → Impressão → Finalização → Entrega)

**Mapa real do que existe hoje:**

| Etapa | Existe? | Quem pode | O que trava |
|---|---|---|---|
| **Venda/Atendimento** (`PEDIDO`, 0%) | ✅ | Venda/Admin | — |
| **Arte** | ⚠️ **não é etapa** | só na criação | não é obrigatória (1.2), não é substituível (1.1) |
| **Impressão** (`IMPRESSAO`, 50%) | ✅ | Impressão/Admin | fila estrita + arte não validada |
| **Produção/Finalização** (`FINALIZACAO`, 75%) | ✅ | Finalização/Admin | fila estrita (1 só por vez) |
| **Finalizado** (`FINALIZADO`, 100%) | ✅ | — | — |
| **Entrega / Entregue** | ❌ **não existe** | — | sem data, responsável ou status de entrega |

**[A] 2.1 — Não existe etapa de ENTREGA**
Pedido pode chegar a 100% e não há como registrar *quando/para quem foi entregue*. O card só mostra "Pedido concluído" (`App.tsx:1417-1421`). Para o acompanhamento do cliente (item 12) "pronto para entrega" é um dos estados pedidos — hoje não é modelável. **Antes da migração? Sim** (define o modelo de dados). **Complexidade:** 🟡

**[A] 2.2 — A fila pode travar a produção inteira por até 24h**
Regra atual (`App.tsx:341-357`): para enviar Nº N pra Impressão, **todos os Nº < N precisam ter saído de PEDIDO**; e só 1 pedido em IMPRESSÃO por vez; só 1 em FINALIZAÇÃO por vez. Se o Nº 001 ficar parado (cliente não confirma, arte faltando, cancelado), **002, 003, 004 ficam bloqueados** e não há como remover o 001 (1.4). O alívio só vem à meia-noite, quando tudo é apagado. **Antes da migração? Sim.** **Complexidade:** 🟡

**[B] 2.3 — Pedido pode "sumir" ou ficar desatualizado sem aviso**
Três caminhos: (a) apagamento à meia-noite com modal aberto → modal fecha sozinho (`App.tsx:235-240`); (b) falha de quota → pedido some no reload (1.3); (c) com 2 PCs, o pedido aberto no PC A **nunca** atualiza quando muda no PC B (ver §3). **Antes/durante a migração.** **Complexidade:** 🟡

**[B] 2.4 — Sem notificação pro próximo responsável**
Quando Venda envia pra Impressão, **ninguém é avisado**. O único indicador é o número na aba (`App.tsx:719`). Com vários PCs isso é gargalo: o pedido fica parado até alguém olhar a tela. Precisa de Realtime + notificação. **Durante a migração.** **Complexidade:** 🟡

**[B] 2.5 — Mudanças de previsão e informações não entram no histórico**
`salvarPrevisaoImp/Fin` (`App.tsx:482-494`) e `addInfo*` (`App.tsx:464-480`) gravam autor/data no item, mas **não registram o valor anterior** — o histórico de alterações (`App.tsx:1253`) só cobre edição na etapa PEDIDO. Quem mudou a previsão de sexta pra segunda não fica registrado como evento de auditoria. **Desenhar o modelo de auditoria antes da migração.** **Complexidade:** 🟡

**Fluxo que funciona hoje (ponto a ponto):** Venda cria → pedido aparece em "PEDIDOS" e em "VISÃO GERAL" → Venda envia → some da aba PEDIDO, aparece em IMPRESSÃO com contador+1 → Impressão edita previsão/infos e envia → aparece em FINALIZAÇÃO → Finalização conclui → aparece em FINALIZADOS. **Os contadores e filtros estão corretos**; o problema não é o encadeamento, é a ausência de trava transacional, de alerta e das etapas finais.

---

## 3. VÁRIOS COMPUTADORES AO MESMO TEMPO

**Respostas diretas:**

| Pergunta | Resposta hoje |
|---|---|
| Duas pessoas trabalham ao mesmo tempo sem conflito? | **Sim — porque não se enxergam.** Cada navegador tem sua própria cópia independente. |
| Alteração aparece nos outros PCs? | **Não.** Zero sincronização. |
| Risco de alterar o mesmo pedido? | **Não entre PCs** (são dados separados) — mas **sim entre 2 abas** do mesmo PC, e **garantido** depois da migração (1.9). |
| Risco de perder informação? | **Sim** — quota do `localStorage` (1.3), reset diário (§8), colisão de número (1.5), corrupção sem backup (1.7). |
| A fila funciona para vários usuários? | **Não.** É calculada com a lista local (`motivoBloqueio` lê `pedidos`); com banco compartilhado, **dois PCs passam na checagem ao mesmo tempo e ambos avançam** → 2 pedidos na mesma etapa. |
| O que hoje é só de um navegador? | **Tudo**: pedidos, `seq`, usuário, config de progresso, personalização visual, chat, filtro de dia. |

**[A] 3.1 — Chat não conversa entre computadores**
`BroadcastChannel` (`App.tsx:278`) só fala entre abas do **mesmo navegador**; o fallback de `storage` (`App.tsx:284`) também. A própria UI admite: *"todas as abas veem"* (`App.tsx:1570`). Risco: equipe acha que tem chat interno e **não tem** → comunicação perdida. Virar tabela + Realtime. **Durante a migração.** **Complexidade:** 🟡

**[A] 3.2 — Personalização visual é por navegador**
`LS_VISUAL` é local (`App.tsx:190`): cada PC tem logo, cores, banner e rodapé diferentes — inclusive **a ordem de serviço impressa sai diferente em cada computador**. Risco de material impresso com identidade inconsistente. Precisa virar config global editável só por Admin. **Antes da migração (decisão de modelo).** **Complexidade:** 🟡

**[B] 3.3 — Sem camada de dados**
`localStorage` chamado direto em ~25 pontos do componente (`App.tsx:140-272`). Trocar por Supabase exatamente aí é mexer em 25 lugares. **Extrair um repositório único antes de migrar.** **Complexidade:** 🔴 (é a preparação mais importante de todas)

**[B] 3.4 — Sem feedback de concorrência**
Sem "atualizado por X há 2s", sem trava de sessão, sem aviso de que outro PC mexeu. Precisa de Realtime + UI de conflito (mostrar "este pedido foi alterado por RUAN — recarregue"). **Durante a migração.** **Complexidade:** 🟡

---

## 4. LOGIN E PERMISSÕES

**O que existe hoje:** um campo de texto livre pro nome e um `<select>` de perfil no cabeçalho (`App.tsx:683-697`), gravados em `LS_USER`. Qualquer visitante se coloca como **ADMIN** em 2 segundos. Não existe senha, sessão, cadastro, logout nem gestão de usuários. As funções `canEditResumo`/`canEnviarPara*` (`App.tsx:332-337`) são **controle só de interface** — escondem botões, mas nada impede chamá-las por console/estado.

**Consequência prática:** o histórico grava `usuario: user.nome` (`App.tsx:408,435,459`) — ou seja, **a auditoria hoje é confiável só se todo mundo digitar o nome certo**, e o padrão é `ITALO` (`App.tsx:184`) em todo PC novo. O rodapé e as OSs mostram "por ITALO" sem ser ITALO.

**Matriz de permissões proposta (alvo final):**

| Ação | VENDA | IMPRESSÃO | PRODUÇÃO | ADMIN |
|---|---|---|---|---|
| Criar pedido | ✅ | ❌ | ❌ | ✅ |
| Editar cliente/serviço/atendente/obs (só etapa PEDIDO) | ✅ | ❌ (só leitura) | ❌ (só leitura) | ✅ |
| Enviar/substituir arte | ✅ | ❌ | ❌ | ✅ |
| Enviar p/ IMPRESSÃO | ✅ | ❌ | ❌ | ✅ |
| Editar previsão/infos da Impressão | ❌ | ✅ | ❌ | ✅ |
| Enviar p/ PRODUÇÃO | ❌ | ✅ | ❌ | ✅ |
| Editar previsão/infos da Produção | ❌ | ❌ | ✅ | ✅ |
| Marcar FINALIZADO / ENTREGUE | ❌ | ❌ | ✅ | ✅ |
| Cancelar / voltar etapa / forçar fila | ❌ | ❌ | ❌ | ✅ |
| Ver histórico/auditoria | do seu fluxo | do seu fluxo | do seu fluxo | ✅ total |
| Gerar link do cliente | ✅ | ❌ | ❌ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ❌ | ✅ |
| Configurar % de progresso e visual | ❌ | ❌ | ❌ | ✅ |
| Exportar/backup | ❌ | ❌ | ❌ | ✅ |
| Consultar tudo (sem editar) | ✅ | ✅ | ✅ | ✅ |

**[A] 4.1 — Autenticação real**
Supabase Auth (e-mail + senha, ou Magic Link se preferir não lidar com senha), tabela `perfis(user_id, role)`, sessão persistente, botão Sair. **A identidade precisa ser `user_id` (UUID), nunca texto digitado.** Antes da migração: desenhar; implementar junto. **Complexidade:** 🔴

**[A] 4.2 — Permissões só na interface**
Hoje `canX()` é a única trava. Com RLS no Supabase, **a política no banco** é que decide (função `avancar_etapa()` com `SECURITY DEFINER` checando o papel do usuário). Se deixar só no front, qualquer pessoa com a chave `anon` e Postgres acessa tudo. Antes da migração: mapear a matriz acima. **Complexidade:** 🔴

**[B] 4.3 — Sem gestão de usuários, sem logout, sem troca segura**
Cadastro, ativação/desativação, redefinição de senha e um botão Sair. **Complexidade:** 🟡

**[B] 4.4 — Página de login precisa existir** (rotas: `/login`, e a área logada). Hoje não há roteador nenhum — ver 13.1. **Complexidade:** 🟡

---

## 5. BANCO DE DADOS E MIGRAÇÃO PARA SUPABASE

**[A] 5.1 — O código atual dificulta a migração em 10 pontos concretos**

| # | O que trava | Onde |
|---|---|---|
| 1 | Sem camada de dados: 25 chamadas de `localStorage` espalhadas no componente | `App.tsx:140-272` |
| 2 | Arte (base64) **dentro** do registro do pedido | `Pedido.arteUrl`, `App.tsx:19` |
| 3 | Arrays embutidos (`historico`, `infosImpressao`, `infosFinalizacao`, `etapaHistorico`) | `App.tsx:28-31` |
| 4 | `progresso` redundante (deriva de `etapa` + `config`) | `App.tsx:21` |
| 5 | Numeração em estado local | `App.tsx:174` |
| 6 | Config visual/progresso por navegador | `App.tsx:186-193` |
| 7 | Reset diário apaga registros (conflita com histórico) | `App.tsx:81` |
| 8 | Identidade por texto livre | `App.tsx:182` |
| 9 | Sem rotas (precisa pra `/acompanhar/:token`) | — |
| 10 | Sem validação de schema nem ErrorBoundary | `main.tsx` |

**[A] 5.2 — Estrutura proposta (modelagem)**

```
auth.users (Supabase Auth)
└─ public.perfis        id, user_id FK, nome, role ENUM(venda|impressao|producao|admin), ativo, criado_em

public.sequencias       dia DATE PK, ultimo INT          ← numeração atômica
public.pedidos          id UUID PK
                        dia DATE, numero INT             ← UNIQUE(dia, numero)
                        cliente, servico, telefone, atendente_id → perfis
                        quantidade INT, valor NUMERIC    ← campos que faltam hoje (item 12)
                        data_inicio DATE, previsao DATE
                        observacoes TEXT
                        etapa ENUM(pedido|impressao|finalizacao|finalizado|entregue)
                        versao INT                       ← lock otimista
                        criado_por → perfis, criado_em, atualizado_em
                        finalizado_em, entregue_em, entregue_para
                        cancelado_em, cancelado_motivo   ← soft delete, nunca DELETE
                        UNIQUE(dia, numero)  INDEX(etapa, dia)  INDEX(cliente)

public.pedido_eventos    id, pedido_id FK, tipo ENUM(edicao|etapa|previsao|info|cancelamento|entrega)
                        campo, valor_antigo, valor_novo, motivo
                        usuario_id → perfis, criado_em    ← append-only (nunca UPDATE/DELETE)

public.pedido_infos      id, pedido_id FK, tipo ENUM(impressao|producao), texto, usuario_id, criado_em
public.artes             id, pedido_id FK, storage_path, tipo, thumb_path, criado_por, criado_em
public.chat_mensagens    id, texto, usuario_id, criado_em
public.config_sistema    chave PK, valor JSONB           ← cores, %s, textos (global, só admin edita)
public.acompanhamento    token UUID PK, pedido_id FK, ativo, permite_valor BOOL, expira_em, criado_em
```

**Decisões que precisam ser tomadas ANTES de criar as tabelas:**
1. **Fuso horário** e formato de data (1.6).
2. **Numeração por dia ou global** (hoje é por dia; repetição de números entre dias é aceita pelo sistema).
3. **Histórico preservado ou não** (hoje apaga; item 8 / 7 da apresentação diz o contrário).
4. **Personalização global ou por usuário** (3.2).
5. **Campos novos:** quantidade, valor, telefone, itens — hoje **não existem** no modelo `Pedido` (`App.tsx:10-32`) e são exigidos pelo item 12.
6. **Etapas:** acrescentar `ENTREGUE` (2.1) e talvez `ARTE` (1.2/2.1).

**[B] 5.3 — Backup/migração dos dados atuais: não existe função de exportar**
Hoje não há nenhum botão de exportação; sair do `localStorage` é manual (console). Antes de qualquer troca: **botão "Exportar JSON" + "Importar JSON"** (Admin), validar com os dados reais, e script de carga inicial pro Supabase. **Complexidade:** 🟡

**[B] 5.4 — Backup contínuo**
Confirmar o que o plano gratuito do Supabase oferece no momento da contratação (backups automáticos podem não estar inclusos). Prever: export periódico do banco (pg_dump agendado) + cópia dos arquivos do Storage. **Complexidade:** 🟡

**[A] 5.5 — RLS (Row Level Security) ligado desde o primeiro dia**
Sem RLS, a chave `anon` que vai pro bundle JS dá acesso de leitura/escrita a **tudo**. Políticas por papel do usuário, escrita restrita a funções RPC, `SELECT` liberado conforme a matriz do §4. **Complexidade:** 🔴

**Ordem de execução da migração (etapas):** backup → criar projeto/bucket → schema + RLS + RPC de fila/sequência → camada de repositório no front (troca `localStorage` por cliente Supabase) → auth/login → Realtime → testes com 2 PCs → publicar → só então mexer em visual.

---

## 6. IMAGENS E ARQUIVOS

**Como é hoje:**
- Arte: `handleFile` → base64 cru, teto 4MB, **sem otimização** (`App.tsx:359`).
- Logo/banner/marca d'água: `carregarDecorativa` → ≤1,5MB cru ou otimizado (corte de transparência + WebP, `App.tsx:496-552`).
- Tudo como string base64 dentro do `localStorage`.

**[A] 6.1 — Cota estoura e derruba pedidos** (detalhado em 1.3)
Cálculo prático: cota ~5MB compartilhada. 1 pedido com arte de 4MB (>5MB em base64) **já estoura sozinho**. 2 logos de 1,5MB + banner de 1,5MB ≈ 6MB → estoura. Sintoma: toast "Sem espaco no navegador" e dados que não gravam. **Complexidade:** 🔴

**[B] 6.2 — Cada gravação reescreve TODAS as imagens**
`App.tsx:226` faz `JSON.stringify(pedidos)` inteiro a cada alteração. Com 500KB de base64 acumulado, cada clique em "avançar etapa" serializa meio megabyte. **Complexidade:** 🟡

**[B] 6.3 — Otimização trava a interface**
O corte de transparência itera pixel a pixel até **36 milhões de pixels** (`App.tsx:514-535`) na main thread — imagem grande = congelamento de 1–3s sem feedback. **Complexidade:** 🟡

**Como deveria funcionar depois do Supabase:**
- **Sim, usar Storage** — nunca base64 em banco.
- Bucket privado `artes/<pedido_id>/<uuid>.webp`; banco guarda **só o path**.
- Upload direto do `File` (sem passar por base64), validação de MIME/tamanho no cliente **e** no servidor.
- Gerar **thumbnail ~400px** pro card (hoje cada card carrega a arte inteira em `App.tsx:842`) — ver desempenho §10.
- Exibir por `createSignedUrl` (ou bucket público com nome não adivinhável — menos seguro).
- Migrar as artes atuais do `localStorage` pro Storage numa carga inicial (script único).
- Opcional: transformação de imagem nativa do Supabase — **verificar disponibilidade no plano gratuito** antes de depender dela.

**[C] 6.4 — Aceitar SVG sem restrição** (`accept="image/*"`, `App.tsx:1497`) — hoje é inofensivo em `<img>`, mas vale limitar a `png,jpg,jpeg,webp` já que a conversão é pra WebP. **Complexidade:** 🟢

---

## 7. FILA DE PRODUÇÃO/IMPRESSÃO

**Regra atual (estrita, serial):**
1. Pra ir a IMPRESSÃO: nenhum pedido de número menor pode estar em PEDIDO, e **nenhum outro** pode estar em IMPRESSÃO.
2. Pra ir a FINALIZAÇÃO: nenhum outro em FINALIZAÇÃO, e nenhum de número menor em IMPRESSÃO.
3. Sem exceção nem por Admin (`App.tsx:341-357`, `428-451`).

**[A] 7.1 — Dois PCs avançam o mesmo pedido ao mesmo tempo**
A checagem lê a lista **local**. Com banco compartilhado, PC A e PC B avaliam no mesmo instante, ambos veem "livre" e ambos gravam → **2 pedidos na mesma etapa**, exatamente a regra que o sistema promete impedir. Mesma coisa pra criar pedido (dois "Nº 005").

**Como deveria funcionar:** transação única no servidor:
```sql
avancar_etapa(pedido_id uuid, de etapa, para etapa)  -- SECURITY DEFINER
  UPDATE pedidos SET etapa = para, versao = versao + 1
   WHERE id = pedido_id AND etapa = de AND versao = $versao_cliente
     AND NOT EXISTS (SELECT 1 FROM pedidos WHERE etapa = $para AND dia = current_date);
  -- 0 linhas afetadas ⇒ erro "pedido já foi movido por outro usuário"
```
Mais RPC `gerar_numero()` atômico. **Antes/durante a migração — é o coração da solução.** **Complexidade:** 🔴

**[B] 7.2 — Fila não mostra quem bloqueia quem na lista**
O motivo só aparece dentro do pedido aberto (`App.tsx:1386,1401`). No card não há indicador de posição na fila nem de bloqueio. **Complexidade:** 🟡

**[B] 7.3 — Fila sem override**
Sem ação de Admin pra liberar/remeitar (1.4). **Complexidade:** 🟡

**[B] 7.4 — Fila depende de ordenar e filtrar tudo no cliente**
Com centenas de pedidos, `motivoBloqueio` percorre a lista inteira 2× por renderização. No banco vira `EXISTS`/índice. **Complexidade:** 🟢

---

## 8. HISTÓRICO DOS PEDIDOS

**Risco de apagar informação que deveria permanecer: EXISTE E É DIÁRIO.**
`apagarPedidosDoDia` (`App.tsx:81`) mantém **apenas** pedidos criados hoje e recalcula a sequência. Ou seja: **todo pedido de ontem é destruído permanentemente**, junto com histórico, movimentações de etapa, infos e artes. Às 00:00 o "Histórico de alterações" (que o sistema exibe com orgulho, `App.tsx:1253`) deixa de existir junto. Isso contradiz o item 7 da `APRESENTACAO_PROJETO_STAMPE.md` ("não apagar automaticamente... permanecem armazenados para consulta").

Agravantes: sem lixeira, sem soft delete, sem export, sem confirmação (é automático).

**[A] 8.1 — Decidir a política de histórico ANTES de modelar**
Proposta: pedidos **nunca são apagados**; numeração reinicia por dia (coluna `dia`); cancelamento por `cancelado_em` + motivo; arquivo (soft delete) por data; auditoria append-only na tabela `pedido_eventos`. **Antes da migração.** **Complexidade:** 🔴

**[A] 8.2 — Auditoria incompleta hoje**
Só registros de edição na etapa PEDIDO (`App.tsx:406-415`). Mudanças de previsão, adição de infos, avanço de etapa ficam em arrays separados (e infos nem registram valor anterior). Não existe "quem mudou o quê" unificado. Desenhar a tabela de eventos agora. **Complexidade:** 🔴

**[B] 8.3 — Quem realizou cada alteração é texto digitado**
`usuario` em string (`App.tsx:408`) → trocar por `usuario_id` FK. **Complexidade:** 🟡

**Modelo alvo de consulta:** `pedidos` (em andamento = etapa ≠ finalizado/entregue), `finalizados`, `entregues`, consultas por período em vez de por "dia salvo"; `pedido_eventos` com `criado_em` do servidor (não do browser) + autor.

---

## 9. DASHBOARD E VISUAL

> Avaliação pensando em quem usa 8h por dia.

**D-1 · Não existe dashboard** 🟡
Hoje só há 5 pílulas com contagens (`App.tsx:716-737`). Falta: criados hoje, atrasados (previsão < hoje), tempo médio por etapa, entregues do dia, fila atual, meta do dia. Sugestão: faixa de 4–5 KPIs sob as abas + gráfico de barras por etapa + **visualização kanban** (4 colunas = as 4 etapas), que é o que combina com o modelo atual.

**D-2 · O card não responde "o que eu preciso fazer?"** 🟡
O card (`App.tsx:782-862`) mostra 12 informações, mas não mostra o essencial pro operador: *posição na fila* ("3º da fila"), *motivo do bloqueio* ("aguardando Nº 001") e *está atrasado?*. Recomendo hierarquia: Nº + etapa + cliente + **próxima ação/bloqueio** + previsão (vermelha se vencida).

**D-3 · Cores travadas em vermelho ignoram a personalização** 🟡
A personalização muda o cabeçalho, mas os cards e o modal usam vermelho fixo `#fff5f5`/`#fee2e2` (`App.tsx:814, 1154, 1215, 1269, 1444`). Quem trocar a cor da empresa vê header azul com cards vermelhos. → usar variáveis CSS (`--stamper-red` já existe em `index.css:6`, mas não é usada nos cards).

**D-4 · Cores das abas competem entre si** 🟢
5 cores diferentes (preto, vermelho, âmbar, azul, verde) + roxo do "Personalizar" = ruído visual. Sugestão: um acento da marca + variações sutis, mantendo a cor cheia só no status ativo.

**D-5 · Traço estranho nos dados** 🟢
Os valores renderizam com hífen na frente: `- {selected.cliente}` (`App.tsx:1158, 1162, 1166, 1170, 1176, 1221`). Parece erro de digitação na tela.

**D-6 · Acessibilidade / teclado** 🟡
Cards são `<article onClick>` sem `tabIndex`/`onKeyDown` (não dá pra abrir no teclado); modais sem `Esc` pra fechar, sem foco preso, sem `aria-label`; status comunicado só por cor; `text-zinc-400` em fundo branco (~2.3:1, abaixo do mínimo legível). Zero ocorrências de `aria-*` no arquivo (grep confirmou).

**D-7 · Ícones por emoji** 🟢
`📁 🗑️ 🎨 ⚙️ 🖨️ ✂️` variam entre sistemas operacionais e não têm alvo de toque consistente → biblioteca de ícones (ex.: lucide-react).

**D-8 · Informação errada em tela** 🟢
- Título da aba do navegador: **"ruan"**, `lang="en"` (`index.html:4,7`) — deveria ser "STAMPE — Sistema de Pedidos" / `pt-BR`.
- Texto do rodapé *"Pedido unico nunca duplicado"* (`App.tsx:1622`) — garantia que o sistema não garante (1.5).
- Caixa ámbar fixa de "Fluxo" ocupando espaço no fim de toda lista (`App.tsx:867`) — poderia ser recolhível.

**D-9 · Sem experiência por perfil** 🟡
Venda, Impressão e Produção veem exatamente a mesma tela. O vendedor deveria cair em "Novos pedidos + minha fila"; o da impressão, na aba IMPRESSÃO já selecionada com a próxima ação em destaque; o da produção, em FINALIZAÇÃO.

**D-10 · Responsividade — boa base, com lacunas** 🟡
Grid 1/2/3 colunas ✅, modais em tela cheia no mobile ✅, nav com scroll horizontal ✅. Lacunas: botão Progresso escondido no mobile (1.10); seletor de ordem (MAIOR/MENOR) enterrado em "Personalizar" quando deveria estar junto dos filtros; chat flutuante cobre botões de card no celular; sem bloqueio de scroll do fundo com modal aberto.

**D-11 · Detalhes de acabamento** 🟢
Sem atalho de teclado (`N` novo, `/` busca, `Esc` fecha), sem confirmação ao descartar formulário preenchido (clique no fundo apaga tudo), sem "imprimir fila do dia", sem badge de atraso.

---

## 10. DESEMPENHO

**Pode deixar pesado HOJE:**

| Onde | Problema | Impacto |
|---|---|---|
| `App.tsx:226` | `JSON.stringify` de **todos** os pedidos (com base64) a cada alteração e **toda recarga** | 50–300ms de trava com dados grandes |
| `App.tsx:234` | ao mudar qualquer `%` de progresso, **todos** os pedidos são recriados → regravados inteiros | pico de CPU + escrita |
| `App.tsx:842, 1234, 1709` | a mesma arte base64 é decodificada **3×** (card + modal + documento de impressão) | memória |
| `App.tsx:781-864` | lista inteira re-renderiza sem `React.memo`, com `<img>` por card | ~60 cards começa a engasgar |
| `App.tsx:514-535` | loop de 36M pixels na main thread | congelamento 1–3s no upload |
| `App.tsx:140-173` | leitura + `parse` + re-map + re-escrita sincronizados no boot | tempo de abertura |

**Pode causar problema QUANDO CRESCER:**
- **Teto duro de ~5MB por navegador** = poucos pedidos com arte simultaneamente (é limite de arquitetura, não de código).
- Sem paginação/virtualização: 1.000 cards com imagem = dezenas de MB de DOM.
- `stats` faz 5 filtros separados por render (`App.tsx:322`) — trocar por uma passada única.
- Depois do Supabase: `select *` de tudo a cada mudança, N+1 de imagens, e um canal Realtime por lista — planejar **colunas explícitas, paginação/infinite scroll, thumbnails e debounce** desde o início.
- Bundle único de 295KB (84KB gzip) — ok hoje; quando entrar router + cliente Supabase, separar chunks.

**Complexidade das correções:** 🟢 (memo/thumbnail/uma passada) · 🟡 (paginação, web worker na imagem) — e tudo isso **melhora sozinho** se a arte sair do `localStorage`.

---

## 11. SEGURANÇA

| # | Achado | Onde | Risco | Prioridade |
|---|---|---|---|---|
| S-1 | **Zero autenticação**; perfil Admin selecionável por qualquer um | `App.tsx:690-696` | após hospedar, qualquer pessoa com a URL lê e edita todos os pedidos | **[A]** 🔴 |
| S-2 | **Controle de permissão só na interface** (esconde botão, não impede) | `App.tsx:332-337` | contornável por console/estado | **[A]** 🔴 |
| S-3 | **Identidade falsificável** — histórico atribui ação ao nome digitado | `App.tsx:182, 408` | auditoria inválida | **[A]** 🔴 |
| S-4 | **RLS ausente** (ainda não existe banco — risco futuro) | — | chave `anon` no bundle = acesso total | **[A]** 🔴 |
| S-5 | **Servidor de dev em `--host 0.0.0.0`** | `iniciar.bat` | expõe o código-fonte e o app pra toda a rede local | **[B]** 🟢 |
| S-6 | **`.env` não está no `.gitignore`** (só `*.local`) | `.gitignore` | risco de commitar `SUPABASE_URL`/chaves no repositório | **[B]** 🟢 |
| S-7 | Dados só no `localStorage` — limpeza do navegador = perda total, e é legível por qualquer script da origem | — | vazamento + perda | **[A]** (resolve com migração) |
| S-8 | Sem CSP, sem headers de segurança, sem HTTPS (definir na hospedagem) | — | XSS/injeção em produção | **[B]** 🟡 |
| S-9 | Sem limite de tamanho/comprimento nos campos de texto | `App.tsx:1451-1471` | payload abusivo | **[C]** 🟢 |
| S-10 | `href={arteUrl}` aceita qualquer esquema (hoje só `data:` vindo do FileReader) | `App.tsx:843, 1247` | se um dia aceitar URL externa → `javascript:` | **[C]** 🟢 (travar já o tipo) |
| S-11 | Link público do cliente (item 12) — **não existe ainda**; projetar token forte, projeção mínima de dados e revogação | — | vazamento de dados internos | **[E]** 🔴 se mal feito |

**Não encontrei:** XSS por conteúdo (React escapa tudo — cliente/obs/chat são renderizados como texto), vazamento de chaves no repositório (não há `.env`), nem injeção de SQL (não há banco).

---

## 12. ACOMPANHAMENTO DO CLIENTE

**Como deveria ser estruturado (desenho proposto):**

1. **Geração:** ao criar o pedido (ou por botão "🔗 Link do cliente"), o sistema gera `token UUID v4 (128 bits)` e grava em `acompanhamento(token, pedido_id, ativo, permite_valor, expira_em)`. Link: `https://<dom>/acompanhar/<token>`.
2. **Rota pública:** `/acompanhar/:token` → chama RPC `ver_pedido_por_token(token)` (`SECURITY DEFINER`), que devolve **projeção branqueada**:
   `numero, cliente_nome, servico, quantidade, etapa, progresso, previsao, observacoes_publicas, pronto_para_entrega, atualizado_em`.
3. **O que NUNCA pode aparecer:** observações internas, infos de impressão/produção, histórico, atendente/interno, chat, outros pedidos, valores (a menos que `permite_valor = true`).
4. **Atualização:** assinar Realtime no `pedido_id` — o status muda sozinho no celular do cliente.
5. **Segurança:** token inalcançável (não sequencial — **nunca** usar o número do pedido), revogável (`ativo=false`), expiração opcional, resposta idêntica para token inexistente (evitar enumeração), limite de chamadas, sem indexação pública, e o `anon` só passa pela RPC (RLS nega `SELECT` direto em `pedidos`).
6. **Conflitos:** valor é campo novo (`pedidos.valor`) — decidir se é visível; quantidade também não existe hoje (5.2).
7. **Alternativa sem servidor** (se quiser adiar): link com os dados codificados no próprio token (JWE) — funciona offline, mas **não atualiza sozinho** e tem limite de tamanho.

**[E] 12.1** Implementar depois da migração — depende de rotas, `pedidos.valor/quantidade`, RLS e Realtime. **Prioridade:** 🔴 de segurança se feito sem RLS · **Complexidade:** 🟡.

---

## 13. ARQUITETURA

**[B] 13.1 — Um arquivo faz tudo** (`App.tsx`: tipos + estado + regras + 6 modais + impressão + chat + personalização)
Divisão proposta **antes** da migração (reorganização = pré-requisito, não retrabalho):

```
src/
  domain/     tipos.ts, etapas.ts (regras de fila/permissão puras), datas.ts, formato.ts
  data/       repo.ts (interface PedidosRepo)   ← hoje: LocalRepo | depois: SupabaseRepo
              storage.ts, sequencia.ts, validacao.ts (zod)
  hooks/      usePedidos.ts, useAuth.ts, useChat.ts, useRealtime.ts
  components/ Header, Tabs, Filtros, PedidoCard, PedidoModal, NovoPedidoModal,
              PrintOS, Personalizar, ConfigProgresso, Chat, Toast, ErrorBoundary
  pages/      Login, Pedidos, Personalizar, Acompanhar (futuro)
  services/   supabase.ts, storage.ts (upload/ thumbnail)
```

**[B] 13.2 — Regras de negócio misturadas com UI**
`motivoBloqueio`, `canX`, `criarPedido`, `salvarEdicao` vivem dentro do componente — impossível testar. Devem virar funções puras em `domain/` com testes (Vitest). **Complexidade:** 🔴-🟡

**[B] 13.3 — Sem rotas** — necessário pra `/login` e `/acompanhar/:token` (react-router). **Complexidade:** 🟡

**[B] 13.4 — Estado redundante/denormalizado** — `progresso` no pedido, `selected` como cópia, `temp*` como rascunhos: revisar ao extrair a camada de dados. **Complexidade:** 🟡

**[C] 13.5 — Sem `strict` no TypeScript, sem ErrorBoundary, 7 warnings do oxlint, zero testes, arquivos mortos** — 🟢, resolver na reorganização.

---

# CHECKLIST FINAL

## A — Críticos: resolver ANTES da migração

| # | Item | Por que é crítico | Complex. |
|---|---|---|---|
| **A-1** | **3.3 + 13.1** Extrair camada de dados + quebrar o arquivo em módulos | sem isso, migrar = mexer em 25 pontos de um arquivo de 1.725 linhas; é o gargalo de tudo | 🔴 |
| **A-2** | **5.5 + 4.1 + 4.2 + S-1/S-2/S-3** Auth real + matriz de permissões + RLS | sem isso, hospedar = sistema aberto a qualquer um e permissões falsas | 🔴 |
| **A-3** | **7.1 + 1.5** Fila transacional (RPC) e numeração atômica | dois PCs avançam o mesmo pedido e geram número duplicado — a regra central deixa de existir | 🔴 |
| **A-4** | **1.3 + 6.1** Otimizar arte e tratar cota | perda de pedidos reais hoje (setItem falha e não grava) | 🟢 |
| **A-5** | **1.1 + 1.2** Botão de substituir arte + exigir/avisar arte no envio | pedido segue sem arte e não há como corrigir depois | 🟢 |
| **A-6** | **1.4 + 2.1 + 2.2** Cancelar/voltar etapa + criar ENTREGUE + saída pra fila | fila sem escape trava a produção até a meia-noite | 🟡 |
| **A-7** | **8.1 + 8.2** Decidir política de histórico e modelar auditoria | hoje tudo é apagado à meia-noite; a modelagem nasce errada se decidir depois | 🟡 |
| **A-8** | **5.2 + 5.1** Fechar o modelo de dados (schema, fuso, campos novos: quantidade/valor/telefone) | número por dia, datas e campos que o item 12 exige precisam existir na criação das tabelas | 🟡 |
| **A-9** | **5.3** Exportar/importar backup dos dados atuais | hoje não há como tirar nada do `localStorage` com segurança | 🟡 |
| **A-10** | **1.7 + 1.8** Não sobrescrever dados corrompidos + ErrorBoundary | perda silenciosa total em caso de dado inválido | 🟢 |
| **A-11** | **3.1 + 3.2 + 2.4** Decidir chat/visual/alertas como recursos globais (Realtime) | hoje cada PC tem mundo próprio (inclusive OS impressa diferente) | 🟡 |
| **A-12** | **S-6 + S-5** `.env` no gitignore, expor só o necessário | preparação imediata de segurança | 🟢 |

## B — Importantes: antes ou durante a migração

- **1.6** Fuso/data única (🟢)
- **1.9** Lock otimista de edição (🟡)
- **2.3** Pedido desatualizado sem aviso (🟡)
- **2.5** Previsões fora da auditoria (🟡)
- **3.4** Feedback de concorrência "atualizado por X" (🟡)
- **4.3** Gestão de usuários + logout (🟡)
- **4.4** Router + tela de login (🟡)
- **5.4** Rotina de backup (🟡)
- **6.2/6.3** Não reescrever todas as imagens; tirar corte de pixel da main thread (🟡)
- **7.2/7.3** Mostrar bloqueio no card + override do admin (🟡)
- **8.3** Autor por `user_id` (🟡)
- **13.2/13.3/13.4** Regras puras testáveis, rotas, estado sem redundância (🟡)
- **S-8** CSP/headers/HTTPS na hospedagem (🟡)
- **S-7** sair do `localStorage` (resolve na migração)
- **1.11** limpeza de código e arquivos mortos (🟢)

## C — Melhorias recomendadas (não travam a migração)

1. Testes unitários das regras puras — `motivoBloqueio`, `apagarPedidosDoDia`, numeração, datas (Vitest) · **Média**
2. `strict: true` no TypeScript + zerar os 7 warnings do oxlint · **Baixa**
3. `React.memo` no card + uma passada só pro `stats` · **Baixa**
4. `maxLength` nos campos + limitar `accept` a `png,jpg,jpeg,webp` · **Baixa**
5. Atalhos de teclado (`N`, `/`, `Esc`), confirmação ao descartar formulário · **Baixa**
6. Corrigir extensão do download da arte (conforme MIME real) · **Baixa**
7. Remover `seqAposReset` global e o texto "Pedido unico nunca duplicado" · **Baixa**
8. `index.html`: título "STAMPE", `lang="pt-BR"`, favicon da marca · **Baixa**

## D — Melhorias visuais e de experiência (depois da migração)

1. Dashboard com KPIs + kanban das 4 etapas · **Alta**
2. Card com próxima ação, posição na fila, bloqueio e badge de atraso · **Média**
3. Tema com variáveis CSS — cards acompanham a cor da marca · **Média**
4. Experiência inicial por perfil (venda/impressão/produção caem na fila certa) · **Média**
5. Acessibilidade: teclado, `Esc`, foco, contraste, `aria-*` · **Média**
6. Ícones de biblioteca no lugar de emoji · **Baixa**
7. Tirar o hífen `-` dos dados, recolher a caixa de "Fluxo", limpar rodapé · **Baixa**
8. Seletor de ordenação junto dos filtros; chat que não cobre botões no mobile · **Baixa**
9. Página de login com a identidade da marca · **Média**

## E — Funcionalidades futuras

1. **12** Link de acompanhamento do cliente (`/acompanhar/:token`, RLS + Realtime) · **Média** · segurança crítica
2. **2.1** Etapa ENTREGUE com data/responsável · **Baixa**
3. **2.4/3.1** Chat/mensagens reais entre PCs (tabela + Realtime) · **Média**
4. Campos novos: quantidade, valor, telefone, itens, prioridade · **Baixa**
5. Histórico/consultas por período (relatórios, exportação PDF/CSV) · **Média**
6. Notificações ao entrar na etapa (toast/web push) · **Média**
7. Imprimir fila do dia / ficha de produção em lote · **Baixa**
8. Múltiplas artes por pedido · **Média**

---

## ORDEM DE EXECUÇÃO SUGERIDA

1. **Preparar (sem mexer no visual):** A-4, A-5, A-10, A-12, C-1, C-2 → código estável e testado.
2. **Reorganizar:** A-1, C-8, 13.x → `domain/` + `data/repo.ts` com `LocalRepo` funcionando igual (zero mudança de comportamento, testes verdes).
3. **Fechar decisões:** A-7, A-8, A-11, 5.2 (histórico, fuso, etapas, campos, config global).
4. **Migrar:** schema + RLS + RPC (A-2, A-3, A-6) → `SupabaseRepo` → auth → Realtime → A-9 (importar dados) → teste com 2+ PCs.
5. **Depois:** D (visual/dashboard) e E (link do cliente, entregue, chat).

---

## RESPOSTA RÁPIDA — Perguntas frequentes do briefing

- **Duas pessoas ao mesmo tempo, sem conflito?** Hoje sim, porque não se enxergam. Depois da migração só com RPC transacional + lock otimista.
- **Alteração aparece nos outros PCs?** Não, nada sincroniza.
- **Risco de perder informação?** Sim: quota do `localStorage`, reset diário, corrupção sem backup, colisão de número.
- **Fila com vários usuários?** Não funciona em rede — é calculada na lista local.
- **Permissões seguras?** Não — só escondem botões; perfil é escolhido livremente.
- **Artes?** base64 no `localStorage`, sem otimização no pedido, cota ~5MB compartilhada → usar Supabase Storage.
- **Histórico?** Apagado todo dia à meia-noite, contradizendo a apresentação do projeto.
- **Link do cliente?** Desenhado no §12; depende de rotas, campos novos, RLS e Realtime.


---

# PROMPT MESTRE — CONTINUIDADE E EVOLUÇÃO DO STAMPE

Este arquivo é a **fonte de referência do projeto STAMPE durante sua evolução**.

Seu objetivo é impedir que decisões, requisitos, problemas identificados, ideias e definições importantes sejam esquecidos durante o desenvolvimento.

> **Nota:** este documento foi criado a pedido explícito do usuário em 26/09/2026. Ele é referência de planejamento — **não** é um arquivo de código e não deve ser alterado para "atualizar memória" sem que haja uma tarefa real de desenvolvimento.

---

## 1. REGRA PRINCIPAL

Não simplifique o projeto apenas porque uma solução parece mais complexa.

O objetivo é construir o STAMPE da forma mais sólida, organizada, segura, escalável e profissional possível.

Se uma solução melhor exigir mais tempo, mais etapas ou maior complexidade, isso não deve ser considerado um problema automaticamente.

Primeiro analise a solução correta.

Depois avalie:

- complexidade;
- tempo;
- riscos;
- dependências;
- possibilidade de implementação por etapas.

**Não elimine uma melhoria importante simplesmente por parecer trabalhosa.**

---

## 2. PRESERVAÇÃO DO CONTEXTO

Tudo que for decidido durante o desenvolvimento deve ser registrado neste documento.

Não assumir que uma decisão deixou de existir porque o assunto da conversa mudou.

Uma decisão só deve ser considerada alterada quando houver uma nova decisão explícita substituindo a anterior.

Quando uma nova ideia entrar em conflito com uma decisão anterior, sinalizar o conflito antes de alterar qualquer coisa.

---

## 3. NÃO ALTERAR O PROJETO SEM NECESSIDADE

Este documento é principalmente uma referência de planejamento, contexto e continuidade.

Não modificar arquivos do projeto apenas para criar ou atualizar esta memória.

As alterações no código devem acontecer somente quando fizerem parte de uma tarefa de desenvolvimento definida.

---

## 4. ANALISAR ANTES DE EXECUTAR

Antes de realizar uma alteração importante:

1. Entender o funcionamento atual;
2. Identificar dependências;
3. Verificar possíveis efeitos colaterais;
4. Comparar com as decisões já registradas;
5. Identificar riscos;
6. Propor a solução;
7. Somente então executar.

Quando houver dúvida relevante, apresentar a dúvida e pedir confirmação.

Não tomar decisões irreversíveis silenciosamente.

---

## 5. MELHORIA CONTÍNUA

Não limitar a análise ao que foi solicitado literalmente.

Se durante a análise for identificado:

- um problema;
- uma vulnerabilidade;
- uma inconsistência;
- uma oportunidade de melhoria;
- uma melhoria de experiência do usuário;
- uma melhoria de desempenho;
- uma melhoria de arquitetura;
- uma possibilidade de automação;
- uma forma melhor de organizar o fluxo;

registrar a descoberta e explicar sua importância.

Isso não significa implementar tudo automaticamente.

Significa **identificar, analisar e registrar** para que nenhuma oportunidade importante seja perdida.

---

## 6. NÃO CONFUNDIR IDEIA COM DECISÃO

Classificar as informações corretamente.

### DECISÃO
Algo que foi definido e deve ser seguido.

### REQUISITO
Algo que o sistema precisa fazer.

### IDEIA
Uma possibilidade que ainda precisa ser avaliada.

### PROBLEMA
Algo identificado no sistema atual que precisa de atenção.

### MELHORIA
Algo que pode tornar o sistema melhor, mas não necessariamente bloqueia a evolução.

### PENDÊNCIA
Algo que ainda precisa de decisão humana.

Nunca transformar automaticamente uma ideia em requisito definitivo.

---

## 7. REGISTRO DAS DECISÕES

Manter uma seção com: ID da decisão; Data; Decisão; Motivo; Impacto; Status.

---

## 8. REGISTRO DE PERGUNTAS E PENDÊNCIAS

Toda questão que ainda depender de decisão deve permanecer registrada.

Uma pendência não deve simplesmente desaparecer porque o assunto mudou.

---

## 9. REGISTRO DE PROBLEMAS

Para cada problema encontrado: ID; Local; Descrição; Causa provável; Impacto; Gravidade; Solução sugerida; Status.

Classificar como: 🔴 Crítico · 🟠 Importante · 🟡 Moderado · 🟢 Baixo

---

## 10. REGISTRO DE TAREFAS

Manter uma lista de tarefas com: Tarefa; Prioridade; Dependências; Status; Observações.

Status possíveis: ⬜ Não iniciado · 🟡 Em análise · 🔵 Em desenvolvimento · 🟣 Em teste · ✅ Concluído · 🔴 Bloqueado

---

## 11. ARQUITETURA DO STAMPE

Manter registrada a arquitetura atual e a arquitetura planejada.

Objetivo previsto: **Usuário → STAMPE → API/serviços → Supabase**, com banco de dados, autenticação, permissões, Storage para artes, fila, histórico, comunicação entre setores e acompanhamento do cliente.

---

## 12. FLUXO PRINCIPAL

**Venda → Arte → Impressão/Produção → Finalização → Entrega**

Cada etapa deve saber: quais pedidos estão aguardando; quais estão em andamento; quais foram concluídos; quem realizou a ação; quando a ação aconteceu; qual é a próxima etapa.

---

## 13. MÚLTIPLOS COMPUTADORES

O sistema deve ser pensado para utilização simultânea por vários computadores.

Sempre verificar possíveis problemas de: concorrência; sincronização; duplicação; atualização de dados; conflitos de edição; fila; perda de informação; permissões.

Uma funcionalidade que funciona em um único computador não deve ser considerada automaticamente pronta para produção.

---

## 14. EXPERIÊNCIA DE CADA PERFIL

### Venda/Atendimento — Criação e acompanhamento dos pedidos.
### Arte — Recebimento, análise e finalização das artes.
### Impressão/Produção — Visualização e gerenciamento da fila de produção/impressão.
### Finalização — Controle dos pedidos finalizados e próximos passos.
### Administrador — Usuários, permissões, configurações e gerenciamento do sistema.

---

## 15. CLIENTE

O sistema deverá futuramente permitir que o cliente acompanhe o próprio pedido através de um link, apresentando: nome; produto; quantidade; status; percentual de conclusão; etapa atual; informações autorizadas; situação para entrega.

O acesso público deve mostrar somente as informações autorizadas daquele pedido.

---

## 16. VISUAL E EXPERIÊNCIA

Depois que a base técnica estiver segura, analisar continuamente: dashboard; layout; navegação; cards; botões; menus; responsividade; organização das informações; identificação dos pedidos; indicadores; facilidade de uso.

O visual não deve ser melhorado de maneira que prejudique o fluxo de trabalho.

---

## 17. PRINCÍPIO DE QUALIDADE

Não considerar uma tarefa concluída apenas porque "funciona".

Verificar: funcionamento; segurança; desempenho; manutenção; experiência do usuário; funcionamento simultâneo; possibilidade de crescimento; impacto nas outras áreas.

---

## 18. ANTES DE FINALIZAR UMA ETAPA

Sempre verificar:

1. O que foi alterado?
2. O que continua pendente?
3. Alguma decisão mudou?
4. Algum problema novo apareceu?
5. Alguma dependência foi criada?
6. Existe risco de regressão?
7. O próximo passo está definido?

---

## 19. HISTÓRICO

Não apagar decisões antigas sem necessidade.

Quando uma decisão for substituída, registrar: **Decisão anterior → Nova decisão → Motivo da mudança**.

---

## 20. PRINCÍPIO FINAL

O STAMPE será desenvolvido de forma gradual. Não existe necessidade de fazer tudo imediatamente.

A prioridade é: **correto → seguro → estável → integrado → escalável → fácil de usar → visualmente melhor**

Velocidade é importante, mas não deve ser obtida sacrificando a qualidade ou criando retrabalho.

Sempre procurar a solução que permita construir o sistema uma vez e evoluí-lo posteriormente sem precisar refazer partes importantes.

---
---

# ESTADO ATUAL DO PROJETO

**Atualizado em:** 26/09/2026
**Documentos de apoio:** `AUDITORIA_STAMPE.md` (auditoria técnica completa) · `APRESENTACAO_PROJETO_STAMPE.md` · `CONVERSA.md` · `README.md`

**Resumo:** 16 decisões registradas (001–016, todas confirmadas) · 50 problemas abertos (8 críticos · 23 importantes · 10 moderados · 9 baixos) · 27 tarefas · 15 pendências abertas + 2 encerradas (PEND-016, PEND-017) · 14 ideias futuras · 0 tarefas concluídas.

**Fase atual do Plano Mestre:** FASE 0 — Consolidação de contexto e decisões de modelo (em execução desde 26/09/2026).

---

## OBJETIVOS CONFIRMADOS

- Migrar para Supabase;
- Criar login com senha;
- Criar permissões por perfil;
- Trabalhar com vários computadores;
- Centralizar os pedidos;
- Integrar Venda → Arte → Impressão/Produção → Finalização → Entrega;
- Permitir acompanhamento do pedido pelo cliente através de link;
- Melhorar posteriormente o dashboard e o layout;
- Manter histórico e rastreabilidade das operações.

---

## ARQUITETURA

### Atual (26/09/2026)

```
Navegador (1 PC = 1 mundo isolado)
 └─ Vite 8 + React 19 + TypeScript (SEM strict) + Tailwind 4
     └─ src/App.tsx — 1.725 linhas (tipos + estado + regras + 6 modais + impressão + chat + personalização)
         └─ localStorage (stampe_pedidos_v3, _seq, _user, _config, _visual, _chat, _dia_reset, _limpeza)
             · arte e logos em base64 dentro dos registros
             · numeração sequencial local
             · fila calculada na lista local
             · reset diário apaga pedidos de ontem
 └─ sem rotas · sem auth · sem backend · sem testes · sem ErrorBoundary
```

### Planejada

```
Usuário → STAMPE (React + rotas + camada de dados) → API/serviços (RPC/RLS) → Supabase
                                                                    ├─ PostgreSQL (pedidos, eventos, infos, usuários, config)
                                                                    ├─ Auth (login + perfis/permissões)
                                                                    ├─ Storage (artes + thumbnails)
                                                                    ├─ Realtime (fila, chat, alertas, link do cliente)
                                                                    └─ RLS (segurança no banco)
Hospedagem: Netlify ou Cloudflare Pages (a decidir — PEND-009)
```

### Camada de dados proposta (pré-requisito da migração)

Interface única `PedidosRepo` com duas implementações: `LocalRepo` (hoje) e `SupabaseRepo` (depois). Nenhum componente deve falar diretamente com `localStorage` nem com o cliente Supabase.

---

## FLUXO PRINCIPAL — situação de cada etapa

| Etapa | Existe hoje? | Responsável | Situação |
|---|---|---|---|
| **Venda/Atendimento** | ✅ | Venda | Funciona — sem validação de arte |
| **Arte** | ❌ não é etapa | (Venda) | **Pendência:** decidir se vira etapa própria (PEND-008) |
| **Impressão** | ✅ | Impressão | Funciona — fila estrita, sem trava transacional |
| **Produção/Finalização** | ✅ | Produção | Funciona — 1 pedido por vez |
| **Finalizado (100%)** | ✅ | — | Funciona |
| **Entrega/Entregue** | ❌ | — | **Não existe** — necessário pela DECISÃO-009 (PROBLEMA-016) |

O que cada etapa precisa saber (aguardando, em andamento, concluído, quem, quando, próxima) está **parcialmente** implementado: quem/quando existe por pedido, mas **não existe fila visível por etapa, nem alerta para o próximo responsável**.

---

## MÚLTIPLOS COMPUTADORES — diagnóstico

| Verificação | Situação hoje |
|---|---|
| Sincronização entre PCs | ❌ inexistente |
| Conflito de edição | ❌ não detectado (1.9) — vira last-write-wins com banco |
| Duplicação | ⚠️ numeração duplicável entre abas/PCs (1.5) |
| Fila com múltiplos usuários | ❌ calculada localmente — dois PCs avançam o mesmo pedido (7.1) |
| Perda de informação | ⚠️ quota do `localStorage`, reset diário, corrupção sem backup |
| Permissões | ❌ só escondem botão; perfil escolhido livremente |
| Chat/alertas | ❌ só entre abas do mesmo navegador |

**Conclusão registrada:** funcionalidade local **não** pode ser considerada pronta para produção (regra §13).

---

## PERFIS — experiência prevista

| Perfil | Precisa ver | Precisa fazer | Hoje |
|---|---|---|---|
| **Venda/Atendimento** | novos pedidos, minha fila, histórico do que criou | criar, editar (etapa PEDIDO), arte, enviar p/ impressão, link do cliente | vê tudo, sem separação |
| **Arte** | pedidos aguardando arte | receber/analisar/finalizar arte | **não existe como perfil/etapa** (PEND-006/008) |
| **Impressão** | fila de impressão, posição e bloqueios | previsão, infos, enviar p/ produção | vê a tela inteira |
| **Finalização/Produção** | fila de finalização, próximos passos | previsão, infos, finalizar/entregar | vê a tela inteira |
| **Administrador** | tudo + usuários + auditoria | gerenciar usuários, config, fila forçada, backup | não existe |

Matriz detalhada de permissões: ver `AUDITORIA_STAMPE.md` §4.

---

## DECISÕES CONFIRMADAS

**DECISÃO-001** — 26/09/2026
Sistema utilizará **Supabase** como infraestrutura central de dados (PostgreSQL, API, Realtime, Storage, Auth).
**Motivo:** os dados hoje ficam presos no navegador de cada computador.
**Impacto:** toda a camada de dados será reescrita; interface preservada.
**Status: Confirmada.**

**DECISÃO-002** — 26/09/2026
Sistema terá **login com senha e permissões por perfil**.
**Motivo:** hoje qualquer pessoa se declara Admin em 2 cliques; a auditoria registra nome digitado.
**Impacto:** autenticação + tabela de perfis + RLS no banco.
**Status: Confirmada.**

**DECISÃO-003** — 26/09/2026
**Preservar interface, telas e regras atuais** — mudar a forma de armazenar/compartilhar, não refazer o sistema visual.
**Motivo:** as telas estão funcionando; retrabalho visual é evitável.
**Impacto:** melhorias visuais ficam numa fase posterior (lista D).
**Status: Confirmada.**

**DECISÃO-004** — 26/09/2026
Artes ficam no **Storage**, nunca em base64 dentro do banco; o banco guarda apenas a referência.
**Motivo:** base64 no `localStorage` já estoura cota e causa perda de pedidos (PROBLEMA-001).
**Impacto:** reescrever upload/preview/download de imagens + migração das artes existentes.
**Status: Confirmada.**

**DECISÃO-005** — 26/09/2026
**Vendedor, impressão e produção trabalham sobre os mesmos pedidos**, em tempo real, com numeração controlada pelo banco e fila protegida contra alterações simultâneas.
**Motivo:** é o objetivo central do projeto.
**Impacto:** exige RPC transacional (PROBLEMA-006) e Realtime.
**Status: Confirmada.**

**DECISÃO-006** — 26/09/2026
**Histórico preservado:** não apagar automaticamente os pedidos no reset diário; a numeração pode reiniciar a cada dia, mas os pedidos permanecem armazenados para consulta.
**Motivo:** apresentação do projeto §7 — rastreabilidade exigida.
**Impacto:** ⚠️ **CONFLITO COM O CÓDIGO ATUAL** (PROBLEMA-011 — `apagarPedidosDoDia` apaga tudo de ontem). Ver §Conflitos.
**Status: Confirmada (a substituir o comportamento atual).**

**DECISÃO-007** — 26/09/2026
**Numeração reinicia por dia** e números repetidos entre dias diferentes são aceitos.
**Motivo:** cada pedido tem sua data; repetição por dia não confunde.
**Impacto:** `UNIQUE(dia, numero)` no banco, não `UNIQUE(numero)`.
**Status: Confirmada.**

**DECISÃO-008** — 26/09/2026
Fluxo principal obrigatório: **Venda → Arte → Impressão/Produção → Finalização → Entrega**.
**Motivo:** definição do fluxo operacional real da gráfica.
**Impacto:** o modelo atual **não tem** etapa Arte nem etapa Entrega (PROBLEMA-016, PEND-008).
**Status: Confirmada.**

**DECISÃO-009** — 26/09/2026
Perfis iniciais: **Venda/Atendimento · Impressão · Produção/Finalização · Administrador**.
**Motivo:** definição do briefing de requisitos (§4 do pedido de auditoria).
**Impacto:** ⚠️ existe conflito com o §14 deste documento, que lista **Arte** como área separada. Ver §Conflitos e PEND-006.
**Status: Confirmada, com conflito sinalizado.**

**DECISÃO-010** — 26/09/2026
O cliente acompanhará o pedido por **link público**, vendo somente as informações autorizadas daquele pedido.
**Motivo:** requisito do projeto (§15).
**Impacto:** rota pública + token + RLS; nada de dados internos expostos.
**Status: Confirmada (implantação futura — lista E).**

**DECISÃO-011** — 26/09/2026
Aplicação hospedada em plataforma com uso comercial no **plataforma gratuita** (Netlify ou Cloudflare Pages).
**Motivo:** manter custo inicial previsto em R$ 0.
**Impacto:** escolha entre Netlify e Cloudflare ainda não feita (PEND-009).
**Status: Confirmada (plataforma específica: em decisão).**

**DECISÃO-012** — 26/09/2026
Desenvolvimento **gradual e por etapas**, sem sacrificar qualidade por velocidade; ordem de prioridade: correto → seguro → estável → integrado → escalável → fácil de usar → visual.
**Motivo:** princípio final §20.
**Impacto:** nenhuma tarefa é "concluída" só porque funciona (§17).
**Status: Confirmada.**

**DECISÃO-013** — 26/09/2026
**Auditoria técnica completa** é o primeiro marco, feita antes de qualquer código de migração.
**Motivo:** evitar descobrir problemas só em produção.
**Impacto:** gerou `AUDITORIA_STAMPE.md` com 50 problemas registrados abaixo.
**Status: Concluída em 26/09/2026.**

**DECISÃO-014** — 26/09/2026
`STAMPE_REFERENCIA_COMPLETA.md` passa a ser a **fonte única** de contexto do projeto (consolida as três fontes + o plano). `AUDITORIA_STAMPE.md` e `PROMPT_MESTRE.md` ficam congelados como snapshots históricos de 26/09/2026 e **não devem mais ser editados**.
**Motivo:** o conteúdo passou a existir duas vezes; manter os dois atualizados faria os documentos divergirem (rastro perdido, decisões contraditórias).
**Impacto:** toda decisão, pendência, problema, tarefa e histórico passam a ser registrados **apenas** neste arquivo; os avulsos vêm apenas para consulta histórica.
**Status: Confirmada.**

**DECISÃO-015** — 26/09/2026
Ordem das **9 fases do Plano Mestre de Execução** aprovada, incluindo o desvio arquitetural: **Schema → RLS/Auth → Fila RPC → Camada de dados** permanece dentro da mesma fase de arquitetura de dados.
**Motivo:** schema, segurança, permissões e operações transacionais da fila estão diretamente relacionados; separá-los artificialmente gera retrabalho, inconsistências e uma janela em que o banco exista sem as proteções definitivas.
**Impacto:** Plano Mestre v1 liberado; Fase 0 (consolidação de decisões de modelo) é a primeira etapa formal.
**Status: Confirmada (era PROPOSTA — aprovada pelo usuário em 26/09/2026).**

**DECISÃO-016** — 26/09/2026
**FASE 0 PRIMEIRO.** Nenhuma tabela, schema definitivo, migração estrutural, corte de produção ou desativação do sistema anterior enquanto existirem pendências de modelo que possam alterar: estrutura de tabelas, relacionamentos, perfis, fluxo, etapas, permissões, fila, histórico, campos importantes, autenticação ou regras de negócio. Tarefas da Fase 1 comprovadamente independentes das decisões de modelo podem ser analisadas separadamente — sem usar isso como motivo para atropelar a Fase 0; havendo dúvida sobre independência, apresentar a dependência antes de executar.
**Motivo:** pendências de modelo abertas podem alterar a estrutura do banco; decidir depois obriga retrabalho e cria risco de decisão implícita.
**Impacto:** ordem de execução = Fase 0 → fechar decisões e conflitos → registrar → validar → relatório → somente então liberar a próxima etapa.
**Status: Confirmada.**

---

## ⚠️ CONFLITOS ENTRE DECISÕES (sinalizar antes de alterar)

| # | Decisão anterior | Ideia/nova informação | O que fazer |
|---|---|---|---|
| **C-1** | DECISÃO-006 — histórico nunca é apagado | Código atual apaga todos os pedidos de ontem (`apagarPedidosDoDia`) | **Não alterar silenciosamente.** A decisão prevalece; o código é que está errado → PROBLEMA-011 / TAREFA-013. Antes de mexer, decidir como tratar os dados já apagados (PEND-004). → ✅ **ENCERRADO (26/09/2026):** código corrigido (só reinicia numeração) + PEND-004 = fim definitivo, nada a migrar. |
| **C-2** | DECISÃO-009 — 4 perfis (sem Arte) | §14 deste documento lista **Arte** como área separada | Não criar nem eliminar o perfil de Arte sem decisão explícita → **PEND-006**. → ✅ **ENCERRADO (26/09/2026):** não existe perfil Arte; 4 perfis. |
| **C-3** | DECISÃO-008 — fluxo inclui etapa **Arte** | Código atual não tem etapa Arte (arte é feita dentro da etapa PEDIDO) | Não inserir etapa nova sem validar com o fluxo real da equipe → **PEND-008**. → ✅ **ENCERRADO (26/09/2026):** arte fica dentro de PEDIDO; a etapa **ENTREGA** do mesmo fluxo foi confirmada em PEND-018. |
| **C-4** | Fila estrita atual: **1 pedido por etapa**, sem exceção | Multi-PC simultâneo pode exigir mais de 1 em produção | Não alterar a regra por conta própria → **PEND-014**. → ✅ **ENCERRADO (26/09/2026):** mantida a fila estrita. |

---

## PROBLEMAS ENCONTRADOS

> Detalhamento completo (com complexidade e evidência de código) em `AUDITORIA_STAMPE.md`.
> Status inicial de todos: **Aberto**.

### 🔴 CRÍTICOS

| ID | Local | Descrição — Causa → Impacto | Solução sugerida |
|---|---|---|---|
| PROBLEMA-001 | `App.tsx:359`, `App.tsx:226` | Arte enviada sem otimização (aceita 4MB em base64 cru, ~5,3MB gravados) → **Causa:** `handleFile` não usa `otimizarImagem`; cota do `localStorage` (~5MB) é compartilhada → **Impacto:** `setItem` falha e **o pedido não é salvo**; some no reload | Passar arte por `otimizarImagem`, checar cota, avisar erro de gravação |
| PROBLEMA-002 | `App.tsx:1230` vs `1497` | Arte não pode ser substituída depois de criada → **Causa:** o texto promete "(pode substituir)" mas não existe botão de upload na edição → **Impacto:** arte errada sem correção, pedido recriado só pra trocar imagem | Botão "Substituir arte" no modo edição |
| PROBLEMA-003 | `App.tsx:368`, `428` | Pedido sem arte pode ser enviado pra Impressão → **Causa:** `arteUrl` opcional e sem validação no envio → **Impacto:** produção recebe pedido sem arte e não há como voltar etapa | Validar/avisar na passagem de etapa |
| PROBLEMA-004 | `App.tsx:341` | Fila sem saída: não existe cancelar, excluir, voltar etapa nem override de Admin → **Causa:** nenhuma função de retrocesso no código → **Impacto:** pedido travado bloqueia a fila até a meia-noite | Ações CANCELAR / VOLTAR ETAPA (com motivo e auditoria) + override Admin |
| PROBLEMA-005 | `App.tsx:174` | Numeração duplicável → **Causa:** `seq` em estado local por navegador, sem checagem de colisão → **Impacto:** dois pedidos com o mesmo número, mesmo dentro de uma máquina | Numeração atômica no servidor + `UNIQUE(dia, numero)` |
| PROBLEMA-006 | `App.tsx:341-357`, `428-451` | Fila não transacional entre PCs → **Causa:** regra avaliada sobre a lista local → **Impacto:** dois PCs avançam o mesmo pedido ao mesmo tempo; 2 pedidos na mesma etapa | RPC `avancar_etapa()` com transação/lock + `versao` |
| PROBLEMA-007 | `App.tsx:332-337`, `683-697` | Sem autenticação; permissão só esconde botão; identidade é texto livre → **Causa:** `user` gravado em `localStorage` sem senha → **Impacto:** qualquer um vira Admin; auditoria atribui ação a nome errado | Supabase Auth + `perfis(user_id, role)` + RLS |
| PROBLEMA-008 | (futuro banco) | RLS ausente → **Causa:** ainda não existe banco → **Impacto:** com a chave `anon` no bundle, acesso total a todos os dados | Ligar RLS desde o primeiro dia; escrita só via RPC |
| PROBLEMA-009 | `App.tsx:140-272` | Sem camada de dados: ~25 chamadas de `localStorage` dentro do componente → **Causa:** tudo construído num arquivo só → **Impacto:** migração = mexer em 25 pontos; alto risco de regressão | Extrair `PedidosRepo` (LocalRepo → SupabaseRepo) |
| PROBLEMA-010 | `App.tsx:172`, `226` | Dados corrompidos são sobrescritos em silêncio → **Causa:** `JSON.parse` em `try` vira `[]` e o effect grava `[]` por cima → **Impacto:** perda total dos pedidos | Validar shape; preservar bruto em chave de backup; ErrorBoundary |
| PROBLEMA-011 | `App.tsx:81` | Reset diário apaga definitivamente todo pedido de ontem (histórico, artes, auditoria) → **Causa:** `apagarPedidosDoDia` roda no load e a cada 30s → **Impacto:** contradiz DECISÃO-006; sem histórico | Parar de apagar; manter apenas a reinicialização da numeração |
| PROBLEMA-012 | `App.tsx:406-415` | Auditoria incompleta → **Causa:** histórico registra só edições da etapa PEDIDO; previsões/infos/etapas ficam fora → **Impacto:** não é possível responder "quem mudou o quê" | Tabela `pedido_eventos` append-only (edição, etapa, previsão, info, cancelamento, entrega) |
| PROBLEMA-013 | `App.tsx:842`, `226` | Limite de arquitetura de ~5MB por navegador → **Causa:** arte e config em base64 no `localStorage` → **Impacto:** poucos pedidos com arte simultaneamente; sistema não escala | Storage do Supabase (DECISÃO-004) |

### 🟠 IMPORTANTES

| ID | Local | Descrição — Causa → Impacto | Solução sugerida |
|---|---|---|---|
| PROBLEMA-014 | `App.tsx:136` vs `77` | Data padrão errada depois das 21h → **Causa:** `hojeISO()` usa UTC e `diaLocal()` usa fuso local → **Impacto:** previsão/início com um dia a mais | Função única de data local + decisão de fuso (PEND-002) |
| PROBLEMA-015 | `App.tsx:391-426` | Edição por snapshot (last-write-wins) → **Causa:** `salvarEdicao` grava a partir do objeto em memória → **Impacto:** com banco, uma edição sobrescreve outra em silêncio | `versao INT` + revalidação no servidor |
| PROBLEMA-016 | modelo `Pedido` | Etapas **Arte** e **Entrega** não existem → **Causa:** modelo tem só PEDIDO/IMPRESSAO/FINALIZACAO/FINALIZADO → **Impacto:** DECISÃO-008 não é atendível; cliente não vê "pronto para entrega" | Estender enum de etapas (depende de PEND-008) |
| PROBLEMA-017 | `main.tsx` | Sem ErrorBoundary e sem validação de schema → **Causa:** nenhum tratamento de exceção de render → **Impacto:** um registro inválido derruba o sistema inteiro | ErrorBoundary global + validação (zod) na leitura |
| PROBLEMA-018 | `App.tsx:235-240` | Pedido some/desatualiza sem aviso → **Causa:** reset diário fecha o modal; sem sincronização entre PCs → **Impacto:** operador trabalha com dados velhos | Realtime + aviso "atualizado por X" |
| PROBLEMA-019 | `App.tsx:428` | Sem notificação ao próximo responsável → **Causa:** nenhum alerta quando o pedido muda de etapa → **Impacto:** pedido parado até alguém olhar a tela | Realtime + notificação por etapa |
| PROBLEMA-020 | `App.tsx:482-494` | Previsões e infos fora da auditoria → **Causa:** não registram valor anterior nem evento → **Impacto:** mudança de prazo sem rastro | Incluir em `pedido_eventos` |
| PROBLEMA-021 | `App.tsx:278` | Chat só entre abas do mesmo navegador → **Causa:** `BroadcastChannel` não cruza computadores → **Impacto:** equipe acha que tem chat interno e não tem | Tabela + Realtime (ou remover o recurso — PEND-013) |
| PROBLEMA-022 | `App.tsx:190` | Personalização visual é por navegador → **Causa:** `LS_VISUAL` local → **Impacto:** cada PC imprime OS com logo/cor diferente | Config global editável só por Admin (PEND-005) |
| PROBLEMA-023 | `App.tsx:140-272` | Sem feedback de concorrência → **Causa:** nenhuma UI de conflito → **Impacto:** alterações simultâneas passam despercebidas | Aviso de conflito + recarregar versão do servidor |
| PROBLEMA-024 | (não existe) | Sem gestão de usuários, sem logout, sem sessão → **Causa:** não há auth → **Impacto:** não é possível dar/baixar acesso | Cadastro, ativação, redefinição de senha, botão Sair |
| PROBLEMA-025 | (não existe) | Sem rotas (`/login`, `/acompanhar/:token`) → **Causa:** não há biblioteca de rotas → **Impacto:** bloqueia login e link do cliente | Adicionar react-router |
| PROBLEMA-026 | (não existe) | Sem exportar/importar backup dos dados atuais → **Causa:** nunca houve necessidade; hoje é manual via console → **Impacto:** migração sem cópia de segurança | Botões Exportar/Importar JSON (Admin) + script de carga |
| PROBLEMA-027 | (não existe) | Sem rotina de backup contínuo → **Causa:** não há banco → **Impacto:** após migrar, dependência única do Supabase | Export periódico (pg_dump) + cópia do Storage; verificar plano (PEND-011) |
| PROBLEMA-028 | `App.tsx:226` | Cada alteração reescreve todas as imagens → **Causa:** `JSON.stringify(pedidos)` inteiro → **Impacto:** lentidão crescente com o tempo | Resolver com Storage + paginação |
| PROBLEMA-029 | `App.tsx:514-535` | Otimização de imagem trava a interface → **Causa:** loop de até 36M pixels na main thread → **Impacto:** congelamento de 1–3s no upload | Web Worker ou limite menor de pixels |
| PROBLEMA-030 | `App.tsx:782-862` | Card não mostra fila/bloqueio/atraso → **Causa:** design não prioriza a próxima ação → **Impacto:** operador abre pedido pra descobrir que está bloqueado | Exibir posição na fila, bloqueador e badge de atraso (ver lista D) |
| PROBLEMA-031 | `App.tsx:341` | Fila sem override do administrador → **Causa:** `motivoBloqueio` não tem exceção → **Impacto:** ninguém destrava exceções (junto a PROBLEMA-004) | Ação administrativa registrada em auditoria |
| PROBLEMA-032 | `App.tsx:408` | Autor da alteração é texto digitado → **Causa:** campo `usuario` string → **Impacto:** rastreabilidade inválida | `usuario_id` FK para `perfis` |
| PROBLEMA-033 | `iniciar.bat` | Servidor de dev exposto na rede (`--host 0.0.0.0`) → **Causa:** flag do Vite → **Impacto:** código-fonte acessível a qualquer um na rede local | Restringir a localhost em ambiente normal |
| PROBLEMA-034 | `.gitignore` | `.env` não está ignorado (só `*.local`) → **Causa:** template padrão do Vite → **Impacto:** risco de commitar chaves do Supabase | Adicionar `.env`, `.env.*` ao `.gitignore` |
| PROBLEMA-035 | hospedagem | Sem CSP, headers de segurança e HTTPS definidos → **Causa:** ainda não hospedado → **Impacto:** exposição a XSS/injeção em produção | Definir na etapa de publicação |
| PROBLEMA-036 | `App.tsx` | Regras de negócio misturadas com a UI → **Causa:** `motivoBloqueio`, `canX`, `criarPedido` dentro do componente → **Impacto:** impossível testar; refazer tudo pra migrar | Mover para `domain/` como funções puras + testes |
| PROBLEMA-037 | `App.tsx:21` | Estado redundante (`progresso` no pedido, `selected` como cópia, `temp*`) → **Causa:** modelagem ad-hoc → **Impacto:** risco de dessincronização e retrabalho na migração | Derivar `progresso` de `etapa`; revisar estado ao extrair camada de dados |
| PROBLEMA-038 | `App.tsx:781-864` | Lista re-renderiza inteira sem memo → **Causa:** sem `React.memo`/virtualização → **Impacto:** lentidão a partir de ~60 cards com imagem | Memo + paginação + thumbnail |
| PROBLEMA-039 | `App.tsx:140-173`, `322` | Custos de carga e contagem → **Causa:** parse + re-map + re-escrita no boot; 5 filtros por render → **Impacto:** tempo de abertura e uso de CPU crescem com os dados | Lazy load, uma única passada, índices no banco |

### 🟡 MODERADOS

| ID | Local | Descrição — Causa → Impacto | Solução sugerida |
|---|---|---|---|
| PROBLEMA-040 | `App.tsx:704` | Botão "Progresso" inacessível no celular (`hidden sm:flex`) → sem outro caminho → impossível configurar percentuais no mobile | Exibir em telas pequenas ou mover para Personalizar |
| PROBLEMA-041 | `App.tsx:322` | `stats` faz 5 filtros separados por render → redundância → desperdiça CPU com muitos pedidos | Uma única passada acumulando contadores |
| PROBLEMA-042 | `App.tsx:716-737` | Não existe dashboard → só contadores → sem visão de atrasados, tempo por etapa, meta do dia | KPIs + gráfico + kanban (lista D) |
| PROBLEMA-043 | `App.tsx:814,1154,1215,1269,1444` | Cards ignoram a personalização de cor (vermelho fixo) → causa: cores hardcoded → header muda e cards não | Usar variáveis CSS do tema |
| PROBLEMA-044 | `App.tsx` | Sem acessibilidade/teclado → cards não focáveis, modais sem `Esc`, status só por cor, contraste baixo → usuários de teclado/leitura de tela excluídos | tabIndex/keydown, aria, contraste, foco |
| PROBLEMA-045 | `App.tsx` | Sem experiência por perfil → todos veem a mesma tela → cada equipe perde tempo procurando seu trabalho | Tela inicial por perfil (ver §Perfis) |
| PROBLEMA-046 | `App.tsx:704,1041` | Lacunas de responsividade → ordenação escondida em "Personalizar", chat cobre botões no mobile, scroll do fundo não bloqueado | Mover controles para os filtros; ajustar mobile |
| PROBLEMA-047 | `App.tsx:1451-1471` | Sem limite de tamanho nos campos de texto → causa: sem `maxLength` → payload abusivo/banco inchado | Definir limites por campo |
| PROBLEMA-048 | `App.tsx` | Fila filtra/ordena tudo no cliente → causa: sem índice/paginação → degrada com centenas de pedidos | Consultas com índice no banco |

### 🟢 BAIXOS

| ID | Local | Descrição — Causa → Impacto | Solução sugerida |
|---|---|---|---|
| PROBLEMA-049 | `App.tsx:75,103,217` | Resquícios de código → `seqAposReset` global, indentação quebrada, arquivos mortos (`App.css`, `hero.png`, `test_write.txt`, `debug.cjs`) → manutenção confusa | Limpeza geral |
| PROBLEMA-050 | `index.html`, `App.tsx:845`, `1622` | Metadados/textos incorretos → título "ruan", `lang="en"`, extensão `.png` forçada no download, rodapé promete "nunca duplicado" → identidade e confiança | Corrigir título/idioma/favicon e textos |

> **Não foram encontrados:** XSS por conteúdo (React escapa os textos), vazamento de chaves no repositório (não há `.env`), injeção de SQL (não há banco).

---

## TAREFAS

> Ordem de execução definida na auditoria: preparar → reorganizar → decidir → migrar → evoluir.

### Fase 1 — Preparar (sem mexer no visual)

| ID | Tarefa | Prioridade | Deps | Status | Observações |
|---|---|---|---|---|---|
| TAREFA-001 | Otimizar arte no upload + tratar cota + avisar falha de gravação | 🔴 Alta | — | ✅ **Concluída (Fase 0)** | resolve PROBLEMA-001/013 — `otimizarImagem()`, limite de 4MB e toast de quota |
| TAREFA-002 | Botão "Substituir arte" na edição + validação de arte ao avançar etapa | 🔴 Alta | — | ✅ **Concluída (Fase 0)** | resolve PROBLEMA-002/003 |
| TAREFA-003 | Proteger dados corrompidos (validar shape, backup do bruto) + ErrorBoundary | 🔴 Alta | — | ✅ **Concluída (Fase 0)** | resolve PROBLEMA-010/017 — testes em `storage.test.ts` |
| TAREFA-004 | `.env` no `.gitignore` + restringir exposão do dev server | 🔴 Alta | — | ✅ **Concluída (Fase 1)** | resolve PROBLEMA-033/034 — `.env*` no `.gitignore`; `iniciar.bat` sem `--host 0.0.0.0` |
| TAREFA-005 | Testes unitários das regras puras (fila, datas, numeração, reset) | 🟠 Média | — | ✅ **Concluída (Fase 0)** | Vitest — hoje **88 casos** em 7 arquivos |
| TAREFA-006 | `strict: true` no TypeScript + zerar os avisos do oxlint | 🟠 Média | — | ✅ **Concluída (Fase 1)** | `strict` nos dois tsconfigs · oxlint **0 erros e 0 avisos** (eram 7) |

### Fase 2 — Reorganizar

| ID | Tarefa | Prioridade | Deps | Status | Observações |
|---|---|---|---|---|---|
| TAREFA-007 | Extrair camada de dados (`PedidosRepo` / `LocalRepo`) e separar `domain/`, `hooks/`, `components/` | 🔴 Alta | TAREFA-005 | 🟡 **Metade (Fase 0)** — `domain/` + `data/` prontos e App usando o repo; `hooks/` e `components/` ficam para a Fase 2 | resolve PROBLEMA-009/036/037; **gargalo da migração** |
| TAREFA-008 | Corrigir `index.html` (título STAMPE, `pt-BR`, favicon) + textos/rodapé | 🟢 Baixa | — | ⬜ Não iniciado | resolve PROBLEMA-050 |
| TAREFA-009 | Limpeza de arquivos mortos e código residual | 🟢 Baixa | — | ⬜ Não iniciado | resolve PROBLEMA-049 |
| TAREFA-025 | Fixar classes estáveis de impressão (trava antes de mexer no DOM) | 🔴 Alta | — | ⬜ Não iniciado | DESC-001 — **BLOQUEIA TAREFA-007** |
| TAREFA-026 | Teste automatizado de impressão via PDF | 🟠 Média | TAREFA-025 | ⬜ Não iniciado | DESC-001 — garante 1 página A4 após refatoração |

### Fase 3 — Fechar decisões (bloqueia Fase 4)

| ID | Tarefa | Prioridade | Deps | Status | Observações |
|---|---|---|---|---|---|
| TAREFA-010 | Validar PEND-002 a PEND-015 com o usuário (Fase 0) | 🔴 Alta | — | ✅ **Concluída (Fase 0)** | todas decididas + PEND-018; conflitos C-1…C-4 encerrados |
| TAREFA-011 | Fechar modelo de dados final (schema, fuso, etapas, campos novos) | 🔴 Alta | TAREFA-010 | 🟡 **Decisões fechadas** — `schema_proposto.sql` escrito (não aplicado); DDL oficial é a TAREFA-015 | resolve PROBLEMA-016 (falta implementar ENTREGA no código) |
| TAREFA-012 | Definir política de histórico e modelar `pedido_eventos` | 🔴 Alta | TAREFA-010 | 🟡 **Rascunho pronto** — tabela `pedido_eventos` no schema proposto; fechar na Fase 3 | resolve PROBLEMA-011/012/020 |
| TAREFA-013 | Remover/substituir o reset diário apagador | 🔴 Alta | TAREFA-012 | ✅ **Código concluído (Fase 0)** — `apagarPedidosDoDia` removido; só reinicia numeração | resolve PROBLEMA-011 |
| TAREFA-014 | Exportar/Importar JSON (backup manual) + script de carga inicial | 🔴 Alta | — | ⬜ Não iniciado | resolve PROBLEMA-026 |
| TAREFA-027 | Escrever e executar em teste o plano de rollback da migração | 🔴 Alta | PEND-016 | ⬜ Não iniciado | DESC-002 — obrigatória antes do corte (corte paralelo com fallback) |

### Fase 4 — Migrar

| ID | Tarefa | Prioridade | Deps | Status | Observações |
|---|---|---|---|---|---|
| TAREFA-015 | Criar projeto Supabase: schema + índices + RLS + Storage bucket | 🔴 Alta | TAREFA-011, 012 | ⬜ Não iniciado | resolve PROBLEMA-008 |
| TAREFA-016 | RPCs: `avancar_etapa()` transacional + `gerar_numero()` atômico | 🔴 Alta | TAREFA-015 | ⬜ Não iniciado | resolve PROBLEMA-005/006 |
| TAREFA-017 | Auth: login, perfis, sessão, logout + aplicar matriz de permissões | 🔴 Alta | TAREFA-015 | ⬜ Não iniciado | resolve PROBLEMA-007/024/032 |
| TAREFA-018 | `SupabaseRepo` + Realtime (fila, alertas, chat) + notificações | 🔴 Alta | TAREFA-016, 017 | ⬜ Não iniciado | resolve PROBLEMA-018/019/021/023 |
| TAREFA-019 | Ações de fila: cancelar, voltar etapa, override admin, etapa ENTREGUE | 🟠 Média | TAREFA-016 | ⬜ Não iniciado | resolve PROBLEMA-004/031/016 |
| TAREFA-020 | Migrar dados + testar com 2+ PCs (numeração, fila, impressão, histórico) | 🔴 Alta | TAREFA-018 | ⬜ Não iniciado | critério de aceite da migração |
| TAREFA-021 | Publicar (hospedagem + HTTPS + headers) | 🟠 Média | TAREFA-020 | ⬜ Não iniciado | resolve PROBLEMA-035; PEND-009 |

### Fase 5 — Evoluir (após estabilidade)

| ID | Tarefa | Prioridade | Deps | Status | Observações |
|---|---|---|---|---|---|
| TAREFA-022 | Painel visual: KPIs, kanban, cards com fila/atraso, tema por variáveis, acessibilidade | 🟠 Média | TAREFA-020 | ⬜ Não iniciado | lista D da auditoria (PROBLEMA-030/042/043/044/045) |
| TAREFA-023 | Link de acompanhamento do cliente (`/acompanhar/:token`) | 🟠 Média | TAREFA-017, 018 | ⬜ Não iniciado | DECISÃO-010; segurança crítica |
| TAREFA-024 | Otimizações de desempenho (thumbnails, paginação, memo, worker) | 🟡 Média | TAREFA-018 | ⬜ Não iniciado | PROBLEMA-028/029/038/039/041 |

---

## PENDÊNCIAS

| ID | Pergunta / decisão necessária | Contexto | Status |
|---|---|---|---|
| PEND-001 | **Quais exatamente** as informações que o cliente verá no link público (incluir telefone? endereço? valor? histórico?) | §15 + DECISÃO-010 | ✅ **Decidida em 25/10/2026 — número, status, etapa, previsão, telefone e valor** |
| PEND-002 | Fuso horário e formato de data (local vs UTC; coluna `date` ou `timestamptz`) | PROBLEMA-014 | ✅ **Resolvida em 26/09/2026 — `date` com dia local (America/Sao_Paulo)** |
| PEND-003 | Numeração por dia (atual) ou global | DECISÃO-007 | ✅ **Resolvida em 26/09/2026 — por dia, `UNIQUE(dia, numero)`** |
| PEND-004 | O que fazer com os dados já apagados pelo reset diário (nada a migrar?) e confirmar fim definitivo do apagamento | CONFLITO C-1 | ✅ **Resolvida em 26/09/2026 — fim definitivo; nada a migrar** |
| PEND-005 | Personalização visual: global (só Admin) ou por usuário | PROBLEMA-022 | ✅ **Resolvida em 26/09/2026 — global, só Admin altera** |
| PEND-006 | **Existe o perfil "Arte"?** §14 lista Arte separada; DECISÃO-009 tem 4 perfis | CONFLITO C-2 | ✅ **Resolvida em 26/09/2026 — não existe; 4 perfis** |
| PEND-007 | Quais campos novos criar: quantidade, valor, telefone, itens, prioridade — e se `valor` é exibido ao cliente | §15 + modelo atual | ✅ **Resolvida em 26/09/2026 — telefone, quantidade, valor, itens, prioridade; `valor` visível ao cliente** |
| PEND-008 | A **etapa ARTE** vira etapa própria do fluxo ou continua dentro da etapa PEDIDO | CONFLITO C-3 + DECISÃO-008 | ✅ **Resolvida em 26/09/2026 — arte fica dentro de PEDIDO** (ver PEND-018: ENTREGA entra) |
| PEND-009 | Plataforma de hospedagem: **Netlify** ou **Cloudflare Pages** | DECISÃO-011 | ✅ **Decidida em 25/10/2026 — Netlify** |
| PEND-010 | De onde vem o arquivo de **logo fixo** da STAMPE (hoje é upload por PC) | pendência antiga do `CONVERSA.md` | ✅ **Decidida em 25/10/2026 — upload pelo Admin (visual global)** |
| PEND-011 | Limites do plano gratuito do Supabase no momento da contratação (Storage, Realtime, backups) | PROBLEMA-027 | ✅ **Decidida em 25/10/2026 — verificar antes de contratar** |
| PEND-012 | Percentuais de progresso continuam configuráveis pelo usuário ou viram fixos? | config atual | ✅ **Resolvida em 26/09/2026 — continuam configuráveis** |
| PEND-013 | Manter o **chat** entre setores (hoje só entre abas) como recurso real, ou remover? | PROBLEMA-021 | ✅ **Decidida em 25/10/2026 — manter como recurso real (tabela + Realtime)** |
| PEND-014 | Manter a regra de **1 pedido por etapa** ou liberar mais de um em produção com vários PCs? | CONFLITO C-4 | ✅ **Resolvida em 26/09/2026 — mantida a fila estrita (1 por etapa)** |
| PEND-015 | Tipo de login: e-mail + senha, ou magic link (sem senha)? | DECISÃO-002 | ✅ **Resolvida em 26/09/2026 — e-mail + senha** |
| PEND-016 | **Estratégia de corte da migração:** paralelo com fallback × corte seco | DESC-002 / DESC-005 + Plano Fase 6 | ✅ **Resolvida em 26/09/2026 — CORTE PARALELO COM FALLBACK** (detalhes abaixo) |
| PEND-017 | **Ambiente e roteiro de teste multi-PC** | DESC-004 + Plano Fase 5/6 | ✅ **Resolvida em 26/09/2026 — 5 PCs reais como teste principal** (detalhes abaixo) |
| PEND-018 | **A etapa ENTREGA existe no fluxo?** (DECISÃO-008 exige; código e modelo atuais não têm) | DECISÃO-008 + PROBLEMA-016 | ✅ **Resolvida em 26/09/2026 — SIM, criar etapa ENTREGA** (decisão de modelo; implementar na Fase 3) |

---

## DECISÕES DE FASE 0 — 26/09/2026 (PEND-016 e PEND-017 encerradas)

### PEND-016 — CORTE PARALELO COM FALLBACK ✅

**Decisão:** a migração usará **corte paralelo com fallback real**. Não haverá corte seco.

Requisitos registrados desta decisão:

- definir tecnicamente o **período de transição** entre sistema antigo e novo;
- definir como os dois sistemas são tratados durante esse período;
- definir **qual sistema é a fonte de verdade em cada momento**;
- decidir se haverá sincronização entre as estruturas e, se sim, como;
- definir detecção de **divergências, perda de dados e duplicidade**;
- impedir que uma versão antiga do sistema continue gravando silenciosamente em outro lugar;
- definir **rollback**: como recuperar a operação anterior;
- listar **quais dados precisam ser preservados**;
- definir **quem autoriza o corte definitivo**;
- definir **testes obrigatórios** e **critérios de aprovação** da nova estrutura;
- definir **em que momento o sistema antigo é desativado**;
- garantir que o **histórico não seja perdido**;
- tratar explicitamente o risco DESC-002 (dois sistemas coexistindo produzindo divergência).

**O fallback deve ser real e planejado, não apenas uma cópia do código antigo.** Nenhum corte definitivo acontece sem procedimento de recuperação definido.
**Impacto:** TAREFA-027 (plano de rollback) torna-se obrigatória antes do corte; Fase 6 depende desta decisão (já atendida).

### PEND-017 — TESTE MULTI-COMPUTADOR ✅

**Decisão:** o teste principal de validação multi-PC representa o **ambiente real da gráfica**:

```
VENDAS: 2 computadores
IMPRESSÃO: 2 computadores
PRODUÇÃO: 1 computador
TOTAL: 5 computadores simultâneos
```

**Hierarquia dos testes:**

| Prioridade | Cenário | Função |
|---|---|---|
| **TESTE PRINCIPAL** | **5 PCs reais** (2 Vendas + 2 Impressão + 1 Produção) | validação antes da entrada em produção |
| Complementar | **2 navegadores diferentes** no mesmo PC | sessões independentes: auth, permissões, realtime, concorrência, fila, numeração |
| Complementar | **2 abas do mesmo navegador** | concorrência local, estado desatualizado, operações simultâneas |

Os testes complementares **não substituem** o teste com os 5 PCs reais.

**Roteiro por setor (teste principal):**

- **Vendas (2 PCs):** criar pedidos simultâneos com números diferentes (nunca duplicar numeração); visualizar/editar pedidos permitidos; receber atualizações dos outros setores; consultar o estado atual.
- **Impressão (2 PCs):** receber os mesmos pedidos liberados; atualizações em tempo real; trabalhar simultaneamente sem duplicar ações; respeitar a fila; impedir conflitos sobre o mesmo pedido; refletir imediatamente o que muda no outro PC.
- **Produção (1 PC):** receber pedidos liberados pela etapa anterior; ver alterações da Impressão; atualizar etapa quando permitido; refletir a alteração para os demais PCs; manter histórico.

**Fluxo completo (exemplo obrigatório):** Venda PC1 cria Pedido 001 · Venda PC2 cria Pedido 002 → ambos aparecem para os setores seguintes → Impressão PC1 e PC2 trabalham em pedidos diferentes, ao mesmo tempo → Produção recebe o liberado → os 5 PCs enxergam a mesma fonte de dados, com atualizações consistentes.

**Teste de concorrência (ações simultâneas):**

- dois usuários criando pedidos ao mesmo tempo;
- dois usuários gerando numeração ao mesmo tempo;
- dois usuários editando o mesmo pedido;
- dois usuários tentando avançar o mesmo pedido;
- dois usuários tentando retirar o mesmo pedido da fila;
- dois usuários finalizando o mesmo pedido;
- dois computadores executando a mesma operação simultaneamente;
- alteração de dados enquanto outro usuário visualiza o mesmo pedido.

O sistema deve **impedir inconsistências**: o comportamento em conflito é definido pela arquitetura e pelas regras, **não** pelo último navegador que gravou primeiro. Rastreabilidade obrigatória: quem, o quê, quando, estado anterior (quando necessário) e novo estado.

**Teste de falha de conexão:** (1) PC normal → (2) perda de conexão → (3) operação durante a falha → (4) recuperação → (5) reconexão → (6) atualização dos dados → (7) consistência do estado final. Verificar: perda de pedidos, duplicação, gravação parcial, conflito de atualização, dados antigos sobrescrevendo novos, fila inconsistente, histórico incorreto. **Se o sistema não suportar offline completo, não inventar esse comportamento** — registrar o comportamento suportado; modo offline futuro seria requisito/melhoria separada, após análise.

**Critérios de aprovação do teste multi-PC (obrigatórios):** compartilhamento correto dos pedidos · atualização em tempo real · numeração sem duplicidade · concorrência controlada · fila consistente · permissões corretas · histórico correto · edição segura · ausência de perda de dados · ausência de duplicidade · comportamento correto após reconexão · ausência de regressão no fluxo · funcionamento correto nos 5 PCs simultaneamente. Se algum teste falhar: registrar problema, impacto e causa **antes** de considerar a etapa concluída — "abriu o site nos 5 PCs" **não** é conclusão.

---

## DECISÕES DE FASE 0 — 2ª LEVA (26/09/2026) — PEND-002…015 e CONFLITOS C-1…C-4 ENCERRADOS ✅

> Decisões tomadas **com o usuário** nesta sessão. Nenhuma foi deduzida do código.
> Com elas **não resta pendência de modelo aberta** (as demais — PEND-001, 009, 010, 011, 013 — são de exibição/hospedagem e não alteram estrutura de tabela).

| ID | Decisão | O que passa a valer |
|---|---|---|
| **PEND-002** | **`date` com dia local (America/Sao_Paulo)** | Coluna `pedidos.dia date`; o dia é o da gráfica, não UTC. `datas.ts` já está nesse fuso. |
| **PEND-003** | **Numeração por dia** (confirma DECISÃO-007) | `UNIQUE(dia, numero)`; sequência reinicia a cada dia. |
| **PEND-004 / C-1** | **Fim definitivo do reset diário — nada a migrar** | Apagamento eliminado do código; dados já apagados no passado são considerados perdidos. DECISÃO-006 fica plena. |
| **PEND-005** | **Personalização visual GLOBAL, só Admin altera** | `config_visual` linha única; resolve PROBLEMA-022. |
| **PEND-006 / C-2** | **Não existe perfil "Arte" — 4 perfis** | enum `perfil`: PEDIDO, IMPRESSAO, FINALIZACAO, ADMIN (DECISÃO-009 prevalece sobre §14). |
| **PEND-007** | **Campos: `telefone`, `quantidade`, `valor`, `itens` e `prioridade`** | `itens` e `prioridade` são **novos** (não existem no código) — forma exata a definir na Fase 3. **`valor` é exibido no link público do cliente.** |
| **PEND-008 / C-3** | **Arte NÃO vira etapa: continua dentro de PEDIDO** | Fluxo de etapas não ganha ARTE. |
| **PEND-012** | **Percentuais continuam configuráveis** | `config_progresso` linha única mantida. |
| **PEND-014 / C-4** | **Mantida a fila estrita de 1 pedido por etapa** | Validação da RPC `avancar_etapa` permanece estrita (PROBLEMA-006 continua valendo). |
| **PEND-015** | **Login e-mail + senha** | Supabase Auth com credencial; identidade real em `perfis.user_id` (resolve PROBLEMA-007/024/032). |
| **PEND-018** (nova) | **Criar etapa ENTREGA** | Fluxo final: **PEDIDO → IMPRESSAO → FINALIZACAO → ENTREGA → FINALIZADO** (fecha PROBLEMA-016). Exige: valor no enum `etapa`, novo percentual em `config_progresso`, permissão/fila do setor responsável e decisão de **quem** entrega — detalhamento na Fase 3. |

**Impacto direto:**
- `supabase/schema_proposto.sql` atualizado com as decisões acima (**ainda não aplicado** — DECISÃO-016 cumprida: DDL só na Fase 4).
- **ENTREGA** e os campos `itens`/`prioridade` **ainda não existem no código** — entram como mudança de modelo na Fase 3 (fora do escopo da Fase 0).
- Conflitos **C-1, C-2, C-3 e C-4 encerrados** (C-1 já estava corrigido no código; C-2/C-3/C-4 agora têm resposta registrada).

---

## IDEIAS FUTURAS

> Ideias — **não** são requisitos nem decisões.

1. Visualização **kanban** das 4/5 etapas com arrastar-e-soltar (validar regra de permissão antes).
2. **Notificações** ao entrar na etapa (toast/web push/e-mail).
3. **Múltiplas artes** por pedido (versões/rascunhos).
4. Relatórios por período: exportação **PDF/CSV**, tempo médio por etapa, faturamento.
5. **Impressão em lote**: ficha de produção do dia / fila impressa.
6. Atribuir pedido a um **operador** específico dentro da etapa.
7. **Duplicar pedido** (cliente recorrente).
8. Busca por **telefone** e por período.
9. Atalhos de teclado (`N` novo pedido, `/` busca, `Esc` fecha).
10. Ícones de biblioteca no lugar de emoji.
11. **Web Worker** para processamento de imagens.
12. Paginação/virtualização da lista de pedidos.
13. Modo **offline** com sincronização (se a conexão da gráfica for instável).
14. Painel de **metas/desempenho** por equipe.

---

## HISTÓRICO DE ALTERAÇÕES

| Data | Alteração | Tipo |
|---|---|---|
| 24/09/2026 | Projeto criado (Vite + React + TS + Tailwind), sistema em `localStorage` | Estrutura |
| 25/09/2026 | Correção da **impressão A4** (banner 36px, 1 página, cabeçalho/rodapé da OS) | Correção concluída |
| 25/09/2026 | **Reset diário** de pedidos + limpeza única dos pedidos de teste; `seedPedidos` removido | Decisão implementada ⚠️ conflita com DECISÃO-006 |
| 25/09/2026 | Equipe atualizada no `datalist` (Vendas: ITALO, RUAN, GRAZIELA · Impressão: TALES, HENRIQUE · Produção: MAGNO, BIA, REYNALDON) | Dado de cadastro |
| 25/09/2026 | Página pública de acompanhamento **adiada** (só estudo de viabilidade) | Decisão |
| 25/09/2026 | Apresentação do projeto de migração (`APRESENTACAO_PROJETO_STAMPE.md`) | Planejamento |
| 26/09/2026 | **Auditoria técnica completa** (`AUDITORIA_STAMPE.md`) — 13 seções, 50 problemas, listas A–E | Análise concluída |
| 26/09/2026 | Criação do **PROMPT MESTRE** com registro de decisões, problemas, tarefas e pendências | Documento de continuidade |
| 26/09/2026 | Consolidação das 3 fontes + plano em `STAMPE_REFERENCIA_COMPLETA.md` | Documento consolidado |
| 26/09/2026 | **DECISÃO-014**: consolidado vira fonte única; `AUDITORIA_STAMPE.md` e `PROMPT_MESTRE.md` congelados como snapshots | Decisão |
| 26/09/2026 | **DECISÃO-015 confirmada** (era proposta): ordem das 9 fases do Plano Mestre aprovada + desvio Schema → RLS/Auth → Fila RPC → Camada de dados na mesma fase de arquitetura | Decisão |
| 26/09/2026 | **DECISÃO-016**: Fase 0 primeiro — nada de schema/migração/corte enquanto houver pendências de modelo abertas | Decisão |
| 26/09/2026 | **PEND-016 resolvida**: corte paralelo com fallback real (corte seco recusado) + roteiro de transição/rollback/autorização do corte | Decisão |
| 26/09/2026 | **PEND-017 resolvida**: teste principal com 5 PCs reais (2 Vendas + 2 Impressão + 1 Produção) + complementares (2 navegadores, 2 abas) + teste de falha de conexão + critérios de aprovação | Decisão |
| 26/09/2026 | TAREFA-025/026/027 incorporadas do Plano Mestre (trava de impressão, teste PDF, rollback) | Tarefa |

**Nenhuma decisão anterior foi substituída até esta data.**

---

## PRÓXIMO PASSO DEFINIDO

**FASE 0 — Consolidação de contexto e decisões de modelo (EM EXECUÇÃO).**

Registradas em 26/09/2026: DECISÃO-015 confirmada · DECISÃO-016 (Fase 0 primeiro) · PEND-016 (corte paralelo com fallback) · PEND-017 (teste com 5 PCs reais).

Resta fechar na Fase 0, com o usuário: **PEND-002, 003, 004, 005, 006, 007, 008, 012, 014, 015** e os conflitos **C-1, C-2, C-3** (C-4 não altera regra — apenas torna a fila transacional). PEND-009/010/011/013 são não-bloqueantes de modelo (Fase 7/8).

Concluída a Fase 0, apresentar o **relatório da Fase 0** (decisões confirmadas · pendências resolvidas · pendências ainda abertas · conflitos resolvidos · novos problemas · novos riscos · novas dependências · alterações de arquitetura · próxima fase liberada) **sem avançar automaticamente** para a fase seguinte.

**Nenhuma tabela do Supabase pode ser criada antes disso (DECISÃO-016). Nada da Fase 4+ deve começar enquanto as pendências de modelo estiverem abertas.**
---

# COMANDO MESTRE — INTELIGÊNCIA, CONTINUIDADE E EXECUÇÃO DO STAMPE

A partir deste momento, trabalhe no STAMPE utilizando conjuntamente as três fontes de referência existentes:

1. **Auditoria Técnica do STAMPE**
2. **Documento Mestre de Continuidade e Evolução**
3. **Prompt de Raciocínio e Evolução**

Essas três fontes não devem ser tratadas como documentos independentes.

Elas formam um único sistema de contexto e tomada de decisão para o projeto.

---

## 1. FUNÇÃO DE CADA FONTE

### AUDITORIA

A auditoria representa o diagnóstico do STAMPE no estado atual.

Utilize-a para compreender:

- problemas existentes;
- bugs;
- limitações;
- riscos;
- arquitetura atual;
- fluxo atual;
- problemas de múltiplos computadores;
- problemas de dados;
- segurança;
- fila;
- histórico;
- desempenho;
- pontos de melhoria;
- necessidades identificadas antes da migração.

A auditoria representa o **ponto de partida técnico**.

### DOCUMENTO MESTRE

O Documento Mestre é a memória viva do projeto.

Ele deve preservar:

- decisões;
- requisitos;
- problemas;
- pendências;
- tarefas;
- ideias;
- melhorias;
- arquitetura;
- histórico;
- mudanças de decisão;
- descobertas feitas durante o desenvolvimento.

Nunca depender somente da memória da conversa para informações importantes.

Se uma informação for importante para o futuro do projeto, registre-a no Documento Mestre.

### PROMPT DE RACIOCÍNIO

O Prompt de Raciocínio define como você deve trabalhar.

Ele estabelece que você deve:

- analisar antes de executar;
- compreender o contexto;
- identificar dependências;
- procurar problemas não mencionados;
- procurar oportunidades de melhoria;
- não simplificar soluções apenas por parecerem complexas;
- não tomar decisões importantes silenciosamente;
- preservar decisões anteriores;
- questionar inconsistências;
- considerar segurança, escalabilidade e manutenção;
- pensar no sistema como um todo;
- evitar retrabalho.

---

# 2. NÃO TRABALHE COM APENAS UMA FONTE

Antes de iniciar uma alteração importante no STAMPE, consulte as três referências.

Cruze as informações.

Pergunte:

- O que a auditoria descobriu?
- O que já foi decidido?
- O que ainda está pendente?
- O que já foi implementado?
- O que ainda não foi implementado?
- Existe alguma decisão posterior que alterou a auditoria?
- Existe algum conflito entre documentos?
- Existe alguma dependência que ainda não foi resolvida?
- Existe uma solução melhor do que a originalmente prevista?
- Existe algum risco que ainda não foi considerado?

Não trate uma informação antiga como decisão atual se houver uma decisão posterior registrada.

---

# 3. NÃO EXECUTAR CEGAMENTE

Não transforme automaticamente a auditoria em uma lista de comandos de programação.

Primeiro compreenda.

Depois organize.

Depois planeje.

Somente então execute.

Para mudanças relevantes, siga:

**Análise → Dependências → Riscos → Proposta → Plano → Implementação → Teste → Registro**

---

# 4. NÃO SIMPLIFICAR O PROJETO

Nunca descarte uma solução tecnicamente melhor simplesmente porque ela é:

- complexa;
- demorada;
- trabalhosa;
- composta por várias etapas;
- mais sofisticada.

Complexidade não significa automaticamente que a solução seja ruim.

Se existir uma solução melhor, apresente:

- por que ela é melhor;
- o que ela exige;
- quais são os riscos;
- quais são as dependências;
- como pode ser dividida em etapas;
- o que pode ser feito agora;
- o que pode ser feito posteriormente.

A prioridade é construir corretamente, não apenas rapidamente.

---

# 5. PENSAR ALÉM DO PEDIDO IMEDIATO

Não analise somente aquilo que foi solicitado na última mensagem.

Sempre considere o impacto no sistema inteiro.

Exemplo:

Se uma alteração na fila resolver o problema de um setor, verifique também:

- venda;
- arte;
- impressão;
- produção;
- finalização;
- entrega;
- histórico;
- permissões;
- notificações;
- cliente;
- banco;
- concorrência;
- desempenho.

Uma alteração local não deve criar um problema em outra parte do sistema.

---

# 6. IDENTIFICAR NOVOS PROBLEMAS

Se durante o desenvolvimento você encontrar algo que não estava na auditoria, registre.

Classifique como:

- Problema;
- Risco;
- Melhoria;
- Requisito;
- Ideia;
- Pendência.

Não ignore uma descoberta apenas porque ela não estava no pedido original.

---

# 7. NÃO CONFUNDIR IDEIA COM DECISÃO

Uma ideia não vira automaticamente requisito.

Uma sugestão não vira automaticamente decisão.

Uma possibilidade não vira automaticamente tarefa.

Classifique corretamente cada informação.

### DECISÃO
Foi definida e deve ser seguida.

### REQUISITO
O sistema precisa atender.

### PROBLEMA
Algo está errado ou inadequado.

### RISCO
Algo pode causar problema.

### MELHORIA
Pode tornar o sistema melhor.

### IDEIA
Possibilidade ainda não decidida.

### PENDÊNCIA
Depende de uma decisão ou informação.

### TAREFA
Algo definido para ser executado.

---

# 8. CONFLITOS ENTRE DECISÕES

Se uma nova solução entrar em conflito com uma decisão anterior:

**não substitua silenciosamente.**

Identifique:

- decisão anterior;
- nova proposta;
- motivo da mudança;
- impacto;
- consequências;
- necessidade de confirmação.

Depois registre a alteração no Documento Mestre.

---

# 9. PLANEJAMENTO ANTES DA IMPLEMENTAÇÃO

Antes de iniciar uma etapa grande de desenvolvimento, produza um plano.

O plano deve indicar:

- objetivo;
- problemas que serão resolvidos;
- tarefas;
- dependências;
- ordem de execução;
- riscos;
- critérios de teste;
- critérios de conclusão;
- o que ficará para depois.

Não iniciar uma grande refatoração ou migração sem compreender suas dependências.

---

# 10. TESTAR NÃO SIGNIFICA APENAS VER SE FUNCIONA

Depois de implementar algo, verificar:

- funcionamento normal;
- casos extremos;
- múltiplos usuários;
- múltiplos computadores;
- permissões;
- segurança;
- dados;
- histórico;
- concorrência;
- desempenho;
- possíveis regressões.

Uma funcionalidade só deve ser considerada concluída quando estiver funcionando dentro do contexto completo do STAMPE.

---

# 11. ATUALIZAR A MEMÓRIA

Depois de uma etapa importante:

1. Registrar o que foi feito.
2. Registrar o que foi descoberto.
3. Registrar problemas novos.
4. Registrar decisões novas.
5. Atualizar tarefas.
6. Atualizar pendências.
7. Atualizar arquitetura quando necessário.
8. Registrar o próximo passo.

O projeto deve deixar um histórico compreensível para uma pessoa que não participou da conversa original.

---

# 12. PRESERVAR O RACIOCÍNIO DO PROJETO

Não deixe decisões importantes existirem somente dentro da conversa.

Se algo importante foi definido durante a conversa, registre no Documento Mestre.

Se algo foi alterado, registre a alteração.

Se uma decisão foi abandonada, registre o motivo.

Se uma ideia foi considerada e descartada, registre quando isso for relevante para evitar que ela seja rediscutida sem necessidade.

---

# 13. PENSAR NO STAMPE COMO UM SISTEMA ÚNICO

O STAMPE não deve ser tratado como várias telas independentes.

Considere sempre a integração:

**Venda → Arte → Impressão → Produção → Finalização → Entrega**

E também:

**Usuário → Permissão → Pedido → Fila → Status → Histórico**

E:

**Cliente → Link → Pedido → Status autorizado**

Todas essas partes precisam conversar corretamente.

---

# 14. PRINCÍPIO DE EVOLUÇÃO

O objetivo não é apenas fazer o STAMPE funcionar hoje.

O objetivo é criar uma base que permita:

- crescer;
- receber novos usuários;
- receber novos computadores;
- aumentar o número de pedidos;
- adicionar funcionalidades;
- melhorar o visual;
- integrar novos serviços;
- manter segurança;
- manter histórico;
- evitar grandes reconstruções futuras.

Sempre que possível, prefira uma solução que permita evolução sem retrabalho estrutural desnecessário.

---

# 15. ORDEM GERAL DE TRABALHO

Utilize esta sequência como orientação:

**AUDITORIA**
↓
**CONSOLIDAÇÃO DO CONTEXTO**
↓
**DOCUMENTO MESTRE**
↓
**ANÁLISE E RACIOCÍNIO**
↓
**PLANO MESTRE DE EXECUÇÃO**
↓
**ESTABILIZAÇÃO**
↓
**REORGANIZAÇÃO NECESSÁRIA**
↓
**ARQUITETURA**
↓
**MIGRAÇÃO PARA SUPABASE**
↓
**AUTENTICAÇÃO E PERMISSÕES**
↓
**FILA E CONCORRÊNCIA**
↓
**HISTÓRICO E RASTREABILIDADE**
↓
**INTEGRAÇÃO ENTRE SETORES**
↓
**TESTES**
↓
**MELHORIAS DE UX/UI**
↓
**FUNCIONALIDADES FUTURAS**

Essa ordem pode ser modificada se a análise técnica demonstrar que outra sequência é mais segura ou eficiente.

Se modificar a ordem, explique o motivo e registre a decisão.

---

# 16. REGRA CONTRA RETRABALHO

Antes de criar algo novo, verificar se:

- já existe;
- já foi planejado;
- já foi implementado;
- existe componente equivalente;
- existe decisão relacionada;
- existe uma tarefa relacionada.

Evite criar duas soluções diferentes para o mesmo problema.

---

# 17. REGRA DE SEGURANÇA

Nunca considerar segurança resolvida apenas porque a interface esconde um botão.

As permissões devem ser avaliadas também no servidor, banco, API e demais pontos de acesso.

Qualquer informação pública, especialmente o acompanhamento do pedido pelo cliente, deve ser analisada cuidadosamente para garantir que um cliente não consiga acessar dados de outro pedido.

---

# 18. REGRA DE CONCORRÊNCIA

Como o STAMPE será utilizado simultaneamente por vários computadores e usuários, toda operação relacionada a:

- fila;
- alteração de status;
- finalização;
- retirada de pedido;
- atualização;
- edição;
- histórico;

deve ser analisada considerando concorrência.

Não assumir que algo está correto apenas porque funciona quando existe um único usuário.

---

# 19. CRITÉRIO DE QUALIDADE

O objetivo não é simplesmente:

> "funciona".

O objetivo é:

> **funciona, é seguro, é consistente, é rastreável, suporta múltiplos usuários, pode crescer, pode ser mantido e não cria problemas desnecessários no restante do sistema.**

---

# 20. PRIMEIRA AÇÃO DEPOIS DE LER ESTE COMANDO

Não comece imediatamente a alterar o código.

Primeiro:

### ETAPA 1
Leia integralmente a Auditoria.

### ETAPA 2
Leia integralmente o Documento Mestre.

### ETAPA 3
Analise este Comando Mestre e o Prompt de Raciocínio.

### ETAPA 4
Cruze todas as informações.

### ETAPA 5
Identifique: decisões; requisitos; problemas; riscos; pendências; tarefas; dependências; conflitos; oportunidades de melhoria.

### ETAPA 6
Monte o **PLANO MESTRE DE EXECUÇÃO DO STAMPE**.

Esse plano deve apresentar a ordem recomendada de trabalho e explicar por que cada etapa vem antes ou depois das outras.

### ETAPA 7
Antes de iniciar alterações estruturais importantes, apresente o plano para análise e validação.

Não pule diretamente da auditoria para uma grande implementação.

---

# OBJETIVO FINAL

Construir o STAMPE de forma:

**correta → segura → estável → integrada → rastreável → escalável → sustentável → fácil de usar → visualmente profissional.**

Velocidade é desejável.

Qualidade é obrigatória.

Nunca sacrificar uma decisão estruturalmente importante apenas para terminar mais rápido.

O projeto pode levar dias, semanas ou meses.

O objetivo é construir corretamente e evoluir continuamente, sem perder o conhecimento adquirido ao longo do caminho.

---
---

# PLANO MESTRE DE EXECUÇÃO DO STAMPE — v1 (para revisão)

**Status:** ✅ **Aprovado em 26/09/2026** (DECISÃO-015 confirmada · DECISÃO-016 — Fase 0 primeiro · PEND-016 e PEND-017 resolvidas). **Nenhuma alteração de código foi feita.** Fase 0 em execução antes de qualquer construção.

---

## ETAPA 5-A — Cruzamento das três fontes

| Pergunta do Comando §2 | Auditoria | Documento Mestre | Comando/Raciocínio | Convergência |
|---|---|---|---|---|
| O que foi descoberto? | 50 problemas | registrados como PROBLEMA-001…050 | classificar e preservar | ✅ sincronizados |
| O que foi decidido? | lista A–E (recomendações) | DECISÃO-001…013 confirmadas | não confundir ideia com decisão | ✅ auditoria ≠ decisão — respeitado |
| O que está pendente? | §5 e §12 apontam lacunas | PEND-001…015 | pendência não desaparece | ✅ |
| O que foi implementado? | 0 tarefas concluídas | 24 tarefas ⬜ | registrar estado real | ✅ **nada do plano foi feito ainda** |
| Decisão posterior altera a auditoria? | — | DECISÃO-006 × PROBLEMA-011 | sinalizar conflito | ⚠️ 4 conflitos (abaixo) |
| Conflito entre documentos? | §4 tem 4 perfis | §14 tem 5 áreas (Arte) | sinalizar antes de alterar | ⚠️ **C-2** |
| Dependência não resolvida? | A-8 exige modelo fechado | 15 pendências abertas | planejar antes de executar | ⚠️ bloqueia a fase de schema |

---

## ETAPA 5-B — Conflitos existentes (não alterar silenciosamente)

| # | Conflito | Resolução proposta no plano | Precisa de você? |
|---|---|---|---|
| **C-1** | DECISÃO-006 (histórico preservado) × código que apaga tudo à meia-noite | Plano **elimina o apagamento** (TAREFA-013) após confirmação da PEND-004 | ✅ sim |
| **C-2** | DECISÃO-009 (4 perfis) × §14 do Documento Mestre (5 áreas, com Arte) | Plano **não cria nem remove** o perfil Arte; trava o schema de perfis até decisão | ✅ sim (PEND-006) |
| **C-3** | DECISÃO-008 (fluxo com etapa Arte) × modelo atual (arte dentro da etapa PEDIDO) | Plano mantém 4 etapas no banco inicial e deixa a 5ª **adicionável por enum** | ✅ sim (PEND-008) |
| **C-4** | Fila de 1 pedido por etapa × uso multi-PC | Plano **não altera a regra**; apenas a torna transacional (comportamento idêntico, só seguro) | ❌ não muda regra |

---

## ETAPA 5-C — Novas descobertas do cruzamento (não estavam na auditoria)

Registro conforme Comando §6. **Nenhuma foi implementada.**

| ID | Tipo | Descoberta | Por que importa |
|---|---|---|---|
| **DESC-001** | 🟠 RISCO | **A impressão A4 depende de seletores estruturais do DOM**: `#root > div`, `header, nav, main, footer { display:none }` e `.fixed.inset-0` (`index.css:22-55`). A Fase 2 (quebrar `App.tsx` em componentes) **vai quebrar a impressão silenciosamente** — erro que só aparece na hora de imprimir | A auditoria marcou a reorganização como "sem mudança de comportamento" — está errado. Precisa de trava antes |
| **DESC-002** | 🟠 RISCO | **Dois sistemas convivendo**: enquanto `LocalRepo` e `SupabaseRepo` coexistirem, qualquer PC que usar o endereço antigo grava dados que o outro não vê → divergência silenciosa exatamente na migração | exige janela de corte + rollback definidos |
| **DESC-003** | 💡 Oportunidade | **O volume de dados reais provavelmente é muito pequeno** (limpeza única apagou os pedidos de teste; só os de hoje existem) → migrar cedo = migrar quase nada | reduz drasticamente o risco da Fase 6; argumenta **para adiantar** a migração em vez de adiá-la |
| **DESC-004** | 🟡 Pendência nova | Não existe definido **onde testar multi-PC** (PCs reais da gráfica? 2 navegadores? 2 abas?) | sem isso, "testar com 2 PCs" não tem critério objetivo |
| **DESC-005** | 🟡 Pendência nova | **Estratégia de corte**: migração paralela com fallback pro `LocalRepo`, ou corte seco numa data? | define o risco da DESC-002 |
| **DESC-006** | 🟡 Problema novo | Mudança de perfil faz **botões sumirem** — sem teste por perfil, a permissão errada só é descoberta por usuário reclamando | exige roteiro de teste por perfil (§10 do Comando) |

**Novas pendências propostas (26/09/2026):** `PEND-016` (estratégia de corte) · `PEND-017` (ambiente/roteiro de teste multi-PC) — **ambas resolvidas em 26/09/2026** (ver seção PENDÊNCIAS).
**Novas tarefas propostas (aprovadas com o plano):** `TAREFA-025` (fixar classes estáveis de impressão) · `TAREFA-026` (teste automatizado de impressão via PDF) · `TAREFA-027` (plano de rollback da migração) — **já adicionadas às tabelas de tarefas.**

---

## ETAPA 6 — PLANO MESTRE DE EXECUÇÃO

### Ordem proposta × ordem do Comando §15

O Comando §15 prevê: … Estabilização → Reorganização → Arquitetura → **Migração → Autenticação → Fila** → Histórico → …

**Desvio proposto (a ser registrado como DECISÃO-015 se aprovado):**
> **Schema + RLS + Auth + Fila entram na mesma fase de arquitetura de dados**, nesta ordem: schema → RLS/auth → fila RPC → camada de dados.

**Motivo:** no Supabase as políticas de segurança **são** definidas sobre as tabelas e a fila **é** uma função do banco — separá-los em fases consecutivas criaria trabalho duas vezes sobre o mesmo artefato e permitiria um intervalo com banco sem RLS (risco de segurança). A ordem proposta é mais segura, não mais rápida.

---

### FASE 0 — Consolidação de contexto e decisões de modelo
| | |
|---|---|
| **Objetivo** | Nenhuma tabela criada antes de todos os modelos fechados |
| **Tarefas** | TAREFA-010 (validar PEND-002…008, 014, 015, 016, 017 com o usuário) |
| **Problemas** | CONFLITOS C-1, C-2, C-3; DESC-004, DESC-005 |
| **Depende de** | usuário |
| **Critério de conclusão** | 0 pendências de modelo abertas; conflitos resolvidos e registrados |
| **Fica para depois** | — |

### FASE 1 — Estabilização (sem alterar fluxo nem visual)
| | |
|---|---|
| **Objetivo** | parar a perda de dados e o vazamento de segurança existentes |
| **Tarefas** | 001 (arte/cota) · 002 (substituir arte + validação) · 003 (dados corrompidos + ErrorBoundary) · 004 (`.env`/dev server) · 005 (testes das regras puras) · 006 (`strict` + warnings) |
| **Problemas** | PROBLEMA-001, 002, 003, 010, 017, 033, 034 |
| **Riscos** | regressão no upload de imagem grande; alterar comportamento de validação de envio |
| **Testes** | arte de 4MB não perde pedido; envio sem arte avisado; registro corrompido preservado e não sobrescrito; `npm run build`/`lint` verdes; suíte de testes verdes |
| **Conclusão** | 7 verificações acima aprovadas |
| **Fica para depois** | — |

### FASE 2 — Reorganização estrutural do frontend
| | |
|---|---|
| **Objetivo** | quebrar `App.tsx` em `domain/`, `data/`, `hooks/`, `components/` **sem mudança de comportamento visível** |
| **Tarefas** | **025 (classes estáveis de impressão — BLOQUEIA as demais)** · 007 (camada de dados + módulos) · 026 (teste de impressão via PDF) · 008 (index.html) · 009 (limpeza) |
| **Problemas** | PROBLEMA-009, 036, 037, 049, 050 + **DESC-001** |
| **Depende de** | Fase 1 (testes existentes) |
| **Riscos** | 🔴 **quebrar a impressão A4** (DESC-001); quebrar modal/chat por movimentação de estado |
| **Testes** | impressão gerando PDF = 1 página A4, coluna de 722px, mesmo layout de antes; card/modal/novo pedido/chat/personalização idênticos; testes unitários verdes |
| **Conclusão** | PDF da OS equivalente ao atual + zero mudança funcional |
| **Fica para depois** | paginação, memo, thumbnails (Fase 8) |

### FASE 3 — Modelo de dados + histórico (decisão → especificação)
| | |
|---|---|
| **Objetivo** | fechar o desenho: schema, fuso, etapas, campos, política de histórico, RLS, RPCs |
| **Tarefas** | 011 (schema final) · 012 (`pedido_eventos`) · 013 (eliminar o apagamento diário — só após PEND-004) · 014 (exportar/importar JSON) · 027 (plano de rollback) |
| **Problemas** | PROBLEMA-011, 012, 016, 020, 026 |
| **Depende de** | Fase 0 |
| **Entregáveis** | DDL completo · matriz de políticas RLS · assinatura das RPCs · script de carga · plano de rollback escrito |
| **Testes** | simular os dados atuais no schema proposto |
| **Conclusão** | aprovação do schema pelo usuário |
| **Fica para depois** | — |

### FASE 4 — Supabase: schema, RLS, Auth, Storage
| | |
|---|---|
| **Objetivo** | banco de pé e **seguro por padrão** |
| **Tarefas** | 015 (schema + índices + RLS + bucket) · 017 (login, perfis, sessão, logout, matriz de permissões) |
| **Problemas** | PROBLEMA-007, 008, 024, 032, 035 (parcial) |
| **Depende de** | Fase 3 |
| **Riscos** | 🔴 RLS esquecido/desligado; chave `anon` vazando acesso |
| **Testes** | com a chave `anon`: **não** lista pedidos sem RLS, **não** avança etapa, **não** lê outro pedido; login/logout real; cada perfil vê só seus botões (DESC-006) |
| **Conclusão** | tentativas de acesso indevido bloqueadas por escrito |
| **Fica para depois** | gestão de usuários avançada, MFA |

### FASE 5 — Camada de dados, fila e concorrência (núcleo)
| | |
|---|---|
| **Objetivo** | sistema funcionando em rede com segurança real |
| **Tarefas** | 016 (`avancar_etapa`/`gerar_numero` transacionais) · 018 (`SupabaseRepo` + Realtime + alertas) |
| **Problemas** | PROBLEMA-005, 006, 015, 018, 019, 021, 022, 023 (parcial) |
| **Depende de** | Fase 4 |
| **Riscos** | concorrência não exercitada em teste real; `LocalRepo` e `SupabaseRepo` divergindo (DESC-002) |
| **Testes** | 2 PCs: criar simultâneos → números distintos; avançar o mesmo pedido ao mesmo tempo → **exatamente 1 vence e o outro recebe erro**; alteração em PC A aparece no PC B; fila respeitada; histórico registra autor real |
| **Conclusão** | checklist de concorrência aprovado nos itens acima |
| **Fica para depois** | notificação push, chat completo |

### FASE 6 — Migração de dados + integração entre setores + testes
| | |
|---|---|
| **Objetivo** | dados reais no banco e fluxo inteiro verificado ponta a ponta |
| **Tarefas** | 020 (carga inicial + teste 2+ PCs) · parte de 027 (executar rollback em teste) |
| **Problemas** | PROBLEMA-013, 018 (parcial); DESC-002 |
| **Depende de** | Fase 5 + Fase 0 (PEND-016) |
| **Testes** | **Venda → Arte → Impressão → Produção → Finalização → Entrega** com 2 usuários/perfis distintos; impressão A4 de cada etapa; histórico completo; negativos: sem permissão, fila cheia, sessão expirada, token de cliente inválido |
| **Conclusão** | roteiro inteiro executado sem perda/duplicação |
| **Fica para depois** | — |

### FASE 7 — Publicação
| | |
|---|---|
| **Objetivo** | online, HTTPS, headers, com plano de retorno |
| **Tarefas** | 021 |
| **Depende de** | Fase 6 + PEND-009 |
| **Testes** | smoke test pós-deploy; dados íntegros; perfis logando de fora |
| **Fica para depois** | domínio próprio, monitoramento |

### FASE 8 — UX/UI + desempenho + futuras
| | |
|---|---|
| **Objetivo** | evoluir só com a base segura (lista D + E da auditoria) |
| **Tarefas** | 022 (dashboard/kanban/cards/tema/acessibilidade) · 023 (link do cliente) · 024 (desempenho) |
| **Depende de** | Fase 6 |
| **Fica para depois** | ideias 4–14 do Documento Mestre |

---

## Mapa de bloqueios (o que precisa de decisão antes de avançar)

| Antes de | Pendências obrigatórias |
|---|---|
| **Fase 0** (imediato) | PEND-002 fuso · 003 numeração · 004 fim do apagamento · 005 visual global? · 006 perfil Arte? · 007 campos novos · 008 etapa Arte? · 012 progresso · 014 regra de fila · 015 tipo de login · **016 corte** · **017 ambiente de teste** |
| **Fase 7** | PEND-009 Netlify × Cloudflare · PEND-010 logo · PEND-011 limites Supabase |
| **Fase 8** | PEND-001 o que o cliente vê · PEND-013 manter chat? |

## Riscos gerais do plano
1. 🔴 Quebra da impressão na Fase 2 → mitigado por TAREFA-025 **antes** de mover qualquer código.
2. 🔴 Banco publicado sem RLS → mitigado: RLS é critério de conclusão da Fase 4, não tarefa posterior.
3. 🟠 Migração com dois sistemas ativos → mitigado por PEND-016 + TAREFA-027.
4. 🟠 Mudança de perfil escondendo botões errados → roteiro de teste por perfil.
5. 🟡 Escopo de visual invadindo a fase técnica → lista D só é liberada após Fase 6.

## Critério de qualidade global (Comando §19)
Nenhuma fase é concluída por "funciona": precisa funcionar, estar segura, ser rastreável, passar no teste de 2 usuários, não regredir a impressão e deixar o próximo passo desbloqueado.

## O que NÃO será feito agora
Nenhum código será alterado; nenhuma tabela criada; nenhuma decisão substituída; lista D/E não iniciada; C-1 a C-4 não resolvidos sem confirmação.

---

## ✅ Respostas recebidas em 26/09/2026

1. **Ordem das 9 fases — APROVADA**, com o desvio explicado (schema + RLS + auth + fila na mesma fase) → **DECISÃO-015 CONFIRMADA**.
2. **FASE 0 PRIMEIRO** → **DECISÃO-016**: nada de schema/migração/corte enquanto houver pendências de modelo; tarefas independentes da Fase 1 só após análise explícita de dependência, sem atropelar a Fase 0.
3. **PEND-016 → CORTE PARALELO COM FALLBACK** (corte seco recusado; fallback real, rollback, fonte de verdade por momento, autorização do corte). **PEND-017 → 5 PCs REAIS** (2 Vendas + 2 Impressão + 1 Produção) como teste principal, com complementares de 2 navegadores e 2 abas, teste de falha de conexão e critérios de aprovação.

**Próxima ação:** executar a Fase 0 — fechar as pendências de modelo restantes (PEND-002…008, 012, 014, 015) e os conflitos C-1…C-3 com o usuário — e apresentar o relatório da Fase 0 **antes** de liberar qualquer fase seguinte.

---
---

# FASE 0 — REGISTRO DE EXECUÇÃO (26/09/2026)

> **Checkpoint de retomada:** `FASE0_PROGRESSO.md` (na raiz do projeto) — quando a conversa se perder, ler esse arquivo antes de qualquer coisa.
> Nenhuma pendência de modelo foi decidida por conta própria; nada de schema aplicado (DECISÃO-016 respeitada).

## ETAPA 3 — Divergências código × documentação

> Lista reconstruída a partir do código atual em 26/09/2026 (a versão anterior existia só na conversa).

| ID | A documentação dizia | O código fazia | Grav. | Status |
|---|---|---|---|---|
| DIV-01 | PROBLEMA-037: derivar `progresso` de `etapa` | `progresso` era campo salvo no `Pedido` e estava duplicado em 3 transições (segundo `...x` sobrescrevia o valor) | 🔴 | ✅ Corrigido — campo removido do tipo; 10 leituras agora usam `prog()` |
| DIV-02 | PROBLEMA-004/031: "não existe cancelar, excluir, voltar etapa" | As funções `voltarEtapa`/`cancelarPedido` existiam, mas **sem nenhum botão** — código morto | 🔴 | ✅ Corrigido — botões religados no modal (ADMIN, com motivo e auditoria) |
| DIV-03 | PROBLEMA-002: texto "(pode substituir)" promete substituição | Não havia input de arte no modo edição | 🔴 | ✅ Corrigido — botão "Substituir/Enviar arte" no modo edição, registrando no histórico |
| DIV-04 | Campos novos `telefone`/`quantidade`/`valor` (PEND-007) | Existiam no tipo e eram gravados, **mas não tinham input no cadastro** e nunca apareciam na tela — e **a edição os apagava** (novo valor = `""`) | 🔴 | ✅ Corrigido — inputs no cadastro e na edição + exibição no card, no modal e na OS |
| DIV-05 | DECISÃO-006 / C-1: histórico nunca é apagado | `apagarPedidosDoDia` apagava tudo de ontem no load | 🔴 | ✅ Corrigido — só reinicia a numeração; aviso "Histórico preservado" |
| DIV-06 | PROBLEMA-014: fuso inconsistente (UTC × local) | `hojeISO()` em UTC e `diaLocal()` em local | 🟠 | ✅ Corrigido — `domain/datas.ts` com `FUSO = "America/Sao_Paulo"` e data local única |
| DIV-07 | PROBLEMA-010: dados corrompidos eram sobrescritos em silêncio | `JSON.parse` em `try` virava `[]` e o effect gravava por cima | 🔴 | ✅ Corrigido — bruto preservado em `stampe_pedidos_backup_v1` + `ErrorBoundary` montado |
| DIV-08 | PROBLEMA-001: arte de até 4MB em base64 cru | — | 🔴 | 🟡 Parcial — `otimizarImagem()` aplicado, mas **arte continua em base64 no localStorage** (DECISÃO-004 só na migração ao Storage) |
| DIV-09 | PROBLEMA-017: "sem ErrorBoundary" | — | 🟠 | ✅ Corrigido — `components/ErrorBoundary.tsx` montado no `main.tsx` |
| DIV-10 | PROBLEMA-036/009: regras de negócio dentro do componente | — | 🟠 | ✅ Corrigido — `domain/` puro (datas, fila, permissões, progresso, regras); transições de etapa agora moram em `data/repo.ts` |
| DIV-11 | PROBLEMA-009: "sem camada de dados" | — | 🟠 | ✅ Corrigido — `storage.ts` + `repo.ts`; **App.tsx não fala mais com `localStorage` de pedidos** (ETAPA 8) |
| DIV-12 | PEND-012: percentuais configuráveis | 0/50/75/100 hardcoded no JSX, ignorando `config` | 🟡 | ✅ Corrigido — barras, rótulos e botões usam `config.*` |
| DIV-13 | Equipe "REYNALDON" na produção | datalist conferido | 🟢 | ✅ Sem divergência |
| DIV-14 | PROBLEMA-026: exportar/importar backup | `montarBackup`/`baixarBackup`/`lerBackupArquivo` prontos em `storage.ts` | 🟠 | ⬜ **Aberto** — nenhum botão na UI |
| DIV-15 | PROBLEMA-050: título "ruan", `lang="en"` | `index.html` inalterado | 🟢 | ⬜ **Aberto** (TAREFA-008) |
| DIV-16 | PROBLEMA-033/034: dev server em `0.0.0.0` e `.env` fora do `.gitignore` | `iniciar.bat` e `.gitignore` inalterados | 🟠 | ✅ **Corrigido na Fase 1 (TAREFA-004)** |
| DIV-17 | Auditoria: "App.tsx 1.725 linhas · 0 tarefas concluídas · sem testes" | Hoje: **1.645 linhas**, domínio extraído, **88 testes** em 7 arquivos | 🟡 | ✅ Corrigido nesta ETAPA 10 — números atualizados no relatório |

## ETAPA 4 — Situação dos itens críticos

| Item | Status |
|---|---|
| Arte (otimização, validação, substituição) | ✅ |
| Dados corrompidos (backup + ErrorBoundary) | ✅ |
| Reset diário (histórico preservado) | ✅ |
| Fila: cancelar / voltar etapa com motivo e auditoria | ✅ |
| Fuso horário único | ✅ |
| Numeração por dia (`sequenciaDoDia`) | ✅ |
| REYNALDON | ✅ |
| Campos novos (criar, editar, exibir) | ✅ |
| Progresso derivado | ✅ |

**Verificação:** `npm run build` ✅ · `npm run lint` 0 erros (8 avisos pré-existentes de `set-state-in-effect`/`exhaustive-deps`) — **repita na ETAPA 9.**

---

## ETAPA 5 — Testes (Vitest)

- `vitest` + `jsdom` instalados; `vitest.config.ts`; scripts `npm test` e `npm run test:watch`.
- **88 testes em 7 arquivos**, todos verdes: `datas` (fuso/meia-noite), `fila` (bloqueio), `regras` (numeração por dia), `progresso`, `permissoes`, `storage` (corrupção→backup, quota→erro), `repo` (operações transacionais locais).
- **Correções que os testes pegaram:** aviso de registro parcialmente inválido estava trocado (dizia "lista reaberta vazia"); `carregarConfig` passou a fazer merge campo a campo em vez de descartar configuração parcial.

## ETAPA 6 — Schema proposto (sem aplicar)

- `supabase/schema_proposto.sql` — 10 seções (enums, perfis, pedidos, eventos, infos, configs, chat, RPCs, storage, RLS), **não executado** (DECISÃO-016 respeitada).
- Atualizado após as decisões da ETAPA 7: enum de `etapa` com **ENTREGA**, `perfil` sem Arte, `itens`/`prioridade` novos, `config_progresso.entrega`, `perfis.email`, `UNIQUE(dia, numero)`.

## ETAPA 7 — Pendências de modelo (decisões do usuário)

> Nenhuma decisão foi deduzida do código — todas foram perguntadas e respondidas.
> Registro completo na seção **"DECISÕES DE FASE 0 — 2ª LEVA"**.

| Encerradas | PEND-002, 003, 004, 005, 006, 007, 008, 012, 014, 015 + **PEND-018 (nova: etapa ENTREGA)** |
| Conflitos | **C-1, C-2, C-3, C-4 — todos encerrados** |
| Continuam abertas (não bloqueiam modelo) | PEND-001 (conteúdo do link público), PEND-009 (hospedagem), PEND-010 (logo fixo), PEND-011 (limites Supabase), PEND-013 (chat) |

## ETAPA 8 — Camada de dados e contratos

- `src/data/repo.ts` — contrato `PedidosRepo`: `hidratar()`, `listar()`, `persistir()`, `proximoNumero(dia, seqAtual)`, `movimentar()`, `cancelar()`, `voltarEtapa()`; `LocalRepo` implementa tudo usando o domínio (`motivoBloqueio`, `ETAPA_ANTERIOR`) e gravando em `storage`.
- **App.tsx:** carga via `repo.hidratar()`, gravação via `repo.persistir()` e as 5 operações de estado (enviar p/ impressão, enviar p/ finalização, finalizar, cancelar, voltar etapa) passaram a `repo.movimentar|cancelar|voltarEtapa`, com erro devolvido para a tela.
- O que **não** é do `PedidosRepo` e continua em `storage`: usuário, config de progresso, visual, chat, seq/dia de numeração (seria um `ConfigRepo`, se necessário).
- `src/data/repo.test.ts` — 19 casos (fila estrita, conflito de etapa, salto inválido, quota, motivo obrigatório, histórico).

## ETAPA 9 — Validação final

| Comando | Resultado |
|---|---|
| `npm run build` | ✅ `tsc -b && vite build` — **0 erros TS** |
| `npm run lint` | ✅ **0 erros** · 7 avisos (eram 8 — o do effect de gravação sumiu ao virar assíncrono) |
| `npm test` | ✅ **88/88** em 7 arquivos |

## ETAPA 10 — RELATÓRIO DE FECHAMENTO DA FASE 0

**O que a Fase 0 entregou**

1. **Auditoria** — `AUDITORIA_STAMPE.md` (problemas críticos mapeados com causa → impacto → solução).
2. **Divergências código × documentação** — DIV-01…DIV-17 registradas acima; **13 corrigidas**, 3 abertas (DIV-14, DIV-15, DIV-16), 1 atualizada (DIV-17).
3. **Correções críticas no código** — tabela da ETAPA 4: 9/9 itens.
4. **Domínio puro + camada de dados** — `src/domain/*` e `src/data/{storage,repo}.ts`; App.tsx não escreve mais em `localStorage` de pedidos.
5. **Testes** — 88 casos verdes (`npm test`).
6. **Schema proposto** — `supabase/schema_proposto.sql`, **não aplicado**.
7. **Decisões de modelo** — todas as pendências que alteram estrutura de tabela foram decididas com o usuário; conflitos C-1…C-4 encerrados.
8. **Validação** — build ✅ · lint 0 erros ✅ · testes ✅.

**O que ficou em aberto (não bloqueia a Fase 1)**

| Item | Observação |
|---|---|
| DIV-14 | backup pronto em `storage.ts` mas **sem botão na UI** (TAREFA) |
| DIV-15 | `index.html` com título "ruan" e `lang="en"` (TAREFA-008) |
| DIV-16 | `iniciar.bat`/`.gitignore` com host e `.env` (TAREFA-004) |
| PEND-001/009/010/011/013 | link público, hospedagem, logo, limites Supabase, chat |
| **ENTREGA, `itens`, `prioridade`** | decididos, **ainda não implementados no código** — Fase 3 |
| Artes em base64 | seguem no `localStorage` até a migração ao Storage (Fase 4/6) |

**Condição para avançar:** a Fase seguinte **não começa sem autorização explícita** (DECISÃO-016). Nenhuma tabela foi criada, nenhum schema aplicado, nenhum corte feito.

---
---

# FASE 1 — REGISTRO DE EXECUÇÃO (26/09/2026) — ESTABILIZAÇÃO

> **Autorização:** usuário respondeu **"PODE SEGUIR"** após o relatório da Fase 0.
> **Regra da fase:** estabilizar **sem alterar fluxo nem visual**.

## O que foi feito

| Tarefa | O quê |
|---|---|
| **TAREFA-001/002/003/005** | ✅ já estavam concluídas na Fase 0 (otimização de arte + cota, substituir arte + validação, dados corrompidos + ErrorBoundary, suíte Vitest) — status corrigido na tabela de tarefas |
| **TAREFA-004** | ✅ `.gitignore` ganhou `.env`, `.env.*`, `!.env.example`, `*.pem`, `*.key`; `iniciar.bat` **perdeu `--host 0.0.0.0`** (só `localhost`) — resolve PROBLEMA-033/034 / DIV-16 |
| **TAREFA-006** | ✅ `"strict": true` em `tsconfig.app.json` **e** `tsconfig.node.json` (`tsc -b --force` = 0 erros); oxlint de **7 avisos → 0** |

## Como os 7 avisos foram zerados (sem mudar comportamento)

| Aviso | Correção |
|---|---|
| efeito de gravação do `visual` | toast agendado em microtask (`avisar()`), igual ao já usado nos pedidos |
| aviso de carga corrompida | idem — `avisar()` em vez de `setToast` síncrono |
| efeito de gravação do `chat` | idem — só o toast foi adiado (a rolagem segue no efeito) |
| efeito de sincronização do pedido selecionado | **removido**: `selected` agora é **derivado** de `selectedId` + `pedidos` (`useMemo`) |
| efeito de `form.atendente` | `form` inicia com `user.nome` e sincroniza no próprio `onChange` do nome |
| efeito de `tempPrevisaoImp/Fin` + `exhaustive-deps` | **removido**: valor base derivado do pedido + override `previsaoEdit` do que o usuário digita |

## Critérios de conclusão da Fase 1 (7 verificações)

| # | Verificação | Status |
|---|---|---|
| 1 | arte de 4MB não perde pedido (limite checado **antes** de processar; falha de gravação vira toast) | ✅ por inspeção de código + teste de quota em `storage.test.ts` |
| 2 | envio sem arte avisado (confirmação obrigatória) | ✅ `semArte` testado em `regras.test.ts` |
| 3 | registro corrompido preservado e não sobrescrito | ✅ `storage.test.ts` (4 casos) |
| 4 | `npm run build` | ✅ 0 erros, **com `strict: true`** |
| 5 | `npm run lint` | ✅ **0 erros e 0 avisos** |
| 6 | suíte de testes | ✅ **88/88** em 7 arquivos |
| 7 | visual/fluxo inalterados | ✅ nenhuma mudança de layout ou de regra — só derivação de estado |

**Checkpoint da fase:** `FASE1_PROGRESSO.md` (na raiz do projeto).

**Próxima fase (Fase 2 — Reorganização):** TAREFA-025 (classes estáveis de impressão, **bloqueia as demais**) → 007 → 026 → 008 → 009. **Não iniciar sem autorização.**
