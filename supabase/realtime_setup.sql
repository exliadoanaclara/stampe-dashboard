-- ============================================================================
-- SUPABASE REALTIME SETUP
-- Execute no SQL Editor do Supabase APÓS migrar dados e habilitar RLS
-- ============================================================================

-- 1. HABILITAR REALTIME NAS TABELAS
-- Vá em Database → Replication → ative para cada tabela:
-- Ou execute:

ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE infos_impressao;
ALTER PUBLICATION supabase_realtime ADD TABLE infos_artes;
ALTER PUBLICATION supabase_realtime ADD TABLE infos_producao;
ALTER PUBLICATION supabase_realtime ADD TABLE infos_costura;
ALTER PUBLICATION supabase_realtime ADD TABLE infos_entrega;
ALTER PUBLICATION supabase_realtime ADD TABLE historico;
ALTER PUBLICATION supabase_realtime ADD TABLE etapa_historico;

-- Para verificar:
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- ============================================================================
-- 2. CÓDIGO JAVASCRIPT (adicionar em src/hooks/usePedidos.ts)
-- ============================================================================

/*
// No topo do arquivo, após imports:
import { supabase } from "../data/supabase"

// Dentro de usePedidos, após const [pedidos, setPedidos] = useState(...):
useEffect(() => {
  if (!import.meta.env.VITE_USE_SUPABASE) return;

  const channel = supabase
    .channel('stampe-pedidos-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pedidos' },
      (payload) => {
        console.log('Realtime pedidos:', payload);
        const novo = payload.new as Pedido;
        const antigo = payload.old as Pedido;

        if (payload.eventType === 'INSERT' && novo) {
          setPedidos(prev => [novo, ...prev.filter(p => p.id !== novo.id)]);
        } else if (payload.eventType === 'UPDATE' && novo) {
          setPedidos(prev => prev.map(p => p.id === novo.id ? novo : p));
        } else if (payload.eventType === 'DELETE' && antigo) {
          setPedidos(prev => prev.filter(p => p.id !== antigo.id));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'infos_impressao' },
      (payload) => refreshInfos('infos_impressao', payload)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'infos_artes' },
      (payload) => refreshInfos('infos_artes', payload)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'infos_producao' },
      (payload) => refreshInfos('infos_producao', payload)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'infos_costura' },
      (payload) => refreshInfos('infos_costura', payload)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'infos_entrega' },
      (payload) => refreshInfos('infos_entrega', payload)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'historico' },
      (payload) => refreshHistorico(payload)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'etapa_historico' },
      (payload) => refreshEtapaHistorico(payload)
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, []);

function refreshInfos(tipo, payload) {
  const novo = payload.new as any;
  const antigo = payload.old as any;
  if (payload.eventType === 'INSERT' && novo) {
    setPedidos(prev => prev.map(p => 
      p.id === novo.pedido_id 
        ? { ...p, [tipo]: [...p[tipo], novo] } 
        : p
    ));
  } else if (payload.eventType === 'DELETE' && antigo) {
    setPedidos(prev => prev.map(p => 
      p.id === antigo.pedido_id 
        ? { ...p, [tipo]: p[tipo].filter(i => i.id !== antigo.id) } 
        : p
    ));
  }
}

function refreshHistorico(payload) {
  const novo = payload.new as HistoricoItem;
  const antigo = payload.old as HistoricoItem;
  if (payload.eventType === 'INSERT' && novo) {
    setPedidos(prev => prev.map(p => 
      p.id === novo.pedido_id 
        ? { ...p, historico: [novo, ...p.historico] } 
        : p
    ));
  }
}

function refreshEtapaHistorico(payload) {
  const novo = payload.new as EtapaHist;
  const antigo = payload.old as EtapaHist;
  if (payload.eventType === 'INSERT' && novo) {
    setPedidos(prev => prev.map(p => 
      p.id === novo.pedido_id 
        ? { ...p, etapaHistorico: [novo, ...p.etapaHistorico] } 
        : p
    ));
  }
}
*/

-- ============================================================================
-- 3. VERIFICAR SE REALTIME FUNCIONA
-- ============================================================================

-- No console do navegador (F12), após abrir o app:
-- supabase.channel('test').on('postgres_changes', {event:'*', schema:'public', table:'pedidos'}, console.log).subscribe()
-- Deve logar mudanças quando você criar/editar pedidos em outra aba

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

-- 1. RLS DEVE ESTAR HABILITADO para Realtime funcionar com segurança
-- 2. As policies de SELECT devem permitir ler as mudanças
-- 3. O canal 'stampe-pedidos-changes' pode ter qualquer nome único
-- 4. Cleanup no useEffect evita memory leaks
-- 5. Realtime usa WebSocket - funciona em HTTPS (Vercel) e localhost