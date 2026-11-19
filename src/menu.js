import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import {
  atualizarAluno,
  buscarAluno,
  cadastrarAluno,
  consultarPorDataNascimento,
  consultarPorPeriodoNascimento,
  consultarPorTurma,
  excluirAluno,
  listarAlunos,
  listarTurmas,
} from "./alunos.js";
import { ErroValidacao, mensagemDeErro } from "./erros.js";
import {
  validarAtivo,
  validarDataNascimento,
  validarId,
  validarNome,
  validarTurma,
} from "./validacao.js";

const LARGURA_NOME = 30;
const LARGURA_TURMA = 16;

function linha() {
  console.log("  " + "-".repeat(72));
}

function titulo(texto) {
  console.log(`\n=== ${texto} ===`);
}

function cortar(texto, limite) {
  const valor = String(texto ?? "");
  return valor.length > limite ? `${valor.slice(0, limite - 1)}…` : valor;
}

function simNao(valor) {
  return valor ? "sim" : "não";
}

function exibirAlunoDetalhado(aluno) {
  console.log(`  ID...............: ${aluno.id}`);
  console.log(`  Nome.............: ${aluno.nome}`);
  console.log(`  Turma............: ${aluno.turma}`);
  console.log(`  Data de nascimento: ${aluno.dataNascimento}`);
  console.log(`  Ativo............: ${simNao(aluno.ativo)}`);
}

function exibirTabela(alunos) {
  if (alunos.length === 0) {
    console.log("  Nenhum aluno encontrado.");
    return;
  }

  console.log(
    `  ${"#".padEnd(3)} ${"NOME".padEnd(LARGURA_NOME)}  ${"TURMA".padEnd(
      LARGURA_TURMA
    )}  ${"NASCIMENTO".padEnd(10)}  ATIVO`
  );
  linha();

  alunos.forEach((aluno, indice) => {
    console.log(
      `  ${String(indice + 1).padEnd(3)} ${cortar(aluno.nome, LARGURA_NOME).padEnd(
        LARGURA_NOME
      )}  ${cortar(aluno.turma, LARGURA_TURMA).padEnd(
        LARGURA_TURMA
      )}  ${aluno.dataNascimento.padEnd(10)}  ${simNao(aluno.ativo)}`
    );
    console.log(`      ID: ${aluno.id}`);
  });

  console.log(`\n  Total: ${alunos.length} aluno(s).`);
}

function exibirMenu() {
  console.log("\n" + "=".repeat(76));
  console.log("  CRUD DE ALUNOS - FIREBASE CLOUD FIRESTORE");
  console.log('  Coleção: "alunos" | Campos: nome, turma, dataNascimento, ativo');
  console.log("=".repeat(76));
  console.log("  1. Cadastrar aluno          (CREATE)");
  console.log("  2. Listar alunos            (READ)");
  console.log("  3. Buscar aluno por ID      (READ)");
  console.log("  4. Atualizar aluno          (UPDATE)");
  console.log("  5. Excluir aluno            (DELETE)");
  console.log("  6. Consultar por turma");
  console.log("  7. Consultar por data de nascimento");
  console.log("  0. Sair");
  console.log("=".repeat(76));
}

export async function iniciarMenu() {
  const rl = createInterface({ input, output });
  const perguntar = async (texto) => (await rl.question(texto)).trim();

  rl.on("SIGINT", () => {
    console.log("\n\nAté logo!");
    rl.close();
    process.exit(0);
  });

  async function lerCampo(rotulo, validador, padrao) {
    const sufixo = padrao === undefined ? "" : ` [${padrao}]`;

    while (true) {
      const digitado = await perguntar(`  ${rotulo}${sufixo}: `);
      const valor = digitado === "" && padrao !== undefined ? padrao : digitado;

      try {
        return validador(valor);
      } catch (erro) {
        if (erro instanceof ErroValidacao) {
          console.log(`  ! ${erro.message}`);
          continue;
        }
        throw erro;
      }
    }
  }

  async function confirmar(rotulo, padrao = false) {
    const resposta = (await perguntar(
      `  ${rotulo} (${padrao ? "S/n" : "s/N"}): `
    )).toLowerCase();

    if (resposta === "") {
      return padrao;
    }

    return ["s", "sim", "y", "yes"].includes(resposta);
  }

  async function escolherAluno(alunos, acao) {
    while (true) {
      const resposta = await perguntar(
        `\n  Número do aluno que deseja ${acao} (0 cancela): `
      );

      if (resposta === "" || resposta === "0") {
        return null;
      }

      const indice = Number(resposta);
      if (Number.isInteger(indice) && indice >= 1 && indice <= alunos.length) {
        return alunos[indice - 1];
      }

      const porId = alunos.find((aluno) => aluno.id === resposta);
      if (porId) {
        return porId;
      }

      console.log("  ! Escolha um número da lista ou cole o ID completo.");
    }
  }

  async function cadastrar() {
    titulo("Cadastrar aluno");

    const dados = {
      nome: await lerCampo("Nome", validarNome),
      turma: await lerCampo("Turma", validarTurma),
      dataNascimento: await lerCampo(
        "Data de nascimento (AAAA-MM-DD)",
        validarDataNascimento
      ),
      ativo: await lerCampo("Aluno ativo? (s/n)", validarAtivo, "s"),
    };

    const aluno = await cadastrarAluno(dados);

    console.log("\n  Aluno cadastrado com sucesso!");
    exibirAlunoDetalhado(aluno);
  }

  async function listar() {
    titulo("Listar alunos");
    exibirTabela(await listarAlunos());
  }

  async function buscar() {
    titulo("Buscar aluno por ID");

    const id = await lerCampo("ID do aluno", validarId);
    const aluno = await buscarAluno(id);

    console.log("\n  Aluno encontrado:");
    exibirAlunoDetalhado(aluno);
  }

  async function atualizar() {
    titulo("Atualizar aluno");

    const alunos = await listarAlunos();
    exibirTabela(alunos);

    if (alunos.length === 0) {
      return;
    }

    const aluno = await escolherAluno(alunos, "atualizar");
    if (!aluno) {
      console.log("  Operação cancelada.");
      return;
    }

    console.log(`\n  Atualizando: ${aluno.nome}`);
    console.log("  Pressione Enter para manter o valor atual.");

    const dados = {
      nome: await lerCampo("Nome", validarNome, aluno.nome),
      turma: await lerCampo("Turma", validarTurma, aluno.turma),
      dataNascimento: await lerCampo(
        "Data de nascimento (AAAA-MM-DD)",
        validarDataNascimento,
        aluno.dataNascimento
      ),
      ativo: await lerCampo(
        "Aluno ativo? (s/n)",
        validarAtivo,
        aluno.ativo ? "s" : "n"
      ),
    };

    const atualizado = await atualizarAluno(aluno.id, dados);

    console.log("\n  Aluno atualizado com sucesso!");
    exibirAlunoDetalhado(atualizado);
  }

  async function excluir() {
    titulo("Excluir aluno");

    const alunos = await listarAlunos();
    exibirTabela(alunos);

    if (alunos.length === 0) {
      return;
    }

    const aluno = await escolherAluno(alunos, "excluir");
    if (!aluno) {
      console.log("  Operação cancelada.");
      return;
    }

    console.log("\n  Aluno selecionado:");
    exibirAlunoDetalhado(aluno);

    const confirmado = await confirmar(
      `Excluir "${aluno.nome}" definitivamente?`,
      false
    );

    if (!confirmado) {
      console.log("  Exclusão cancelada.");
      return;
    }

    const removido = await excluirAluno(aluno.id);

    console.log(`\n  Aluno excluído com sucesso (ID: ${removido.id}).`);
  }

  async function consultarTurma() {
    titulo("Consultar por turma");

    const turmas = await listarTurmas();
    if (turmas.length === 0) {
      console.log("  Nenhum aluno cadastrado ainda.");
      return;
    }

    console.log(`  Turmas cadastradas: ${turmas.join(" | ")}`);

    const turma = await lerCampo("Turma", validarTurma);
    const encontrados = await consultarPorTurma(turma);

    console.log("");
    exibirTabela(encontrados);

    if (encontrados.length === 0) {
      const sugestao = turmas.find(
        (item) => item.toLowerCase() === turma.toLowerCase()
      );
      if (sugestao) {
        console.log(
          `  Dica: a turma cadastrada é "${sugestao}" (o Firestore diferencia maiúsculas de minúsculas).`
        );
      }
    }
  }

  async function consultarData() {
    titulo("Consultar por data de nascimento");
    console.log("  1. Data exata");
    console.log("  2. Intervalo (de/até)");
    console.log("  0. Voltar");

    const opcao = await perguntar("  Escolha uma opção: ");

    if (opcao === "1") {
      const data = await lerCampo(
        "Data de nascimento (AAAA-MM-DD)",
        validarDataNascimento
      );
      const encontrados = await consultarPorDataNascimento(data);

      console.log("");
      exibirTabela(encontrados);
      console.log(`\n  ${encontrados.length} aluno(s) nascido(s) em ${data}.`);
      return;
    }

    if (opcao === "2") {
      const inicio = await lerCampo(
        "Data inicial (AAAA-MM-DD)",
        validarDataNascimento
      );
      const fim = await lerCampo(
        "Data final (AAAA-MM-DD)",
        validarDataNascimento
      );

      if (inicio > fim) {
        throw new ErroValidacao(
          "A data inicial não pode ser maior que a data final."
        );
      }

      const encontrados = await consultarPorPeriodoNascimento(inicio, fim);

      console.log("");
      exibirTabela(encontrados);
      console.log(
        `\n  ${encontrados.length} aluno(s) nascido(s) entre ${inicio} e ${fim}.`
      );
      return;
    }

    if (opcao !== "0") {
      console.log("  Opção inválida.");
    }
  }

  try {
    let executando = true;

    while (executando) {
      exibirMenu();
      const opcao = await perguntar("  Escolha uma opção: ");

      try {
        switch (opcao) {
          case "1":
            await cadastrar();
            break;
          case "2":
            await listar();
            break;
          case "3":
            await buscar();
            break;
          case "4":
            await atualizar();
            break;
          case "5":
            await excluir();
            break;
          case "6":
            await consultarTurma();
            break;
          case "7":
            await consultarData();
            break;
          case "0":
            executando = false;
            continue;
          default:
            console.log("  Opção inválida. Escolha um número do menu.");
            continue;
        }
      } catch (erro) {
        console.error(`\n  Erro: ${mensagemDeErro(erro)}`);
      }

      await perguntar("\n  Pressione Enter para voltar ao menu...");
    }
  } finally {
    rl.close();
  }

  console.log("\nAté logo!");
}
