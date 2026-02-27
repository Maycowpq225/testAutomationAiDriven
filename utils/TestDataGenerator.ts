import axios from 'axios';

export interface TestData {
  matricula: string;
  startDate: string;
  endDate: string;
  nome: string;
  apelido: string;
  nif: string;
  email: string;
  morada: string;
  codigoPostal: string;
  localidade: string;
  pais: string;
  termos: {
    privacidade: boolean;
    titular: boolean;
    autorizacao: boolean;
  };
}

/**
 * Gerador de dados de teste dinâmicos para o formulário de pagamento de dívida.
 * Gera dados válidos portugueses de forma aleatória.
 */
export class TestDataGenerator {
  private readonly nomes = [
    'João', 'Maria', 'António', 'Ana', 'José', 'Catarina', 'Manuel', 'Isabel',
    'Francisco', 'Teresa', 'Carlos', 'Margarida', 'Luís', 'Fernanda', 'Paulo',
    'Sofia', 'Pedro', 'Cristina', 'Rui', 'Helena', 'Miguel', 'Inês', 'Tiago',
    'Rita', 'André', 'Patrícia', 'Ricardo', 'Sónia', 'Bruno', 'Carla'
  ];

  private readonly apelidos = [
    'Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues',
    'Martins', 'Jesus', 'Sousa', 'Fernandes', 'Gonçalves', 'Gomes', 'Lopes',
    'Marques', 'Alves', 'Almeida', 'Ribeiro', 'Pinto', 'Carvalho', 'Teixeira',
    'Moreira', 'Correia', 'Mendes', 'Nunes', 'Soares', 'Vieira', 'Monteiro',
    'Cardoso', 'Rocha', 'Neves', 'Coelho', 'Cruz', 'Cunha', 'Pires', 'Ramos'
  ];

  private readonly localidades = [
    'Lisboa', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga', 'Funchal',
    'Coimbra', 'Setúbal', 'Almada', 'Agualva-Cacém', 'Queluz', 'Sintra',
    'Barreiro', 'Aveiro', 'Guimarães', 'Odivelas', 'Gondomar', 'Loures',
    'Póvoa de Varzim', 'Rio Tinto', 'Covilhã', 'Santarém', 'Faro', 'Leiria',
    'Vila Franca de Xira', 'Évora', 'Matosinhos', 'Beja', 'Vila Real',
    'Viseu', 'Castelo Branco', 'Guarda', 'Bragança', 'Portalegre'
  ];

  private readonly ruas = [
    'Rua da Liberdade', 'Rua 25 de Abril', 'Rua do Comércio', 'Avenida da República',
    'Rua Professor Doutor', 'Rua dos Bombeiros Voluntários', 'Rua da Escola',
    'Rua da Igreja', 'Rua do Rossio', 'Rua Nova', 'Rua Direita', 'Rua do Mercado',
    'Rua António José de Almeida', 'Rua Vasco da Gama', 'Rua Infante D. Henrique',
    'Rua Dr. Manuel Arriaga', 'Rua Pedro Álvares Cabral', 'Rua Gil Vicente',
    'Rua Camões', 'Rua Alexandre Herculano', 'Rua João de Deus', 'Rua do Progresso'
  ];

  private readonly dominiosEmail = [
    'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'sapo.pt',
    'iol.pt', 'clix.pt', 'netcabo.pt', 'telepac.pt'
  ];

  /**
   * Gera uma matrícula portuguesa válida (formato: NNNNAA).
   */
  private generateMatricula(): string {
    const numbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const letters = String.fromCharCode(65 + Math.random() * 26) + 
                   String.fromCharCode(65 + Math.random() * 26);
    return `${numbers}${letters}`;
  }

  /**
   * Gera uma data formatada para uso nos campos de data.
   * @param date - Objeto Date
   */
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} 00:00:00`;
  }

  /**
   * Busca um NIF português válido via API.
   */
  private async fetchValidNif(): Promise<string> {
    try {
      const response = await axios.get('https://nif.marcosantos.me/?i=2', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      // A API retorna HTML, preciso extrair o NIF do conteúdo
      const html = response.data;
      const nifMatch = html.match(/\b\d{9}\b/);
      
      if (nifMatch) {
        return nifMatch[0];
      }
    } catch (error) {
      console.warn('Erro ao buscar NIF da API, usando fallback:', error);
    }
    
    // Fallback: gerar NIF válido localmente usando algoritmo português
    return this.generateValidNifFallback();
  }

  /**
   * Gera um NIF português válido usando o algoritmo de validação.
   * Fallback para quando a API não está disponível.
   */
  private generateValidNifFallback(): string {
    // Começar com 8 dígitos aleatórios (primeiro dígito 1-3 para pessoa singular)
    const firstDigit = Math.floor(Math.random() * 3) + 1;
    const remainingDigits = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
    const nifArray = [firstDigit, ...remainingDigits];
    
    // Calcular dígito de controle usando algoritmo português
    const multipliers = [9, 8, 7, 6, 5, 4, 3, 2];
    const sum = nifArray.reduce((acc, digit, index) => acc + digit * multipliers[index], 0);
    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? 0 : 11 - remainder;
    
    return nifArray.join('') + checkDigit.toString();
  }

  /**
   * Seleciona um item aleatório de um array.
   */
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Gera um código postal português válido (formato: NNNN-NNN).
   */
  private generateCodigoPostal(): string {
    const part1 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const part2 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${part1}-${part2}`;
  }

  /**
   * Remove acentos e caracteres especiais de uma string.
   */
  private removeAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }

  /**
   * Gera um endereço de email baseado no nome e apelido.
   */
  private generateEmail(nome: string, apelido: string): string {
    const cleanNome = this.removeAccents(nome);
    const cleanApelido = this.removeAccents(apelido);
    const userName = `${cleanNome}.${cleanApelido}`;
    const number = Math.floor(Math.random() * 999) + 1;
    const domain = this.randomChoice(this.dominiosEmail);
    return `${userName}${number}@${domain}`;
  }

  /**
   * Gera dados de teste completos para o formulário.
   */
  async generateTestData(): Promise<TestData> {
    // Gerar datas
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Gerar dados pessoais
    const nome = this.randomChoice(this.nomes);
    const apelido = this.randomChoice(this.apelidos);
    const localidade = this.randomChoice(this.localidades);
    const rua = this.randomChoice(this.ruas);
    const numeroPorta = Math.floor(Math.random() * 500) + 1;
    
    return {
      matricula: this.generateMatricula(),
      startDate: this.formatDate(oneMonthAgo),
      endDate: this.formatDate(yesterday),
      nome: nome,
      apelido: apelido,
      nif: await this.fetchValidNif(),
      email: this.generateEmail(nome, apelido),
      morada: `${rua}, ${numeroPorta}`,
      codigoPostal: this.generateCodigoPostal(),
      localidade: localidade,
      pais: 'Portugal',
      termos: {
        privacidade: true,
        titular: true,
        autorizacao: true
      }
    };
  }

  /**
   * Gera dados de teste de forma síncrona (sem buscar NIF da API).
   * Útil para cenários onde não queremos depender de APIs externas.
   */
  generateTestDataSync(): TestData {
    // Gerar datas
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Gerar dados pessoais
    const nome = this.randomChoice(this.nomes);
    const apelido = this.randomChoice(this.apelidos);
    const localidade = this.randomChoice(this.localidades);
    const rua = this.randomChoice(this.ruas);
    const numeroPorta = Math.floor(Math.random() * 500) + 1;
    
    return {
      matricula: this.generateMatricula(),
      startDate: this.formatDate(oneMonthAgo),
      endDate: this.formatDate(yesterday),
      nome: nome,
      apelido: apelido,
      nif: this.generateValidNifFallback(),
      email: this.generateEmail(nome, apelido),
      morada: `${rua}, ${numeroPorta}`,
      codigoPostal: this.generateCodigoPostal(),
      localidade: localidade,
      pais: 'Portugal',
      termos: {
        privacidade: true,
        titular: true,
        autorizacao: true
      }
    };
  }
}