-- CreateTable
CREATE TABLE "Ferias" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "periodo1I" TIMESTAMP(3),
    "periodo1F" TIMESTAMP(3),
    "periodo2I" TIMESTAMP(3),
    "periodo2F" TIMESTAMP(3),
    "periodo3I" TIMESTAMP(3),
    "periodo3F" TIMESTAMP(3),
    "totalDias" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ferias_pkey" PRIMARY KEY ("id")
);
