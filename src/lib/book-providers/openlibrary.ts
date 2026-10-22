import type { NormalizedBook } from "./types";

export async function fetchOpenLibrary(
  isbn13: string
): Promise<NormalizedBook | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn13}&format=json&jscmd=data`,
      {
        headers: { "User-Agent": "minha-biblioteca/1.0 (contato@exemplo.com)" },
        next: { revalidate: 60 * 60 * 24 * 7 },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const entry = data[`ISBN:${isbn13}`];
    if (!entry) return null;

    const authors: string[] = Array.isArray(entry.authors)
      ? entry.authors
          .map((a: { name?: string }) => a?.name)
          .filter((n: string | undefined): n is string => Boolean(n))
      : [];

    return {
      isbn13,
      title: entry.title ?? "Sem título",
      subtitle: entry.subtitle,
      authors,
      publisher: entry.publishers?.[0]?.name,
      publishedAt: entry.publish_date
        ? parseInt(entry.publish_date, 10) || undefined
        : undefined,
      pages: entry.number_of_pages,
      language: entry.languages?.[0]?.key?.replace("/languages/", ""),
      coverUrl: entry.cover?.large ?? entry.cover?.medium ?? entry.cover?.small,
      description: entry.excerpts?.[0]?.text,
      source: "openlibrary",
    };
  } catch {
    return null;
  }
}