> ⚠️ **SNAPSHOT HISTÓRICO — CONGELADO EM 26/09/2026 — NÃO EDITAR.**
> A fonte viva do projeto é `STAMPE_REFERENCIA_COMPLETA.md` (DECISÃO-014). Este arquivo existe apenas para consulta histórica. Novas informações vão para o consolidado.

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
