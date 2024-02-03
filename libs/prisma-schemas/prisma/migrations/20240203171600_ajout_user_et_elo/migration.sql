-- CreateEnum
CREATE TYPE "EncryptionAlgs" AS ENUM ('ARGON2ID_CHACHA20POLY1305');

-- CreateEnum
CREATE TYPE "Games" AS ENUM ('TicTacToe');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "encryption" "EncryptionAlgs" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameELO" (
    "id" SERIAL NOT NULL,
    "game" "Games" NOT NULL,
    "value" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "GameELO_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "GameELO" ADD CONSTRAINT "GameELO_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
