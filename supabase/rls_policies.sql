-- ============================================================================
-- RLS POLICIES STAMPE
-- Execute APÓS migrar os dados e ANTES de testar em produção
-- Habilite RLS em cada tabela e cole as policies abaixo
-- ============================================================================

-- HABILITAR RLS (execute uma vez por tabela)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE infos_impressao ENABLE ROW LEVEL SECURITY;
ALTER TABLE infos_artes ENABLE ROW LEVEL SECURITY;
ALTER TABLE infos_producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE infos_costura ENABLE ROW LEVEL SECURITY;
ALTER TABLE infos_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE etapa_historico ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS USUARIOS
-- ============================================================================

-- Admin vê todos, usuário vê só a si mesmo
CREATE POLICY "usuarios_select_own_or_admin" ON usuarios
  FOR SELECT USING (
    auth.uid()::text = id
    OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND 'ADMIN' = ANY(roles))
  );

-- Admin pode inserir/atualizar/deletar
CREATE POLICY "usuarios_all_admin" ON usuarios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND 'ADMIN' = ANY(roles))
  );

-- ============================================================================
-- POLÍTICAS PEDIDOS
-- ============================================================================

-- SELECT: Admin vê tudo; Vendedor vê só seus pedidos; Outros veem todos (fila)
CREATE POLICY "pedidos_select" ON pedidos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND 'ADMIN' = ANY(roles))
    OR vendedor_id = auth.uid()::text
    OR NOT EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND 'PEDIDO' = ANY(roles))
  );

-- INSERT: Só PEDIDO e ADMIN podem criar
CREATE POLICY "pedidos_insert" ON pedidos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND ('PEDIDO' = ANY(roles) OR 'ADMIN' = ANY(roles)))
    AND vendedor_id = auth.uid()::text
  );

-- UPDATE: 
-- - Admin: tudo
-- - Vendedor: só seus pedidos em etapa PEDIDO/ARTES (resumo, arte)
-- - ARTES: pode editar arte_arte_urls em PEDIDO/ARTES
-- - IMPRESSAO: previsao_impressao, infos_impressao em IMPRESSAO
-- - PRODUCAO: previsao_producao, infos_producao em PRODUCAO/COSTURA
-- - ENTREGA: entrega em ENTREGA/FINALIZADO
CREATE POLICY "pedidos_update" ON pedidos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND 'ADMIN' = ANY(roles))
    OR (
      vendedor_id = auth.uid()::text
      AND etapa IN ('PEDIDO', 'ARTES')
      AND NOT EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND 'ADMIN' = ANY(roles))
    )
    OR (
      EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND 'ARTES' = ANY(roles))
      AND etapa IN ('PEDIDO', 'ARTES')
    )
    OR (
      EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND 'IMPRESSAO' = ANY(roles))
      AND etapa = 'IMPRESSAO'
    )
    OR (
      EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND 'PRODUCAO' = ANY(roles))
      AND etapa IN ('PRODUCAO', 'COSTURA')
    )
    OR (
      EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND ('PRODUCAO' = ANY(roles) OR 'ADMIN' = ANY(roles)))
      AND etapa IN ('ENTREGA', 'FINALIZADO')
    )
  );

-- DELETE: Só Admin (soft delete via cancelado_em preferível)
CREATE POLICY "pedidos_delete_admin" ON pedidos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND 'ADMIN' = ANY(roles))
  );

-- ============================================================================
-- POLÍTICAS INFOS_* (todas iguais)
-- ============================================================================

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['infos_impressao','infos_artes','infos_producao','infos_costura','infos_entrega']
  LOOP
    EXECUTE format('
      CREATE POLICY %I ON %I FOR SELECT USING (true);
      CREATE POLICY %I ON %I FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND ''ADMIN'' = ANY(roles))
        OR (
          pedido_id IN (SELECT id FROM pedidos WHERE vendedor_id = auth.uid()::text)
        )
        OR (
          pedido_id IN (SELECT id FROM pedidos WHERE etapa = %L)
        )
      );
      CREATE POLICY %I ON %I FOR UPDATE USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND ''ADMIN'' = ANY(roles))
      );
      CREATE POLICY %I ON %I FOR DELETE USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND ''ADMIN'' = ANY(roles))
      );
    ', 
    tbl || '_select', tbl,
    tbl || '_insert', tbl, tbl,
    tbl || '_update', tbl,
    tbl || '_delete', tbl
    );
  END LOOP;
END $$;

-- ============================================================================
-- POLÍTICAS HISTORICO E ETAPA_HISTORICO
-- ============================================================================

-- SELECT: todos podem ver histórico
CREATE POLICY "historico_select" ON historico FOR SELECT USING (true);
CREATE POLICY "etapa_historico_select" ON etapa_historico FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: só Admin (histórico é append-only, gerado pelo sistema)
CREATE POLICY "historico_admin" ON historico FOR ALL USING (
  EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND 'ADMIN' = ANY(roles))
);
CREATE POLICY "etapa_historico_admin" ON etapa_historico FOR ALL USING (
  EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND 'ADMIN' = ANY(roles))
);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
/*
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
*/