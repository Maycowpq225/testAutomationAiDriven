// spec: specs/login-test-plan.md

import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://paytolls.vialivre.pt/portalweb/');
  await page.getByRole('link', { name: '    Aceitar cookies' }).click();
  await page.getByRole('link').nth(5).click();
  await page.getByPlaceholder('').click();
  await page.getByPlaceholder('').fill('7295');
  await page.getByPlaceholder('').press('CapsLock');
  await page.getByPlaceholder('').fill('7295UE');
  await page.getByRole('textbox', { name: 'Data / hora de início' }).click();
  await page.getByRole('textbox', { name: 'Data / hora de início' }).fill('27/01/2026 00:00:00');
  await page.getByRole('textbox', { name: 'Data / hora de fim' }).click();
  await page.getByRole('textbox', { name: 'Data / hora de fim Campo' }).fill('27/02/2026 00:00:00');
  await page.getByPlaceholder('').fill('João');
  await page.getByPlaceholder('').fill('Oliveira');
  await page.getByPlaceholder('').fill('334742633');
  await page.getByPlaceholder('').fill('teste@gmail.com');
  await page.getByPlaceholder('').fill('rua professor 1');
  await page.getByPlaceholder('').fill('2820-273');
  await page.getByPlaceholder('').fill('lisboa');
  await page.locator('select[name="country"]').selectOption({ label: 'Portugal' });
  await page.locator('#privacyDebt').check();
  await page.locator('#conditionsDebt').check();
  await page.locator('#extenalSearchDebt').check();
  await page.getByRole('button', { name: 'PESQUISAR' }).click();
  await page.getByText('Por favor, verifique a sua').click();
  await page.getByText('teste@gmail.com').click();
  await page.getByText('Caso não encontre o email na').click();
  await page.getByRole('tabpanel', { name: 'Pesquisa' }).getByRole('img').click();
  await page.getByRole('button', { name: 'VOLTAR', exact: true }).click();
});