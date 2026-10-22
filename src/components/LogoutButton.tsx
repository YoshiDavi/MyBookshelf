"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";

export function LogoutButton() {
  const router = useRouter();
  const { refresh } = useUser();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-border px-3 py-1.5 text-sm text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
    >
      Sair
    </button>
  );
}