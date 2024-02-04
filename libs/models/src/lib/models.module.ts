import { Module } from '@nestjs/common'
import { PrismaSchemasModule } from '@tictactoe/prisma-schemas'

@Module({
    controllers: [],
    providers: [],
    exports: [],
    imports: [PrismaSchemasModule],
})
export class ModelsModule {}
