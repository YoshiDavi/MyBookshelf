import type { NormalizedBook } from "./types";

export async function fetchGoogleBooks(
  isbn13: string
): Promise<NormalizedBook | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}`,
      { next: { revalidate: 60 * 60 * 24 * 7 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const item = data.items?.[0]?.volumeInfo;
    if (!item) return null;

    return {
      isbn13,
      title: item.title ?? "Sem título",
      subtitle: item.subtitle,
      authors: Array.isArray(item.authors) ? item.authors : [],
      publisher: item.publisher,
      publishedAt: item.publishedDate
        ? parseInt(item.publishedDate, 10) || undefined
        : undefined,
      pages: item.pageCount,
      language: item.language,
      coverUrl: item.imageLinks?.thumbnail?.replace("http://", "https://"),
      description: item.description,
      source: "googlebooks",
    };
  } catch {
    return null;
  }
}