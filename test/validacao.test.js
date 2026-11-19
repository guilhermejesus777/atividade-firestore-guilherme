import assert from "node:assert/strict";
import test from "node:test";

import { ErroValidacao } from "../src/erros.js";
import {
  validarAluno,
  validarAtivo,
  validarDataNascimento,
  validarId,
  validarNome,
  validarTurma,
} from "../src/validacao.js";

test("normaliza e valida o nome", () => {
  assert.equal(validarNome("  Ana   Beatriz  "), "Ana Beatriz");
  assert.throws(() => validarNome("Al"), ErroValidacao);
  assert.throws(() => validarNome(""), ErroValidacao);
});

test("valida a turma", () => {
  assert.equal(validarTurma("  1º Ano A "), "1º Ano A");
  assert.throws(() => validarTurma("   "), ErroValidacao);
});

test("aceita datas de nascimento válidas", () => {
  assert.equal(validarDataNascimento("2009-03-14"), "2009-03-14");
  assert.equal(validarDataNascimento("2008-02-29"), "2008-02-29");
});

test("rejeita datas em formato errado ou inexistentes", () => {
  assert.throws(() => validarDataNascimento("14/03/2009"), ErroValidacao);
  assert.throws(() => validarDataNascimento("2009-02-30"), ErroValidacao);
  assert.throws(() => validarDataNascimento("2009-13-01"), ErroValidacao);
  assert.throws(() => validarDataNascimento("2999-01-01"), ErroValidacao);
});

test("converte as formas de informar ativo", () => {
  assert.equal(validarAtivo("s"), true);
  assert.equal(validarAtivo("SIM"), true);
  assert.equal(validarAtivo("não"), false);
  assert.equal(validarAtivo("0"), false);
  assert.equal(validarAtivo(true), true);
  assert.throws(() => validarAtivo("talvez"), ErroValidacao);
});

test("valida o ID do documento", () => {
  assert.equal(validarId(" abc123 "), "abc123");
  assert.throws(() => validarId(""), ErroValidacao);
  assert.throws(() => validarId("a/b"), ErroValidacao);
});

test("valida o aluno completo", () => {
  assert.deepEqual(
    validarAluno({
      nome: "Ana Beatriz",
      turma: "1º Ano A",
      dataNascimento: "2009-03-14",
      ativo: "s",
    }),
    {
      nome: "Ana Beatriz",
      turma: "1º Ano A",
      dataNascimento: "2009-03-14",
      ativo: true,
    }
  );
});
