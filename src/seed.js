import { cadastrarAluno, listarAlunos } from "./alunos.js";
import { COLECAO } from "./firebase.js";
import { mensagemDeErro } from "./erros.js";

// Dados fictícios apenas para demonstração e capturas de tela.
const ALUNOS_EXEMPLO = [
  {
    nome: "Ana Beatriz Souza Lima",
    turma: "1º Ano A",
    dataNascimento: "2009-03-14",
    ativo: true,
  },
  {
    nome: "Bruno Henrique Alves",
    turma: "1º Ano A",
    dataNascimento: "2008-11-02",
    ativo: true,
  },
  {
    nome: "Carla Menezes Ribeiro",
    turma: "2º Ano B",
    dataNascimento: "2009-06-21",
    ativo: false,
  },
  {
    nome: "Daniel Oliveira Santos",
    turma: "2º Ano B",
    dataNascimento: "2008-01-30",
    ativo: true,
  },
  {
    nome: "Eduarda Lima Ferreira",
    turma: "3º Ano A",
    dataNascimento: "2007-09-05",
    ativo: true,
  },
  {
    nome: "Felipe Andrade Costa",
    turma: "3º Ano A",
    dataNascimento: "2008-12-17",
    ativo: false,
  },
  {
    nome: "Gabriela Nunes Martins",
    turma: "1º Ano B",
    dataNascimento: "2009-04-09",
    ativo: true,
  },
  {
    nome: "Henrique Barbosa Dias",
    turma: "2º Ano A",
    dataNascimento: "2007-07-25",
    ativo: true,
  },
];

async function main() {
  const forcar = process.argv.includes("--forcar");
  const existentes = await listarAlunos();

  if (existentes.length > 0 && !forcar) {
    console.log(
      `A coleção "${COLECAO}" já possui ${existentes.length} aluno(s).`
    );
    console.log("Nada foi alterado. Para cadastrar mesmo assim, use:");
    console.log("  npm run seed -- --forcar");
    return;
  }

  console.log(`Cadastrando ${ALUNOS_EXEMPLO.length} alunos fictícios...\n`);

  for (const aluno of ALUNOS_EXEMPLO) {
    const criado = await cadastrarAluno(aluno);
    console.log(`  + ${criado.nome} (${criado.turma}) -> ${criado.id}`);
  }

  console.log("\nDados de exemplo cadastrados com sucesso.");
}

main().catch((erro) => {
  console.error(`\nErro: ${mensagemDeErro(erro)}`);
  process.exitCode = 1;
});
