import type { NormalizedBook } from "./types";

export async function fetchBrasilApi(
  isbn13: string
): Promise<NormalizedBook | null> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/isbn/v1/${isbn13}`, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!res.ok) return null;

    const data = await res.json();

    return {
      isbn13,
      title: data.title ?? "Sem título",
      subtitle: data.subtitle,
      authors: Array.isArray(data.authors) ? data.authors : [],
      publisher: data.publisher,
      publishedAt: data.year ? parseInt(String(data.year), 10) || undefined : undefined,
      pages: data.page_count,
      language: data.language,
      coverUrl: data.cover_url,
      description: data.synopsis,
      source: "brasilapi",
    };
  } catch {
    return null;
  }
}