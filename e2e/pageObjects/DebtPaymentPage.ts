import { Page, Locator, expect } from '@playwright/test';

/**
 * DebtPaymentPage - Page Object para a página de Pagamento de Dívida Total.
 *
 * Responsável por:
 * - Todos os elementos do formulário de pesquisa de dívida
 * - Preenchimento de campos (matrícula, datas, dados pessoais)
 * - Seleção de país e aceite de termos
 * - Submissão do formulário
 * - Tela de confirmação de envio de email
 */
export class DebtPaymentPage {
  readonly page: Page;

  // --- Locators: Campos do formulário ---
  readonly matriculaInput: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly nomeInput: Locator;
  readonly apelidosInput: Locator;
  readonly nifInput: Locator;
  readonly emailInput: Locator;
  readonly moradaInput: Locator;
  readonly codigoPostalInput: Locator;
  readonly localidadeInput: Locator;
  readonly countrySelect: Locator;

  // --- Locators: Checkboxes de termos ---
  readonly privacyCheckbox: Locator;
  readonly conditionsCheckbox: Locator;
  readonly externalSearchCheckbox: Locator;

  // --- Locators: Botões ---
  readonly pesquisarButton: Locator;
  readonly voltarButton: Locator;

  // --- Locators: Tela de confirmação ---
  readonly confirmationMessage: Locator;
  readonly spamWarning: Locator;
  readonly confirmationCloseIcon: Locator;

  constructor(page: Page) {
    this.page = page;

    // Campos de texto do formulário usando IDs específicos
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
   * Preenche o campo de matrícula com o valor informado.
   * Clica no campo, digita e garante o formato correto.
   */
  async fillMatricula(value: string): Promise<void> {
    await this.matriculaInput.click();
    await this.matriculaInput.fill(value);
  }

  /**
   * Preenche o campo "Data / hora de início".
   * @param date - Formato esperado: 'DD/MM/YYYY HH:mm:ss'
   */
  async fillStartDate(date: string): Promise<void> {
    await this.startDateInput.click();
    await this.startDateInput.fill(date);
  }

  /**
   * Preenche o campo "Data / hora de fim".
   * @param date - Formato esperado: 'DD/MM/YYYY HH:mm:ss'
   */
  async fillEndDate(date: string): Promise<void> {
    await this.endDateInput.click();
    await this.endDateInput.fill(date);
  }

  /**
   * Preenche o campo "Nome".
   */
  async fillNome(nome: string): Promise<void> {
    await this.nomeInput.fill(nome);
  }

  /**
   * Preenche o campo "Apelidos" (sobrenome).
   */
  async fillApelidos(apelidos: string): Promise<void> {
    await this.apelidosInput.fill(apelidos);
  }

  /**
   * Preenche o campo "NIF" (Número de Identificação Fiscal).
   */
  async fillNif(nif: string): Promise<void> {
    await this.nifInput.fill(nif);
  }

  /**
   * Preenche o campo "Email".
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Preenche o campo "Morada" (endereço).
   */
  async fillMorada(morada: string): Promise<void> {
    await this.moradaInput.fill(morada);
  }

  /**
   * Preenche o campo "Código Postal".
   */
  async fillCodigoPostal(codigo: string): Promise<void> {
    await this.codigoPostalInput.fill(codigo);
  }

  /**
   * Preenche o campo "Localidade" (cidade).
   */
  async fillLocalidade(localidade: string): Promise<void> {
    await this.localidadeInput.fill(localidade);
  }

  /**
   * Seleciona o país no dropdown.
   * @param country - Label do país (ex: 'Portugal')
   */
  async selectCountry(country: string): Promise<void> {
    await this.countrySelect.selectOption({ label: country });
  }

  /**
   * Marca o checkbox de Política de Privacidade.
   */
  async checkPrivacyPolicy(): Promise<void> {
    await this.privacyCheckbox.check();
  }

  /**
   * Marca o checkbox de Condições (Declaro, na qualidade de titular dos dados).
   */
  async checkConditions(): Promise<void> {
    await this.conditionsCheckbox.check();
  }

  /**
   * Marca o checkbox de Autorização de pesquisa externa (Autorizo que a Vialivre...).
   */
  async checkExternalSearch(): Promise<void> {
    await this.externalSearchCheckbox.check();
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
   * Preenche todo o formulário de uma vez usando os dados de teste.
   * @param testData - Objeto com todos os dados necessários para preencher o formulário
   */
  async fillForm(testData: any): Promise<void> {
    // Preencher campos básicos
    await this.matriculaInput.fill(testData.matricula);
    await this.startDateInput.fill(testData.startDate);
    await this.endDateInput.fill(testData.endDate);
    
    // Preencher dados pessoais
    await this.nomeInput.fill(testData.nome);
    await this.apelidosInput.fill(testData.apelido);
    await this.nifInput.fill(testData.nif);
    await this.emailInput.fill(testData.email);
    
    // Preencher endereço
    await this.moradaInput.fill(testData.morada);
    await this.codigoPostalInput.fill(testData.codigoPostal);
    await this.localidadeInput.fill(testData.localidade);
    
    // Selecionar país
    await this.countrySelect.selectOption({ label: testData.pais });
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

  // =============================================
  //  COMPOSITES - Métodos compostos (atalhos)
  // =============================================

  /**
   * Preenche o intervalo de datas (início e fim).
   */
  async fillDateRange(startDate: string, endDate: string): Promise<void> {
    await this.fillStartDate(startDate);
    await this.fillEndDate(endDate);
  }

  /**
   * Preenche todos os dados pessoais do formulário de uma vez.
   */
  async fillPersonalInfo(data: {
    nome: string;
    apelidos: string;
    nif: string;
    email: string;
    morada: string;
    codigoPostal: string;
    localidade: string;
  }): Promise<void> {
    await this.fillNome(data.nome);
    await this.fillApelidos(data.apelidos);
    await this.fillNif(data.nif);
    await this.fillEmail(data.email);
    await this.fillMorada(data.morada);
    await this.fillCodigoPostal(data.codigoPostal);
    await this.fillLocalidade(data.localidade);
  }

  // =============================================
  //  ASSERTIONS - Métodos de verificação
  // =============================================

  /**
   * Verifica se o formulário de pesquisa de dívida está visível.
   */
  async expectFormVisible(): Promise<void> {
    await expect(this.pesquisarButton).toBeVisible();
  }

  /**
   * Verifica se o botão PESQUISAR está habilitado.
   */
  async expectPesquisarEnabled(): Promise<void> {
    await expect(this.pesquisarButton).toBeEnabled();
  }

  /**
   * Verifica se o botão PESQUISAR está desabilitado.
   */
  async expectPesquisarDisabled(): Promise<void> {
    await expect(this.pesquisarButton).toBeDisabled();
  }

  /**
   * Verifica se o sistema detectou acesso automatizado.
   */
  async isAutomationDetected(): Promise<boolean> {
    try {
      return await this.page.getByText('Detectou-se um acesso automatizado').isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Verifica se a mensagem de confirmação de email é exibida.
   * @param email - O email esperado na mensagem de confirmação.
   */
  async expectEmailConfirmation(email: string): Promise<void> {
    await expect(this.confirmationMessage).toBeVisible();
    await expect(this.page.getByText(email)).toBeVisible();
    await expect(this.spamWarning).toBeVisible();
    await expect(this.voltarButton).toBeVisible();
  }
}
