# Conversa — Sistema de Pedidos STAMPE

Resumo do que foi feito, do que foi decidido e do que ficou em aberto.
Data da conversa: **25/09/2026**.
Projeto: `G:\ruan` (Vite + React + TypeScript + Tailwind, dados no `localStorage`).

---

## 1. Correção da impressão A4 (CONCLUÍDO)

**Problema relatado:** a ordem de serviço saía numa faixa estreita no centro da folha, com o cabeçalho sumindo e uma área branca enorme embaixo.

**Causas encontradas:**

- O container raiz do app (`App.tsx`) aplica `paddingLeft/Right = visual.bannerLarg` (padrão **160px em cada lado**) — esse padding continuava valendo na impressão e espremia a área central para ~250–300px.
- A regra `header, nav, footer { display: none }` do `@media print` escondia também o **cabeçalho e o rodapé da ordem de serviço**.
- A marca d'água (`fixed inset-0`) aparecia como imagem gigante de fundo na folha.

**O que foi feito (somente no bloco de impressão):**

- `@page { size: A4; margin: 0 }` — a folha inteira é aproveitada.
- Grid `36px minmax(0,1fr) 36px` — banners de 36px como moldura, centro ocupando toda a largura restante (`width: 100%`, sem `max-width`/`scale`).
- `#root > div { padding: 0 !important }` só no print — neutraliza o padding dos banners.
- A ordem de serviço passou a usar `div` em vez de `<header>`/`<footer>`, para não ser engolido pelas regras de esconder a interface.
- Altura: `min-height: 100vh` no documento **e** na coluna central → a linha do grid estica, a prévia da arte ocupa ~77% da altura, rodapé no pé da folha, **1 página**.
- Marca d'água/fundo ocultos no print (`.fixed.inset-0 { display: none }`).

**Estrutura da impressão:**

```
[BANNER 36px] [ ORDEM DE SERVIÇO — logo + "ORDEM DE SERVIÇO" + "PEDIDO Nº 001" ]
              [ CLIENTE | SERVIÇO | ATENDENTE ]
              [ PREVISÃO | INÍCIO | ETAPA ]
              [ OBSERVAÇÕES ]
              [ PRÉVIA DA ARTE (maior área) ]
              [ rodapé ]
[BANNER 36px]
```

**Verificação:** build headless (Edge → PDF) confirmou 1 página A4, coluna central de 722px (794 − 2×36) e prévia com 690×862px.

**Arquivos alterados:** `src/index.css` (bloco `@media print`), `src/App.tsx` (bloco `.print-document`).

> Regra mantida: **nada da tela normal do pedido foi alterado.**

---

## 2. Reset diário dos pedidos (CONCLUÍDO)

**Pedido do usuário:** apagar os pedidos de teste (nº 1 a 4) e, à meia-noite, zerar a lista e voltar a contar do **1**. Como cada pedido tem a data dele, números repetindo por dia não confundem.

**Comportamento atual:**

| Momento | O que acontece |
|---|---|
| Primeira carga após a atualização | Limpeza única: apaga tudo o que está salvo e zera a numeração (`stampe_limpeza_teste_v1`) |
| Ao abrir o site | Remove qualquer pedido **que não foi criado hoje** (apaga pela `dataCriacao`) |
| Com o site aberto, virando o dia | Verifica a cada 30s, ao voltar para a aba (`visibilitychange`/`focus`) e ao dar foco na janela |
| Depois da meia-noite | Lista vazia, próximo pedido criado já sai como **nº 1** |

**Detalhes técnicos:**

- Chaves novas no `localStorage`: `stampe_dia_reset_v1` (dia) e `stampe_limpeza_teste_v1` (limpeza única).
- Função `apagarPedidosDoDia()` — mantém só pedidos de hoje e recalcula a sequência (`seq = max(1, maior + 1)`).
- **`seedPedidos()` foi removido** — o sistema não cria mais pedidos de demonstração.
- Se o pedido aberto na tela for apagado, o modal fecha sozinho.
- Avisos por toast: "Meia-noite: pedidos apagados e numeracao reiniciada no 1".

**Observação:** o código novo só roda com **recarga completa da página (`Ctrl + F5`)** — o HMR do Vite não reinicia o estado do React.

---

## 3. Página pública de acompanhamento do cliente (NÃO IMPLEMENTADA — só estudo)

O usuário apresentou um prompt completo para uma página pública `/acompanhar/<token>` enviada ao cliente por WhatsApp. **Foi decidido não implementar por enquanto** ("foi só uma sugestão").

### Análise da arquitetura (fatores verificados no código)

- **Não existe backend.** Sem `fetch`/API, sem proxy no `vite.config.ts`, sem servidor. Tudo vive no `localStorage` de cada navegador.
- **Não existe biblioteca de rotas** (sem react-router).
- **Não existe arquivo de logo STAMPE no projeto.** `src/assets` tem `hero.png`, `react.svg`, `vite.svg`; `public` tem `favicon.svg` e `icons.svg` (ícones do Vite). A logo que aparece no sistema é uma imagem enviada por upload (`visual.logoUrl`, base64 no `localStorage`).
- Sistema roda localmente em `http://localhost:5173` (`iniciar.bat`).

### Implicações

1. **Celular do cliente não veria o pedido** — `localStorage` não sincroniza entre aparelhos.
2. **Sem endpoint** → impossível validar token no servidor e fazer atualização automática (polling/websocket).
3. **Hospedar o site sozinho não resolve** o fluxo interno multi-computador: hospedar coloca as *telas* na internet, mas os *pedidos* continuam isolados em cada navegador.

### Alternativas apresentadas

- **Opção A — criar backend/nuvem** (Node + banco, ou Supabase/Firebase): dados reais no celular do cliente, etapa atualizando sozinha, token validado no servidor. Também resolve o fluxo interno (vendedor → impressão → produção) em computadores diferentes.
- **Opção B — sem servidor:** o token carrega os dados do pedido dentro do próprio link. Abre no celular sem login e não dá para acessar outro pedido trocando a URL, **mas a etapa não atualiza sozinha**.

---

## 4. Fluxo interno desejado (pendente de decisão)

O usuário quer que, hospedado o site:

1. O **vendedor** cria o pedido na venda.
2. A **impressão** acessa esse pedido.
3. Passa para a **produção** para produzir.

As etapas já existentes (`PEDIDO → IMPRESSÃO → FINALIZAÇÃO → FINALIZADO`) e os perfis (`Atendimento / Impressão / Finalização / Admin`) já servem a esse fluxo — falta apenas o **banco de dados compartilhado**.

**Conclusão levantada:** dá para fazer, mas **hospedar sozinho não basta**; é preciso site hospedado **+** banco de dados compartilhado. A página do cliente fica para depois.

> Pendências do usuário: decidir se quer o backend, se vai hospedar, e de onde virá o arquivo de logo para uso fixo.

---

## 5. Comandos úteis

```bash
npm run dev      # ou duplo clique em iniciar.bat -> http://localhost:5173
npm run build    # build de produção (tsc + vite)
npm run lint     # oxlint
```

Após qualquer alteração no código: recarregar a página com **`Ctrl + F5`**.

---

## 7. Equipe (atualizada em 25/09/2026)

Nomes cadastrados nas sugestões de atendente do sistema (`datalist`), agrupados por área:

| Área | Pessoas |
|---|---|
| **VENDAS** | ITALO, RUAN, GRAZIELA |
| **IMPRESSÃO** | TALES, HENRIQUE |
| **PRODUÇÃO** | MAGNO, BIA, REYNALDON |

- Os nomes aparecem ao preencher o campo **Atendente** (pedido novo e edição).
- O filtro "Todos atendentes" continua sendo montado automaticamente a partir dos pedidos existentes.
- Usuário padrão do sistema: **ITALO** (Vendas).
- Antes o sistema tinha apenas ITALO, CARLOS e ANA — CARLOS/ANA eram dos pedidos de demonstração, que já foram removidos.

---

## 8. Checklist do que está pronto

- [x] Impressão A4: banner estreito | documento central largo | banner estreito, página inteira aproveitada, 1 folha
- [x] Cabeçalho da OS com logo + "ORDEM DE SERVIÇO" + nº real do pedido
- [x] Dados, observações e prévia da arte distribuídos na altura da folha
- [x] Reset diário de pedidos + limpeza única dos testes
- [x] Remoção dos pedidos de demonstração
- [x] Equipe atualizada (Vendas / Impressão / Produção)
- [ ] Página pública de acompanhamento (adiada)
- [ ] Backend/banco compartilhado para uso multi-computador na gráfica (em decisão)
- [ ] Hospedagem do site (em decisão)
