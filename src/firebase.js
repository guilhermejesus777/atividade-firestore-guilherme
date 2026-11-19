import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";
import dotenv from "dotenv";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Carrega atividade-firestore/.env, se existir (as variáveis já definidas
// no ambiente têm prioridade).
dotenv.config({ path: path.join(RAIZ, ".env"), quiet: true });

export const COLECAO = process.env.FIRESTORE_COLLECTION?.trim() || "alunos";

let app = null;
let banco = null;

function validarContaDeServico(json, origem) {
  const obrigatorios = ["project_id", "client_email", "private_key"];
  const faltando = obrigatorios.filter((campo) => !json?.[campo]);

  if (faltando.length > 0) {
    throw new Error(
      `A conta de serviço em ${origem} está incompleta. Campos ausentes: ${faltando.join(", ")}.`
    );
  }
  if (!String(json.private_key).includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      `A chave privada em ${origem} parece inválida. Gere o JSON novamente no console do Firebase.`
    );
  }

  return json;
}

function criarConfiguracao() {
  // Permite testar sem uma conta real usando o emulador local do Firestore.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID?.trim() || "demo-atividade",
    };
  }

  const inline = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (inline) {
    let json;
    try {
      json = JSON.parse(inline);
    } catch {
      throw new Error(
        "A variável FIREBASE_SERVICE_ACCOUNT não contém um JSON válido."
      );
    }
    return {
      credential: admin.credential.cert(
        validarContaDeServico(json, "FIREBASE_SERVICE_ACCOUNT")
      ),
    };
  }

  const caminho = path.resolve(
    RAIZ,
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() || "serviceAccountKey.json"
  );

  if (fs.existsSync(caminho)) {
    let json;
    try {
      json = JSON.parse(fs.readFileSync(caminho, "utf8"));
    } catch {
      throw new Error(`O arquivo ${caminho} não é um JSON válido.`);
    }
    return {
      credential: admin.credential.cert(validarContaDeServico(json, caminho)),
    };
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return { credential: admin.credential.applicationDefault() };
  }

  throw new Error(
    [
      "Conta de serviço não encontrada.",
      "",
      "Coloque o arquivo serviceAccountKey.json na pasta atividade-firestore/",
      "ou defina FIREBASE_SERVICE_ACCOUNT_PATH no arquivo .env.",
      "",
      "Como obter o arquivo:",
      "  1. Abra https://console.firebase.google.com e escolha o projeto;",
      "  2. Configurações do projeto > Contas de serviço;",
      "  3. Clique em Gerar nova chave privada e salve o JSON como",
      "     atividade-firestore/serviceAccountKey.json.",
      "",
      "Atenção: esse arquivo dá acesso total ao Firebase. Ele já está no",
      ".gitignore e NUNCA deve ser publicado no GitHub.",
    ].join("\n")
  );
}

/**
 * Inicializa o Firebase Admin SDK na primeira chamada e devolve o Firestore.
 */
export function obterDb() {
  if (!banco) {
    app = admin.apps.length > 0 ? admin.app() : admin.initializeApp(criarConfiguracao());
    banco = admin.firestore(app);
    banco.settings({ ignoreUndefinedProperties: true });
  }

  return banco;
}
