import * as fs from 'fs';
import * as path from 'path';
import { JiraClient, JiraStory, JiraAttachment } from './jiraClient';

/**
 * Script para buscar uma história do Jira e salvar todas as informações
 * em uma pasta na raiz do projeto.
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

  // 3. Cria a pasta com o título da história (sanitizado)
  const folderName = sanitizeFolderName(`${story.key} - ${story.title}`);
  const projectRoot = path.resolve(__dirname, '..');
  const storyDir = path.join(projectRoot, folderName);

  if (!fs.existsSync(storyDir)) {
    fs.mkdirSync(storyDir, { recursive: true });
  }
  console.log(`\n📁 Pasta criada: ${folderName}/`);

  // 4. Salva as informações em um arquivo de resumo
  const summaryPath = path.join(storyDir, 'story-info.md');
  const summaryContent = buildSummary(story, url);
  fs.writeFileSync(summaryPath, summaryContent, 'utf-8');
  console.log(`✅ Resumo salvo: story-info.md`);

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

  console.log(`\n🎉 Concluído! Todas as informações foram salvas em: ${folderName}/\n`);
}

/**
 * Sanitiza o nome da pasta removendo caracteres inválidos do sistema de arquivos.
 */
function sanitizeFolderName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '-')  // Caracteres inválidos no Windows
    .replace(/\s+/g, ' ')            // Espaços múltiplos → um espaço
    .replace(/\.+$/, '')              // Remove pontos no final
    .trim()
    .substring(0, 100);               // Limita o tamanho
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
