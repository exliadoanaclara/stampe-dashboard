# 📋 CONTROLE DE TAREFAS — STAMPE Dashboard

**Data atual:** 08/11/2026  
**Fase em execução:** FASE 01 — Auditoria e Organização (CONCLUÍDA)  
**Próxima fase recomendada:** FASE 06 (Etapa de costura), FASE 08 (Link individual cliente), FASE 09 (Relatório gerencial) — conforme pedido do usuário

---

## ✅ CONCLUÍDO (até 08/11/2026)

### Hoje (04/11/2026) — Correções e melhorias
- [x] Correção de parse/build errors no `PedidoModal.tsx` (estrutura JSX com array de seções + IIFE)
- [x] Sistema de Priority Lock (Reposição) — PRODUÇÃO → IMPRESSÃO com confirmação "É REPOSIÇÃO?"
- [x] Remoção da seção "Arte de Produção" do modal (produção não faz upload de arte)
- [x] Botão "Criar pedido" / "Novo Pedido" restrito a vendedores (PEDIDO) e ADMIN
- [x] Usuários de PRODUCAO veem todos os pedidos (não apenas próprios)
- [x] Usuários de PRODUCAO podem voltar etapa (podeVoltarEtapa aceita ADMIN e PRODUCAO)
- [x] Botão "🔄 REPOSIÇÃO" quando etapa é PRODUCAO; "↩ VOLTAR UMA ETAPA" nas demais
- [x] Botão "PERSONALIZAR" duplicado removido da linha de fluxo (Tabs.tsx)
- [x] Documentação atualizada: DIAGNOSTICO_FASE01.md, README.md, RELATORIO_ALTERACOES.md, RESUMO_SESSAO.md

### Sessões anteriores (27-29/10/2026)
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
- [x] ~72 testes unitários passando

---

## 🚧 PRÓXIMAS TAREFAS (ordem sugerida pelo usuário)

### 1. Etapa de Costura (FASE 06) — ALTA ✅ CONCLUÍDA
- [x] Adicionar "COSTURA" entre PRODUÇÃO e ENTREGA no fluxo
- [x] Tipo Etapa: adicionar "COSTURA"
- [x] Regras de transição: PRODUÇÃO → COSTURA → ENTREGA
- [x] Configurável: pedidos que não precisam de costura vão direto PRODUÇÃO → ENTREGA (etapa opcional - pular COSTURA)
- [x] Acesso por celular: interface simplificada (PainelCostura.tsx) para funcionária de costura
- [x] Registro: responsável, início, conclusão, observações, data/horário (infosCostura, previsaoCostura)

### 1b. Entrega e Histórico (FASE 07) — ALTA ✅ CONCLUÍDA
- [x] Campos opcionais de entrega: entregaSituacao, entregaPagamento, entregaAssinatura (extensíveis, não bloqueiam o fluxo)
- [x] dataEntrega e entreguePor já existiam; agora preenchidos via modal detalhado
- [x] Modal de entrega (ModalEntrega.tsx): responsável, data/horário, situação, pagamento (opcional), assinatura (opcional), observações
- [x] Registro no histórico de alterações ao concluir entrega
- [x] Botão "ENTREGA CONCLUÍDA" no modal do pedido abre o formulário de entrega
- [x] Não obriga preenchimento de campos comerciais não definidos (pagamento/assinatura opcionais)

### 2. Link Individual do Cliente (FASE 08) — ALTA ✅ CONCLUÍDA
- [x] Gerar token não previsível para cada pedido (stampe-track-<UUID>)
- [x] Tela pública simples (sem login) para o cliente acompanhar seu pedido (PedidoPublico.tsx)
- [x] Cliente vê: número do pedido, status, etapa, progresso, previsão de entrega, linha do tempo
- [x] Segurança: cliente não vê outros pedidos, não acessa fila geral, não acessa dados internos
- [x] Possibilidade de revogar link (tokenAcompanhamentoAtivo)
- [x] Vendedor consegue gerar/disponibilizar o link para cada pedido (gerarTokenAcompanhamento)

### 3. Relatório Gerencial / Centro de Comando (FASE 09) — ALTA ✅ CONCLUÍDA
- [x] Tela exclusiva para ADMIN (CentroComando.tsx)
- [x] Cabeçalho com data, relógio (Horário Brasília), indicador de conexão, último update
- [x] Cards: total pedidos, recebidos hoje, concluídos hoje, em andamento, atrasados, urgentes, aguardando arte, aguardando impressão
- [x] Gráficos: pedidos por etapa, produção por funcionário, evolução por período (últimos 7 dias), status do prazo
- [x] Filtros: data inicial/final, hoje, últimos 7/30 dias, mês atual, funcionário, etapa, status
- [x] Exportação PDF e CSV
- [ ] Atualização em tempo real (WebSocket/SSE ou polling) — pendente

### 4. Banco de Produção e HTTPS (FASE 04) — ALTA
- [ ] Ativar Supabase (`VITE_USE_SUPABASE=true` no .env)
- [ ] Criar tabelas no Supabase: pedidos, infos_*, historico, etapa_historico, usuarios
- [ ] Migrar dados do localStorage para Supabase (backup → importar)
- [ ] Configurar HTTPS na hospedagem
- [ ] Validar no ambiente hospedado (não considerar concluído só porque funciona localmente)

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