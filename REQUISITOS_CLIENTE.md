# 📋 REQUISITOS DO CLIENTE - STAMPE Dashboard

> Baseado na gravacao/transcricao da conversa com o cliente (Ruan). Atualizado em 09/11/2026.

---

## 1. Funcionarios e Funcoes (Lista Definitiva)

| Funcao | Pessoas | Acesso |
|--------|---------|--------|
| **Administrador** | Ruan (dono), Henrique | Visao geral, personalizacao, controle amplo. Vê TODOS os pedidos de todos. So admin pode alterar pedido apos finalizado. |
| **Cadastro de pedidos (Vendas)** | Juan, Grazielli, Italo, Tales, Leonardo | Criar pedidos, ver SO SEUS pedidos, acompanhar proprios pedidos. Tales e Leonardo também vendem (fora da área de vendedor tradicional). |
| **Artes** | Arte 1 | Preparar e anexar as artes do pedido. |
| **Impressao** | Teles, Henrique | Acessar pedidos e arquivos para imprimir, baixar arte, preparar para maquina. |
| **Producao** | Magno, Bia, Reinaldo | Acompanhar e atualizar etapas de producao. |

> Observacao: Teles e Leonardo estao tanto em Vendas quanto em Impressao. Eles podem criar pedidos e tambem atuar na impressao.

---

## 2. Fluxo de Etapas (Pedidos)

1. **PEDIDO** — Vendedor cadastra o pedido e informacoes do cliente
2. **ARTES** — Equipe prepara a arte e disponibiliza arquivo para impressao
3. **IMPRESSAO** — Responsavel baixa o arquivo, prepara material, encaminha para maquina
4. **PRODUCAO** — Pedido avança pelas etapas até ficar pronto
5. **COSTURA** (futuro) — Etapa de costura (acesso pelo celular)
6. **ENTREGA** — Registrar informacoes da entrega e concluir o pedido
7. **FINALIZADO** — Pedido concluido, vai para Historico
8. **HISTORICO** — Consultar pedidos finalizados e informacoes anteriores

---

## 3. Permissoes

- **Administrador (Ruan, Henrique)**: visao geral, personalizacao, controle amplo. Só admin pode alterar pedido depois que foi finalizado.
- **Cadastro de pedidos**: criar e acompanhar pedidos conforme suas permissoes. Cada vendedor vê SO SEUS pedidos (exceto admin que vê todos).
- **Impressao**: acessar pedidos e arquivos necessarios para imprimir.
- **Producao**: acompanhar e atualizar as etapas de producao.
- **Artes**: preparar e anexar as artes do pedido.
- **Costura (futuro)**: acessar etapa propria pelo celular.

> Cada login deve ter acesso só aos seus pedidos. Só o Ruan (admin) vê de todos os outros.

---

## 4. Auditoria de Alteracoes

Quando um admin altera um pedido apos finalizado:
- Registrar qual admin fez a alteracao
- Data e hora da alteracao
- O que foi alterado (campo anterior → novo)
- Historico preservado (nao apagar historico anterior)

---

## 5. Prazo de 3 Dias e Cores de Urgencia

- Prazo de **3 dias uteis** (segunda a sexta) contado a partir da entrada do pedido na loja / criacao
- **Verde**: dentro do prazo
- **Laranja**: prazo proximo (precisa chamar atencao)
- **Vermelho**: atrasado ou critico (atingiu ou ultrapassou o prazo)
- Identificacao visual deve ser facil de perceber na lista, sem abrir o pedido

---

## 6. Formatos de Arquivo de Arte

- **PDF, CDR (CorelDRAW), TIF** + imagens
- Os arquivos precisam ser baixados para serem utilizados na maquina de impressao (CorelDRAW)
- São entregues na sessão de "Artes a fazer"
- Suporta upload multiplo, preview de galeria, download individual

---

## 7. Personalizacao pelo Administrador

Aba de personalizacao disponível **somente para o administrador**:
- Configurar progresso de cada etapa (ex: Pedido 0%, Impressao 50%, Producao 75%, Finalizado 100%)
- Alterar forma de exibicao dos pedidos
- Mostrar/ocultar prévia das artes
- Mostrar/ocultar historico
- Ordenar pedidos em formato de listagem
- Ajustar tamanho das fontes
- Modificar prioridade e opcoes de exibicao
- Personalizar interface conforme rotina da empresa

---

## 8. Melhorias Visuais Solicitadas

- Pedidos precisam ficar **maiores e mais visiveis**
- Informacoes nao devem ficar excessivamente pequenas em monitores grandes
- Interface nao deve ficar carregada de logos, banners e elementos decorativos
- Mais espaco para informacoes importantes dos pedidos
- Apresentacao simples, sem exigir treinamento complexo
- Interface limpa, pratica e legivel

---

## 9. Entrega

- Registrar informacoes da entrega
- Dados sobre pagamento (a definir com cliente)
- Observacoes pertinentes
- Nao é apenas mudança de status: deve ser possivel consultar o que aconteceu com aquele pedido

---

## 10. Historico (Auditoria Operacional)

Deve conter:
- Data e horario de criacao
- Data e horario da ultima atualizacao
- Data e horario de entrega
- Funcionario que criou o pedido
- Funcionario que finalizou o pedido
- Informacoes sobre as etapas
- Dados registrados durante impressao e entrega (quando existirem)

---

## 11. Link Individual do Cliente

- O consumidor deve acessar somente o **proprio pedido**, por link individual
- Nao deve visualizar a fila inteira de pedidos da empresa
- Prioridade, mas para depois (nao implementar agora)

---

## 12. Login e Segurança (implementado)

- Login real por funcionario com senha
- Primeiro acesso: usuario cria propria senha (min. 4 caracteres)
- Admin pode cadastrar usuarios, editar roles, redefinir senhas, excluir usuarios
- Bloqueio de acesso se usuario nao tem senha definida
- Admin pode forcar troca de senha no proximo login
- Cada funcionario so ve seus proprios pedidos (exceto admin que ve todos)

---

## 13. Centro de Comando Gerencial (implementado - FASE 09)

Tela exclusiva para administradores com:
- KPIs: Total de pedidos, Criados hoje, Em andamento, Atrasados, Urgentes
- Filtros: periodo, funcionario, etapa, status do prazo
- Graficos: Pedidos por etapa, Status do prazo, Producao por funcionario, Evolucao 7 dias
- Exportacao: CSV e PDF
- Tempo real: atualizacao automatica entre abas via BroadcastChannel
- Relogio de Brasília + indicador de conexao

---

## 14. Ordens de Desenvolvimento (Fases)

| Fase | Status | O que fazer |
|------|--------|-------------|
| Fase 1 | ✅ Concluido | Consolidar fluxo atual: revisar telas, permissoes, dados dos pedidos e historico |
| Fase 2 | ✅ Concluido | Prazos e prioridades: regra de 3 dias, cores verde/laranja/vermelho, tratamento de alteracoes com preservacao de historico |
| Fase 3 | ✅ Concluido | Artes e impressao: validar anexos, previas, downloads, ficha fisica de identificacao |
| Fase 4 | ✅ Concluido | Permissoes e personalizacao: conferir acessos de cada funcionario, somente admin acessa funcoes administrativas |
| Fase 5 | ✅ Concluido | Login real por funcionario (com senha), primeiro acesso, forcar troca de senha |
| Fase 6 | ✅ Concluido | Centro de Comando Gerencial (dashboard admin) |
| Fase 7 | ⏳ Pendente | Banco de dados SQL / Supabase (tabelas, credenciais no .env) |
| Fase 8 | ⏳ Pendente | GitHub (repositorio e push) |
| Fase 9 | ⏳ Pendente | Vercel (deploy de producao) |

---

## 15. O que falta implementar

- [ ] Banco de dados SQL / tabelas Supabase (`E:\ruan\supabase\schema_proposto.sql`)
- [ ] GitHub (repositorio e push do codigo)
- [ ] Vercel (deploy de producao)
- [ ] Link individual do cliente (prioridade baixa - ja tem base em PedidoPublico.tsx)

---

> Pontos deixados para confirmacao posterior com o cliente:
> - Campos obrigatorios da entrega (pagamento, assinatura, etc.)
> - Lista definitiva pode ser ajustada se houver mudanças
