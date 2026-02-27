# Pagamento de dívida total (PAYTOLLS)

**Issue Key:** SCRUM-6
**Link:** https://maycowfellipo123.atlassian.net/browse/SCRUM-6

---

## Descrição

# Plano de Testes Completo - Pagamento de Dívida Total
## Application Overview
Este plano de testes abrange a funcionalidade completa de "Pagamento de dívida total" do portalweb da Vialivre (https://paytolls.vialivre.pt/portalweb/), incluindo todos os cenários positivos, negativos, validações de campo, limites de caracteres, e fluxos de erro.
## Test Scenarios
### 1. Cenários Positivos (Happy Path)
Seed: e2e/seed.spec.ts
#### 1.1. CT001 - Fluxo de Sucesso Completo com Dados Válidos
File: tests/debt-payment/happy-path/CT001-complete-flow-success.spec.ts
Steps:
• Navegar para https://paytolls.vialivre.pt/portalweb/
- expect: Página inicial carregada com sucesso
- expect: Banner de cookies exibido
• Clicar em 'Aceitar cookies'
- expect: Banner de cookies removido
- expect: Navegação liberada
• Clicar na opção 'Pagamento de dívida total'
- expect: Formulário de pesquisa de dívida exibido
- expect: Todos os campos relevantes visíveis
- expect: Botão PESQUISAR inicialmente desabilitado
• Preencher campo 'Matrícula' com formato válido português (ex: '7395UE')
- expect: Campo aceita entrada
- expect: Não há mensagem de erro
• Preencher 'Data / hora de início' com data de 1 mês atrás (ex: 27/01/2026 00:00:00)
- expect: Date picker funciona corretamente
- expect: Data formatada automaticamente
• Preencher 'Data / hora de fim' com data de ontem (ex: 26/02/2026 23:59:59)
- expect: Data preenchida corretamente
- expect: Período válido estabelecido
• Preencher campo 'Nome' com nome válido (ex: 'João')
- expect: Campo aceita caracteres alfabéticos
• Preencher campo 'Apelidos' com sobrenome válido (ex: 'Silva')
- expect: Campo aceita caracteres alfabéticos
• Preencher campo 'NIF' com NIF português válido (ex: '295325550')
- expect: Campo aceita números válidos
- expect: Algoritmo de validação aceita NIF
• Preencher campo 'Email' com endereço válido (ex: 'teste@gmail.com')
- expect: Campo aceita formato de email válido
- expect: Validação em tempo real funciona
• Preencher campo 'Morada' com endereço válido (ex: 'Rua João Senhor Neto, 1')
- expect: Campo aceita texto completo da morada
• Preencher campo 'Código Postal' com código português válido (ex: '1000-000')
- expect: Campo aceita formato português de código postal
• Preencher campo 'Localidade' com cidade válida (ex: 'Lisboa')
- expect: Campo aceita nome da cidade
• Selecionar 'Portugal' no dropdown 'País'
- expect: Portugal selecionado corretamente
• Marcar checkbox 1 'Política de Privacidade'
- expect: Checkbox marcado
- expect: Primeiro termo aceito
• Marcar checkbox 2 'Declaro, na qualidade de titular dos dados'
- expect: Checkbox marcado
- expect: Segundo termo aceito
• Marcar checkbox 3 'Autorizo que a Vialivre...'
- expect: Checkbox marcado
- expect: Terceiro termo aceito
- expect: Botão PESQUISAR habilitado
• Clicar no botão 'PESQUISAR'
- expect: Formulário submetido
- expect: Tela de confirmação de email exibida
- expect: Mensagem: 'Por favor, verifique a sua caixa de correio eletrónico. Enviamos um e-mail para: teste@gmail.com'
- expect: Orientação sobre spam exibida
- expect: Botão VOLTAR visível
#### 1.2. CT002 - Teste com Diferentes Formatos de Matrícula Válidos
File: tests/debt-payment/happy-path/CT002-license-plate-variations.spec.ts
Steps:
• Testar matrícula formato antigo português (AA-00-00)
- expect: Sistema aceita formato antigo
• Testar matrícula formato novo português (00-AA-00)
- expect: Sistema aceita formato novo
• Testar matrícula formato especial (0000UE)
- expect: Sistema aceita formato especial (ex: comercial)
### 2. Cenários Negativos - Validações de Campos Obrigatórios
Seed: e2e/seed.spec.ts
#### 2.1. CT003 - Validação de Campos Obrigatórios Vazios
File: tests/debt-payment/negative/CT003-required-fields-validation.spec.ts
Steps:
• Acessar formulário e tentar submeter sem preencher campos
- expect: Botão PESQUISAR permanece desabilitado
• Preencher apenas matrícula e tentar submeter
- expect: Botão PESQUISAR permanece desabilitado
• Preencher campos obrigatórios um por um e verificar estado do botão
- expect: Botão só é habilitado após todos os campos obrigatórios
- expect: Campos obrigatórios: Matrícula, Data início, Data fim, Nome, Apelidos, NIF, Email, Morada, Código Postal, Localidade, País, todas as 3 checkboxes
#### 2.2. CT004 - Validação de Email Inválido
File: tests/debt-payment/negative/CT004-invalid-email-validation.spec.ts
Steps:
• Inserir email sem @ (ex: 'emailinvalido')
- expect: Mensagem de erro: 'Por favor inserir um email válido.'
• Inserir email com @ mas sem domínio (ex: 'usuario@')
- expect: Mensagem de erro de validação exibida
• Inserir email com espaços (ex: 'user @email.com')
- expect: Mensagem de erro de validação exibida
• Inserir email sem extensão (ex: 'user@domain')
- expect: Validação de formato deve falhar
#### 2.3. CT005 - Validação de NIF Inválido
File: tests/debt-payment/negative/CT005-invalid-nif-validation.spec.ts
Steps:
• Inserir NIF com menos de 9 dígitos (ex: '12345')
- expect: Sistema deve rejeitar ou mostrar erro
• Inserir NIF com mais de 9 dígitos (ex: '1234567890')
- expect: Campo deve limitar entrada ou mostrar erro
• Inserir NIF com caracteres alfabéticos (ex: 'ABC123456')
- expect: Campo deve rejeitar caracteres não numéricos
• Inserir NIF com dígito verificador inválido (ex: '123456789')
- expect: Sistema deve validar algoritmo do NIF português
#### 2.4. CT006 - Validação de Datas Inválidas
File: tests/debt-payment/negative/CT006-invalid-dates-validation.spec.ts
Steps:
• Selecionar data de fim anterior à data de início
- expect: Sistema deve mostrar erro de período inválido
• Inserir datas futuras
- expect: Sistema deve validar se aceita datas futuras
• Inserir datas muito antigas (mais de 1 ano)
- expect: Verificar se há limite temporal para consultas
• Tentar inserir formatos de data incorretos manualmente
- expect: Date picker deve impedir formatos inválidos
### 3. Cenários de Limite de Caracteres
Seed: e2e/seed.spec.ts
#### 3.1. CT007 - Teste de Limites de Caracteres em Campos de Texto
File: tests/debt-payment/limits/CT007-character-limits.spec.ts
Steps:
• Testar campo Matrícula com string muito longa (ex: 20 caracteres)
- expect: Campo deve limitar entrada (observado limite aproximado de 12 caracteres)
• Testar campo Nome com 1 caractere
- expect: Verificar se aceita nomes muito curtos
• Testar campo Nome com string muito longa (ex: 255 caracteres)
- expect: Verificar limite máximo do campo Nome
• Testar campo Apelidos com string muito longa
- expect: Verificar limite máximo do campo Apelidos
• Testar campo Morada com endereço muito longo
- expect: Verificar limite máximo do campo Morada
• Testar campo Localidade com nome muito longo
- expect: Verificar limite máximo do campo Localidade
• Testar campo Email com endereço muito longo (mas válido)
- expect: Verificar se aceita emails longos mas válidos
#### 3.2. CT008 - Caracteres Especiais e Encoding
File: tests/debt-payment/limits/CT008-special-characters.spec.ts
Steps:
• Inserir caracteres acentuados em campos de nome (ex: José, Conceição)
- expect: Sistema deve aceitar caracteres portugueses
• Inserir símbolos especiais na morada (ex: Rua 25 de Abril, nº 123 - 2º Andar)
- expect: Campo deve aceitar caracteres comuns em endereços
• Testar emojis ou caracteres unicode nos campos de texto
- expect: Verificar como sistema lida com caracteres não padrão
• Inserir HTML/JavaScript nos campos (teste de XSS básico)
- expect: Sistema deve sanitizar entrada e não executar código
### 4. Cenários de Interface e Usabilidade
Seed: e2e/seed.spec.ts
#### 4.1. CT009 - Teste de Navegação e Controles de Interface
File: tests/debt-payment/ui/CT009-navigation-controls.spec.ts
Steps:
• Testar botão VOLTAR na página de busca
- expect: Retorna à página inicial
• Testar botão VOLTAR na página de confirmação de email
- expect: Retorna ao formulário de pesquisa
• Testar navegação com Tab entre campos
- expect: Ordem de tabulação lógica e acessível
• Testar date picker - navegação entre meses/anos
- expect: Date picker funciona corretamente
- expect: Botões Anterior/Próximo funcionam
- expect: Dropdowns de mês/ano funcionam
• Testar fechamento do date picker
- expect: Botão Fechar funciona
- expect: Click fora do date picker fecha
#### 4.2. CT010 - Teste de Responsividade e Diferentes Dispositivos
File: tests/debt-payment/ui/CT010-responsive-design.spec.ts
Steps:
• Acessar formulário em dispositivo móvel
- expect: Layout adapta-se ao tamanho da tela
- expect: Campos permanecem usáveis
• Testar date picker em tela pequena
- expect: Date picker permanece funcional em dispositivos móveis
• Verificar scroll e visibilidade de todos os elementos
- expect: Todos os campos e botões acessíveis
- expect: Não há elementos cortados
### 5. Cenários de Segurança e Performance
Seed: e2e/seed.spec.ts
#### 5.1. CT011 - Testes de Segurança Básicos
File: tests/debt-payment/security/CT011-security-tests.spec.ts
Steps:
• Verificar se formulário usa HTTPS
- expect: Conexão segura estabelecida
• Testar submissão múltipla do formulário
- expect: Sistema deve prevenir submissões múltiplas
• Verificar se dados sensíveis aparecem nos logs do console
- expect: NIF e email não devem aparecer em logs
• Testar timeout de sessão
- expect: Verificar se há timeout de inatividade


