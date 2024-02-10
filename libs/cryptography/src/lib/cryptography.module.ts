import { Module } from '@nestjs/common'
import { CryptographyFactory } from './cryptography.factory'
import { ConfigModule } from '@nestjs/config'
import { cryptoConfig } from '@tictactoe/backend-configuration'

@Module({
    controllers: [],
    providers: [CryptographyFactory],
    exports: [CryptographyFactory],
    imports: [ConfigModule.forFeature(cryptoConfig)],
})
export class CryptographyModule {}
