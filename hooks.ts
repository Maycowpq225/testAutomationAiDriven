import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Usar a página normalmente
    await use(page);
    
    // Teardown: fechar a página após cada teste
    if (page) {
      await page.close();
    }
  },

  browser: async ({ browser }, use) => {
    // Usar o browser normalmente
    await use(browser);
    
    // Teardown: fechar o browser após cada teste
    if (browser) {
      await browser.close();
    }
  },
});

export { expect } from '@playwright/test';
