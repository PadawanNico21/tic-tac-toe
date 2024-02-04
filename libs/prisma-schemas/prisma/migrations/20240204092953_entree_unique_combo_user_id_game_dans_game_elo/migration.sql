/*
  Warnings:

  - A unique constraint covering the columns `[userId,game]` on the table `GameELO` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GameELO_userId_game_key" ON "GameELO"("userId", "game");
