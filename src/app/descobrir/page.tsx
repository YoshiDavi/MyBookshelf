import { Shelf } from "@/components/Shelf";

type Book = {
  id: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
};

type ShelfData = {
  id: string;
  title: string;
  books: Book[];
};

type DiscoverResponse = {
  shelves: ShelfData[];
};

async function getShelves(): Promise<ShelfData[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const res = await fetch(`${baseUrl}/api/discover`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Falha ao carregar descobrir: ${res.status}`);
  }

  const data: DiscoverResponse = await res.json();
  return data.shelves;
}

export default async function DescobrirPage() {
  const shelves = await getShelves();

  return (
    <div className="space-y-10 pt-6">
      <header>
        <h1 className="font-serif text-4xl text-fg">Descobrir</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Explore o catálogo por gênero, popularidade e novidades.
        </p>
      </header>

      <div className="space-y-12">
        {shelves.map((shelf) => (
          <Shelf
            key={shelf.id}
            id={shelf.id}
            title={shelf.title}
            books={shelf.books}
          />
        ))}
      </div>
    </div>
  );
}