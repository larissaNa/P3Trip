import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Busca na tela inicial', () => {
  test('filtra viagens por palavra-chave', async ({ page }) => {
    const termo = 'Vila';
    const home = new HomePage(page);
  
    await home.acessarPaginaInicial();
    await home.preencherBusca(termo);
  
    // Aguarda um curto momento para a reatividade do React filtrar a lista
    await page.waitForTimeout(1000);

    const itens = await home.obterItensViagem();
    
    // Filtra itens que contêm o texto da busca E também contenham indicativo de ser um card (ex: preço ou dias)
    const itensFiltrados = itens.filter({ hasText: termo }).filter({ hasText: 'R$' });
    
    // Aguarda explicitamente que haja pelo menos 1 item filtrado visível
    await expect(itensFiltrados.first()).toBeVisible({ timeout: 10000 });
    
    const qtdFiltrados = await itensFiltrados.count();
    
    // Valida que encontrou resultados
    expect(qtdFiltrados).toBeGreaterThan(0);

    // Valida que TODOS os itens visíveis correspondem à busca
    // (A variável 'itens' pode estar pegando elementos antigos se o DOM não limpou, 
    // mas aqui queremos garantir que o que o usuário vê é coerente)
    const textos = await home.obterTextosItensViagem();
    const termoLower = termo.toLowerCase();
    
    for (const texto of textos) {
      // Ignora textos muito curtos (provavelmente ícones como "") ou vazios
      if (texto && texto.length > 2) {
         // O texto completo do card contém várias quebras de linha.
         // Verificamos se ALGUMA parte do texto do card contém o termo buscado.
         expect(texto.toLowerCase()).toContain(termoLower);
      }
    }
  });
});
  
// ATENÇÃO: Ajuste os seletores no Page Object (HomePage.ts) para os reais do sistema.
// Exemplos de seletores:
// - Campo de busca: [data-testid="search-input"] ou input[name="search"] ou #search
// - Itens da lista: .viagem-item ou [data-testid="viagem-item"] ou li.trip-item
// Os seletores definidos atualmente são apenas exemplos e devem ser alinhados à sua implementação real.
