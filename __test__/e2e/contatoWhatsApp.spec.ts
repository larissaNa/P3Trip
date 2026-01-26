import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { TravelDetailsPage } from './pages/TravelDetailsPage';

test.describe('Fluxo de Contato via WhatsApp', () => {
  test('deve acessar detalhes de uma viagem e clicar no botão de contato', async ({ page }) => {
    const home = new HomePage(page);
    const details = new TravelDetailsPage(page);

    // 1. Acessar a página inicial
    await home.acessarPaginaInicial();

    // 2. Garantir que existem viagens listadas
    // Aguarda um pouco para garantir que a lista carregou (o HomePage já tem esperas implícitas, mas é bom ser explícito no fluxo)
    const itens = await home.obterItensViagem();
    
    // Filtra para garantir que estamos aguardando um Card de Viagem (tem preço "R$") e não um botão da navbar
    const cardViagem = itens.filter({ hasText: 'R$' }).first();
    
    // Aumenta o timeout para 15s pois o carregamento inicial pode ser lento (cold start ou fetch)
    await expect(cardViagem).toBeVisible({ timeout: 15000 });

    // 3. Clicar na primeira viagem da lista para abrir os detalhes
    await home.clicarEmPrimeiraViagem();

    // 4. Aguardar o carregamento da tela de detalhes
    await details.esperarCarregar();

    // 5. Verificar se o botão de WhatsApp está visível
    const botaoVisivel = await details.verificarBotaoWhatsAppVisivel();
    expect(botaoVisivel).toBe(true);

    // 6. Clicar no botão de WhatsApp
    // O método do Page Object já tenta capturar a nova página (aba) se ela abrir.
    const newPage = await details.clicarBotaoWhatsApp();

    if (newPage) {
      // Cenário 1: Nova aba foi aberta (comportamento padrão web desktop)
      try {
        // Tenta aguardar o carregamento, mas não falha se demorar (sites externos podem ser lentos/bloqueados em CI)
        await newPage.waitForLoadState('domcontentloaded', { timeout: 10000 });
      } catch (e) {
        console.log('Aviso: Timeout aguardando carga da página do WhatsApp. Verificando URL mesmo assim.');
      }
      
      const url = newPage.url();
      
      // Valida se a URL redirecionada pertence ao domínio do WhatsApp
      expect(url).toMatch(/wa\.me|api\.whatsapp\.com/);
      await newPage.close();
    } else {
      // Cenário 2: Nenhuma nova aba detectada (ex: bloqueador de popup ou execução headless rápida)
      // Neste caso, validamos a intenção através do atributo href do botão.
      // Isso garante que o teste passe se a estrutura estiver correta, mesmo sem o efeito colateral da aba.
      const href = await details.obterLinkWhatsApp();

      expect(href).toBeTruthy();
      expect(href).toMatch(/wa\.me|api\.whatsapp\.com/);
    }
  });
});
