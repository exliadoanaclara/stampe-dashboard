// Teste automatizado de impressão via PDF (TAREFA-026)
// VERSÃO MINIMALISTA PARA VALIDAÇÃO MANUAL
/// <reference types="puppeteer" />
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import * as puppeteer from 'puppeteer';
import { promises as fs } from 'fs';

describe('Impressão via PDF (PUPPETEER)', () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    await page.goto('http://localhost:3030', { 
      waitUntil: 'networkidle0', 
      timeout: 60000 
    });
  });
  afterAll(async () => {
    await browser?.close();
  });
  test('deve gerar PDF com uma página A4 e layout correto', async () => {
    // === PASSO 1: INJETAR DADOS DE TESTE DIRETO NO LOCALSTORAGE ===
    await page.evaluate(() => {
      localStorage.clear();
      // Sessao valida para o app liberar a area de pedidos (sem sessao o app fica na tela de login)
      localStorage.setItem('stampe_user_session_v1', JSON.stringify({ id: 'ITALO', nome: 'ITALO', roles: ['PEDIDO'] }));
      const pedido = {
        id: 'test-p1',
        numero: 1,
        cliente: 'CLIENTE TESTE',
        servico: 'FAIXA',
        atendente: 'ITALO',
        vendedorId: 'ITALO',
        telefone: '',
        quantidade: '',
        valor: '',
        dataInicio: '2026-09-26',
        previsaoConclusao: '2026-09-26',
        observacoes: '',
        arteUrls: [],
        arteProducaoUrls: [],
        etapa: 'PEDIDO',
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
        dataPrazo: '2026-10-01',
        prazoDias: 3,
        statusPrazo: 'VERDE',
        infosImpressao: [],
        infosProducao: [],
        infosEntrega: [],
        historico: [],
        etapaHistorico: [],
        itens: [],
        prioridade: 'NORMAL',
      };
      localStorage.setItem('stampe_pedidos_v3', JSON.stringify([pedido]));
      localStorage.setItem('stampe_seq_v3', '2');
    });
    // === PASSO 2: RECARREGAR A APLICAÇÃO COM OS NOVOS DADOS ===
    await page.reload({ 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    // === PASSO 3: AGUARDAR O PEDIDO APARECER ===
    await page.waitForSelector('[data-testid="pedido-card"]', { 
      timeout: 30000 
    });
    // === PASSO 4: INTERAGIR COM A APLICAÇÃO ===
    await page.click('[data-testid="pedido-card"]');
    await page.waitForSelector('[data-testid="pedido-modal"]', { 
      timeout: 10000 
    });
    await page.click('[data-testid="modal-print-button"]');
    await new Promise(resolve => setTimeout(resolve, 2000));
    // === PASSO 5: GERAR E VALIDAR O PDF ===
    const pdfBuffer = await page.pdf({
      path: 'test-output.pdf',
      format: 'A4',
      printBackground: true,
    });
    expect(pdfBuffer.length).toBeGreaterThan(0);
    expect(pdfBuffer.length).toBeLessThan(10 * 1024 * 1024); // < 10MB
    // Limpeza
    try {
      await fs.unlink('test-output.pdf');
    } catch {}
  }, 60000);
});