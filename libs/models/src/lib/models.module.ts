import { Module } from '@nestjs/common'
import { PrismaSchemasModule } from '@tictactoe/prisma-schemas'
import { UsersService } from './users.service'
import { UserSessionService } from './user-session.service'
import { ConfigModule } from '@nestjs/config'
import { DragonflyModule } from '@tictactoe/dragonfly'
import { CryptographyModule } from '@tictactoe/cryptography'

@Module({
    providers: [UsersService, UserSessionService],
    exports: [UsersService, UserSessionService],
    imports: [
        PrismaSchemasModule,
        ConfigModule,
        DragonflyModule,
        CryptographyModule,
    ],
})
export class ModelsModule {}
