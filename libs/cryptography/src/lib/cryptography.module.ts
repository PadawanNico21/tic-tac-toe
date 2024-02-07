import { Module } from '@nestjs/common'
import { CryptographyFactory } from './cryptography.factory'

@Module({
    controllers: [],
    providers: [CryptographyFactory],
    exports: [CryptographyFactory],
})
export class CryptographyModule {}
