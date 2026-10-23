"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";

export function Header() {
  const { user, loading, refresh } = useUser();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="mx-auto max-w-5xl px-6 pt-8">
      <div className="flex items-center justify-between pb-4">
        <Link
          href="/"
          className="font-mono text-sm uppercase tracking-[0.2em] text-fg transition-colors hover:text-accent"
        >
          Minha Biblioteca
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-fg-muted transition-colors hover:text-fg"
          >
            Início
          </Link>

          {loading ? (
            <span className="text-fg-subtle">…</span>
          ) : user ? (
            <>
              <Link
                href="/adicionar"
                className="text-fg-muted transition-colors hover:text-fg"
              >
                Adicionar
              </Link>
              <Link
                href="/perfil"
                className="text-fg-muted transition-colors hover:text-fg"
              >
                {user.name ?? user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="text-fg-muted transition-colors hover:text-accent"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-fg-muted transition-colors hover:text-fg"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="text-accent transition-colors hover:text-accent-hover"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Divisória centralizada, não vai até as bordas */}
      <div className="h-px w-full bg-border" />
    </header>
  );
}