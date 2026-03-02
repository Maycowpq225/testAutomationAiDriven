import { test, expect } from '../../hooks';
import { HomePage } from '../pageObjects/HomePage';
import { DebtPaymentPage } from '../pageObjects/DebtPaymentPage';
import { TestDataGenerator, TestData } from '../../utils/TestDataGenerator';

test('Pesquisa de dívida com dados válidos', async ({ page }) => {
  const homePage = new HomePage(page);
  const debtPaymentPage = new DebtPaymentPage(page);
  const dataGenerator = new TestDataGenerator();

  // Given
  const testData: TestData = await dataGenerator.generateTestData();
  await homePage.navigate();
  await expect(page).toHaveURL(/portalweb/);
  await homePage.acceptCookies();

  //When
  await homePage.goToDebtPayment();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  await debtPaymentPage.fillForm(testData);
  await debtPaymentPage.acceptAllTerms();
  await debtPaymentPage.clickPesquisar();

  //Then
  await debtPaymentPage.expectEmailConfirmation(testData.email);
});

