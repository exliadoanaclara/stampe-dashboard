-- ============================================================================
-- MIGRAÇÃO STAMPE: localStorage → Supabase
-- Execute APÓS exportar o backup no app (botão "Exportar backup")
-- ============================================================================

-- 1. USUARIOS (execute primeiro - FK em pedidos.vendedor_id)
-- Substitua os VALUES pelos dados reais do seu backup JSON
INSERT INTO usuarios (id, nome, senha, roles, ativo, criado_em)
VALUES
  ('ruan', 'RUAN', '', ARRAY['ADMIN'], true, NOW()),
  ('henrique', 'HENRIQUE', '', ARRAY['ADMIN','IMPRESSAO'], true, NOW()),
  ('grazielli', 'GRAZIELLI', '', ARRAY['PEDIDO'], true, NOW()),
  ('italo', 'ITALO', '', ARRAY['PEDIDO'], true, NOW()),
  ('tales', 'TALES', '', ARRAY['PEDIDO','IMPRESSAO'], true, NOW()),
  ('leonardo', 'LEONARDO', '', ARRAY['PEDIDO','IMPRESSAO'], true, NOW()),
  ('arte1', 'ARTE 1', '', ARRAY['ARTES'], true, NOW()),
  ('magno', 'MAGNO', '', ARRAY['PRODUCAO'], true, NOW()),
  ('bia', 'BIA', '', ARRAY['PRODUCAO'], true, NOW()),
  ('reinaldo', 'REYNALDO', '', ARRAY['PRODUCAO'], true, NOW())
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  roles = EXCLUDED.roles,
  ativo = EXCLUDED.ativo;

-- 2. PEDIDOS
-- COLE AQUI os INSERTs gerados a partir do backup JSON
-- Exemplo de estrutura (substitua pelos dados reais):
/*
INSERT INTO pedidos (
  id, numero, cliente, servico, atendente, vendedor_id, telefone, quantidade, valor,
  data_inicio, previsao_conclusao, observacoes, arte_urls, arte_arte_urls, arte_producao_urls,
  etapa, data_criacao, data_atualizacao, data_finalizacao, usuario_finalizacao,
  previsao_impressao, previsao_producao, previsao_costura, previsao_entrega,
  data_entrega, entregue_por, entrega_situacao, entrega_pagamento, entrega_assinatura,
  cancelado_em, cancelado_motivo, cancelado_por,
  data_prazo, prazo_dias, status_prazo, alteracao_solicitada,
  data_ultima_alteracao, usuario_ultima_alteracao,
  itens, prioridade,
  token_acompanhamento, token_acompanhamento_ativo, token_acompanhamento_criado_em, token_acompanhamento_criado_por
) VALUES
  ('uuid-aqui', 1, 'CLIENTE', 'SERVICO', 'ATENDENTE', 'ruan', 'TEL', '10', '100.00',
   '2026-11-01', '2026-11-05', 'OBS', ARRAY['data:image/...'], ARRAY[]::text[], ARRAY[]::text[],
   'PEDIDO', NOW(), NOW(), NULL, NULL,
   NULL, NULL, NULL, NULL,
   NULL, NULL, NULL, NULL, NULL,
   NULL, NULL, NULL,
   '2026-11-08', 3, 'VERDE', false,
   NULL, NULL,
   '[]'::jsonb, 'NORMAL',
   NULL, false, NULL, NULL);
*/

-- 3. INFOS_* (após pedidos)
-- Cole os INSERTs de infos_impressao, infos_artes, infos_producao, infos_costura, infos_entrega
-- Exemplo:
/*
INSERT INTO infos_impressao (pedido_id, texto, usuario, criado_em)
VALUES ('uuid-do-pedido', 'Texto da info', 'RUAN', NOW());
*/

-- 4. HISTORICO
-- Cole os INSERTs de historico
-- Exemplo:
/*
INSERT INTO historico (pedido_id, campo, anterior, novo, usuario, criado_em)
VALUES ('uuid-do-pedido', 'Cliente', 'Antigo', 'Novo', 'RUAN', NOW());
*/

-- 5. ETAPA_HISTORICO
-- Cole os INSERTs de etapa_historico
-- Exemplo:
/*
INSERT INTO etapa_historico (pedido_id, de, para, usuario, data, motivo)
VALUES ('uuid-do-pedido', 'PEDIDO', 'ARTES', 'RUAN', NOW(), 'Enviado para arte');
*/

-- ============================================================================
-- COMO GERAR OS INSERTs AUTOMATICAMENTE:
-- 1. No app, clique "Exportar backup" → baixa stampe-backup-YYYY-MM-DD.json
-- 2. Use este script Node para converter JSON → SQL:
-- ============================================================================

/*
// save as convert-backup.js e rode: node convert-backup.js backup.json > inserts.sql
const fs = require('fs');
const backup = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

function escapeSql(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return `ARRAY[${v.map(escapeSql).join(',')}]::text[]`;
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return v;
}

backup.pedidos.forEach(p => {
  const cols = Object.keys(p).filter(k => p[k] !== null && p[k] !== undefined && p[k] !== '');
  const vals = cols.map(k => escapeSql(p[k]));
  console.log(`INSERT INTO pedidos (${cols.join(',')}) VALUES (${vals.join(',')});`);
});

['infos_impressao','infos_artes','infos_producao','infos_costura','infos_entrega'].forEach(t => {
  (backup.pedidos.flatMap(p => (p[t]||[]).map(i => ({...i, pedido_id: p.id})))).forEach(i => {
    const cols = Object.keys(i).filter(k => i[k] !== null && i[k] !== undefined && i[k] !== '');
    const vals = cols.map(k => escapeSql(i[k]));
    console.log(`INSERT INTO ${t} (${cols.join(',')}) VALUES (${vals.join(',')});`);
  });
});

['historico'].forEach(t => {
  (backup.pedidos.flatMap(p => (p[t]||[]).map(i => ({...i, pedido_id: p.id})))).forEach(i => {
    const cols = Object.keys(i).filter(k => i[k] !== null && i[k] !== undefined && i[k] !== '');
    const vals = cols.map(k => escapeSql(i[k]));
    console.log(`INSERT INTO ${t} (${cols.join(',')}) VALUES (${vals.join(',')});`);
  });
});

['etapa_historico'].forEach(t => {
  (backup.pedidos.flatMap(p => (p[t]||[]).map(i => ({...i, pedido_id: p.id})))).forEach(i => {
    const cols = Object.keys(i).filter(k => i[k] !== null && i[k] !== undefined && i[k] !== '');
    const vals = cols.map(k => escapeSql(i[k]));
    console.log(`INSERT INTO ${t} (${cols.join(',')}) VALUES (${vals.join(',')});`);
  });
});
*/

-- ============================================================================
-- APÓS MIGRAÇÃO: Verifique contagens
-- ============================================================================
/*
SELECT 'pedidos' as tabela, count(*) FROM pedidos
UNION ALL SELECT 'usuarios', count(*) FROM usuarios
UNION ALL SELECT 'infos_impressao', count(*) FROM infos_impressao
UNION ALL SELECT 'infos_artes', count(*) FROM infos_artes
UNION ALL SELECT 'infos_producao', count(*) FROM infos_producao
UNION ALL SELECT 'infos_costura', count(*) FROM infos_costura
UNION ALL SELECT 'infos_entrega', count(*) FROM infos_entrega
UNION ALL SELECT 'historico', count(*) FROM historico
UNION ALL SELECT 'etapa_historico', count(*) FROM etapa_historico;
*/