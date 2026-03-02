import { Page, Locator } from '@playwright/test';

/**
 * HomePage - Page Object para a página inicial do portal Vialivre.
 */
export class HomePage {
  readonly page: Page;
  private readonly acceptCookiesButton: Locator;
  private readonly debtPaymentLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.acceptCookiesButton = page.getByRole('link', { name: 'Aceitar cookies' });
    this.debtPaymentLink = page.getByRole('link').nth(5);
  }

  async navigate(): Promise<void> {
    await this.page.goto('https://paytolls.vialivre.pt/portalweb/');
  }

  async acceptCookies(): Promise<void> {
    await this.acceptCookiesButton.click();
  }

  async goToDebtPayment(): Promise<void> {
    await this.debtPaymentLink.click();
  }
}
