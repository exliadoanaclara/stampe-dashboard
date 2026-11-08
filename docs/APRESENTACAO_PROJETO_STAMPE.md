# Projeto STAMPE — Evolução para Sistema Compartilhado

**Documento de apresentação — visão geral do planejamento**

---

## 1. Como o sistema funciona hoje

- O STAMPE já possui todas as telas e regras de funcionamento prontas.
- Hoje, os pedidos ficam armazenados **localmente**, em cada computador/navegador.
- Por isso, os PCs **não compartilham automaticamente** os mesmos pedidos.
- O objetivo é fazer **vendedor, impressão e produção** trabalharem sobre os mesmos pedidos.

## 2. O problema que queremos resolver

O problema principal **não é a interface do sistema** — as telas estão funcionando bem.

O problema é **onde os dados estão guardados**: cada computador guarda os pedidos apenas para si.

Precisamos de um **banco central** para que todos os computadores da empresa trabalhem com os mesmos dados, ao mesmo tempo.

## 3. Solução proposta

Usar o **Supabase** como estrutura central do projeto:

- **Banco de dados PostgreSQL** — guarda todos os pedidos em um lugar só.
- **API** — comunicação entre o sistema e o banco.
- **Realtime** — atualização automática entre os computadores.
- **Storage** — armazenamento das artes/imagens dos pedidos.
- **Autenticação** — controle de usuários e permissões.

A aplicação será hospedada separadamente, em uma plataforma que permita uso comercial dentro do plano gratuito, como **Netlify** ou **Cloudflare Pages**.

## 4. Como vai funcionar na prática

Exemplo simples do dia a dia:

1. O vendedor cria um pedido no **PC 1**.
2. O pedido é salvo no **banco central**.
3. O PC da **impressão** recebe o mesmo pedido.
4. A **produção** também enxerga o pedido.
5. Quando uma etapa é alterada, os **outros computadores recebem a atualização**.
6. Todos trabalham com **a mesma informação**.

## 5. O que será preservado

- Interface atual
- Telas existentes
- Impressão A4
- Regras de funcionamento
- Filtros e personalizações
- Funcionalidades atuais

A ideia é alterar principalmente **a forma como os dados são armazenados e compartilhados**, e **não refazer o sistema visual**.

## 6. Segurança e organização

- Login com senha.
- Controle de permissões por usuário.
- Numeração dos pedidos controlada pelo banco, para evitar duplicidade entre PCs.
- Fila de produção protegida contra alterações simultâneas.
- Backup antes da migração.
- Possibilidade de **rollback** (voltar ao estado anterior) durante a implantação.

## 7. Histórico dos pedidos

- A proposta é **não apagar automaticamente** os pedidos antigos no reset diário.
- A numeração pode reiniciar a cada dia, mas os pedidos permanecem armazenados para consulta de histórico.

## 8. Imagens e artes

- As artes **não** ficarão armazenadas dentro do banco em formato base64.
- Elas serão salvas no **Storage**, e o banco guarda apenas a **referência** da imagem.

## 9. Custo

- A proposta inicial é utilizar os **planos gratuitos** dos serviços, mantendo o custo inicial previsto em **R$ 0** enquanto o uso permanecer dentro dos limites gratuitos.
- Isso **não é garantia de custo zero para sempre**: caso o uso cresça além dos limites gratuitos, poderão existir custos futuros.

## 10. Etapas do projeto

1. Fazer backup dos dados atuais.
2. Criar e configurar o Supabase.
3. Criar o banco, as regras de segurança e o Storage.
4. Adaptar o sistema para usar o banco central.
5. Testar com dois ou mais PCs.
6. Conferir pedidos, numeração, fila, atualizações e impressão.
7. Publicar o sistema.
8. Só depois colocar a nova estrutura em uso definitivo.

## 11. Objetivo final

Transformar o STAMPE em um **sistema compartilhado** entre os computadores da empresa:

- Manter as **telas e funcionalidades atuais**.
- Fazer **todos os PCs trabalharem com uma única fonte de dados**.
- Vendedor, impressão e produção enxergarem os mesmos pedidos, em tempo real.
