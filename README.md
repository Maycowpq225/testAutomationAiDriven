# testAutomationAiDriven

Projeto de automação de testes com integração ao Jira para extração automática de histórias.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- npm (incluído com o Node.js)
- Uma conta no [Jira Cloud (Atlassian)](https://www.atlassian.com/software/jira)

## Instalação

```bash
git clone https://github.com/Maycowpq225/testAutomationAiDriven.git
cd testAutomationAiDriven
npm install
```

---

## Integração com o Jira

O projeto possui um módulo que se comunica com a API REST do Jira Cloud para extrair informações de histórias (issues). Ele busca o **título**, a **descrição** e faz o **download de anexos** (imagens, PDFs, textos, etc.), salvando tudo em uma pasta organizada na raiz do projeto.

### 1. Configurar o arquivo `.env`

Na raiz do projeto, crie (ou edite) o arquivo `.env` com as seguintes variáveis:

```env
JIRA_BASE_URL=https://SEU-DOMINIO.atlassian.net
JIRA_EMAIL=seu-email@exemplo.com
JIRA_API_TOKEN=seu-token-aqui
```

| Variável | Descrição |
|----------|-----------|
| `JIRA_BASE_URL` | URL base da sua instância Jira Cloud. Exemplo: `https://meutime.atlassian.net` |
| `JIRA_EMAIL` | O e-mail associado à sua conta Atlassian. É o mesmo usado para fazer login no Jira. |
| `JIRA_API_TOKEN` | Token de API gerado na Atlassian. Veja abaixo como criar. |

> ⚠️ **Importante:** O arquivo `.env` já está no `.gitignore` e **não será commitado**. Cada pessoa que clonar o projeto precisa criar o seu próprio `.env` com suas credenciais.

### 2. Como gerar um API Token no Jira

1. Acesse [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Clique em **"Create API token"**
3. Dê um nome ao token (ex: `automacao-testes`)
4. Copie o token gerado e cole no campo `JIRA_API_TOKEN` do seu `.env`

> O token funciona em conjunto com o seu e-mail para autenticação via Basic Auth na API do Jira.

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

O script irá:

1. **Conectar** à API do Jira usando suas credenciais do `.env`
2. **Extrair** o título, a descrição (convertida de ADF para Markdown) e a lista de anexos
3. **Criar uma pasta** na raiz do projeto com o nome no formato:
   ```
   PROJETO-123 - Título da História/
   ```
4. **Salvar um arquivo `story-info.md`** com o resumo completo da história (título, descrição, tabela de anexos)
5. **Baixar os anexos** legíveis (imagens, PDFs, textos, JSON, XML, documentos Office) para a subpasta `attachments/`

**Exemplo de estrutura gerada:**

```
SCRUM-6 - Pagamento de dívida total (PAYTOLLS)/
├── story-info.md
└── attachments/
    ├── mockup-tela.png
    ├── especificacao.pdf
    └── dados-teste.json
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
├── jiraClient.ts    # Módulo de comunicação com a API REST do Jira
└── fetchStory.ts    # Script executável que busca a história e salva na pasta
```

| Arquivo | Responsabilidade |
|---------|-----------------|
| `jira/jiraClient.ts` | Classe `JiraClient` com métodos para autenticação, busca de issues, parsing de ADF e download de anexos |
| `jira/fetchStory.ts` | Script CLI que orquestra o fluxo: recebe a URL → busca dados → cria pasta → salva resumo → baixa anexos |

---

## Troubleshooting

| Erro | Causa | Solução |
|------|-------|---------|
| `Configuração Jira incompleta` | Variáveis do `.env` ausentes ou vazias | Verifique se `JIRA_BASE_URL`, `JIRA_EMAIL` e `JIRA_API_TOKEN` estão preenchidas |
| `Status: 401` | Credenciais inválidas | Confirme que o e-mail e o token estão corretos e que o token não expirou |
| `Status: 404` | Issue não encontrada | Verifique se a URL/issue key está correta e se você tem acesso ao projeto |
| `Não foi possível extrair a issue key` | URL em formato inválido | Use o formato completo: `https://dominio.atlassian.net/browse/PROJ-123` |