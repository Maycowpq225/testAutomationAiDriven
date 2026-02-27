import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { JiraStory } from './jiraClient';

dotenv.config();

const GITHUB_MODELS_URL = 'https://models.github.ai/inference/chat/completions';
const MODEL = 'openai/gpt-4.1';

/**
 * Prompt do sistema baseado no agente scenario-planner-bdd.
 */
const SYSTEM_PROMPT = `You are an expert BDD test scenario planner with extensive experience in quality assurance, Gherkin syntax, and comprehensive test coverage planning. Your expertise includes functional testing, edge case identification, negative scenarios, and writing clear, maintainable .feature files.

You will receive story data from Jira (title, description, acceptance criteria, attachments info). Your job is to analyze it and generate a comprehensive .feature file in Gherkin format.

## Requirements

1. **Analyze the Story Data thoroughly** to identify all testable functionalities.

2. **Design Comprehensive BDD Scenarios** including:
   - **Happy path** scenarios (main success flows)
   - **Negative scenarios** (invalid inputs, error conditions)
   - **Edge cases** (boundary values, limits, special characters)
   - **UI/UX scenarios** (navigation, responsiveness, usability)
   - **Security scenarios** (basic security validations)

3. **All scenarios must be:**
   - Independent and runnable in any order
   - Written in proper Gherkin syntax (Feature, Scenario, Given, When, Then, And, But)
   - With clear, descriptive titles
   - With detailed steps and expected outcomes
   - Assuming a blank/fresh starting state

4. **Use proper Gherkin structure:**
   - Steps must be in order (given - when - then), you can have only one given/when/then per test, but use as many AND as needed within the same scenario.
   - Steps must be in the correct sequence (given - when - then), If you used when, you can no longer use given in the next lines of the same test, and if you use then, you can no longer use when or given.
   - Use scenarios outlines with examples where applicable, but ensure that each scenario is still self-contained and can be run independently.
    exemples:
    Scenario Outline: Aceitar diferentes formatos válidos de matrícula
        Given o usuário acessa a página inicial do portalweb Vialivre em "https://xxx.xxx.pt/xx/"
        When o usuário preenche o campo "Matrícula" com "<Matricula>"
        And o sistema aceita o formato informado
        Examples:
        | Matricula  |
        | AA-00-00   |
        | 00-AA-00   |
        | 0000UE     |
   - You must not use background, all scenarios must be independent and self-contained, with their own given steps.
   - Tags for categorization (@happy-path, @negative, @edge-case, @ui, @security)

## Quality Standards
- Write steps that are specific enough for any tester or automation engineer to follow
- Include negative testing scenarios for all input validations
- Ensure scenarios cover boundary/limit conditions and Equivalence Partitioning
- Use proper Gherkin keywords and syntax
- Group scenarios logically using tags
- Always reutilize steps when possible to avoid duplication of logic, but ensure each scenario is still self-contained and can be run independently.

## Output Format
Return ONLY the .feature file content. Do not include any explanation, markdown fences, or extra text. Start directly with the Feature: keyword.`;

/**
 * Gera o arquivo .feature a partir dos dados da história do Jira
 * usando o GitHub Models API com Claude Sonnet 4.
 */
export async function generateFeatureFile(
  story: JiraStory,
  storyInfoContent: string,
  outputDir: string
): Promise<string> {
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    throw new Error(
      'GITHUB_TOKEN não encontrado no .env. ' +
      'Gere um Personal Access Token em https://github.com/settings/tokens e adicione ao .env'
    );
  }

  console.log(`\n🤖 Gerando cenários BDD com IA (${MODEL})...`);
  console.log(`   Analisando história: ${story.key} - ${story.title}`);

  const userMessage = `Analyze the following Jira story data and generate a comprehensive .feature file with all BDD test scenarios.\n\n---\n\n${storyInfoContent}`;

  const response = await axios.post(
    GITHUB_MODELS_URL,
    {
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 16000,
    },
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      timeout: 120000, // 2 min timeout — LLM pode demorar
    }
  );

  const featureContent = response.data?.choices?.[0]?.message?.content;

  if (!featureContent) {
    throw new Error('A IA não retornou conteúdo. Verifique o GITHUB_TOKEN e tente novamente.');
  }

  // Remove markdown fences caso a IA inclua por engano
  const cleanContent = featureContent
    .replace(/^```(?:gherkin|feature)?\n?/gm, '')
    .replace(/\n?```$/gm, '')
    .trim();

  // Salva o arquivo .feature
  const featureFileName = `${story.key}.feature`;
  const featurePath = path.join(outputDir, featureFileName);
  fs.writeFileSync(featurePath, cleanContent, 'utf-8');

  console.log(`   ✅ Arquivo gerado: generated-test-cases/${featureFileName}`);

  return featurePath;
}
