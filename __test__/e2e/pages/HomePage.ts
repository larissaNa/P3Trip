import { Page, Locator } from '@playwright/test';

export class HomePage {
  private page: Page;
  private searchSelectors = [
    '[placeholder="Ex: Praia, Serviços..."]',
    'input[type="text"]',
  ];
  private tripItemSelectors = [
    // Em React Native Web, TouchableOpacity vira div[role="button"] ou div com tabIndex
    // Simplificando para pegar qualquer elemento que tenha "dias" (texto comum nos cards) e pareça um card
    'div[role="button"]', 
    'div[tabindex="0"]',
  ];

  constructor(page: Page) {
    this.page = page;
  }

  // Ajuste a navegação conforme sua configuração:
  // - Se usar baseURL no Playwright config, `page.goto('/')` é suficiente.
  // - Caso contrário, forneça a URL completa, por exemplo: 'http://localhost:3000/'.
  async acessarPaginaInicial(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    // Espera pelo título da aplicação para garantir carregamento
    try {
      await this.page.getByText('D&E Turismo').waitFor({ timeout: 10000 });
    } catch {
      // Ignora se não achar, o esperarPronto fará o resto
    }
    await this.esperarPronto();
  }

  async preencherBusca(termo: string): Promise<void> {
    const input = await this.resolverCampoBusca();
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.fill(termo);
    // Opcional: aciona busca por Enter caso a UI utilize submissão
    try {
      await input.press('Enter');
    } catch {}
  }

  async obterItensViagem(): Promise<Locator> {
    return await this.resolverItensViagem();
  }

  async obterTextosItensViagem(): Promise<string[]> {
    const items = await this.resolverItensViagem();
    const count = await items.count();
    const textos: string[] = [];
    for (let i = 0; i < count; i++) {
      textos.push((await items.nth(i).innerText()).trim());
    }
    return textos;
  }

  /**
   * Clica no primeiro item de viagem encontrado na lista
   */
  async clicarEmPrimeiraViagem(): Promise<void> {
    const items = await this.resolverItensViagem();
    
    // Tenta encontrar um card real filtrando por texto comum (ex: "R$")
    // Isso evita clicar em botões da navbar se o seletor for genérico
    const cards = items.filter({ hasText: 'R$' });
    
    if (await cards.count() > 0) {
      await cards.first().click();
    } else {
      // Fallback: clica no primeiro item genérico encontrado
      const count = await items.count();
      if (count === 0) {
        throw new Error('Nenhuma viagem encontrada para clicar.');
      }
      await items.first().click();
    }
  }

  private async resolverCampoBusca(): Promise<Locator> {
    for (const sel of this.searchSelectors) {
      const loc = this.page.locator(sel).first();
      if (await loc.count()) {
        try {
          await loc.waitFor({ state: 'visible', timeout: 5000 });
          return loc;
        } catch {
          // tenta próximo seletor
        }
      }
    }
    throw new Error('Campo de busca não encontrado. Ajuste os seletores no Page Object.');
  }

  private async resolverItensViagem(): Promise<Locator> {
    for (const sel of this.tripItemSelectors) {
      const loc = this.page.locator(sel);
      if (await loc.count()) {
        return loc;
      }
    }
    // Se não houver itens no primeiro carregamento, ainda retornamos o primeiro seletor para permitir filtros posteriores
    return this.page.locator(this.tripItemSelectors[0]);
  }

  private async esperarPronto(): Promise<void> {
    for (const sel of [...this.searchSelectors, ...this.tripItemSelectors]) {
      try {
        await this.page.locator(sel).first().waitFor({ state: 'visible', timeout: 3000 });
        return;
      } catch {
        // tenta próximo seletor
      }
    }
    // como fallback, espera um curto período
    await this.page.waitForTimeout(500);
  }
}

