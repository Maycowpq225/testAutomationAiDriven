import * as fs from 'fs';
import * as path from 'path';
import { JiraStory } from './jiraClient';

export interface SavedStoryFiles {
  summaryPath: string;
}

/**
 * Salva os dados da história do Jira em disco para análise manual.
 * Gera apenas um resumo em Markdown.
 */
export function saveStoryFiles(
  story: JiraStory,
  storyInfoContent: string,
  outputDir: string
): SavedStoryFiles {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const summaryPath = path.join(outputDir, `${story.key}.md`);

  fs.writeFileSync(summaryPath, ensureTrailingNewline(storyInfoContent));

  return { summaryPath };
}

function ensureTrailingNewline(content: string): string {
  return content.endsWith('\n') ? content : `${content}\n`;
}
