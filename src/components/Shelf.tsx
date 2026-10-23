import Link from "next/link";
import { BookCard } from "./BookCard";

type Props = {
  id: string;
  title: string;
  books: Array<{
    id: string;
    title: string;
    authors: string[];
    coverUrl: string | null;
  }>;
};

export function Shelf({ id, title, books }: Props) {
  if (books.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-xl text-fg">{title}</h2>
        <Link
          href={`/descobrir?genero=${id}`}
          className="text-xs uppercase tracking-[0.12em] text-fg-subtle transition-colors hover:text-accent"
        >
          Ver tudo →
        </Link>
      </div>

      <div className="relative -mx-6 px-6">
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}
