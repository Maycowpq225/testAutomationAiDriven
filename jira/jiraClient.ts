import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

export interface JiraAttachment {
  id: string;
  filename: string;
  mimeType: string;
  contentUrl: string;
  size: number;
}

export interface JiraStory {
  key: string;
  title: string;
  description: string;
  attachments: JiraAttachment[];
}

/**
 * Client para comunicação com a API REST do Jira Cloud.
 */
export class JiraClient {
  private client: AxiosInstance;
  private config: JiraConfig;

  constructor(config?: Partial<JiraConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.JIRA_BASE_URL || '',
      email: config?.email || process.env.JIRA_EMAIL || '',
      apiToken: config?.apiToken || process.env.JIRA_API_TOKEN || '',
    };

    if (!this.config.baseUrl || !this.config.email || !this.config.apiToken) {
      throw new Error(
        'Configuração Jira incompleta. Verifique JIRA_BASE_URL, JIRA_EMAIL e JIRA_API_TOKEN no .env'
      );
    }

    const authToken = Buffer.from(`${this.config.email}:${this.config.apiToken}`).toString('base64');

    this.client = axios.create({
      baseURL: `${this.config.baseUrl}/rest/api/3`,
      headers: {
        Authorization: `Basic ${authToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Extrai a issue key de uma URL do Jira.
   * Ex: 'https://xxx.atlassian.net/browse/SCRUM-6' -> 'SCRUM-6'
   */
  static extractIssueKey(url: string): string {
    const match = url.match(/\/browse\/([A-Z][A-Z0-9_]+-\d+)/i);
    if (!match) {
      throw new Error(`Não foi possível extrair a issue key da URL: ${url}`);
    }
    return match[1];
  }

  /**
   * Busca os dados de uma issue do Jira.
   */
  async getIssue(issueKey: string): Promise<JiraStory> {
    const response = await this.client.get(`/issue/${issueKey}`, {
      params: {
        fields: 'summary,description,attachment',
      },
    });

    const fields = response.data.fields;

    return {
      key: response.data.key,
      title: fields.summary || '',
      description: this.parseDescription(fields.description),
      attachments: this.parseAttachments(fields.attachment || []),
    };
  }

  /**
   * Faz o download de um attachment do Jira.
   * Retorna o buffer com o conteúdo do arquivo.
   */
  async downloadAttachment(attachment: JiraAttachment): Promise<Buffer> {
    const authToken = Buffer.from(`${this.config.email}:${this.config.apiToken}`).toString('base64');

    const response = await axios.get(attachment.contentUrl, {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Basic ${authToken}`,
      },
    });

    return Buffer.from(response.data);
  }

  /**
   * Converte a descrição do formato ADF (Atlassian Document Format) para texto plano.
   */
  private parseDescription(description: any): string {
    if (!description) return '(sem descrição)';
    if (typeof description === 'string') return description;

    // ADF (Atlassian Document Format) -> texto plano
    return this.adfToText(description);
  }

  /**
   * Converte recursivamente o ADF para texto.
   */
  private adfToText(node: any): string {
    if (!node) return '';

    if (typeof node === 'string') return node;

    if (node.type === 'text') {
      return node.text || '';
    }

    if (node.type === 'hardBreak') {
      return '\n';
    }

    if (node.type === 'mention') {
      return `@${node.attrs?.text || node.attrs?.id || 'unknown'}`;
    }

    if (node.type === 'emoji') {
      return node.attrs?.shortName || '';
    }

    if (node.type === 'inlineCard' || node.type === 'blockCard') {
      return node.attrs?.url || '';
    }

    let text = '';

    if (Array.isArray(node.content)) {
      text = node.content.map((child: any) => this.adfToText(child)).join('');
    }

    // Adiciona formatação baseada no tipo do nó
    switch (node.type) {
      case 'paragraph':
        return text + '\n';
      case 'heading':
        const level = node.attrs?.level || 1;
        return '#'.repeat(level) + ' ' + text + '\n';
      case 'bulletList':
        return text;
      case 'orderedList':
        return text;
      case 'listItem':
        return '• ' + text;
      case 'codeBlock':
        return '```\n' + text + '\n```\n';
      case 'blockquote':
        return text.split('\n').map((line: string) => '> ' + line).join('\n') + '\n';
      case 'rule':
        return '---\n';
      case 'table':
      case 'tableRow':
      case 'tableCell':
      case 'tableHeader':
        return text + '\t';
      case 'mediaSingle':
      case 'media':
        return '[media]\n';
      default:
        return text;
    }
  }

  /**
   * Mapeia os attachments retornados pela API para o formato interno.
   */
  private parseAttachments(attachments: any[]): JiraAttachment[] {
    // Tipos MIME que consideramos "legíveis/baixáveis"
    const readableTypes = [
      'image/', 'application/pdf', 'text/',
      'application/json', 'application/xml',
      'application/msword',
      'application/vnd.openxmlformats-officedocument',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
    ];

    return attachments
      .filter((att: any) => {
        const mime = (att.mimeType || '').toLowerCase();
        return readableTypes.some(type => mime.startsWith(type));
      })
      .map((att: any) => ({
        id: att.id,
        filename: att.filename,
        mimeType: att.mimeType,
        contentUrl: att.content,
        size: att.size,
      }));
  }
}
