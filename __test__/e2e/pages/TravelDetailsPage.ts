import { Page, Locator, expect } from '@playwright/test';

export class TravelDetailsPage {
  private page: Page;
  
  // Seletores baseados no texto visível ou estrutura
  private selectors = {
    // Título da página ou elemento único que confirma que estamos nos detalhes
    headerTitle: 'text=Sobre a viagem', 
    // Botão de WhatsApp
    whatsappButton: 'text=Entrar em contato',
    // Preço (para validação extra)
    price: 'text=R$',
  };

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Aguarda que a tela de detalhes esteja carregada e visível
   */
  async esperarCarregar(): Promise<void> {
    // Espera pelo texto "Sobre a viagem" que é estático na tela de detalhes
    await this.page.locator(this.selectors.headerTitle).waitFor({ state: 'visible', timeout: 10000 });
  }


  /**
   * Clica no botão de WhatsApp e aguarda a ação
   * Retorna uma promessa que resolve para a nova página (popup) se houver, ou null.
   */
  async clicarBotaoWhatsApp(): Promise<Page | null> {
    const button = this.page.locator(this.selectors.whatsappButton);
    await button.waitFor({ state: 'visible' });

    // Em testes web, clicar em um link externo geralmente abre uma nova aba (page)
    // O Playwright permite capturar esse evento.
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null), // Timeout reduzido para evitar espera longa
      button.click(),
    ]);

    return newPage;
  }

  /**
   * Verifica se o botão de WhatsApp está visível
   */
  async verificarBotaoWhatsAppVisivel(): Promise<boolean> {
    const button = this.page.locator(this.selectors.whatsappButton);
    return await button.isVisible();
  }

  /**
   * Obtém o valor do atributo href do botão de WhatsApp
   */
  async obterLinkWhatsApp(): Promise<string | null> {
    const button = this.page.locator(this.selectors.whatsappButton);
    return await button.getAttribute('href');
  }
}
