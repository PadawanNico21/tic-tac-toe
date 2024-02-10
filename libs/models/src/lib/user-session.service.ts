import { Injectable } from '@nestjs/common'
import { DragonflyService } from '@tictactoe/dragonfly'
import { randomBytes } from 'crypto'
import { UserSessionModel } from './models/user-session.model'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UserSessionService {
    constructor(
        private dragonflyService: DragonflyService,
        private configService: ConfigService
    ) {}

    async createSession(
        userId: number,
        userAgent: string,
        os: string
    ): Promise<UserSessionModel> {
        const ttl = parseInt(this.configService.get('TOKEN_TTL', '3600'), 10)

        const creationDate = Date.now()
        const expirationDate = creationDate + ttl

        const token = Buffer.concat([Buffer.alloc(8, 0), randomBytes(32)])
        token.writeUInt32BE(userId)
        token.writeUInt32BE(creationDate, 4)

        const serializedToken = token.toString('base64url')

        const userSession = new UserSessionModel({
            id: userId,
            token: serializedToken,
            creationDate,
            expirationDate,
            os,
            userAgent,
        })

        const key = `user-session:${serializedToken}`

        await this.dragonflyService.hmset(key, userSession)
        await this.dragonflyService.expireat(key, expirationDate)

        return userSession
    }
}
