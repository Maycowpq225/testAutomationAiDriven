Feature: Pagamento de dívida total no portalweb PAYTOLLS

  @happy-path
  Scenario: Submeter pesquisa de dívida total com dados válidos
    Given o utilizador acede ao portalweb PAYTOLLS em "https://paytolls.vialivre.pt/portalweb/" e abre a opção "Pagamento de dívida total"
    And o utilizador aceita cookies e visualiza o formulário com o botão "PESQUISAR" desativado
    When o utilizador preenche matrícula válida "7395UE", período válido, dados pessoais válidos, país "Portugal" e aceita as 3 declarações obrigatórias
    Then o botão "PESQUISAR" fica ativado e ao submeter é apresentada a confirmação de envio de e-mail para o endereço informado

  @happy-path @edge-case
  Scenario Outline: Aceitar formatos válidos de matrícula
    Given o utilizador acede ao formulário de "Pagamento de dívida total"
    And os restantes campos obrigatórios estão preenchidos com dados válidos e as 3 declarações obrigatórias estão aceites
    When o utilizador preenche o campo "Matrícula" com "<matricula>" e submete a pesquisa
    Then o sistema aceita o formato informado sem erro de validação da matrícula

    Examples:
      | matricula |
      | AA-00-00  |
      | 00-AA-00  |
      | 0000UE    |

  @negative
  Scenario: Manter pesquisa bloqueada quando há campos obrigatórios em falta
    Given o utilizador acede ao formulário de "Pagamento de dívida total"
    And nenhum campo obrigatório está preenchido e nenhuma declaração obrigatória está aceite
    When o utilizador tenta prosseguir preenchendo apenas parte dos campos obrigatórios
    Then o botão "PESQUISAR" permanece desativado até todos os campos obrigatórios e as 3 declarações estarem válidos

  @negative
  Scenario Outline: Rejeitar formatos inválidos de email
    Given o utilizador acede ao formulário de "Pagamento de dívida total"
    And todos os restantes campos obrigatórios e declarações estão válidos
    When o utilizador preenche o campo "Email" com "<email>"
    Then o sistema apresenta erro de validação de email e impede a submissão

    Examples:
      | email           |
      | emailinvalido   |
      | usuario@        |
      | user @email.com |
      | user@domain     |

  @negative @edge-case
  Scenario Outline: Rejeitar NIF inválido
    Given o utilizador acede ao formulário de "Pagamento de dívida total"
    And todos os restantes campos obrigatórios e declarações estão válidos
    When o utilizador preenche o campo "NIF" com "<nif>"
    Then o sistema rejeita o NIF por formato, tamanho ou validação de dígito de controlo e impede a submissão

    Examples:
      | nif        |
      | 12345      |
      | 1234567890 |
      | ABC123456  |
      | 123456789  |

  @negative
  Scenario: Rejeitar período com data de fim anterior à data de início
    Given o utilizador acede ao formulário de "Pagamento de dívida total"
    And o utilizador preenche os restantes campos obrigatórios com dados válidos
    When o utilizador informa uma data de fim anterior à data de início
    Then o sistema apresenta erro de período inválido e bloqueia a pesquisa

  @edge-case
  Scenario Outline: Validar limites e formatos em campos textuais
    Given o utilizador acede ao formulário de "Pagamento de dívida total"
    And os restantes campos obrigatórios e declarações estão válidos
    When o utilizador preenche o campo "<campo>" com "<valor>"
    Then o sistema aplica a validação esperada para tamanho e formato sem comprometer a integridade do formulário

    Examples:
      | campo       | valor                                                                 |
      | Matrícula   | ABCDEFGHIJKLMNOPQRST                                                  |
      | Nome        | A                                                                     |
      | Nome        | AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA |
      | Apelidos    | BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB |
      | Morada      | Rua Muito Longa, Bloco 999, Fração ZZZ, Urbanização Exemplo, Lote 123 |
      | Localidade  | LocalidadeComNomeExcessivamenteLongoParaTesteDeLimite                |
      | Email       | utilizador.comprido+tag+teste@subdominio.exemplo.pt                  |

  @edge-case
  Scenario Outline: Tratar caracteres especiais e unicode com segurança
    Given o utilizador acede ao formulário de "Pagamento de dívida total"
    And os restantes campos obrigatórios e declarações estão válidos
    When o utilizador preenche o campo "<campo>" com "<valor>"
    Then o sistema preserva entradas legítimas e neutraliza conteúdo potencialmente perigoso sem executar código

    Examples:
      | campo   | valor                                |
      | Nome    | José                                 |
      | Apelidos| Conceição                            |
      | Morada  | Rua 25 de Abril, nº 123 - 2º Andar   |
      | Nome    | 😀Teste                              |
      | Morada  | <script>alert('xss')</script>        |

  @ui
  Scenario: Navegar com controles de interface sem perda de contexto
    Given o utilizador acede ao fluxo de "Pagamento de dívida total" e interage com date picker e navegação por teclado
    And o formulário contém dados preenchidos válidos
    When o utilizador usa tabulação entre campos, fecha o date picker e utiliza os botões "VOLTAR" em cada ecrã
    Then a navegação mantém comportamento consistente e regressa ao ecrã esperado sem bloquear o fluxo

  @ui
  Scenario: Utilizar formulário em ecrã móvel mantendo usabilidade
    Given o utilizador acede ao fluxo de "Pagamento de dívida total" num dispositivo móvel
    And o formulário é apresentado no viewport reduzido
    When o utilizador interage com campos, date picker e ações principais de pesquisa
    Then os elementos permanecem visíveis e utilizáveis sem cortes críticos de conteúdo

  @security
  Scenario: Proteger submissão e dados sensíveis durante o fluxo
    Given o utilizador acede ao formulário de "Pagamento de dívida total" através de ligação segura HTTPS
    And o formulário está totalmente preenchido com dados válidos
    When o utilizador tenta submeter múltiplas vezes e inspeciona sinais básicos de exposição de dados no cliente
    Then o sistema previne submissões duplicadas e não expõe dados sensíveis desnecessários em mensagens visíveis ao utilizador
