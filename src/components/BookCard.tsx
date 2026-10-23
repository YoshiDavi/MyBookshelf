import Link from "next/link";
import { BookCover } from "./BookCover";

type Props = {
  book: {
    id: string;
    title: string;
    authors: string[];
    coverUrl: string | null;
  };
};

export function BookCard({ book }: Props) {
  return (
    <Link
      href={`/livros/${book.id}`}
      className="group block w-[140px] shrink-0 snap-start"
    >
      <div className="overflow-hidden rounded-md ring-1 ring-border transition-all duration-200 group-hover:ring-accent group-hover:shadow-lg group-hover:shadow-black/40">
        <BookCover
          title={book.title}
          coverUrl={book.coverUrl}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-2 line-clamp-2 font-serif text-sm leading-tight text-fg group-hover:text-accent">
        {book.title}
      </h3>
      <p className="mt-0.5 line-clamp-1 text-xs text-fg-muted">
        {book.authors[0] ?? "Autor desconhecido"}
      </p>
    </Link>
  );
}
