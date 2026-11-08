# 📋 REQUISITOS DO CLIENTE - STAMPE Dashboard

> Baseado na gravação/transcrição da conversa com o cliente (Ruan). Salvo em 27/10/2026.

---

## 1. Funcionários e Funções (Lista Definitiva)

| Função | Pessoas | Acesso |
|--------|---------|--------|
| **Administrador** | Ruan (dono), Henrique | Visão geral, personalização, controle amplo. Vê TODOS os pedidos de todos. Só admin pode alterar pedido após finalizado. |
| **Cadastro de pedidos (Vendas)** | Juan, Grazielli, Ítalo, Teles, Leonardo | Criar pedidos, ver SO SEUS pedidos, acompanhar próprios pedidos. Teles e Leonardo também vendem (fora da área de vendedor tradicional). |
| **Impressão** | Teles, Henrique | Acessar pedidos e arquivos para imprimir, baixar arte, preparar para máquina. |
| **Produção** (era Finalização) | Magno, Bia, Reinaldo | Acompanhar e atualizar etapas de produção. |

> Observação: Teles e Leonardo estão tanto em Vendas quanto em Impressão. Eles podem criar pedidos e também atuar na impressão.

---

## 2. Fluxo de Etapas (Pedidos)

1. **PEDIDO** — Vendedor cadastra o pedido e informações do cliente
2. **ARTES A FAZER** — Equipe prepara a arte e disponibiliza arquivo para impressão
3. **IMPRESSÃO** — Responsável baixa o arquivo, prepara material, encaminha para máquina
4. **PRODUÇÃO** (antes chamada "Finalização") — Pedido avança pelas etapas até ficar pronto
5. **ENTREGA** — Registrar informações da entrega e concluir o pedido
6. **HISTÓRICO** — Consultar pedidos finalizados e informações anteriores

> Nome da etapa "FINALIZAÇÃO" deve ser renomeado para **"PRODUÇÃO"** em todo o sistema.

---

## 3. Permissões

- **Administrador (Ruan, Henrique)**: visão geral, personalização, controle amplo. Só admin pode alterar pedido depois que foi finalizado.
- **Cadastro de pedidos**: criar e acompanhar pedidos conforme suas permissões. Cada vendedor vê SO SEUS pedidos (exceto admin que vê todos).
- **Impressão**: acessar pedidos e arquivos necessários para imprimir.
- **Produção**: acompanhar e atualizar as etapas de produção.
- **Costura (futuro)**: acessar etapa própria pelo celular.

> Cada login deve ter acesso só aos seus pedidos. Só o Ruan (admin) vê de todos os outros.

---

## 4. Auditoria de Alterações

Quando um admin altera um pedido após finalizado:
- Registrar qual admin fez a alteração
- Data e hora da alteração
- O que foi alterado (campo anterior → novo)
- Histórico preservado (não apagar histórico anterior)

---

## 5. Prazo de 3 Dias e Cores de Urgência

- Prazo de **3 dias úteis** (segunda a sexta) contado a partir da entrada do pedido na loja / criação
- **Verde**: dentro do prazo
- **Laranja**: prazo próximo (precisa chamar atenção)
- **Vermelho**: atrasado ou crítico (atingiu ou ultrapassou o prazo)
- Identificação visual deve ser fácil de perceber na lista, sem abrir o pedido
- Exemplo: 50 pedidos, alguns criados há 2 dias, outros no dia atual — identificar imediatamente quem precisa de atenção

### Quando cliente solicita alteração:
- Pedido volta para o fluxo de trabalho (volta para etapa anterior)
- Recebe **novo prazo de 3 dias**
- Vendedor deve informar ao cliente que a alteração reinicia o prazo
- Pedido volta pro **final da fila**
- Vendedor ou admin pode **reclassificar a prioridade** do pedido
- Histórico deve preservar o que aconteceu anteriormente (não apagar)

---

## 6. Formatos de Arquivo de Arte

- **PDF, CDR (CorelDRAW), TIF** + imagens
- Os arquivos precisam ser baixados para serem utilizados na máquina de impressão (CorelDRAW)
- São entregues na sessão de "Artes a fazer"

---

## 7. Personalização pelo Administrador

Aba de personalização disponível **somente para o administrador**:
- Configurar progresso de cada etapa (ex: Pedido 10%, Impressão 50%, Produção 75%, Finalizado 100%)
- Alterar forma de exibição dos pedidos
- Mostrar/ocultar prévia das artes
- Mostrar/ocultar histórico
- Ordenar pedidos em formato de listagem
- Ajustar tamanho das fontes
- Modificar prioridade e opções de exibição
- Personalizar interface conforme rotina da empresa

---

## 8. Melhorias Visuais Solicitadas

- Pedidos precisam ficar **maiores e mais visíveis**
- Informações não devem ficar excessivamente pequenas em monitores grandes
- Interface não deve ficar carregada de logos, banners e elementos decorativos
- Mais espaço para informações importantes dos pedidos
- Apresentação simples, sem exigir treinamento complexo
- Interface limpa, prática e legível

---

## 9. Entrega

- Registrar informações da entrega
- Dados sobre pagamento (a definir com cliente — deixado para depois)
- Observações pertinentes
- Não é apenas mudança de status: deve ser possível consultar o que aconteceu com aquele pedido

---

## 10. Histórico (Auditoria Operacional)

Deve conter:
- Data e horário de criação
- Data e horário da última atualização
- Data e horário de entrega
- Funcionário que criou o pedido
- Funcionário que finalizou o pedido
- Informações sobre as etapas
- Dados registrados durante impressão e entrega (quando existirem)

---

## 11. Link Individual do Cliente

- O consumidor deve acessar somente o **próprio pedido**, por link individual
- Não deve visualizar a fila inteira de pedidos da empresa
- **Prioridade, mas para depois** (não implementar agora)

---

## 12. Ordens de Desenvolvimento (Fases)

| Fase | O que fazer |
|------|-------------|
| **Fase 1** | Consolidar fluxo atual: revisar telas, permissões, dados dos pedidos e histórico |
| **Fase 2** | Prazos e prioridades: regra de 3 dias, cores verde/laranja/vermelho, tratamento de alterações com preservação de histórico |
| **Fase 3** | Artes e impressão: validar anexos, prévias, downloads, ficha física de identificação |
| **Fase 4** | Permissões e personalização: conferir acessos de cada funcionário, somente admin acessa funções administrativas |
| **Fase 5** | Evoluções futuras: costura, celular, relatórios gerenciais |

---

## 13. O que já está implementado no sistema (E:\ruan)

- Fluxo Pedido → Impressão → Produção → Entrega → Histórico
- Múltiplas imagens de arte (arteUrls, arteProducaoUrls)
- Aba HISTÓRICO separada
- Reabrir pedido do histórico
- Notificações (toast) de mudança de etapa
- Export/backup de pedidos
- Progresso por etapa personalizável
- Prioridade URGENTE na fila
- Limite de pedidos simultâneos por etapa
- Personalização visual (parcial)

---

## 14. O que ainda falta implementar

- [x] Login real por funcionário (com senha)
- [x] Permissões: cada vendedor vê SO SEUS pedidos; Admin (Ruan) vê todos
- [x] Renomear FINALIZAÇÃO → PRODUCAO
- [x] Prazo de 3 dias úteis com cores Verde/Laranja/Vermelho
- [x] Auditoria de alterações (quem, quando, o que mudou)
- [x] Suporte a arquivos PDF, CDR, TIF nas artes
- [x] Forçar troca de senha / bloqueio até definir senha (primeiro acesso)
- [ ] Link individual do cliente (futuro/prioridade baixa)
- [ ] Relatório gerencial (guardado para sessão futura)
- [ ] Etapa de costura (celular) (guardado para sessão futura)

---

> Pontos deixados para confirmação posterior com o cliente:
> - Campos obrigatórios da entrega (pagamento, assinatura, etc.)
> - Lista definitiva pode ser ajustada se houver mudanças
