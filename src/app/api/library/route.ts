import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { bumpVersion } from "@/lib/cache";

const bodySchema = z.object({
  bookId: z.string().min(1),
  status: z
    .enum(["WANT_TO_READ", "READING", "READ", "ABANDONED"])
    .default("WANT_TO_READ"),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const entries = await prisma.userBook.findMany({
    where: { userId: session.userId },
    include: { book: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { bookId, status } = parsed.data;

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return NextResponse.json({ error: "Livro não encontrado" }, { status: 404 });
  }

  const existing = await prisma.userBook.findUnique({
    where: { userId_bookId: { userId: session.userId, bookId } },
  });
  if (existing) {
    return NextResponse.json(
      { entry: existing, alreadyExists: true },
      { status: 200 }
    );
  }

  const entry = await prisma.userBook.create({
    data: { userId: session.userId, bookId, status },
    include: { book: true },
  });

  // Invalida o cache do discover (a shelf "Em alta" muda)
  bumpVersion();

  return NextResponse.json({ entry }, { status: 201 });
}