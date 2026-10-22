import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!user) {
    // sessão válida mas usuário sumiu do banco (edge case)
    redirect("/login");
  }

  const membroDesde = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <div className="mx-auto max-w-3xl pt-10 space-y-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-fg">
            {user.name ?? "Meu perfil"}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">{user.email}</p>
          <p className="mt-1 text-xs text-fg-subtle">
            Membro desde {membroDesde}
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-bg-elev p-5">
          <div className="text-xs uppercase tracking-[0.12em] text-fg-subtle">
            Na estante
          </div>
          <div className="mt-2 font-serif text-3xl text-fg">0</div>
          <p className="mt-1 text-xs text-fg-muted">livros cadastrados</p>
        </div>
        <div className="rounded-lg border border-border bg-bg-elev p-5">
          <div className="text-xs uppercase tracking-[0.12em] text-fg-subtle">
            Lidos
          </div>
          <div className="mt-2 font-serif text-3xl text-fg">0</div>
          <p className="mt-1 text-xs text-fg-muted">concluídos</p>
        </div>
        <div className="rounded-lg border border-border bg-bg-elev p-5">
          <div className="text-xs uppercase tracking-[0.12em] text-fg-subtle">
            Avaliações
          </div>
          <div className="mt-2 font-serif text-3xl text-fg">—</div>
          <p className="mt-1 text-xs text-fg-muted">sem notas ainda</p>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-bg-elev p-6">
        <h2 className="font-serif text-xl text-fg">Minha estante</h2>
        <p className="mt-2 text-sm text-fg-muted">
          Você ainda não adicionou livros. Em breve você poderá cadastrar pelo
          ISBN e acompanhar suas leituras aqui.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-md border border-border px-4 py-2 text-sm text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
        >
          Voltar ao início
        </Link>
      </section>
    </div>
  );
}