-- CreateTable
CREATE TABLE "CategoryGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "iconName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryGroup_slug_key" ON "CategoryGroup"("slug");

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "groupId" INTEGER;

-- CreateIndex
CREATE INDEX "Category_groupId_idx" ON "Category"("groupId");
