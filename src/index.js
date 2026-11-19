import { iniciarMenu } from "./menu.js";
import { COLECAO, obterDb } from "./firebase.js";
import { mensagemDeErro } from "./erros.js";

async function main() {
  console.log("Conectando ao Firebase Cloud Firestore...");

  const db = obterDb();

  // Faz uma leitura simples para confirmar credenciais e conexão
  // antes de abrir o menu.
  await db.collection(COLECAO).limit(1).get();

  console.log(`Conexão estabelecida. Coleção: "${COLECAO}".`);

  await iniciarMenu();
}

main().catch((erro) => {
  console.error(`\nErro: ${mensagemDeErro(erro)}`);
  process.exitCode = 1;
});
