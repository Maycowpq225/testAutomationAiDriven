import { Page, BrowserContext } from '@playwright/test';

/**
 * Utilitários para mascarar automação e evitar detecção anti-bot.
 * Aplica várias técnicas para simular comportamento humano.
 */
export class StealthHelper {
  
  /**
   * Aplica configurações stealth ao contexto do browser.
   */
  static async setupStealthContext(context: BrowserContext): Promise<void> {
    // Adicionar scripts para mascarar webdriver
    await context.addInitScript(() => {
      // Remover propriedades que indicam automação
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Mascarar outras propriedades detectáveis
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Simular plugins do Chrome
      Object.defineProperty(navigator, 'languages', {
        get: () => ['pt-PT', 'pt', 'en-US', 'en'],
      });
      
      // Mascarar a detecção de headless
      Object.defineProperty(navigator, 'platform', {
        get: () => 'Win32',
      });
      
      // Remover traces de automação do window
      Object.defineProperty(window, 'chrome', {
        get: () => ({
          runtime: {}
        }),
      });
      
      // Mascarar permission queries
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });
  }

  /**
   * Adiciona delays humanizados entre ações.
   */
  static async humanDelay(min: number = 100, max: number = 300): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simula digitação humana com delays variáveis.
   */
  static async humanType(page: Page, selector: string, text: string): Promise<void> {
    try {
      await page.locator(selector).click();
      await this.humanDelay(200, 500);
      
      for (const char of text) {
        await page.keyboard.type(char);
        await this.humanDelay(50, 150);
      }
    } catch (error) {
      // Fallback direto se digitação char por char falhar
      await page.locator(selector).fill(text);
    }
  }

  /**
   * Simula movimento e clique humano.
   */
  static async humanClick(page: Page, selector: string): Promise<void> {
    try {
      const element = page.locator(selector);
      
      // Verificar se o elemento existe e é visível
      await element.waitFor({ state: 'visible', timeout: 5000 });
      
      const box = await element.boundingBox();
      
      if (box) {
        // Mover mouse para perto do elemento primeiro
        await page.mouse.move(box.x + box.width / 2 - 10, box.y + box.height / 2 - 10);
        await this.humanDelay(100, 200);
        
        // Mover para o elemento
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await this.humanDelay(50, 100);
      }
      
      await element.click();
      await this.humanDelay(100, 200);
    } catch (error) {
      // Se o método stealth falhar, usar clique simples
      await page.locator(selector).click();
      await this.humanDelay(100, 200);
    }
  }

  /**
   * Simula scroll humano.
   */
  static async humanScroll(page: Page, pixels: number = 300): Promise<void> {
    const scrolls = Math.ceil(pixels / 50);
    for (let i = 0; i < scrolls; i++) {
      await page.mouse.wheel(0, 50);
      await this.humanDelay(50, 100);
    }
  }

  /**
   * Aguarda carregamento da página com verificações humanizadas.
   */
  static async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded');
    await this.humanDelay(500, 1000);
    await page.waitForLoadState('networkidle');
    await this.humanDelay(300, 600);
  }

  /**
   * Configura headers mais naturais para requisições.
   */
  static async setupNaturalHeaders(page: Page): Promise<void> {
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    });
  }

  /**
   * Simula padrões humanos de preenchimento de formulário.
   */
  static async fillFormHumanLike(page: Page, selector: string, value: string): Promise<void> {
    try {
      // Clicar no campo
      await this.humanClick(page, selector);
      
      // Limpar campo primeiro
      await page.locator(selector).fill('');
      await this.humanDelay(100, 200);
      
      // Simular possível erro de digitação/correção (15% de chance)
      if (Math.random() < 0.15 && value.length > 3) {
        await this.humanType(page, selector, value.substring(0, value.length - 1) + 'x');
        await this.humanDelay(200, 400);
        await page.keyboard.press('Backspace');
        await this.humanDelay(100, 200);
        await page.keyboard.type(value.slice(-1));
      } else {
        await this.humanType(page, selector, value);
      }
      
      await this.humanDelay(200, 500);
    } catch (error) {
      // Fallback: preenchimento simples se stealth falhar
      await page.locator(selector).fill(value);
      await this.humanDelay(200, 400);
    }
  }

  /**
   * Simula hesitação antes de ações importantes.
   */
  static async simulateHesitation(): Promise<void> {
    await this.humanDelay(800, 1500);
  }
}