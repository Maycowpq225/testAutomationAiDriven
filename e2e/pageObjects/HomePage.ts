import { Page, Locator } from '@playwright/test';

/**
 * HomePage - Page Object para a página inicial do portal Vialivre.
 *
 * Responsável por:
 * - Navegação para a URL base
 * - Aceitar cookies
 * - Navegar para as funcionalidades do portal
 */
export class HomePage {
  readonly page: Page;

  // --- Locators ---
  readonly acceptCookiesButton: Locator;
  readonly debtPaymentLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.acceptCookiesButton = page.getByRole('link', { name: 'Aceitar cookies' });
    this.debtPaymentLink = page.getByRole('link').nth(5);
  }

  // --- Actions ---

  /**
   * Navega para a página inicial do portal.
   */
  async navigate(): Promise<void> {
    await this.page.goto('https://paytolls.vialivre.pt/portalweb/');
  }

  /**
   * Aceita o banner de cookies.
   */
  async acceptCookies(): Promise<void> {
    await this.acceptCookiesButton.click();
  }

  /**
   * Navega para a funcionalidade "Pagamento de dívida total".
   */
  async goToDebtPayment(): Promise<void> {
    await this.debtPaymentLink.click();
  }
}
