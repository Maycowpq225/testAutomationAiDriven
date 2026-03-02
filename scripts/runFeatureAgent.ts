import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

type GeneratedFile = {
  path: string;
  content: string;
};

type AgentResponse = {
  summary?: string;
  files: GeneratedFile[];
};

const GITHUB_MODELS_URL = 'https://models.github.ai/inference/chat/completions';
const MODEL = 'openai/gpt-4.1';

async function main(): Promise<void> {
  const featureArgument = process.argv[2];

  if (!featureArgument) {
    console.error('❌ Uso: npm run command -- "<arquivo.feature|nome-da-feature>"');
    process.exit(1);
  }

  const projectRoot = path.resolve(__dirname, '..');
  const featurePath = resolveFeaturePath(projectRoot, featureArgument);
  const agentPath = path.join(projectRoot, '.github', 'agents', 'playwright-test-expert.md');

  if (!fs.existsSync(featurePath)) {
    console.error(`❌ Feature não encontrada: ${path.relative(projectRoot, featurePath)}`);
    process.exit(1);
  }

  if (!fs.existsSync(agentPath)) {
    console.error('❌ Agente não encontrado em .github/agents/playwright-test-expert.md');
    process.exit(1);
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('❌ GITHUB_TOKEN não encontrado no .env');
    process.exit(1);
  }

  const featureContent = fs.readFileSync(featurePath, 'utf-8');
  const agentDefinition = fs.readFileSync(agentPath, 'utf-8');
  const compactFeature = compactFeatureContent(featureContent);
  const compactAgentDefinition = compactAgentDefinitionForPrompt(agentDefinition);

  console.log(`\n🤖 Executando agente para: ${path.basename(featurePath)}`);

  const agentOutput = await runAgent(compactAgentDefinition, compactFeature, githubToken);
  const writtenFiles = writeGeneratedFiles(projectRoot, agentOutput.files);
  ensureLegacyCompatibility(projectRoot, writtenFiles);

  const reportPath = saveRunReport(projectRoot, featurePath, agentOutput, writtenFiles);

  console.log('✅ Fluxo concluído com sucesso.');
  if (agentOutput.summary) {
    console.log(`📌 Resumo: ${agentOutput.summary}`);
  }
  console.log(`🧾 Relatório: ${path.relative(projectRoot, reportPath)}`);
  console.log('📁 Arquivos gerados/atualizados:');
  for (const file of writtenFiles) {
    console.log(`   - ${path.relative(projectRoot, file)}`);
  }
}

function resolveFeaturePath(projectRoot: string, input: string): string {
  const normalized = input.endsWith('.feature') ? input : `${input}.feature`;
  if (path.isAbsolute(normalized)) {
    return normalized;
  }
  return path.join(projectRoot, 'e2e', 'ai-bdd-generated', normalized);
}

async function runAgent(
  agentDefinition: string,
  featureContent: string,
  githubToken: string
): Promise<AgentResponse> {
  const systemPrompt = [
    'Você está executando automaticamente o agente abaixo.',
    'Siga as regras do agente para gerar os cenários de teste em Playwright.',
    'Responda SOMENTE em JSON válido com o formato: {"summary":"...","files":[{"path":"e2e/features/nome.spec.ts","content":"..."},{"path":"e2e/pageObjects/Nome.ts","content":"..."}]}',
    'Nunca use markdown fences.',
    'Nunca retorne texto fora do JSON.',
    'Todos os paths devem ser relativos ao projeto e estar dentro de e2e/features ou e2e/pageObjects.',
    '',
    'Instruções compactadas do agente:',
    agentDefinition,
  ].join('\n');

  const userPrompt = [
    'Gere ou atualize os arquivos de teste com base nesta feature Gherkin:',
    '',
    featureContent,
  ].join('\n');

  const response = await postWithRetry(
    GITHUB_MODELS_URL,
    {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 16000,
    },
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      timeout: 180000,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('O agente não retornou conteúdo.');
  }

  return parseAgentJson(content);
}

async function postWithRetry(
  url: string,
  data: unknown,
  config: Parameters<typeof axios.post>[2]
): Promise<{ data?: { choices?: Array<{ message?: { content?: string } }> } }> {
  const maxAttempts = 4;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await axios.post(url, data, config);
    } catch (error: unknown) {
      lastError = error;
      const status = (error as { response?: { status?: number } })?.response?.status;
      const isRetryable = status === 429 || (typeof status === 'number' && status >= 500);

      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = Math.min(30000, 2000 * Math.pow(2, attempt - 1));
      console.warn(`⚠️ Tentativa ${attempt}/${maxAttempts} falhou com status ${status}. Repetindo em ${Math.round(delayMs / 1000)}s...`);
      await delay(delayMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Falha ao chamar API do modelo.');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function compactAgentDefinitionForPrompt(agentDefinition: string): string {
  const lines = agentDefinition
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      return !trimmed.startsWith('```');
    });

  const maxChars = 7000;
  const compact = lines.join('\n').trim();
  if (compact.length <= maxChars) {
    return compact;
  }

  return [
    compact.slice(0, maxChars),
    '',
    '[agent-definition-truncated-for-size]'
  ].join('\n');
}

function compactFeatureContent(featureContent: string): string {
  const lines = featureContent.split(/\r?\n/);
  const compactLines = lines.map((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('#')) {
      return '';
    }

    if (trimmed.startsWith('|')) {
      const maxTableLine = 500;
      if (line.length > maxTableLine) {
        return `${line.slice(0, maxTableLine)} ...[truncated-table-cell]`;
      }
    }

    const maxGenericLine = 1200;
    if (line.length > maxGenericLine) {
      return `${line.slice(0, maxGenericLine)} ...[truncated-long-step]`;
    }

    return line;
  }).filter((line) => line !== '');

  const compact = compactLines.join('\n').trim();
  const maxChars = 22000;
  if (compact.length <= maxChars) {
    return compact;
  }

  return `${compact.slice(0, maxChars)}\n\n[feature-truncated-for-size]`;
}

function parseAgentJson(raw: string): AgentResponse {
  const withoutFences = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const firstBrace = withoutFences.indexOf('{');
  const lastBrace = withoutFences.lastIndexOf('}');
  const jsonCandidate = firstBrace >= 0 && lastBrace > firstBrace
    ? withoutFences.slice(firstBrace, lastBrace + 1)
    : withoutFences;

  const parsed = JSON.parse(jsonCandidate) as AgentResponse;

  if (!parsed || !Array.isArray(parsed.files) || parsed.files.length === 0) {
    throw new Error('Resposta do agente inválida: nenhum arquivo foi retornado.');
  }

  parsed.files.forEach((file) => {
    if (!file.path || !file.content) {
      throw new Error('Resposta do agente inválida: arquivos sem path/content.');
    }
  });

  return parsed;
}

function writeGeneratedFiles(projectRoot: string, files: GeneratedFile[]): string[] {
  const writtenFiles: string[] = [];

  for (const file of files) {
    const safePath = normalizeAndValidateOutputPath(file.path);
    const absolutePath = path.join(projectRoot, safePath);

    if (isExistingPageObject(projectRoot, safePath)) {
      const generatedPath = toGeneratedVariantPath(absolutePath);
      fs.mkdirSync(path.dirname(generatedPath), { recursive: true });
      fs.writeFileSync(generatedPath, file.content, 'utf-8');
      writtenFiles.push(generatedPath);
      continue;
    }

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, file.content, 'utf-8');
    writtenFiles.push(absolutePath);
  }

  return writtenFiles;
}

function isExistingPageObject(projectRoot: string, safePath: string): boolean {
  if (!safePath.startsWith('e2e/pageObjects/')) {
    return false;
  }
  const absolutePath = path.join(projectRoot, safePath);
  return fs.existsSync(absolutePath);
}

function toGeneratedVariantPath(absolutePath: string): string {
  const parsed = path.parse(absolutePath);
  return path.join(parsed.dir, `${parsed.name}.generated${parsed.ext}`);
}

function normalizeAndValidateOutputPath(relativeFilePath: string): string {
  const normalized = relativeFilePath.replace(/\\/g, '/').trim();

  if (normalized.startsWith('/') || normalized.includes('..')) {
    throw new Error(`Path inválido retornado pelo agente: ${relativeFilePath}`);
  }

  const allowedPrefixes = ['e2e/features/', 'e2e/pageObjects/'];
  if (!allowedPrefixes.some((prefix) => normalized.startsWith(prefix))) {
    throw new Error(`Path fora das pastas permitidas: ${relativeFilePath}`);
  }

  return normalized;
}

function saveRunReport(
  projectRoot: string,
  featurePath: string,
  output: AgentResponse,
  writtenFiles: string[]
): string {
  const reportsDir = path.join(projectRoot, 'e2e', 'ai-bdd-generated', '.runs');
  fs.mkdirSync(reportsDir, { recursive: true });

  const featureName = path.basename(featurePath, '.feature');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFileName = `${featureName}-${timestamp}.json`;
  const reportPath = path.join(reportsDir, reportFileName);

  const report = {
    feature: path.relative(projectRoot, featurePath),
    model: MODEL,
    generatedAt: new Date().toISOString(),
    summary: output.summary || null,
    files: writtenFiles.map((filePath) => path.relative(projectRoot, filePath)),
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  return reportPath;
}

function ensureLegacyCompatibility(projectRoot: string, writtenFiles: string[]): void {
  const normalizedWritten = writtenFiles.map((file) => file.replace(/\\/g, '/').toLowerCase());

  const homePagePath = path.join(projectRoot, 'e2e', 'pageObjects', 'HomePage.ts');
  if (normalizedWritten.includes(homePagePath.replace(/\\/g, '/').toLowerCase()) && fs.existsSync(homePagePath)) {
    let content = fs.readFileSync(homePagePath, 'utf-8');

    if (!content.includes('async navigate(')) {
      if (!content.includes('private readonly baseUrl')) {
        content = content.replace(
          /export class HomePage \{\r?\n\s*private readonly page: Page;\r?\n/,
          "export class HomePage {\n  private readonly page: Page;\n  private readonly baseUrl = 'https://paytolls.vialivre.pt/portalweb/';\n"
        );
      }

      const navigateMethod = [
        '',
        '  /**',
        '   * Navigates to the home page URL.',
        '   */',
        '  async navigate(url?: string): Promise<void> {',
        '    await this.page.goto(url ?? this.baseUrl);',
        '  }',
      ].join('\n');

      content = insertBeforeClassEnd(content, navigateMethod);
      fs.writeFileSync(homePagePath, content, 'utf-8');
    }
  }

  const debtPagePath = path.join(projectRoot, 'e2e', 'pageObjects', 'DebtPaymentPage.ts');
  if (normalizedWritten.includes(debtPagePath.replace(/\\/g, '/').toLowerCase()) && fs.existsSync(debtPagePath)) {
    let content = fs.readFileSync(debtPagePath, 'utf-8');

    if (!content.includes('async clickPesquisar(')) {
      const clickPesquisarMethod = [
        '',
        '  /**',
        '   * Backward-compatible alias for click on PESQUISAR button.',
        '   */',
        '  async clickPesquisar(): Promise<void> {',
        "    await this.page.locator('button', { hasText: 'PESQUISAR' }).click();",
        '  }',
      ].join('\n');
      content = insertBeforeClassEnd(content, clickPesquisarMethod);
    }

    if (!content.includes('async expectEmailConfirmation(')) {
      const expectEmailConfirmationMethod = [
        '',
        '  /**',
        '   * Backward-compatible assertion for confirmation email message.',
        '   */',
        '  async expectEmailConfirmation(email: string): Promise<void> {',
        "    const message = `Por favor, verifique a sua caixa de correio eletrónico. Enviamos um e-mail para: ${email}`;",
        '    await expect(this.page.locator(`text=${message}`)).toBeVisible();',
        '  }',
      ].join('\n');
      content = insertBeforeClassEnd(content, expectEmailConfirmationMethod);
    }

    fs.writeFileSync(debtPagePath, content, 'utf-8');
  }
}

function insertBeforeClassEnd(fileContent: string, methodBlock: string): string {
  const lastBrace = fileContent.lastIndexOf('}');
  if (lastBrace < 0) {
    return fileContent;
  }
  return `${fileContent.slice(0, lastBrace).trimEnd()}\n${methodBlock}\n}\n`;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`❌ Falha ao executar fluxo automático: ${message}`);
  process.exit(1);
});
