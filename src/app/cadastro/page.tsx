"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/FormField";
import { useUser } from "@/lib/use-user";

type FieldErrors = Partial<Record<"name" | "email" | "password", string>>;

export default function CadastroPage() {
  const router = useRouter();
  const { refresh } = useUser();

  const [name, setName] = useState("");
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
      errors.password = "Informe uma senha";
    } else if (password.length < 8) {
      errors.password = "A senha precisa ter ao menos 8 caracteres";
    } else if (password.length > 72) {
      errors.password = "A senha é muito longa";
    }

    if (name.trim().length > 80) {
      errors.name = "O nome é muito longo";
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 400: validação do servidor (Zod)
        if (res.status === 400 && data?.issues) {
          const issues = data.issues as Record<string, string[] | undefined>;
          setFieldErrors({
            email: issues.email?.[0],
            password: issues.password?.[0],
            name: issues.name?.[0],
          });
          setFormError("Verifique os campos destacados.");
          return;
        }

        if (res.status === 409) {
          setFieldErrors({ email: "Este e-mail já está cadastrado" });
          setFormError("Este e-mail já está cadastrado.");
          return;
        }

        setFormError(data?.error ?? "Não foi possível criar a conta.");
        return;
      }

      // sucesso
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
        <h1 className="font-serif text-3xl text-fg">Criar conta</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Comece a montar sua biblioteca pessoal em poucos segundos.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField
          label="Nome"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Como quer ser chamado? (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />

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
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint="Use ao menos 8 caracteres."
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
          {submitting ? "Criando conta…" : "Criar conta"}
        </button>

        <p className="text-center text-sm text-fg-muted">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}