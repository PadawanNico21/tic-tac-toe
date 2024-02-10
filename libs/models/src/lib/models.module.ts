import { Module } from '@nestjs/common'
import { PrismaSchemasModule } from '@tictactoe/prisma-schemas'
import { UsersService } from './Users.service'
import { UserSessionService } from './user-session.service'
import { ConfigModule } from '@nestjs/config'
import { DragonflyModule } from '@tictactoe/dragonfly'

@Module({
    providers: [UsersService, UserSessionService],
    exports: [UsersService, UserSessionService],
    imports: [PrismaSchemasModule, ConfigModule, DragonflyModule],
})
export class ModelsModule {}
