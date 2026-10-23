import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TARGET_TOTAL = 4000;
const PER_PAGE = 100;
const MAX_PAGES_PER_GENRE = 15;
const SLEEP_MS = 1000;

const GENRE_QUERIES: Array<{ subject: string; slug: string }> = [
  { subject: "science_fiction", slug: "ficcao-cientifica" },
  { subject: "fantasy", slug: "fantasia" },
  { subject: "mystery", slug: "misterio" },
  { subject: "horror", slug: "terror" },
  { subject: "thriller", slug: "suspense" },
  { subject: "romance", slug: "romance" },
  { subject: "historical_fiction", slug: "historia" },
  { subject: "biography", slug: "biografia" },
  { subject: "memoir", slug: "memorias" },
  { subject: "philosophy", slug: "filosofia" },
  { subject: "poetry", slug: "poesia" },
  { subject: "drama", slug: "drama" },
  { subject: "adventure", slug: "aventura" },
  { subject: "children's_fiction", slug: "infantojuvenil" },
  { subject: "young_adult_fiction", slug: "jovem-adulto" },
  { subject: "business", slug: "negocios" },
  { subject: "science", slug: "ciencia" },
  { subject: "self-help", slug: "autoajuda" },
  { subject: "fiction", slug: "ficcao" },
  { subject: "nonfiction", slug: "nao-ficcao" },
];

function extractIsbn(doc: any): { isbn13: string | null; isbn10: string | null } {
  const isbns: string[] = doc.isbn ?? [];
  let isbn13: string | null = null;
  let isbn10: string | null = null;
  for (const raw of isbns) {
    const cleaned = String(raw).replace(/[\s-]/g, "").toUpperCase();
    if (/^\d{13}$/.test(cleaned) && !isbn13) isbn13 = cleaned;
    else if (/^\d{9}[\dX]$/.test(cleaned) && !isbn10) isbn10 = cleaned;
    if (isbn13 && isbn10) break;
  }
  return { isbn13, isbn10 };
}

function extractOlid(doc: any): string | null {
  if (!doc.key) return null;
  const m = String(doc.key).match(/OL\d+W/);
  return m ? m[0] : null;
}

function extractCover(
  doc: any,
  isbn13: string | null,
  isbn10: string | null,
  olid: string | null
): string | null {
  if (isbn13) return `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`;
  if (isbn10) return `https://covers.openlibrary.org/b/isbn/${isbn10}-L.jpg`;
  if (doc.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
  if (olid) return `https://covers.openlibrary.org/b/olid/${olid}-L.jpg`;
  return null;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPage(subject: string, page: number): Promise<any[]> {
  const url = `https://openlibrary.org/search.json?subject=${encodeURIComponent(
    subject
  )}&limit=${PER_PAGE}&page=${page}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "minha-biblioteca-import/1.0" },
  });
  if (!res.ok) {
    console.warn(`   HTTP ${res.status} em ${subject} p.${page}`);
    return [];
  }
  const data = await res.json();
  return data.docs ?? [];
}

async function main() {
  console.log("Importacao de catalogo\n");
  console.log(`Meta: ${TARGET_TOTAL} livros\n`);

  const genres = await prisma.genre.findMany();
  const genreMap = new Map(genres.map((g) => [g.slug, g.id]));
  console.log(`${genres.length} generos carregados\n`);

  if (genres.length === 0) {
    console.error("ERRO: Nenhum genero no banco. Rode 'npx tsx prisma/seed.ts' primeiro.");
    process.exit(1);
  }

  let totalImported = 0;
  let totalSkipped = 0;
  let totalDuplicated = 0;
  const seenOlids = new Set<string>();
  const seenIsbns = new Set<string>();
  const seenTitleAuthors = new Set<string>();

  for (const query of GENRE_QUERIES) {
    if (totalImported >= TARGET_TOTAL) {
      console.log(`\nMeta de ${TARGET_TOTAL} livros atingida!`);
      break;
    }

    const genreId = genreMap.get(query.slug);
    if (!genreId) {
      console.warn(`Genero nao encontrado: ${query.slug}`);
      continue;
    }

    console.log(`\nBuscando "${query.subject}" (-> ${query.slug})...`);

    for (let page = 1; page <= MAX_PAGES_PER_GENRE; page++) {
      if (totalImported >= TARGET_TOTAL) break;

      const docs = await fetchPage(query.subject, page);
      if (docs.length === 0) {
        console.log(`   p.${page}: sem resultados`);
        break;
      }

      let importedThisPage = 0;

      for (const doc of docs) {
        if (totalImported >= TARGET_TOTAL) break;

        const title = doc.title;
        if (!title) {
          totalSkipped++;
          continue;
        }

        const olid = extractOlid(doc);
        const { isbn13, isbn10 } = extractIsbn(doc);

        let key: string;
        if (olid) key = `olid:${olid}`;
        else if (isbn13) key = `isbn:${isbn13}`;
        else if (isbn10) key = `isbn:${isbn10}`;
        else key = `ta:${title.toLowerCase()}|${(doc.author_name?.[0] ?? "").toLowerCase()}`;

        if (seenOlids.has(key) || seenIsbns.has(key) || seenTitleAuthors.has(key)) {
          totalDuplicated++;
          continue;
        }
        seenOlids.add(key);

        let existing = null;
        if (olid) {
          existing = await prisma.book.findUnique({ where: { olid }, select: { id: true } });
        }
        if (!existing && isbn13) {
          existing = await prisma.book.findUnique({ where: { isbn13 }, select: { id: true } });
        }
        if (!existing) {
          existing = await prisma.book.findFirst({
            where: {
              title,
              authors: { has: doc.author_name?.[0] ?? "" },
            },
            select: { id: true },
          });
        }
        if (existing) {
          totalDuplicated++;
          continue;
        }

        const coverUrl = extractCover(doc, isbn13, isbn10, olid);
        const authors: string[] = doc.author_name ?? [];

        try {
          const book = await prisma.book.create({
            data: {
              isbn13: isbn13 ?? undefined,
              isbn10: isbn10 ?? undefined,
              olid: olid ?? undefined,
              title,
              authors,
              publishedAt: doc.first_publish_year ?? undefined,
              pages: doc.number_of_pages_median ?? undefined,
              publisher: doc.publisher?.[0] ?? undefined,
              coverUrl: coverUrl ?? undefined,
              source: "openlibrary-import",
            },
          });

          await prisma.bookGenre.create({
            data: { bookId: book.id, genreId },
          });

          totalImported++;
          importedThisPage++;
        } catch (err) {
          console.warn(`   Erro ao salvar "${title}":`, (err as Error).message);
          totalSkipped++;
        }
      }

      console.log(`   p.${page}: +${importedThisPage} (total: ${totalImported}/${TARGET_TOTAL})`);

      if (importedThisPage === 0 && page > 1) {
        console.log(`   p.${page}: sem novos, proximo genero`);
        break;
      }

      await sleep(SLEEP_MS);
    }
  }

  console.log("\n=======================================");
  console.log("Importacao concluida!");
  console.log(`   Importados: ${totalImported}`);
  console.log(`   Duplicados (pulados): ${totalDuplicated}`);
  console.log(`   Ignorados (sem titulo): ${totalSkipped}`);
  console.log("=======================================\n");
}

main()
  .catch((err) => {
    console.error("Erro fatal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
