import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCached, setCached, getVersion } from "@/lib/cache";

const BOOK_SELECT = {
  id: true,
  isbn13: true,
  title: true,
  subtitle: true,
  authors: true,
  publisher: true,
  publishedAt: true,
  pages: true,
  coverUrl: true,
  description: true,
} as const;

const LIMIT = 20;
const TTL_SECONDS = 300;

async function byGenre(slug: string) {
  return prisma.book.findMany({
    where: {
      genres: { some: { genre: { slug } } },
    },
    select: BOOK_SELECT,
    take: LIMIT,
    orderBy: { createdAt: "desc" },
  });
}

export async function GET() {
  const cacheKey = `discover:v${getVersion()}`;
  const cached = getCached<{ shelves: unknown[] }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const [
    popular,
    ficcaoCientifica,
    fantasia,
    misterio,
    terror,
    romance,
    classicos,
    novidades,
  ] = await Promise.all([
    prisma.book.findMany({
      select: {
        ...BOOK_SELECT,
        _count: { select: { entries: true } },
      },
      orderBy: { entries: { _count: "desc" } },
      take: LIMIT,
    }),
    byGenre("ficcao-cientifica"),
    byGenre("fantasia"),
    byGenre("misterio"),
    byGenre("terror"),
    byGenre("romance"),
    prisma.book.findMany({
      where: { publishedAt: { lt: 1950 } },
      select: BOOK_SELECT,
      take: LIMIT,
      orderBy: { publishedAt: "asc" },
    }),
    prisma.book.findMany({
      where: { source: "openlibrary-import" },
      select: BOOK_SELECT,
      take: LIMIT,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const popularClean = popular.map(({ _count, ...book }) => book);

  const payload = {
    shelves: [
      { id: "popular", title: "Em alta", books: popularClean },
      { id: "ficcao-cientifica", title: "Ficção Científica", books: ficcaoCientifica },
      { id: "fantasia", title: "Fantasia", books: fantasia },
      { id: "misterio", title: "Mistério", books: misterio },
      { id: "terror", title: "Terror", books: terror },
      { id: "romance", title: "Romance", books: romance },
      { id: "classicos", title: "Clássicos", books: classicos },
      { id: "novidades", title: "Novidades", books: novidades },
    ],
  };

  setCached(cacheKey, payload, TTL_SECONDS);

  return NextResponse.json(payload);
}