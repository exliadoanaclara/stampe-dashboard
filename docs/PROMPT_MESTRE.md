> ⚠️ **SNAPSHOT HISTÓRICO — CONGELADO EM 26/09/2026 — NÃO EDITAR.**
> A fonte viva do projeto é `STAMPE_REFERENCIA_COMPLETA.md` (DECISÃO-014). Este arquivo existe apenas para consulta histórica. Novas informações vão para o consolidado.

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

**Resumo:** 13 decisões registradas · 50 problemas abertos (8 críticos · 23 importantes · 10 moderados · 9 baixos) · 20 tarefas · 15 pendências · 14 ideias futuras · 0 tarefas concluídas.

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

---

## ⚠️ CONFLITOS ENTRE DECISÕES (sinalizar antes de alterar)

| # | Decisão anterior | Ideia/nova informação | O que fazer |
|---|---|---|---|
| **C-1** | DECISÃO-006 — histórico nunca é apagado | Código atual apaga todos os pedidos de ontem (`apagarPedidosDoDia`) | **Não alterar silenciosamente.** A decisão prevalece; o código é que está errado → PROBLEMA-011 / TAREFA-013. Antes de mexer, decidir como tratar os dados já apagados (PEND-004). |
| **C-2** | DECISÃO-009 — 4 perfis (sem Arte) | §14 deste documento lista **Arte** como área separada | Não criar nem eliminar o perfil de Arte sem decisão explícita → **PEND-006**. |
| **C-3** | DECISÃO-008 — fluxo inclui etapa **Arte** | Código atual não tem etapa Arte (arte é feita dentro da etapa PEDIDO) | Não inserir etapa nova sem validar com o fluxo real da equipe → **PEND-008**. |
| **C-4** | Fila estrita atual: **1 pedido por etapa**, sem exceção | Multi-PC simultâneo pode exigir mais de 1 em produção | Não alterar a regra por conta própria → **PEND-014**. |

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
| TAREFA-001 | Otimizar arte no upload + tratar cota + avisar falha de gravação | 🔴 Alta | — | ⬜ Não iniciado | resolve PROBLEMA-001/013 |
| TAREFA-002 | Botão "Substituir arte" na edição + validação de arte ao avançar etapa | 🔴 Alta | — | ⬜ Não iniciado | resolve PROBLEMA-002/003 |
| TAREFA-003 | Proteger dados corrompidos (validar shape, backup do bruto) + ErrorBoundary | 🔴 Alta | — | ⬜ Não iniciado | resolve PROBLEMA-010/017 |
| TAREFA-004 | `.env` no `.gitignore` + restringir exporão do dev server | 🔴 Alta | — | ⬜ Não iniciado | resolve PROBLEMA-033/034 |
| TAREFA-005 | Testes unitários das regras puras (fila, datas, numeração, reset) | 🟠 Média | — | ⬜ Não iniciado | Vitest; base para toda refatoração |
| TAREFA-006 | `strict: true` no TypeScript + zerar 7 warnings do oxlint | 🟠 Média | — | ⬜ Não iniciado | previne erros na migração |

### Fase 2 — Reorganizar

| ID | Tarefa | Prioridade | Deps | Status | Observações |
|---|---|---|---|---|---|
| TAREFA-007 | Extrair camada de dados (`PedidosRepo` / `LocalRepo`) e separar `domain/`, `hooks/`, `components/` | 🔴 Alta | TAREFA-005 | ⬜ Não iniciado | resolve PROBLEMA-009/036/037; **gargalo da migração** |
| TAREFA-008 | Corrigir `index.html` (título STAMPE, `pt-BR`, favicon) + textos/rodapé | 🟢 Baixa | — | ⬜ Não iniciado | resolve PROBLEMA-050 |
| TAREFA-009 | Limpeza de arquivos mortos e código residual | 🟢 Baixa | — | ⬜ Não iniciado | resolve PROBLEMA-049 |

### Fase 3 — Fechar decisões (bloqueia Fase 4)

| ID | Tarefa | Prioridade | Deps | Status | Observações |
|---|---|---|---|---|---|
| TAREFA-010 | Validar PEND-002 a PEND-015 com o usuário | 🔴 Alta | — | 🟡 Em análise | nenhuma tabela pode ser criada antes |
| TAREFA-011 | Fechar modelo de dados final (schema, fuso, etapas, campos novos) | 🔴 Alta | TAREFA-010 | ⬜ Não iniciado | resolve PROBLEMA-016 |
| TAREFA-012 | Definir política de histórico e modelar `pedido_eventos` | 🔴 Alta | TAREFA-010 | ⬜ Não iniciado | resolve PROBLEMA-011/012/020 |
| TAREFA-013 | Remover/substituir o reset diário apagador | 🔴 Alta | TAREFA-012 | ⬜ Não iniciado | ⚠️ altera comportamento atual — depende da decisão |
| TAREFA-014 | Exportar/Importar JSON (backup manual) + script de carga inicial | 🔴 Alta | — | ⬜ Não iniciado | resolve PROBLEMA-026 |

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
| PEND-001 | **Quais exatamente** as informações que o cliente verá no link público (incluir telefone? endereço? valor? histórico?) | §15 + DECISÃO-010 | 🟡 Aguardando decisão |
| PEND-002 | Fuso horário e formato de data (local vs UTC; coluna `date` ou `timestamptz`) | PROBLEMA-014 | 🟡 Aguardando decisão |
| PEND-003 | Numeração por dia (atual) ou global | DECISÃO-007 | 🟡 Aguardando decisão |
| PEND-004 | O que fazer com os dados já apagados pelo reset diário (nada a migrar?) e confirmar fim definitivo do apagamento | CONFLITO C-1 | 🟡 Aguardando decisão |
| PEND-005 | Personalização visual: global (só Admin) ou por usuário | PROBLEMA-022 | 🟡 Aguardando decisão |
| PEND-006 | **Existe o perfil "Arte"?** §14 lista Arte separada; DECISÃO-009 tem 4 perfis | CONFLITO C-2 | 🟡 Aguardando decisão |
| PEND-007 | Quais campos novos criar: quantidade, valor, telefone, itens, prioridade — e se `valor` é exibido ao cliente | §15 + modelo atual | 🟡 Aguardando decisão |
| PEND-008 | A **etapa ARTE** vira etapa própria do fluxo ou continua dentro da etapa PEDIDO | CONFLITO C-3 + DECISÃO-008 | 🟡 Aguardando decisão |
| PEND-009 | Plataforma de hospedagem: **Netlify** ou **Cloudflare Pages** | DECISÃO-011 | 🟡 Aguardando decisão |
| PEND-010 | De onde vem o arquivo de **logo fixo** da STAMPE (hoje é upload por PC) | pendência antiga do `CONVERSA.md` | 🟡 Aguardando decisão |
| PEND-011 | Limites do plano gratuito do Supabase no momento da contratação (Storage, Realtime, backups) | PROBLEMA-027 | 🟡 Aguardando decisão |
| PEND-012 | Percentuais de progresso continuam configuráveis pelo usuário ou viram fixos? | config atual | 🟡 Aguardando decisão |
| PEND-013 | Manter o **chat** entre setores (hoje só entre abas) como recurso real, ou remover? | PROBLEMA-021 | 🟡 Aguardando decisão |
| PEND-014 | Manter a regra de **1 pedido por etapa** ou liberar mais de um em produção com vários PCs? | CONFLITO C-4 | 🟡 Aguardando decisão |
| PEND-015 | Tipo de login: e-mail + senha, ou magic link (sem senha)? | DECISÃO-002 | 🟡 Aguardando decisão |

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
| 26/09/2026 | Criação deste **PROMPT MESTRE** com registro de decisões, problemas, tarefas e pendências | Documento de continuidade |

**Nenhuma decisão anterior foi substituída até esta data.**

---

## PRÓXIMO PASSO DEFINIDO

**Fase 1** (TAREFA-001 a TAREFA-004) — corrigir perda de dados e exposição de segurança **sem alterar o fluxo** — e, em paralelo, **TAREFA-010**: validar as PEND-002 a PEND-015, porque nenhuma tabela do Supabase pode ser criada antes das decisões de modelo.

**Nada da Fase 4 (migração) deve começar enquanto as pendências de modelo estiverem abertas.**
