import { test, expect } from '../../hooks';
import { HomePage } from '../pageObjects/HomePage';
import { DebtPaymentPage } from '../pageObjects/DebtPaymentPage';
import { TestDataGenerator, TestData } from '../../utils/TestDataGenerator';

test.describe('Pagamento de dívida total', () => {

  test('Pesquisa de dívida com dados válidos', async ({ page }) => {
    const homePage = new HomePage(page);
    const debtPaymentPage = new DebtPaymentPage(page);
    const dataGenerator = new TestDataGenerator();

    // Gerar dados de teste dinâmicos
    const testData: TestData = await dataGenerator.generateTestData();

    // Step 1: Navegar para a página inicial
    await homePage.navigate();
    await expect(page).toHaveURL(/portalweb/);

    // Step 2: Aceitar cookies
    await homePage.acceptCookies();

    // Step 3: Clicar na opção 'Pagamento de dívida total'
    await homePage.goToDebtPayment();

    // Aguardar carregamento completo da página
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Step 4-13: Preencher todo o formulário
    await debtPaymentPage.fillForm(testData);

    // Step 14-16: Aceitar todos os termos
    await debtPaymentPage.acceptAllTerms();

    // Step 17: Clicar no botão 'PESQUISAR'
    await debtPaymentPage.clickPesquisar();

    await debtPaymentPage.expectEmailConfirmation(testData.email);
    await debtPaymentPage.closeConfirmation();
    await debtPaymentPage.clickVoltar();
  });
});
