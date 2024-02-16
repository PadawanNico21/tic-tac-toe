import { Injectable, UnauthorizedException } from '@nestjs/common'
import { CryptographyFactory } from '@tictactoe/cryptography'
import { UserSessionModel, UserSessionService } from '@tictactoe/models'
import { PrismaService } from '@tictactoe/prisma-schemas'

@Injectable()
export class AuthenticationService {
    constructor(
        private prismaService: PrismaService,
        private cryptoFactory: CryptographyFactory,
        private userSessioService: UserSessionService
    ) {}

    async login(
        username: string,
        password: string,
        requester: { os?: string; ua?: string } = {}
    ): Promise<UserSessionModel> {
        const user = await this.prismaService.user.findUnique({
            where: { username },
            select: { id: true, password: true, encryption: true },
        })

        if (!user) throw new UnauthorizedException('Invalid credentials')

        const crypto = this.cryptoFactory.createFromEnum(user.encryption)

        if (!(await crypto.verifyHash(user.password, password)))
            throw new UnauthorizedException('Invalid credentials')

        return this.userSessioService.createSession(
            user.id,
            requester.ua ?? 'Unknown',
            requester.os ?? 'Unknown'
        )
    }

    async getUserSessionFromToken(token: string): Promise<UserSessionModel> {
        return this.userSessioService.getSession(token)
    }
}
