import { ErroValidacao } from "./erros.js";

const FORMATO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Remove espaços extras e valida o nome do aluno.
 */
export function validarNome(valor) {
  const nome = String(valor ?? "").trim().replace(/\s+/g, " ");

  if (nome.length < 3) {
    throw new ErroValidacao("O nome deve ter pelo menos 3 caracteres.");
  }
  if (nome.length > 120) {
    throw new ErroValidacao("O nome deve ter no máximo 120 caracteres.");
  }

  return nome;
}

/**
 * Valida a turma (string obrigatória).
 */
export function validarTurma(valor) {
  const turma = String(valor ?? "").trim().replace(/\s+/g, " ");

  if (!turma) {
    throw new ErroValidacao("A turma é obrigatória.");
  }
  if (turma.length > 60) {
    throw new ErroValidacao("A turma deve ter no máximo 60 caracteres.");
  }

  return turma;
}

/**
 * Valida a data no formato AAAA-MM-DD, incluindo datas inexistentes
 * (ex.: 2009-02-30) e datas no futuro.
 */
export function validarDataNascimento(valor) {
  const data = String(valor ?? "").trim();
  const partes = FORMATO_DATA.exec(data);

  if (!partes) {
    throw new ErroValidacao("Use o formato AAAA-MM-DD (ex.: 2009-03-14).");
  }

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const dataConvertida = new Date(Date.UTC(ano, mes - 1, dia));

  const dataExiste =
    dataConvertida.getUTCFullYear() === ano &&
    dataConvertida.getUTCMonth() === mes - 1 &&
    dataConvertida.getUTCDate() === dia;

  if (!dataExiste) {
    throw new ErroValidacao("Essa data não existe no calendário. Confira dia e mês.");
  }
  if (ano < 1900) {
    throw new ErroValidacao("Informe uma data de nascimento a partir de 1900.");
  }

  const hoje = new Date();
  const limite = Date.UTC(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );

  if (Date.UTC(ano, mes - 1, dia) > limite) {
    throw new ErroValidacao("A data de nascimento não pode estar no futuro.");
  }

  return data;
}

/**
 * Aceita s/n, sim/não, true/false, 1/0, ativo/inativo.
 */
export function validarAtivo(valor) {
  if (typeof valor === "boolean") {
    return valor;
  }

  const texto = String(valor ?? "").trim().toLowerCase();
  const verdadeiros = ["s", "sim", "true", "1", "ativo", "ativa"];
  const falsos = ["n", "nao", "não", "false", "0", "inativo", "inativa"];

  if (verdadeiros.includes(texto)) {
    return true;
  }
  if (falsos.includes(texto)) {
    return false;
  }

  throw new ErroValidacao("Responda com 's' (sim) ou 'n' (não).");
}

/**
 * Valida o identificador do documento no Firestore.
 */
export function validarId(valor) {
  const id = String(valor ?? "").trim();

  if (!id) {
    throw new ErroValidacao("Informe o ID do aluno.");
  }
  if (id.includes("/")) {
    throw new ErroValidacao("O ID não pode conter '/'.");
  }
  if (id.length > 1500) {
    throw new ErroValidacao("O ID informado é longo demais.");
  }

  return id;
}

/**
 * Valida o aluno completo no formato salvo na coleção.
 */
export function validarAluno(dados = {}) {
  return {
    nome: validarNome(dados.nome),
    turma: validarTurma(dados.turma),
    dataNascimento: validarDataNascimento(dados.dataNascimento),
    ativo: validarAtivo(dados.ativo),
  };
}
