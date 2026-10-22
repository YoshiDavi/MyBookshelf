/**
 * Normaliza e valida ISBN-10/ISBN-13.
 * Retorna { isbn13, isbn10? } quando válido; null se inválido.
 */
export function normalizeIsbn(
  raw: string
): { isbn13: string; isbn10?: string } | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[\s-]/g, "").toUpperCase();

  if (cleaned.length === 13) {
    if (!/^\d{13}$/.test(cleaned) || !isValidIsbn13(cleaned)) return null;
    return { isbn13: cleaned, isbn10: toIsbn10(cleaned) ?? undefined };
  }

  if (cleaned.length === 10) {
    if (!/^\d{9}[\dX]$/.test(cleaned) || !isValidIsbn10(cleaned)) return null;
    const isbn13 = toIsbn13(cleaned);
    return isbn13 ? { isbn13, isbn10: cleaned } : null;
  }

  return null;
}

function isValidIsbn10(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const c = isbn[i];
    const v = c === "X" ? 10 : Number(c);
    sum += v * (10 - i);
  }
  return sum % 11 === 0;
}

function isValidIsbn13(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const v = Number(isbn[i]);
    sum += i % 2 === 0 ? v : v * 3;
  }
  return sum % 10 === 0;
}

function toIsbn13(isbn10: string): string | null {
  const base = "978" + isbn10.slice(0, 9);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const v = Number(base[i]);
    sum += i % 2 === 0 ? v : v * 3;
  }
  const check = (10 - (sum % 10)) % 10;
  return base + check;
}

function toIsbn10(isbn13: string): string | null {
  if (!isbn13.startsWith("978")) return null; // 979 não tem conversão
  const core = isbn13.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(core[i]) * (10 - i);
  }
  const rest = 11 - (sum % 11);
  const check = rest === 10 ? "X" : rest === 11 ? "0" : String(rest);
  return core + check;
}

/** Formata para exibição: 978-85-359-0277-8 */
export function formatIsbn(isbn13: string): string {
  if (isbn13.length !== 13) return isbn13;
  return `${isbn13.slice(0, 3)}-${isbn13.slice(3, 5)}-${isbn13.slice(
    5,
    8
  )}-${isbn13.slice(8, 12)}-${isbn13.slice(12)}`;
}