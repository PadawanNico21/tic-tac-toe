import { Injectable } from '@nestjs/common'
import { Games, PrismaService } from '@tictactoe/prisma-schemas'
import { UserModel, encryptionAlgs } from './models/user.model'
import { games } from './models/game-elo.model'

@Injectable()
export class UsersService {
    public readonly DEFAULT_ELO_VALUE: number = 1000

    constructor(private prisma: PrismaService) {}

    async getUser(id: number): Promise<UserModel> {
        return new UserModel(
            await this.prisma.user.findUnique({
                where: { id },
                include: { GameELO: true },
            })
        )
    }

    async updateUser(
        user: Partial<Omit<UserModel, 'GameELO'>> & Pick<UserModel, 'id'>
    ): Promise<void> {
        await this.prisma.user.update({
            where: { id: user.id },
            data: user,
        })
    }

    async updateUserELOOnGame(
        userId: number,
        game: Games,
        value: number
    ): Promise<void> {
        await this.prisma.gameELO.update({
            where: { userId_game: { userId, game } },
            data: { value },
        })
    }

    async createUser(user: Omit<UserModel, 'id' | 'GameELO' | 'encryption'>) {
        const createdUser = await this.prisma.user.create({
            data: { ...user, encryption: encryptionAlgs.prefered },
        })

        await this.prisma.gameELO.createMany({
            data: games.map((game) => ({
                game,
                userId: createdUser.id,
                value: this.DEFAULT_ELO_VALUE,
            })),
        })
    }
}
