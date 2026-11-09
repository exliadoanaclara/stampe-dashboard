# 📋 CONTROLE DE TAREFAS — STAMPE Dashboard

**Data atual:** 09/11/2026  
**Fase em execução:** FASE 01 — Auditoria e Organização (CONCLUÍDA)  
**Próxima fase recomendada:** Deploy Vercel + Supabase ativo em produção

---

## ✅ CONCLUÍDO (até 09/11/2026)

### Hoje (09/11/2026) — Ajustes UI + Supabase ativo + Deploy Vercel
- [x] Aba **COSTURA** adicionada ao fluxo (entre PRODUÇÃO e ENTREGA) no Tabs
- [x] Botão **"Novo Pedido" só na aba PEDIDOS** (não em VISÃO GERAL/TODOS)
- [x] Botão **"Progresso" removido do Header** → vai em Personalizar (ConfigProgresso)
- [x] Botão **"Costura" removido do Header** (PainelCostura existe mas sem gatilho)
- [x] Botão **"Novo Pedido" fixo no topo da lista** (abas PEDIDOS e TODOS, mesmo com pedidos)
- [x] **Supabase ativo localmente** (`.env` com `VITE_USE_SUPABASE=true`)
- [x] **Deploy Vercel configurado** com 3 variáveis de ambiente:
  - `VITE_SUPABASE_URL=https://vjagdnpbqzlykolybhqw.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=sb_publishable_...`
  - `VITE_USE_SUPABASE=true`
- [x] Tabelas Supabase criadas + RLS desativado + Bucket `artes` criado
- [x] Documentação atualizada

### Sessões anteriores (27-29/10/2026 + 04/11/2026)
- [x] Fluxo completo PEDIDO → IMPRESSÃO → PRODUÇÃO → ENTREGA → FINALIZADO → HISTÓRICO
- [x] Múltiplas imagens de arte (arteUrls, arteProducaoUrls, arteArteUrls)
- [x] Login com senha e cadastro de usuários (somente admin)
- [x] Prazo de 3 dias úteis com cores Verde/Laranja/Vermelho
- [x] Auditoria de alterações (quem, quando, o que mudou)
- [x] Suporte a PDF, CDR, TIF nas artes
- [x] Prioridade URGENTE na fila
- [x] Prioridade lock (Reposição)
- [x] Export/backup de pedidos
- [x] Progresso por etapa personalizável
- [x] Modal com header sticky, PDF preview, fullscreen viewer
- [x] Build de produção aprovado (`vite build`)
- [x] TypeScript aprovado (`tsc --noEmit`)
- [x] ~101 testes unitários passando

---

## 🚧 PRÓXIMAS TAREFAS (ordem sugerida)

### 1. Validação em Produção (FASE 04) — ALTA
- [ ] Testar `https://stampe-dashboard.vercel.app/` no console (F12)
- [ ] Confirmar que carrega pedidos do Supabase (sem `ERR_NAME_NOT_RESOLVED`)
- [ ] Validar login, criação de pedido, fluxo de etapas, upload de artes

### 2. Migração de dados localStorage → Supabase (FASE 04) — MÉDIA
- [ ] Backup dos dados atuais do localStorage (Exportar backup no app)
- [ ] Importar no Supabase via SQL ou script
- [ ] Validar integridade dos dados migrados

### 3. Atualização em tempo real (FASE 09) — MÉDIA
- [ ] Implementar Realtime/SSE para sincronizar entre navegadores
- [ ] Testar com 2+ usuários simultâneos

### 4. HTTPS e Segurança (FASE 04) — BAIXA
- [ ] Vercel já fornece HTTPS automático ✅
- [ ] Ativar RLS no Supabase com policies por role
- [ ] Revisar CSP headers se necessário

---

## 📁 ARQUIVOS PRINCIPAIS DO PROJETO

| Arquivo | Função |
|---------|--------|
| `E:\ruan\src\App.tsx` | Componente raiz, navegação, modais |
| `E:\ruan\src/hooks/usePedidos.ts` | Lógica principal de negócio |
| `E:\ruan\src/domain/permissoes.ts` | Controle de acesso por role |
| `E:\ruan\src/domain/regras.ts` | Regras de negócio (prazo, etapas, validação) |
| `E:\ruan\src/domain/fila.ts` | Regras de fila estrita e bloqueios |
| `E:\ruan\src/data/repo.ts` | Repositório (LocalRepo ativo, SupabaseRepo preparado) |
| `E:\ruan\src/data/storage.ts` | Wrapper localStorage |
| `E:\ruan\src/domain/tipos.ts` | Interfaces e types principais |
| `E:\ruan\src/components/PedidoModal.tsx` | Modal detalhado do pedido |
| `E:\ruan\src/components/PedidoCard.tsx` | Card visual do pedido |
| `E:\ruan\src/components/Tabs.tsx` | Abas de navegação |
| `E:\ruan\.env` | Variáveis de ambiente (Supabase inativo) |

---

## 📊 ORÇAMENTO DE ALTERAÇÕES (sessão de hoje)

- **Arquivos de código modificados:** 10
- **Arquivos de documentação modificados:** 3
- **Arquivo de diagnóstico criado:** 1 (DIAGNOSTICO_FASE01.md)
- **Linhas alteradas (estimadas):** ~120
- **Build:** ✅ Aprovado (`vite build` + `tsc --noEmit`)

---

## ⚠️ PONTOS DE ATENÇÃO

1. **Campos obrigatórios da entrega** (pagamento, assinatura) — ainda não definidos com o cliente. Implementar como campos opcionais/configuráveis.
2. **Lista definitiva de funcionários** — pode ser ajustada se houver mudanças.
3. **Supabase inativo** — credenciais existem no .env mas `VITE_USE_SUPABASE=false`. Dados estão apenas no localStorage do navegador.
4. **Sem HTTPS** — necessário para produção.
5. **Sem atualização em tempo real** — usuário precisa recarregar para ver mudanças de outro operador.

---

## 🎯 PRÓXIMA AÇÃO IMEDIATA

Escolher qual fase iniciar entre:
- **FASE 06:** Etapa de costura (inclui acesso por celular)
- **FASE 08:** Link individual do cliente
- **FASE 09:** Relatório gerencial / Centro de Comando

O usuário indicou interesse em avançar nas três. Recomenda-se iniciar pela **FASE 08 (Link individual)** pois é mais independente e traz valor imediato para o cliente final.

---