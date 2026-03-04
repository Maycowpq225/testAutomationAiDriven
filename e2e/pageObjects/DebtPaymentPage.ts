import { Page, expect } from '@playwright/test';
import { TestData } from '../../utils/TestDataGenerator';

/**
 * Page Object para a página de pagamento de dívida total.
 * Gerencia o preenchimento do formulário de pesquisa e validações.
 */
export class DebtPaymentPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // --- Form Fields ---
  private matriculaField() { return this.page.getByPlaceholder(''); }
  private startDateField() { return this.page.getByRole('textbox', { name: 'Data / hora de início' }); }
  private endDateField() { return this.page.getByRole('textbox', { name: 'Data / hora de fim' }); }
  private nomeField() { return this.page.getByPlaceholder(''); }
  private apelidosField() { return this.page.getByPlaceholder(''); }
  private nifField() { return this.page.getByPlaceholder(''); }
  private emailField() { return this.page.getByPlaceholder(''); }
  private moradaField() { return this.page.getByPlaceholder(''); }
  private codigoPostalField() { return this.page.getByPlaceholder(''); }
  private localidadeField() { return this.page.getByPlaceholder(''); }
  private countryDropdown() { return this.page.locator('select[name="country"]'); }

  // --- Checkboxes ---
  private privacyCheckbox() { return this.page.locator('#privacyDebt'); }
  private conditionsCheckbox() { return this.page.locator('#conditionsDebt'); }
  private authorizationCheckbox() { return this.page.locator('#extenalSearchDebt'); }

  // --- Buttons ---
  private cancelButton() { return this.page.getByRole('button', { name: 'CANCELAR' }); }
  private searchButton() { return this.page.getByRole('button', { name: 'PESQUISAR' }); }
  private backButton() { return this.page.getByRole('button', { name: 'VOLTAR' }); }

  // --- Confirmation Elements ---
  private successMessage() { return this.page.getByText('Por favor, verifique a sua caixa de correio eletrónico'); }
  private automatedAccessMessage() { return this.page.getByText('Detectou-se um acesso automatizado'); }

  /**
   * Preenche todos os campos do formulário com os dados fornecidos.
   * @param testData - Dados de teste para preenchimento do formulário
   */
  async fillForm(testData: TestData): Promise<void> {
    // Preencher campos de matrícula e datas
    await this.matriculaField().fill(testData.matricula);
    await this.startDateField().fill(testData.startDate);
    await this.endDateField().fill(testData.endDate);

    // Preencher dados pessoais
    await this.nomeField().fill(testData.nome);
    await this.apelidosField().fill(testData.apelido);
    await this.nifField().fill(testData.nif);
    await this.emailField().fill(testData.email);
    await this.moradaField().fill(testData.morada);
    await this.codigoPostalField().fill(testData.codigoPostal);
    await this.localidadeField().fill(testData.localidade);

    // Selecionar país
    await this.countryDropdown().selectOption([testData.pais]);
  }

  /**
   * Preenche apenas um campo específico do formulário.
   * Útil para testes de validação de campos individuais.
   */
  async fillField(fieldName: string, value: string): Promise<void> {
    switch (fieldName.toLowerCase()) {
      case 'matrícula':
      case 'matricula':
        await this.matriculaField().fill(value);
        break;
      case 'data / hora de início':
      case 'data inicio':
        await this.startDateField().fill(value);
        break;
      case 'data / hora de fim':
      case 'data fim':
        await this.endDateField().fill(value);
        break;
      case 'nome':
        await this.nomeField().fill(value);
        break;
      case 'apelidos':
        await this.apelidosField().fill(value);
        break;
      case 'nif':
        await this.nifField().fill(value);
        break;
      case 'email':
        await this.emailField().fill(value);
        break;
      case 'morada':
        await this.moradaField().fill(value);
        break;
      case 'código postal':
      case 'codigo postal':
        await this.codigoPostalField().fill(value);
        break;
      case 'localidade':
        await this.localidadeField().fill(value);
        break;
      default:
        throw new Error(`Campo não reconhecido: ${fieldName}`);
    }
  }

  /**
   * Seleciona um país no dropdown.
   */
  async selectCountry(country: string): Promise<void> {
    await this.countryDropdown().selectOption([country]);
  }

  /**
   * Marca todas as checkboxes obrigatórias do formulário.
   */
  async acceptAllTerms(): Promise<void> {
    await this.privacyCheckbox().click();
    await this.conditionsCheckbox().click();
    await this.authorizationCheckbox().click();
  }

  /**
   * Marca uma checkbox específica.
   */
  async markCheckbox(checkboxName: string): Promise<void> {
    switch (checkboxName.toLowerCase()) {
      case 'política de privacidade':
      case 'privacidade':
        await this.privacyCheckbox().click();
        break;
      case 'declaro, na qualidade de titular dos dados':
      case 'titular':
        await this.conditionsCheckbox().click();
        break;
      case 'autorizo que a vialivre':
      case 'autorizacao':
        await this.authorizationCheckbox().click();
        break;
      default:
        throw new Error(`Checkbox não reconhecida: ${checkboxName}`);
    }
  }

  /**
   * Clica no botão PESQUISAR para submeter o formulário.
   */
  async clickPesquisar(): Promise<void> {
    await this.searchButton().click();
  }

  /**
   * Clica no botão CANCELAR.
   */
  async clickCancel(): Promise<void> {
    await this.cancelButton().click();
  }

  /**
   * Clica no botão VOLTAR.
   */
  async clickBack(): Promise<void> {
    await this.backButton().click();
  }

  /**
   * Verifica se o botão PESQUISAR está habilitado.
   */
  async isSearchButtonEnabled(): Promise<boolean> {
    return await this.searchButton().isEnabled();
  }

  /**
   * Verifica se o botão PESQUISAR está desabilitado.
   */
  async expectSearchButtonDisabled(): Promise<void> {
    await expect(this.searchButton()).toBeDisabled();
  }

  /**
   * Verifica se o botão PESQUISAR está habilitado.
   */
  async expectSearchButtonEnabled(): Promise<void> {
    await expect(this.searchButton()).toBeEnabled();
  }

  /**
   * Verifica se a mensagem de sucesso é exibida com o email correto.
   */
  async expectEmailConfirmation(email: string): Promise<void> {
    const expectedMessage = `Por favor, verifique a sua caixa de correio eletrónico. Enviamos um e-mail para: ${email}`;
    await expect(this.page.getByText(expectedMessage)).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verifica se a orientação sobre caixa de spam é exibida.
   */
  async expectSpamGuidance(): Promise<void> {
    await expect(this.page.getByText('caixa de spam', { exact: false })).toBeVisible();
  }

  /**
   * Verifica se o botão VOLTAR está visível na tela de confirmação.
   */
  async expectBackButtonVisible(): Promise<void> {
    await expect(this.backButton()).toBeVisible();
  }

  /**
   * Verifica se uma mensagem de erro de validação é exibida.
   */
  async expectValidationError(): Promise<void> {
    await expect(this.page.getByText('erro', { exact: false })).toBeVisible();
  }

  /**
   * Verifica se o acesso automatizado foi detectado (comum em testes).
   */
  async expectAutomatedAccessDetected(): Promise<void> {
    await expect(this.automatedAccessMessage()).toBeVisible();
  }

  /**
   * Verifica se os 4 passos do processo são exibidos corretamente.
   */
  async expectWizardSteps(): Promise<void> {
    await expect(this.page.getByRole('tab', { name: /1\s+Pesquisa/i })).toBeVisible();
    await expect(this.page.getByRole('tab', { name: /2\s+Selecionar/i })).toBeVisible();
    await expect(this.page.getByRole('tab', { name: /3\s+Pagar/i })).toBeVisible();
    await expect(this.page.getByRole('tab', { name: /4\s+Confirmação/i })).toBeVisible();
  }

  async getFieldValue(fieldName: string): Promise<string> {
    switch (fieldName.toLowerCase()) {
      case 'matrícula':
      case 'matricula':
        return this.matriculaField().inputValue();
      case 'nome':
        return this.nomeField().inputValue();
      case 'apelidos':
        return this.apelidosField().inputValue();
      case 'morada':
        return this.moradaField().inputValue();
      case 'código postal':
      case 'codigo postal':
        return this.codigoPostalField().inputValue();
      default:
        throw new Error(`Campo não reconhecido para leitura: ${fieldName}`);
    }
  }
}