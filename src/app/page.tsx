import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="max-w-2xl pt-8">
        <h1 className="font-serif text-5xl leading-tight tracking-tight text-fg sm:text-6xl">
          Sua biblioteca <span className="italic text-accent">pessoal</span>,
          organizada.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-fg-muted">
          Cadastre seus livros pelo ISBN, acompanhe leituras, dê notas e
          construa sua estante digital — tudo em um só lugar.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/cadastro"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
          >
            Começar agora
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      <section className="grid gap-6 border-t border-border pt-10 sm:grid-cols-3">
        <div>
          <div className="text-2xl">📖</div>
          <h2 className="mt-3 text-lg text-fg">Cadastro por ISBN</h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            Digite o ISBN e buscamos os dados automaticamente nas bases
            públicas.
          </p>
        </div>
        <div>
          <div className="text-2xl">⭐</div>
          <h2 className="mt-3 text-lg text-fg">Notas e resenhas</h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            Dê de meia a cinco estrelas e registre suas impressões de leitura.
          </p>
        </div>
        <div>
          <div className="text-2xl">📚</div>
          <h2 className="mt-3 text-lg text-fg">Sua estante</h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            Organize por status: quero ler, lendo, lido ou abandonado.
          </p>
        </div>
      </section>
    </div>
  );
}