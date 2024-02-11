import { Module } from '@nestjs/common'
import { AuthenticationService } from './authentication.service'
import { PrismaSchemasModule } from '@tictactoe/prisma-schemas'
import { ModelsModule } from '@tictactoe/models'
import { CryptographyModule } from '@tictactoe/cryptography'
import { AuthenticationGuard } from './authentication.guard'

@Module({
    controllers: [],
    imports: [PrismaSchemasModule, ModelsModule, CryptographyModule],
    providers: [AuthenticationService, AuthenticationGuard],
    exports: [AuthenticationService, AuthenticationGuard],
})
export class AuthenticationModule {}
