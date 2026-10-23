import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GENRES = [
  { slug: "ficcao", name: "Ficcao" },
  { slug: "nao-ficcao", name: "Nao-ficcao" },
  { slug: "romance", name: "Romance" },
  { slug: "fantasia", name: "Fantasia" },
  { slug: "ficcao-cientifica", name: "Ficcao Cientifica" },
  { slug: "suspense", name: "Suspense" },
  { slug: "terror", name: "Terror" },
  { slug: "misterio", name: "Misterio" },
  { slug: "biografia", name: "Biografia" },
  { slug: "memorias", name: "Memorias" },
  { slug: "historia", name: "Historia" },
  { slug: "filosofia", name: "Filosofia" },
  { slug: "poesia", name: "Poesia" },
  { slug: "drama", name: "Drama" },
  { slug: "aventura", name: "Aventura" },
  { slug: "infantojuvenil", name: "Infantojuvenil" },
  { slug: "jovem-adulto", name: "Jovem Adulto" },
  { slug: "negocios", name: "Negocios" },
  { slug: "ciencia", name: "Ciencia" },
  { slug: "autoajuda", name: "Autoajuda" },
];

async function main() {
  console.log("Iniciando seed de generos...\n");

  for (const g of GENRES) {
    await prisma.genre.upsert({
      where: { slug: g.slug },
      create: { slug: g.slug, name: g.name },
      update: { name: g.name },
    });
    console.log("   OK " + g.name);
  }

  console.log("\n" + GENRES.length + " generos prontos!");
}

main()
  .catch((e) => {
    console.error("Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });