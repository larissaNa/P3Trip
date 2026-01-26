import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Diretório dos testes E2E
  testDir: '__test__/e2e',
  // Relatórios simples no terminal
  reporter: [['list']],
  // Configurações padrão para os testes
  use: {
    // Ajuste a URL da sua aplicação web
    baseURL: 'http://localhost:8081',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Exemplo: rodar só em Chromium por enquanto
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});

