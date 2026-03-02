import { Page, Locator, expect } from '@playwright/test';

/**
 * DebtPaymentPage - Page Object para a página de Pagamento de Dívida Total.
 * Responsável por preencher e submeter o formulário de pesquisa de dívida.
 */
export class DebtPaymentPage {
  readonly page: Page;
  readonly pesquisarButton: Locator;
  readonly voltarButton: Locator;
  readonly confirmationMessage: Locator;
  readonly spamWarning: Locator;
  readonly confirmationCloseIcon: Locator;

  // --- Locators: Campos do formulário ---
  private readonly matriculaInput: Locator;
  private readonly startDateInput: Locator;
  private readonly endDateInput: Locator;
  private readonly nomeInput: Locator;
  private readonly apelidosInput: Locator;
  private readonly nifInput: Locator;
  private readonly emailInput: Locator;
  private readonly moradaInput: Locator;
  private readonly codigoPostalInput: Locator;
  private readonly localidadeInput: Locator;
  private readonly countrySelect: Locator;
  private readonly privacyCheckbox: Locator;
  private readonly conditionsCheckbox: Locator;
  private readonly externalSearchCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;

    // Campos de texto
    this.matriculaInput = page.locator('#debtPlate');
    this.startDateInput = page.locator('#startDate');
    this.endDateInput = page.locator('#endDate');
    this.nomeInput = page.locator('#nameDebt');
    this.apelidosInput = page.locator('#surnameDebt');
    this.nifInput = page.locator('#nifDebt');
    this.emailInput = page.locator('#emailDebt');
    this.moradaInput = page.locator('#addressDebt');
    this.codigoPostalInput = page.locator('#zipDebt');
    this.localidadeInput = page.locator('#townDebt');
    this.countrySelect = page.locator('select[name="country"]');

    // Checkboxes
    this.privacyCheckbox = page.locator('#privacyDebt');
    this.conditionsCheckbox = page.locator('#conditionsDebt');
    this.externalSearchCheckbox = page.locator('#extenalSearchDebt');

    // Botões
    this.pesquisarButton = page.locator('#searchDebtBtn');
    this.voltarButton = page.getByRole('button', { name: 'VOLTAR', exact: true });

    // Tela de confirmação
    this.confirmationMessage = page.getByText('Por favor, verifique a sua');
    this.spamWarning = page.getByText('Caso não encontre o email na');
    this.confirmationCloseIcon = page.getByRole('tabpanel', { name: 'Pesquisa' }).getByRole('img');
  }

  // =============================================
  //  ACTIONS - Métodos de ação do formulário
  // =============================================

  /**
   * Preenche todo o formulário de uma vez usando os dados de teste.
   */
  async fillForm(testData: any): Promise<void> {
    await this.matriculaInput.fill(testData.matricula);
    await this.startDateInput.fill(testData.startDate);
    await this.endDateInput.fill(testData.endDate);
    await this.nomeInput.fill(testData.nome);
    await this.apelidosInput.fill(testData.apelido);
    await this.nifInput.fill(testData.nif);
    await this.emailInput.fill(testData.email);
    await this.moradaInput.fill(testData.morada);
    await this.codigoPostalInput.fill(testData.codigoPostal);
    await this.localidadeInput.fill(testData.localidade);
    await this.countrySelect.selectOption({ label: testData.pais });
  }

  /**
   * Marca todos os três checkboxes de termos de uma vez.
   */
  async acceptAllTerms(): Promise<void> {
    await this.privacyCheckbox.check();
    await this.conditionsCheckbox.check();
    await this.externalSearchCheckbox.check();
  }

  /**
   * Clica no botão PESQUISAR para submeter o formulário.
   */
  async clickPesquisar(): Promise<void> {
    await this.pesquisarButton.click();
  }

  /**
   * Clica no botão VOLTAR na tela de confirmação.
   */
  async clickVoltar(): Promise<void> {
    await this.voltarButton.click();
  }

  /**
   * Fecha o painel de confirmação clicando no ícone de fechar.
   */
  async closeConfirmation(): Promise<void> {
    await this.confirmationCloseIcon.click();
  }

  /**
   * Verifica se a mensagem de confirmação de email é exibida.
   */
  async expectEmailConfirmation(email: string): Promise<void> {
    await expect(this.confirmationMessage).toBeVisible();
    await expect(this.page.getByText(email)).toBeVisible();
    await expect(this.spamWarning).toBeVisible();
    await expect(this.voltarButton).toBeVisible();
  }
}
