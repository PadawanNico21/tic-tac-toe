import { Injectable } from '@nestjs/common'
import { Games, PrismaService } from '@tictactoe/prisma-schemas'
import { UserModel, encryptionAlgs } from './models/user.model'
import { games } from './models/game-elo.model'
import { CryptographyFactory } from '@tictactoe/cryptography'

@Injectable()
export class UsersService {
    public readonly DEFAULT_ELO_VALUE: number = 1000

    constructor(
        private prisma: PrismaService,
        private cryptoFactory: CryptographyFactory
    ) {}

    async getUser(id: number): Promise<UserModel> {
        return new UserModel(
            await this.prisma.user.findUnique({
                where: { id },
                select: { id: true, username: true, GameELO: true },
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
        const crypto = this.cryptoFactory.createFromEnum(
            encryptionAlgs.prefered
        )

        const hashedPassword = await crypto.hash(user.password)

        const createdUser = await this.prisma.user.create({
            data: {
                ...user,
                encryption: encryptionAlgs.prefered,
                password: hashedPassword,
            },
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
