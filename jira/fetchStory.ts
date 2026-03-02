import * as fs from 'fs';
import * as path from 'path';
import { JiraClient, JiraStory, JiraAttachment } from './jiraClient';
import { generateFeatureFile } from './generateFeature';

/**
 * Script para buscar uma história do Jira, salvar as informações
 * na pasta 'e2e/ai-bdd-generated/' e gerar automaticamente o arquivo .feature
 * com cenários BDD usando IA (GitHub Models API + openai).
 *
 * Uso:
 *   npx ts-node jira/fetchStory.ts <URL_DA_HISTORIA>
 *
 * Exemplo:
 *   npx ts-node jira/fetchStory.ts https://maycowfellipo123.atlassian.net/browse/SCRUM-6
 */

async function main(): Promise<void> {
  const url = process.argv[2];

  if (!url) {
    console.error('❌ Uso: npx ts-node jira/fetchStory.ts <URL_DA_HISTORIA_JIRA>');
    console.error('   Exemplo: npx ts-node jira/fetchStory.ts https://maycowfellipo123.atlassian.net/browse/SCRUM-6');
    process.exit(1);
  }

  console.log(`\n🔍 Buscando história do Jira: ${url}\n`);

  // 1. Inicializa o client e extrai a issue key
  const client = new JiraClient();
  const issueKey = JiraClient.extractIssueKey(url);
  console.log(`📌 Issue Key: ${issueKey}`);

  // 2. Busca dados da issue
  const story = await client.getIssue(issueKey);
  console.log(`📝 Título: ${story.title}`);
  console.log(`📎 Anexos encontrados: ${story.attachments.length}`);

  // 3. Salva os dados na pasta 'e2e/ai-bdd-generated'
  const projectRoot = path.resolve(__dirname, '..');
  const storyDir = path.join(projectRoot, 'e2e', 'ai-bdd-generated');

  if (!fs.existsSync(storyDir)) {
    fs.mkdirSync(storyDir, { recursive: true });
  }
  console.log(`\n📁 Usando pasta: e2e/ai-bdd-generated/`);

  // 4. Monta o conteúdo da história para enviar à IA
  const summaryContent = buildSummary(story, url);

  // 5. Faz download dos anexos
  if (story.attachments.length > 0) {
    const attachDir = path.join(storyDir, 'attachments');
    if (!fs.existsSync(attachDir)) {
      fs.mkdirSync(attachDir, { recursive: true });
    }

    for (const attachment of story.attachments) {
      await downloadAndSave(client, attachment, attachDir);
    }
  }

  // 6. Gera o arquivo .feature com cenários BDD via IA
  await generateFeatureFile(story, summaryContent, storyDir);

  console.log(`\n🎉 Concluído! Dados do Jira e cenários BDD salvos em: e2e/ai-bdd-generated/\n`);
}

/**
 * Constrói o conteúdo do arquivo de resumo em Markdown.
 */
function buildSummary(story: JiraStory, originalUrl: string): string {
  let content = '';

  content += `# ${story.title}\n\n`;
  content += `**Issue Key:** ${story.key}\n`;
  content += `**Link:** ${originalUrl}\n\n`;
  content += `---\n\n`;
  content += `## Descrição\n\n`;
  content += `${story.description}\n\n`;

  if (story.attachments.length > 0) {
    content += `---\n\n`;
    content += `## Anexos\n\n`;
    content += `| Arquivo | Tipo | Tamanho |\n`;
    content += `|---------|------|---------|\n`;

    for (const att of story.attachments) {
      const size = formatFileSize(att.size);
      content += `| ${att.filename} | ${att.mimeType} | ${size} |\n`;
    }

    content += `\nOs anexos foram salvos na pasta \`attachments/\`.\n`;
  }

  return content;
}

/**
 * Formata o tamanho do arquivo em formato legível.
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Faz download de um attachment e salva no diretório especificado.
 */
async function downloadAndSave(
  client: JiraClient,
  attachment: JiraAttachment,
  outputDir: string
): Promise<void> {
  try {
    console.log(`   ⬇️  Baixando: ${attachment.filename} (${formatFileSize(attachment.size)})...`);
    const buffer = await client.downloadAttachment(attachment);
    const filePath = path.join(outputDir, attachment.filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`   ✅ Salvo: ${attachment.filename}`);
  } catch (error: any) {
    console.error(`   ❌ Erro ao baixar ${attachment.filename}: ${error.message}`);
  }
}

// Executa o script
main().catch((error) => {
  console.error(`\n❌ Erro: ${error.message}`);
  if (error.response) {
    console.error(`   Status: ${error.response.status}`);
    console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
  }
  process.exit(1);
});
