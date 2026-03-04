Feature: Pagamento de dívida total no portalweb PAYTOLLS

@happy-path
Scenario: Fluxo completo de sucesso com dados válidos
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário preenche o campo "Matrícula" com "7395UE"
  And o usuário preenche "Data / hora de início" com "27/01/2026 00:00:00"
  And o usuário preenche "Data / hora de fim" com "26/02/2026 23:59:59"
  And o usuário preenche o campo "Nome" com "João"
  And o usuário preenche o campo "Apelidos" com "Silva"
  And o usuário preenche o campo "NIF" com "295325550"
  And o usuário preenche o campo "Email" com "teste@gmail.com"
  And o usuário preenche o campo "Morada" com "Rua João Senhor Neto, 1"
  And o usuário preenche o campo "Código Postal" com "1000-000"
  And o usuário preenche o campo "Localidade" com "Lisboa"
  And o usuário seleciona "Portugal" no dropdown "País"
  And o usuário marca a checkbox "Política de Privacidade"
  And o usuário marca a checkbox "Declaro, na qualidade de titular dos dados"
  And o usuário marca a checkbox "Autorizo que a Vialivre"
  And o usuário clica no botão "PESQUISAR"
  Then o sistema exibe mensagem "Por favor, verifique a sua caixa de correio eletrónico. Enviamos um e-mail para: teste@gmail.com"
  And o sistema apresenta orientação sobre caixa de spam
  And o botão "VOLTAR" está visível

@happy-path
Scenario Outline: Aceitar diferentes formatos válidos de matrícula
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário preenche o campo "Matrícula" com "<Matricula>"
  And o usuário preenche todos os campos obrigatórios com dados válidos
  And o usuário marca todas as checkboxes obrigatórias
  Then o botão "PESQUISAR" fica habilitado
  And o sistema permite prosseguir sem mensagem de erro
Examples:
  | Matricula |
  | AA-00-00  |
  | 00-AA-00  |
  | 7395UE    |

@negative
Scenario: Validação de campos obrigatórios vazios
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  Then o botão "PESQUISAR" está desabilitado
  And o sistema não permite submissão do formulário

@negative
Scenario Outline: Validação de email inválido
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário preenche o campo "Email" com "<EmailInvalido>"
  Then o sistema exibe uma mensagem de erro de validação
  And o botão "PESQUISAR" permanece desabilitado
Examples:
  | EmailInvalido    |
  | emailinvalido    |
  | usuario@         |
  | user @email.com  |
  | user@domain      |

@negative
Scenario Outline: Validação de NIF inválido
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário preenche o campo "NIF" com "<NIFInvalido>"
  Then o sistema exibe uma mensagem de erro de validação
  And o botão "PESQUISAR" permanece desabilitado
Examples:
  | NIFInvalido  |
  | 12345        |
  | 1234567890   |
  | ABC123456    |
  | 123456789    |

@negative
Scenario: Validação de período de datas inválido
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário preenche "Data / hora de início" com "01/03/2026 00:00:00"
  And o usuário preenche "Data / hora de fim" com "01/02/2026 23:59:59"
  Then o sistema exibe mensagem de erro de período inválido
  And o botão "PESQUISAR" permanece desabilitado

@edge-case
Scenario Outline: Teste de limites de caracteres em campos de texto
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário preenche o campo "<Campo>" com "<Valor>"
  Then o sistema <ResultadoEsperado>
Examples:
  | Campo      | Valor                              | ResultadoEsperado                    |
  | Matrícula  | ABCDEFGHIJKLMNOP1234567890        | limita entrada a aproximadamente 12 |
  | Nome       | J                                  | aceita nome com 1 caractere         |
  | Nome       | NomeExtremamenteLongoPara TesteLimite | limita entrada ao máximo permitido   |
  | Apelidos   | SobrenomeExtremamenteLongo Silva   | limita entrada ao máximo permitido   |

@edge-case
Scenario Outline: Caracteres especiais e encoding
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário preenche o campo "<Campo>" com "<Valor>"
  Then o sistema <ResultadoEsperado>
Examples:
  | Campo      | Valor                            | ResultadoEsperado                    |
  | Nome       | José                             | aceita caracteres acentuados        |
  | Apelidos   | Conceição                        | aceita caracteres portugueses       |
  | Morada     | Rua 25 de Abril, nº 123 - 2º    | aceita símbolos especiais comuns    |

@ui
Scenario: Navegação e controles de interface
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário clica no botão "VOLTAR"
  Then o sistema retorna à página inicial

@ui
Scenario: Teste de tabulação entre campos
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário navega pelos campos usando a tecla Tab
  Then o sistema mantém uma ordem lógica de tabulação
  And todos os campos e controles são acessíveis via teclado

@ui
Scenario: Teste de date picker
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário clica no campo "Data / hora de início"
  Then o date picker é exibido corretamente
  And o usuário pode navegar entre meses e anos
  And o usuário pode fechar o date picker

@security
Scenario: Validação de conexão segura
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  Then o sistema utiliza conexão HTTPS
  And a comunicação é estabelecida de forma segura

@security
Scenario: Prevenção de submissão múltipla
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário preenche todos os campos obrigatórios com dados válidos
  And o usuário marca todas as checkboxes obrigatórias
  And o usuário clica no botão "PESQUISAR" múltiplas vezes rapidamente
  Then o sistema previne submissões múltiplas
  And apenas uma requisição é processada

@security
Scenario Outline: Teste básico de sanitização de entrada
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário preenche o campo "<Campo>" com "<ValorMalicioso>"
  Then o sistema sanitiza a entrada
  And não executa código malicioso
Examples:
  | Campo | ValorMalicioso        |
  | Nome  | <script>alert(1)</script> |
  | Email | test@<script>evil</script>.com |

@negative
Scenario: Validação de checkboxes obrigatórias não marcadas
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário preenche todos os campos de texto com dados válidos
  And o usuário não marca nenhuma checkbox obrigatória
  Then o botão "PESQUISAR" permanece desabilitado
  And o sistema não permite submissão do formulário

@edge-case
Scenario: Teste com dados de código postal português
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário preenche o campo "Código Postal" com "1000-000"
  Then o sistema aceita o formato português de código postal
  And não exibe mensagem de erro para o campo

@ui
Scenario: Verificação de passos do wizard
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  Then o sistema exibe os 4 passos do processo
  And o passo atual "Pesquisa" está ativo
  And os passos "Selecionar", "Pagar" e "Confirmação" estão desabilitados

@negative
Scenario: Tentativa de submissão com país não selecionado
  Given o usuário acessa a página "https://paytolls.vialivre.pt/portalweb/"
  When o usuário aceita cookies
  And o usuário clica na opção "Pagamento de dívida total"
  And o usuário preenche todos os campos de texto com dados válidos
  And o usuário marca todas as checkboxes obrigatórias
  And o usuário não seleciona país no dropdown
  Then o botão "PESQUISAR" permanece desabilitado
  And o sistema não permite submissão do formulário
