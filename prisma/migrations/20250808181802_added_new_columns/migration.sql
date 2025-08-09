-- CreateTable
CREATE TABLE "public"."Move" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categories" TEXT[],
    "roles" TEXT[],
    "effects" TEXT[],
    "affectedStats" JSONB NOT NULL,
    "affectedStats2" JSONB NOT NULL,
    "power" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "healamount" INTEGER NOT NULL,
    "targetTypes" TEXT[],
    "duration" INTEGER NOT NULL,
    "moveType" TEXT NOT NULL,
    "contact" BOOLEAN NOT NULL,
    "exceptionHandler" TEXT,
    "moveSound" TEXT,
    "animation" TEXT,
    "relatedCharacters" TEXT[],
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Move_pkey" PRIMARY KEY ("id")
);
