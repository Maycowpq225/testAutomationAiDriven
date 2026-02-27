# testAutomationAiDriven

Projeto de automação de testes com integração ao Jira e geração automática de cenários BDD via IA.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- npm (incluído com o Node.js)
- Uma conta no [Jira Cloud (Atlassian)](https://www.atlassian.com/software/jira)
- Um [GitHub Personal Access Token](https://github.com/settings/tokens) com acesso ao GitHub Models

## Instalação

```bash
git clone https://github.com/Maycowpq225/testAutomationAiDriven.git
cd testAutomationAiDriven
npm install
```

---

## Integração com o Jira + Geração Automática de Cenários BDD

O projeto possui um fluxo automatizado que:
1. Se comunica com a API REST do Jira Cloud para extrair informações de histórias (issues)
2. Gera automaticamente cenários de teste BDD em formato `.feature` (Gherkin) usando IA (Claude via GitHub Models API)
3. Salva tudo na pasta `generated-test-cases/`

### 1. Configurar o arquivo `.env`

Na raiz do projeto, crie (ou edite) o arquivo `.env` com as seguintes variáveis:

```env
JIRA_BASE_URL=https://SEU-DOMINIO.atlassian.net
JIRA_EMAIL=seu-email@exemplo.com
JIRA_API_TOKEN=seu-token-jira-aqui
GITHUB_TOKEN=seu-github-token-aqui
```

| Variável | Descrição |
|----------|----------|
| `JIRA_BASE_URL` | URL base da sua instância Jira Cloud. Exemplo: `https://meutime.atlassian.net` |
| `JIRA_EMAIL` | O e-mail associado à sua conta Atlassian. É o mesmo usado para fazer login no Jira. |
| `JIRA_API_TOKEN` | Token de API gerado na Atlassian. Veja abaixo como criar. |
| `GITHUB_TOKEN` | Personal Access Token do GitHub para acesso ao GitHub Models API (Claude). Veja abaixo como criar. |

> ⚠️ **Importante:** O arquivo `.env` já está no `.gitignore` e **não será commitado**. Cada pessoa que clonar o projeto precisa criar o seu próprio `.env` com suas credenciais.

### 2. Como gerar um API Token no Jira

1. Acesse [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Clique em **"Create API token"**
3. Dê um nome ao token (ex: `automacao-testes`)
4. Copie o token gerado e cole no campo `JIRA_API_TOKEN` do seu `.env`

> O token funciona em conjunto com o seu e-mail para autenticação via Basic Auth na API do Jira.

### 2b. Como gerar o GitHub Token

1. Acesse [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Clique em **"Generate new token"** (classic)
3. Selecione os escopos necessários (para GitHub Models basta o escopo padrão)
4. Copie o token gerado e cole no campo `GITHUB_TOKEN` do seu `.env`

> O GitHub Token é usado para chamar a API do GitHub Models (Claude Sonnet) que gera os cenários BDD automaticamente.

### 3. Executar a extração de uma história

Com o `.env` configurado, execute o comando abaixo passando a **URL completa** da história no Jira:

```bash
npm run jira:fetch -- "https://SEU-DOMINIO.atlassian.net/browse/PROJETO-123"
```

**Exemplo real:**

```bash
npm run jira:fetch -- "https://maycowfellipo123.atlassian.net/browse/SCRUM-6"
```

Alternativamente, você pode usar `npx` diretamente:

```bash
npx ts-node jira/fetchStory.ts "https://maycowfellipo123.atlassian.net/browse/SCRUM-6"
```

### 4. O que acontece após a execução

O script executa automaticamente todo o fluxo:

1. **Conectar** à API do Jira usando suas credenciais do `.env`
2. **Extrair** o título, a descrição (convertida de ADF para Markdown) e a lista de anexos
3. **Salvar um arquivo `story-info.md`** na pasta `generated-test-cases/` com o resumo completo da história
4. **Baixar os anexos** legíveis para a subpasta `generated-test-cases/attachments/`
5. **Gerar automaticamente** o arquivo `.feature` com cenários BDD usando IA (Claude via GitHub Models API)
6. **Salvar o `.feature`** na pasta `generated-test-cases/` com o nome `<ISSUE-KEY>.feature`

**Exemplo de estrutura gerada:**

```
generated-test-cases/
├── story-info.md
├── SCRUM-6.feature
└── attachments/
    ├── mockup-tela.png
    └── especificacao.pdf
```

### 5. Tipos de anexos suportados

O módulo faz download apenas de arquivos com tipos MIME considerados legíveis:

| Categoria | Tipos |
|-----------|-------|
| Imagens | `image/*` (PNG, JPG, GIF, SVG, etc.) |
| Documentos | `application/pdf`, `application/msword`, formatos Office (DOCX, XLSX, PPTX) |
| Texto | `text/*` (TXT, CSV, HTML, etc.) |
| Dados | `application/json`, `application/xml` |

### 6. Estrutura dos arquivos da integração

```
jira/
├── jiraClient.ts       # Módulo de comunicação com a API REST do Jira
├── fetchStory.ts       # Script executável que orquestra todo o fluxo
└── generateFeature.ts  # Módulo que chama a IA para gerar o .feature
```

| Arquivo | Responsabilidade |
|---------|------------------|
| `jira/jiraClient.ts` | Classe `JiraClient` com métodos para autenticação, busca de issues, parsing de ADF e download de anexos |
| `jira/fetchStory.ts` | Script CLI que orquestra o fluxo: recebe a URL → busca dados → salva resumo → baixa anexos → gera .feature |
| `jira/generateFeature.ts` | Chama o GitHub Models API (Claude Sonnet) para gerar cenários BDD em formato Gherkin |

---

## Troubleshooting

| Erro | Causa | Solução |
|------|-------|---------|
| `Configuração Jira incompleta` | Variáveis do `.env` ausentes ou vazias | Verifique se `JIRA_BASE_URL`, `JIRA_EMAIL` e `JIRA_API_TOKEN` estão preenchidas |
| `GITHUB_TOKEN não encontrado` | Variável `GITHUB_TOKEN` ausente no `.env` | Adicione seu GitHub Personal Access Token ao `.env` |
| `Status: 401` (GitHub Models) | Token do GitHub inválido ou sem permissão | Verifique se o token tem acesso ao GitHub Models |
| `Status: 401` (Jira) | Credenciais do Jira inválidas | Confirme que o e-mail e o token estão corretos e que o token não expirou |
| `Status: 404` | Issue não encontrada | Verifique se a URL/issue key está correta e se você tem acesso ao projeto |
| `Não foi possível extrair a issue key` | URL em formato inválido | Use o formato completo: `https://dominio.atlassian.net/browse/PROJ-123` |