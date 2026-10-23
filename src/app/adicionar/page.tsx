"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";

type Book = {
  id: string;
  isbn13: string | null;
  title: string;
  subtitle: string | null;
  authors: string[];
  publisher: string | null;
  publishedAt: number | null;
  pages: number | null;
  coverUrl: string | null;
  description: string | null;
  source: string | null;
};

export default function AdicionarPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [isbn, setIsbn] = useState("");
  const [searching, setSearching] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBook(null);
    setAdded(false);
    setAddError(null);

    const cleaned = isbn.replace(/[\s-]/g, "").trim();
    if (!cleaned) {
      setError("Informe um ISBN");
      return;
    }

    setSearching(true);

    try {
      const res = await fetch(
        `/api/books/isbn/${encodeURIComponent(cleaned)}`,
        { cache: "no-store" }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "Não foi possível buscar o livro.");
        return;
      }

      setBook(data.book);
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd() {
    if (!book) return;

    setAddError(null);
    setAdding(true);

    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, status: "WANT_TO_READ" }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAddError(data?.error ?? "Não foi possível adicionar à estante.");
        return;
      }

      setAdded(true);
      setTimeout(() => router.push("/estante"), 800);
    } catch {
      setAddError("Erro de rede. Tente novamente.");
    } finally {
      setAdding(false);
    }
  }

  if (userLoading) {
    return (
      <div className="mx-auto max-w-md pt-12 text-sm text-fg-muted">
        Carregando…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md pt-12">
        <h1 className="font-serif text-3xl text-fg">Adicionar livro</h1>
        <p className="mt-3 text-sm text-fg-muted">
          Você precisa estar logado para adicionar livros à sua estante.
        </p>
        <a
          href="/login"
          className="mt-6 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
        >
          Entrar
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pt-10">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-fg">Adicionar livro</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Digite o ISBN da contracapa e buscamos os dados automaticamente.
        </p>
      </header>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          placeholder="978-85-359-0277-8"
          className="flex-1 rounded-md border border-border bg-bg-elev px-3 py-2 text-sm text-fg placeholder:text-fg-subtle outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/40"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {searching ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {book && (
        <article className="mt-8 rounded-lg border border-border bg-bg-elev p-6">
          <div className="flex gap-6">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="h-48 w-32 flex-shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-48 w-32 flex-shrink-0 items-center justify-center rounded-md border border-border bg-bg-base text-fg-subtle">
                sem capa
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-2xl text-fg">{book.title}</h2>
              {book.subtitle && (
                <p className="mt-1 text-sm text-fg-muted">{book.subtitle}</p>
              )}
              <p className="mt-3 text-sm text-fg-muted">
                {book.authors.join(", ") || "Autor desconhecido"}
              </p>
              <p className="mt-1 text-xs text-fg-subtle">
                {book.publisher ?? "Editora desconhecida"}
                {book.publishedAt ? ` · ${book.publishedAt}` : ""}
                {book.pages ? ` · ${book.pages} páginas` : ""}
              </p>
              {book.isbn13 && (
                <p className="mt-2 font-mono text-xs text-fg-subtle">
                  ISBN {book.isbn13}
                </p>
              )}
            </div>
          </div>

          {book.description && (
            <p className="mt-6 text-sm leading-relaxed text-fg-muted">
              {book.description}
            </p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleAdd}
              disabled={adding || added}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {added
                ? "Adicionado ✓"
                : adding
                ? "Adicionando…"
                : "Adicionar à estante"}
            </button>

            <span className="text-xs text-fg-subtle">
              Vai para "Quero ler" por padrão.
            </span>
          </div>

          {addError && (
            <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {addError}
            </div>
          )}
        </article>
      )}
    </div>
  );
}