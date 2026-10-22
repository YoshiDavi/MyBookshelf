import { normalizeIsbn, formatIsbn } from "../src/lib/isbn";
import { resolveBookByIsbn } from "../src/lib/book-providers";

async function main() {
  const raw = process.argv[2];

  if (!raw) {
    console.error("Uso: npx tsx scripts/test-isbn.ts 9788535902778");
    process.exit(1);
  }

  const normalized = normalizeIsbn(raw);

  if (!normalized) {
    console.error(`❌ ISBN inválido: ${raw}`);
    process.exit(1);
  }

  console.log("✅ ISBN normalizado:", normalized);
  if (normalized.isbn10) {
    console.log("   ISBN-10:", normalized.isbn10);
  }
  console.log("   Formatado:", formatIsbn(normalized.isbn13));
  console.log("\n🔎 Buscando nas bases públicas...\n");

  const book = await resolveBookByIsbn(normalized.isbn13);

  if (!book) {
    console.error("❌ Livro não encontrado em nenhuma base.");
    process.exit(1);
  }

  console.log("✅ Livro encontrado:");
  console.log(JSON.stringify(book, null, 2));
}

main().catch((err) => {
  console.error("❌ Erro inesperado:", err);
  process.exit(1);
});