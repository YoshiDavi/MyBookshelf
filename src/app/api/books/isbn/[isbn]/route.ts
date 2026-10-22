import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeIsbn } from "@/lib/isbn";
import { resolveBookByIsbn } from "@/lib/book-providers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ isbn: string }> }
) {
  const { isbn: rawIsbn } = await params;

  const normalized = normalizeIsbn(rawIsbn);
  if (!normalized) {
    return NextResponse.json(
      { error: "ISBN inválido", isbn: rawIsbn },
      { status: 400 }
    );
  }

  const existing = await prisma.book.findUnique({
    where: { isbn13: normalized.isbn13 },
  });
  if (existing) {
    return NextResponse.json({ book: existing, cached: true });
  }

  const fetched = await resolveBookByIsbn(normalized.isbn13);
  if (!fetched) {
    return NextResponse.json(
      {
        error: "Livro não encontrado nas bases públicas",
        isbn: normalized.isbn13,
      },
      { status: 404 }
    );
  }

  const created = await prisma.book.create({
    data: {
      isbn13: fetched.isbn13,
      isbn10: fetched.isbn10 ?? normalized.isbn10,
      title: fetched.title,
      subtitle: fetched.subtitle,
      authors: fetched.authors,
      publisher: fetched.publisher,
      publishedAt: fetched.publishedAt,
      pages: fetched.pages,
      language: fetched.language,
      coverUrl: fetched.coverUrl,
      description: fetched.description,
      source: fetched.source,
    },
  });

  return NextResponse.json({ book: created, cached: false });
}