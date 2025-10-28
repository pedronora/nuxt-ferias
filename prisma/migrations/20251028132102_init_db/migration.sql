-- CreateTable
CREATE TABLE "Ferias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "periodo1I" DATETIME,
    "periodo1F" DATETIME,
    "periodo2I" DATETIME,
    "periodo2F" DATETIME,
    "periodo3I" DATETIME,
    "periodo3F" DATETIME,
    "totalDias" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
