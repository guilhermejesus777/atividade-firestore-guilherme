/**
 * Erros de validação dos dados digitados pelo usuário.
 * A mensagem é exibida diretamente no terminal.
 */
export class ErroValidacao extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = "ErroValidacao";
  }
}

/**
 * Aluno não encontrado no Firestore.
 */
export class ErroNaoEncontrado extends Error {
  constructor(mensagem = "Aluno não encontrado.") {
    super(mensagem);
    this.name = "ErroNaoEncontrado";
  }
}

/**
 * Traduz erros do Firebase/Node para mensagens amigáveis.
 */
export function mensagemDeErro(erro) {
  if (erro instanceof ErroValidacao || erro instanceof ErroNaoEncontrado) {
    return erro.message;
  }

  switch (erro?.code) {
    case 3:
      return "Os dados enviados são inválidos para o Firestore.";
    case 5:
      return "Aluno não encontrado. Ele pode ter sido excluído por outra pessoa.";
    case 6:
      return "Já existe um documento com esse identificador.";
    case 7:
      return "Sem permissão para acessar o Firestore. Verifique se a API Cloud Firestore está ativada no projeto e se a conta de serviço tem o papel de proprietário/editor.";
    case 9:
      return "Limite de operações do Firestore atingido. Tente novamente em alguns instantes.";
    case 14:
      return "Não foi possível conectar ao Firestore. Verifique a internet, o project_id da chave e se o banco foi criado no console do Firebase.";
    case 16:
      return "Credenciais inválidas (UNAUTHENTICATED). Gere uma nova chave em Configurações do projeto > Contas de serviço.";
    default:
      return erro?.message || String(erro);
  }
}
