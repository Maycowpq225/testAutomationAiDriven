Feature: Pagamento de dívida total no portalweb Vialivre

  O usuário pode consultar e pagar a dívida total de portagens através do formulário online, com validações de campos, limites de caracteres, controles de interface, responsividade e segurança.

  @happy-path
  Scenario: Fluxo completo de pagamento de dívida total com dados válidos
    Given o usuário acessa a página inicial do portalweb Vialivre em "https://paytolls.vialivre.pt/portalweb/"
    When o usuário aceita o banner de cookies
    And o usuário clica na opção "Pagamento de dívida total"
    And o usuário preenche o campo "Matrícula" com "7395UE"
    And o usuário preenche o campo "Data / hora de início" com "27/01/2026 00:00:00"
    And o usuário preenche o campo "Data / hora de fim" com "26/02/2026 23:59:59"
    And o usuário preenche o campo "Nome" com "João"
    And o usuário preenche o campo "Apelidos" com "Silva"
    And o usuário preenche o campo "NIF" com "295325550"
    And o usuário preenche o campo "Email" com "teste@gmail.com"
    And o usuário preenche o campo "Morada" com "Rua João Senhor Neto, 1"
    And o usuário preenche o campo "Código Postal" com "1000-000"
    And o usuário preenche o campo "Localidade" com "Lisboa"
    And o usuário seleciona "Portugal" no campo "País"
    And o usuário marca o checkbox "Política de Privacidade"
    And o usuário marca o checkbox "Declaro, na qualidade de titular dos dados"
    And o usuário marca o checkbox "Autorizo que a Vialivre..."
    And o usuário clica no botão "PESQUISAR"
    Then o sistema exibe a tela de confirmação de email com a mensagem "Por favor, verifique a sua caixa de correio eletrónico. Enviamos um e-mail para: teste@gmail.com"
    And o sistema exibe orientação sobre spam
    And o botão "VOLTAR" está visível

  @happy-path
  Scenario Outline: Aceitar diferentes formatos válidos de matrícula
    Given o usuário acessa a página inicial do portalweb Vialivre em "https://paytolls.vialivre.pt/portalweb/"
    When o usuário clica na opção "Pagamento de dívida total"
    And o usuário preenche o campo "Matrícula" com "<Matricula>"
    Then o sistema aceita o formato informado e não exibe mensagem de erro
    Examples:
      | Matricula  |
      | AA-00-00   |
      | 00-AA-00   |
      | 0000UE     |

  @negative
  Scenario: Validação de campos obrigatórios vazios
    Given o usuário acessa a página inicial do portalweb Vialivre em "https://paytolls.vialivre.pt/portalweb/"
    When o usuário clica na opção "Pagamento de dívida total"
    And o usuário não preenche nenhum campo do formulário
    Then o botão "PESQUISAR" permanece desabilitado

  @negative
  Scenario: Validação de campos obrigatórios preenchidos parcialmente
    Given o usuário acessa a página inicial do portalweb Vialivre em "https://paytolls.vialivre.pt/portalweb/"
    When o usuário clica na opção "Pagamento de dívida total"
    And o usuário preenche apenas o campo "Matrícula" com "7395UE"
    Then o botão "PESQUISAR" permanece desabilitado

  @negative
  Scenario Outline: Validação de email inválido
    Given o usuário acessa a página inicial do portalweb Vialivre em "https://paytolls.vialivre.pt/portalweb/"
    When o usuário clica na opção "Pagamento de dívida total"
    And o usuário preenche o campo "Email" com "<Email>"
    Then o sistema exibe a mensagem de erro "Por favor inserir um email válido."
    Examples:
      | Email            |
      | emailinvalido    |
      | usuario@         |
      | user @email.com  |
      | user@domain      |

  @negative
  Scenario Outline: Validação de NIF inválido
    Given o usuário acessa a página inicial do portalweb Vialivre em "https://paytolls.vialivre.pt/portalweb/"
    When o usuário clica na opção "Pagamento de dívida total"
    And o usuário preenche o campo "NIF" com "<NIF>"
    Then o sistema exibe mensagem de erro de validação de NIF
    Examples:
      | NIF         |
      | 12345       |
      | 1234567890  |
      | ABC123456   |
      | 123456789   |

  @negative
  Scenario: Validação de datas inválidas - data de fim anterior à data de início
    Given o usuário acessa a página inicial do portalweb Vialivre em "https://paytolls.vialivre.pt/portalweb/"
    When o usuário clica na opção "Pagamento de dívida total"
    And o usuário preenche o campo "Data / hora de início" com "26/02/2026 23:59:59"
    And o usuário preenche o campo "Data / hora de fim" com "27/01/2026 00:00:00"
    Then o sistema exibe mensagem de erro de período inválido

  @edge-case
  Scenario Outline: Validação de datas fora do intervalo permitido
    Given o usuário acessa a página inicial do portalweb Vialivre em "https://paytolls.vialivre.pt/portalweb/"
    When o usuário clica na opção "Pagamento de dívida total"
    And o usuário preenche o campo "Data / hora de início" com "<DataInicio>"
    And o usuário preenche o campo "Data / hora de fim" com "<DataFim>"
    Then o sistema valida o intervalo e exibe mensagem de erro se fora do permitido
    Examples:
      | DataInicio           | DataFim              |
      | 01/01/2025 00:00:00 | 01/01/2025 23:59:59  | # data muito antiga (>1 ano)
      | 01/03/2027 00:00:00 | 01/03/2027 23:59:59  | # data futura

  @negative
  Scenario: Validação de formatos de data incorretos
    Given o usuário acessa a página inicial do portalweb Vialivre em "https://paytolls.vialivre.pt/portalweb/"
    When o usuário clica na opção "Pagamento de dívida total"
    And o usuário tenta inserir manualmente um formato de data inválido no campo "Data / hora de início"
    Then o sistema impede a entrada e exibe mensagem de erro de formato de data

  @edge-case
  Scenario Outline: Limite de caracteres nos campos de texto
    Given o usuário acessa a página inicial do portalweb Vialivre em "https://paytolls.vialivre.pt/portalweb/"
    When o usuário clica na opção "Pagamento de dívida total"
    And o usuário preenche o campo "<Campo>" com "<Valor>"
    Then o sistema aceita ou limita a entrada conforme o limite do campo
    Examples:
      | Campo         | Valor                                                                 |
      | Matrícula     | 12345678901234567890                                                  |
      | Nome          | J                                                                     |