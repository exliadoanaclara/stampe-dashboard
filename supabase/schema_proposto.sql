-- ============================================================================
-- STAMPE — SCHEMA PROPOSTO — FASE 0 / ETAPA 6  (atualizado com as decisões)
-- ============================================================================
-- ⚠️  ARQUIVO PROPOSTO. **NÃO EXECUTAR.** Nenhuma tabela, índice, política ou
--     função abaixo foi criada no Supabase (DECISÃO-016 — Fase 0 primeiro).
--
--     Este arquivo existe para: (a) registrar o modelo decidido com o usuário;
--     (b) simular os dados atuais no desenho proposto;
--     (c) servir de base para a TAREFA-015 da Fase 4.
--
--     PENDÊNCIAS DE MODELO ENCERRADAS EM 26/09/2026 (ver documento mestre,
--     seção "DECISÕES DE FASE 0 — 2ª LEVA"):
--       PEND-002  data = `date` com dia local America/Sao_Paulo      ✔ decidido
--       PEND-003  numeração POR DIA  → UNIQUE(dia, numero)           ✔ decidido
--       PEND-004  / C-1  reset diário extinto; histórico preservado  ✔ decidido
--       PEND-005  configuração visual GLOBAL (só Admin)              ✔ decidido
--       PEND-006  / C-2  NÃO existe perfil "Arte" (4 perfis)         ✔ decidido
--       PEND-007  telefone, quantidade, valor, itens, prioridade;
--                  `valor` visível ao cliente no link público        ✔ decidido
--       PEND-008  / C-3  arte NÃO vira etapa (fica em PEDIDO)        ✔ decidido
--       PEND-012  percentuais continuam configuráveis                ✔ decidido
--       PEND-014  / C-4  mantida fila estrita de 1 pedido por etapa  ✔ decidido
--       PEND-015  login e-mail + senha                               ✔ decidido
--       PEND-018  etapa ENTREGA entra no fluxo                       ✔ decidido
--
--     AINDA ABERTAS (não alteram a estrutura acima):
--       PEND-001  exatamente o que o cliente vê no link público (Fase 7)
--       PEND-009  Netlify ou Cloudflare Pages (hospedagem)
--       PEND-010  origem do logo fixo
--       PEND-011  limites do plano gratuito do Supabase
--       PEND-013  manter ou remover o chat entre setores
--
--     ⚠️ DECISÕES QUE MEXEM COM O CÓDIGO ATUAL (entrar na Fase 3, antes do
--        SupabaseRepo): etapa ENTREGA, campos `itens` e `prioridade`.
--        Hoje o código tem só PEDIDO/IMPRESSAO/FINALIZACAO/FINALIZADO e não
--        tem `itens`/`prioridade` — enquanto isso não for implementado, o
--        SupabaseRepo não pode ser ligado ao banco (mismatch de enum).
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. TIPOS ENUM
-- ---------------------------------------------------------------------------
-- PEND-018 (decidido): fluxo PEDIDO → IMPRESSAO → FINALIZACAO → ENTREGA → FINALIZADO.
-- ⚠️ O código atual ainda não tem ENTREGA: entrada na Fase 3 (PROBLEMA-016).
-- ARTE NÃO entra (PEND-008): a arte continua sendo feita dentro de PEDIDO.
-- ---------------------------------------------------------------------------
create type etapa as enum ('PEDIDO', 'IMPRESSAO', 'FINALIZACAO', 'ENTREGA', 'FINALIZADO');

-- PEND-006 (decidido): 4 perfis, sem Arte (DECISÃO-009 prevalece sobre o §14).
create type perfil as enum ('PEDIDO', 'IMPRESSAO', 'FINALIZACAO', 'ADMIN');

-- PEND-007 (decidido): prioridade entra no modelo. Rótulos/valores são
-- rascunho — confirmar na Fase 3 junto com `itens`.
create type prioridade as enum ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE');


-- ---------------------------------------------------------------------------
-- 2. USUÁRIOS E PERFIS
-- ---------------------------------------------------------------------------
-- PEND-015 (decidido): e-mail + senha (Supabase Auth comum).
-- Resolve PROBLEMA-007/024/032 (identidade real em vez de texto digitado).
-- ---------------------------------------------------------------------------
create table perfis (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nome       text not null,
  email      text not null,
  role       perfil not null default 'PEDIDO',
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

alter table perfis enable row level security;


-- ---------------------------------------------------------------------------
-- 3. PEDIDOS
-- ---------------------------------------------------------------------------
-- PEND-002 (decidido): `dia` é `date` no fuso da gráfica (America/Sao_Paulo).
-- PEND-003 (decidido): numeração POR DIA → UNIQUE(dia, numero).
-- PEND-007 (decidido): telefone/quantidade/valor confirmados + `itens` e
--    `prioridade` novos; `valor` é exibido ao cliente no link público.
-- DECISÃO-004: `arte_url` guarda APENAS a referência do Storage — nunca base64.
-- versao resolve PROBLEMA-015 (edição por snapshot / last-write-wins).
-- ---------------------------------------------------------------------------
create table pedidos (
  id                   uuid primary key default gen_random_uuid(),
  dia                  date not null,                    -- PEND-002 decidido
  numero               integer not null,                 -- PEND-003 decidido
  cliente              text not null,
  servico              text not null,
  atendente            text not null,
  telefone             text,                             -- PEND-007 ✔
  quantidade           text,                             -- PEND-007 ✔
  valor                text,                             -- PEND-007 ✔ (visível ao cliente)
  itens                jsonb not null default '[]'::jsonb,   -- PEND-007 ✔ NOVO — forma a definir na Fase 3
  prioridade           prioridade not null default 'NORMAL', -- PEND-007 ✔ NOVO — rótulos a confirmar
  data_inicio          date not null,
  previsao_conclusao   date not null,
  observacoes          text not null default '',
  arte_url             text,                             -- referência no Storage
  etapa                etapa not null default 'PEDIDO',
  versao               integer not null default 1,       -- PROBLEMA-015
  data_criacao         timestamptz not null default now(),
  data_atualizacao     timestamptz not null default now(),
  previsao_impressao   date,
  previsao_finalizacao date,
  data_entrega         timestamptz,                      -- PEND-018 ✔ (etapa ENTREGA)
  entregue_por         text,                             -- PEND-018 ✔
  data_finalizacao     timestamptz,
  usuario_finalizacao  text,
  cancelado_em         timestamptz,
  cancelado_motivo     text,
  cancelado_por        text,
  criado_por           uuid references perfis(user_id),  -- PROBLEMA-032
  constraint pedidos_numero_positivo check (numero > 0)
);

create unique index pedidos_dia_numero_uk on pedidos (dia, numero);
create index pedidos_etapa_idx on pedidos (etapa) where cancelado_em is null;
create index pedidos_criacao_idx on pedidos (data_criacao desc);

alter table pedidos enable row level security;


-- ---------------------------------------------------------------------------
-- 4. HISTÓRICO / AUDITORIA  (PROBLEMA-012, 020 — append-only)
-- ---------------------------------------------------------------------------
--    Um pedido só pode ser consultado depois: quem mudou, o quê, quando.
--    NUNCA é atualizado nem apagado (DECISÃO-006 / C-1 — encerrado).
-- ---------------------------------------------------------------------------
create table pedido_eventos (
  id          bigint generated always as identity primary key,
  pedido_id   uuid not null references pedidos(id) on delete cascade,
  tipo        text not null,   -- EDICAO | ETAPA | PREVISAO | INFO | CANCELAMENTO | RETORNO | ARTE | ENTREGA
  campo       text,
  anterior    text,
  novo        text,
  motivo      text,
  usuario_id  uuid references perfis(user_id),
  usuario     text,
  criado_em   timestamptz not null default now()
);

create index pedido_eventos_pedido_idx on pedido_eventos (pedido_id, criado_em desc);

alter table pedido_eventos enable row level security;


-- ---------------------------------------------------------------------------
-- 5. INFORMAÇÕES POR ETAPA (IMPRESSÃO, FINALIZAÇÃO e ENTREGA)
-- ---------------------------------------------------------------------------
create table pedido_infos (
  id         uuid primary key default gen_random_uuid(),
  pedido_id  uuid not null references pedidos(id) on delete cascade,
  etapa      etapa not null,      -- IMPRESSAO | FINALIZACAO | ENTREGA
  texto      text not null,
  usuario    text not null,
  criado_em  timestamptz not null default now()
);

create index pedido_infos_pedido_idx on pedido_infos (pedido_id, etapa);

alter table pedido_infos enable row level security;


-- ---------------------------------------------------------------------------
-- 6. CONFIGURAÇÕES
-- ---------------------------------------------------------------------------
-- PEND-005 (decidido): GLOBAL — uma linha só; só Admin altera (PROBLEMA-022).
-- PEND-012 (decidido): percentuais continuam CONFIGURÁVEIS.
-- ⚠️ `entrega` é novo (PEND-018). O valor padrão 90 é RASCUNHO — a definição
--    dos percentuais do fluxo de 5 etapas acontece na Fase 3.
-- ---------------------------------------------------------------------------
create table config_progresso (
  id             boolean primary key default true check (id),   -- linha única
  pedido         integer not null default 0,
  impressao      integer not null default 50,
  finalizacao    integer not null default 75,
  entrega        integer not null default 90,          -- PEND-018 ✔ (rascunho)
  finalizado     integer not null default 100,
  atualizado_em  timestamptz not null default now(),
  constraint config_progresso_faixa check (
    pedido >= 0 and pedido <= impressao and impressao <= finalizacao
    and finalizacao <= entrega and entrega <= finalizado
  )
);

create table config_visual (
  id             boolean primary key default true check (id),   -- linha única (GLOBAL — PEND-005)
  conteudo       jsonb not null default '{}'::jsonb,            -- VisualConfig atual
  atualizado_em  timestamptz not null default now()
);

alter table config_progresso enable row level security;
alter table config_visual enable row level security;


-- ---------------------------------------------------------------------------
-- 7. CHAT ENTRE SETORES
-- ---------------------------------------------------------------------------
-- ⚠️ PEND-013 AINDA ABERTA: manter o chat como recurso real ou remover?
--    Enquanto aberta, a tabela fica aqui como rascunho (hoje só existe entre
--    abas do navegador).
-- ---------------------------------------------------------------------------
create table chat_mensagens (
  id         uuid primary key default gen_random_uuid(),
  usuario    text not null,
  texto      text not null,
  criado_em  timestamptz not null default now()
);

alter table chat_mensagens enable row level security;


-- ---------------------------------------------------------------------------
-- 8. RPCs (PROBLEMA-005, 006 — numeração atômica e fila transacional)
-- ---------------------------------------------------------------------------
-- PEND-003 (decidido): gerar_numero(p_dia date) usa UNIQUE(dia, numero).
-- PEND-014 (decidido): fila ESTRITA mantida — avancar_etapa valida que não há
--    outro pedido ativo na etapa de destino nem na frente, na mesma transação.
--
-- create or replace function gerar_numero(p_dia date) returns integer ...
-- create or replace function avancar_etapa(
--   p_pedido_id uuid, p_para etapa, p_versao integer, p_usuario uuid
-- ) returns pedidos ...   -- valida fila + versão dentro da transação
-- create or replace function cancelar_pedido(p_pedido_id uuid, p_motivo text, ...) ...
-- create or replace function voltar_etapa(p_pedido_id uuid, p_motivo text, ...) ...
-- ---------------------------------------------------------------------------
-- As implementações NÃO estão escritas aqui de propósito: entram na
-- TAREFA-016 (Fase 5), quando as pendências já estiverem todas encerradas.


-- ---------------------------------------------------------------------------
-- 9. STORAGE
-- ---------------------------------------------------------------------------
-- DECISÃO-004: bucket privado `artes`; o banco guarda só o caminho.
--   - pasta por pedido:  artes/{pedido_id}/arte-v{n}.{ext}
--   - nunca base64 dentro do banco (PROBLEMA-001/013)
--   - plano de migração das artes existentes em base64 (TAREFA-020)
-- ---------------------------------------------------------------------------


-- ---------------------------------------------------------------------------
-- 10. RLS — sketch de política (PROBLEMA-008)
-- ---------------------------------------------------------------------------
-- Regra geral: leitura para usuários autenticados com perfil válido;
-- escrita de pedidos SOMENTE pelas RPCs; eventos append-only (sem UPDATE/DELETE);
-- cliente do link público lê APENAS o pedido autorizado e vê também `valor`
-- (DECISÃO-010 + PEND-007: valor visível ao cliente).
--
-- NÃO ESTÁ APLICADO. Detalhamento na TAREFA-015 (Fase 4).
-- ---------------------------------------------------------------------------
