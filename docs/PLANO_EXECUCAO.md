# 📋 PLANO DE EXECUÇÃO — STAMPE Dashboard (Hospedagem + Supabase + Revisão)

**Data:** 08/11/2026  
**Objetivo:** Publicar o STAMPE online com HTTPS (Vercel), ativar Supabase (banco real + realtime) e revisar todo o código para garantir que não haja erros.

---

## 📊 ESTADO ATUAL (já implementado)

| Fase | Funcionalidade | Status |
|------|---------------|--------|
| FASE 01-05 | Pedidos, linha do tempo, artes, impressão, prazos, permissões | ✅ Implementado |
| FASE 06 | Etapa de costura (fluxo + PainelCostura mobile) | ✅ Implementado |
| FASE 07 | Entrega e histórico (modal detalhado, campos opcionais) | ✅ Implementado |
| FASE 08 | Link individual do cliente (token seguro, revogação) | ✅ Implementado |
| FASE 09 | Centro de Comando (dashboard, KPIs, gráficos, filtros, exportação, tempo real) | ✅ Implementado |
| FASE 04 (código) | Supabase preparado no `src/data/repo.ts` e `src/data/supabase.ts` | ✅ Código pronto |
| FASE 04 (ativação) | `VITE_USE_SUPABASE=true` no `.env` | ⏳ Pendente |
| FASE 04 (tabelas) | Criar tabelas no Supabase | ⏳ Pendente |
| FASE 04 (hospedagem) | Vercel com HTTPS | ⏳ Pendente |
| FASE 10/11 | Revisão de código, testes integrados, qualidade | ⏳ Pendente |

---

## 🗓️ ORDEM DE EXECUÇÃO

### ETAPA 1 — Ativar Supabase no código (5 min)

1. Abrir `E:\ruan\.env`
2. Alterar `VITE_USE_SUPABASE=false` → `VITE_USE_SUPABASE=true`
3. Salvar o arquivo

### ETAPA 2 — Subir código para o GitHub (10 min)

1. Verificar se o repositório Git está inicializado em `E:\ruan`
2. Fazer commit de todas as alterações (FASES 06-09 já implementadas)
3. Subir para um repositório no GitHub (público ou privado)

### ETAPA 3 — Criar tabelas no Supabase (15 min)

1. Acessar [supabase.com](https://supabase.com), entrar no projeto existente
2. Ir em **SQL Editor**
3. Colar o script SQL com todas as tabelas (pedidos, infos_*, historico, etapa_historico, usuarios, token_acompanhamento_*)
4. Executar e confirmar que todas as tabelas foram criadas

### ETAPA 4 — Hospedar no Vercel com HTTPS (15 min)

1. Acessar [vercel.com](https://vercel.com), criar conta grátis
2. Clicar em **"Add New Project"** → importar o repositório do GitHub do STAMPE
3. O Vercel detecta Vite/React automaticamente
4. Em **Settings → Environment Variables**, adicionar:
   - `VITE_SUPABASE_URL` = URL do projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` = chave anônima do Supabase
   - `VITE_USE_SUPABASE` = `true`
5. Fazer o deploy. O Vercel gera um link tipo `https://stampe-xxx.vercel.app`
6. Esse link é o que você envia para as pessoas usarem (já com HTTPS)

### ETAPA 5 — Validar no ambiente hospedado (30 min)

1. Abrir o link do Vercel no navegador
2. Fazer login com um usuário existente
3. Verificar se os pedidos carregam do Supabase (não do localStorage)
4. Testar criar um pedido, mover de etapa, concluir entrega
5. Testar o link individual do cliente (gerar link e abrir em aba anônima)
6. Testar o Centro de Comando (somente ADMIN)
7. Confirmar que o HTTPS está ativo (cadeado no navegador)

### ETAPA 6 — Revisão completa do código (FASE 10/11) (60 min)

1. Ler todos os arquivos modificados nas FASES 06-09
2. Verificar se não há variáveis não utilizadas, imports duplicados ou código morto
3. Verificar se todas as permissões estão corretas (quem pode o quê)
4. Verificar se não há nomes de funcionários fixos no código
5. Executar `npx tsc --noEmit` e `npx vitest run` para confirmar que tudo passa
6. Executar `npx vite build` para confirmar build de produção
7. Corrigir eventuais erros encontrados

### ETAPA 7 — Documentação final (15 min)

1. Atualizar `docs/CURRENT_TASK.md` marcando FASE 04 como concluída
2. Atualizar `docs/DIAGNOSTICO_FASE01.md` com o status de produção
3. Registrar o link do Vercel e as credenciais (sem expor senhas)

---

## ⚠️ PONTOS DE ATENÇÃO

- **Não expor senhas:** Nunca commit senhas de usuários ou chaves secretas no GitHub
- **Supabase primeiro:** As tabelas precisam existir no Supabase ANTES de ativar `VITE_USE_SUPABASE=true`, senão o app vai tentar ler de um banco vazio
- **localStorage como fallback:** Se algo der errado com o Supabase, o código já tem fallback para LocalRepo (localStorage)
- **HTTPS é automático no Vercel:** Não precisa configurar nada manualmente

---

## ✅ DEFINIÇÃO DE CONCLUSÃO

O projeto estará concluído quando:
- O link do Vercel estiver funcionando com HTTPS
- Pedidos criados na produção aparecem no Supabase
- Todas as 101 testes unitários passam
- Build de produção (`vite build`) não tem erros
- Nenhum erro de TypeScript (`tsc --noEmit`)
- Link individual do cliente funciona sem login
- Centro de Comando acessível somente para ADMIN

---