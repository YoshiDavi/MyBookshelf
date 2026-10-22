"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/FormField";
import { useUser } from "@/lib/use-user";

type FieldErrors = Partial<Record<"email" | "password", string>>;

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = "Informe seu e-mail";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "E-mail inválido";
    }

    if (!password) {
      errors.password = "Informe a senha";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 400 && data?.issues) {
          const issues = data.issues as Record<string, string[] | undefined>;
          setFieldErrors({
            email: issues.email?.[0],
            password: issues.password?.[0],
          });
          setFormError("Verifique os campos destacados.");
          return;
        }

        if (res.status === 401) {
          setFormError("E-mail ou senha incorretos.");
          return;
        }

        setFormError(`Erro ${res.status}: ${data?.error ?? "desconhecido"}`);
        return;
      }

      await refresh();
      router.push("/perfil");
      router.refresh();
    } catch {
      setFormError("Erro de rede. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md pt-12">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-fg">Entrar</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Acesse sua biblioteca pessoal.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          required
        />

        <FormField
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          required
        />

        {formError && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Entrando…" : "Entrar"}
        </button>

        <p className="text-center text-sm text-fg-muted">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-accent hover:text-accent-hover">
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}