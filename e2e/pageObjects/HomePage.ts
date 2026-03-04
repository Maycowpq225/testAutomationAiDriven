import { Page } from '@playwright/test';

/**
 * Page Object para a página inicial do PAYTOLLS.
 * Gerencia navegação inicial e acesso às diferentes seções do sistema.
 */
export class HomePage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navega para a página inicial do PAYTOLLS.
   */
  async navigate(): Promise<void> {
    await this.page.goto('https://paytolls.vialivre.pt/portalweb/');
  }

  /**
   * Aceita o banner de cookies conforme requerido pelo sistema.
   */
  async acceptCookies(): Promise<void> {
    await this.page.getByRole('link', { name: /Aceitar\s*cookies/i }).click();
  }

  /**
   * Navega para a seção de pagamento de dívida total.
   */
  async goToDebtPayment(): Promise<void> {
    await this.page.locator('a[href="gotodebt.htm"]').first().click();
  }
}