import { Module } from '@nestjs/common'
import { PrismaSchemasModule } from '@tictactoe/prisma-schemas'
import { UsersService } from './Users.service'

@Module({
    providers: [UsersService],
    exports: [UsersService],
    imports: [PrismaSchemasModule],
})
export class ModelsModule {}
