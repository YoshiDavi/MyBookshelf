/*
  Warnings:

  - A unique constraint covering the columns `[olid]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "olid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Book_olid_key" ON "Book"("olid");
