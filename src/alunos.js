import { COLECAO, obterDb } from "./firebase.js";
import { ErroNaoEncontrado } from "./erros.js";
import {
  validarAluno,
  validarDataNascimento,
  validarId,
  validarTurma,
} from "./validacao.js";

function colecao() {
  return obterDb().collection(COLECAO);
}

function documentoParaAluno(documento) {
  const dados = documento.data() ?? {};

  return {
    id: documento.id,
    nome: dados.nome ?? "",
    turma: dados.turma ?? "",
    dataNascimento: dados.dataNascimento ?? "",
    ativo: Boolean(dados.ativo),
  };
}

function ordenarPorNome(alunos) {
  return alunos.sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
  );
}

/**
 * CREATE: cadastra um aluno e devolve o documento criado (com id).
 */
export async function cadastrarAluno(dados) {
  const aluno = validarAluno(dados);
  const referencia = await colecao().add(aluno);

  return { id: referencia.id, ...aluno };
}

/**
 * READ: lista todos os alunos da coleção.
 */
export async function listarAlunos() {
  const resultado = await colecao().get();
  return ordenarPorNome(resultado.docs.map(documentoParaAluno));
}

/**
 * READ: busca um aluno pelo ID do documento.
 */
export async function buscarAluno(id) {
  const documento = await colecao().doc(validarId(id)).get();

  if (!documento.exists) {
    throw new ErroNaoEncontrado(`Nenhum aluno encontrado com o ID "${id}".`);
  }

  return documentoParaAluno(documento);
}

/**
 * UPDATE: atualiza os dados de um aluno existente.
 */
export async function atualizarAluno(id, dados) {
  const aluno = validarAluno(dados);
  const referencia = colecao().doc(validarId(id));

  await referencia.update(aluno);

  return { id: referencia.id, ...aluno };
}

/**
 * DELETE: exclui um aluno e devolve os dados de quem foi removido.
 */
export async function excluirAluno(id) {
  const aluno = await buscarAluno(id);

  await colecao().doc(aluno.id).delete();

  return aluno;
}

/**
 * Consulta pelo campo turma (igualdade).
 */
export async function consultarPorTurma(turma) {
  const turmaValidada = validarTurma(turma);
  const resultado = await colecao()
    .where("turma", "==", turmaValidada)
    .get();

  return ordenarPorNome(resultado.docs.map(documentoParaAluno));
}

/**
 * Consulta por uma data de nascimento exata (AAAA-MM-DD).
 */
export async function consultarPorDataNascimento(data) {
  const dataValidada = validarDataNascimento(data);
  const resultado = await colecao()
    .where("dataNascimento", "==", dataValidada)
    .get();

  return ordenarPorNome(resultado.docs.map(documentoParaAluno));
}

/**
 * Consulta por intervalo de datas de nascimento (inclusive).
 */
export async function consultarPorPeriodoNascimento(inicio, fim) {
  const inicioValidado = validarDataNascimento(inicio);
  const fimValidado = validarDataNascimento(fim);

  if (inicioValidado > fimValidado) {
    throw new Error("A data inicial não pode ser maior que a data final.");
  }

  const resultado = await colecao()
    .where("dataNascimento", ">=", inicioValidado)
    .where("dataNascimento", "<=", fimValidado)
    .get();

  return ordenarPorNome(resultado.docs.map(documentoParaAluno));
}

/**
 * Lista as turmas já cadastradas (sem repetir), para ajudar nas consultas.
 */
export async function listarTurmas() {
  const alunos = await listarAlunos();
  const turmas = new Set(alunos.map((aluno) => aluno.turma).filter(Boolean));

  return [...turmas].sort((a, b) =>
    a.localeCompare(b, "pt-BR", { sensitivity: "base" })
  );
}
