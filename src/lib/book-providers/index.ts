import { fetchOpenLibrary } from "./openlibrary";
import { fetchGoogleBooks } from "./googlebooks";
import { fetchBrasilApi } from "./brasilapi";
import type { NormalizedBook } from "./types";

/**
 * Tenta Open Library → Google Books → BrasilAPI.
 * Retorna o primeiro que achar.
 */
export async function resolveBookByIsbn(
  isbn13: string
): Promise<NormalizedBook | null> {
  const providers = [
    { name: "openlibrary", fn: fetchOpenLibrary },
    { name: "googlebooks", fn: fetchGoogleBooks },
    { name: "brasilapi", fn: fetchBrasilApi },
  ];

  for (const { name, fn } of providers) {
    try {
      const result = await fn(isbn13);
      if (result && result.title && result.title !== "Sem título") {
        return result;
      }
      if (result) {
        console.log(`[isbn] ${name} retornou sem título para ${isbn13}`);
      }
    } catch (err) {
      console.error(`[isbn] erro em ${name}:`, err);
    }
  }

  return null;
}

export type { NormalizedBook };