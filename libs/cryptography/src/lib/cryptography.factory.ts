import { Inject, Injectable } from '@nestjs/common'
import { EncryptionAlgs } from '@tictactoe/prisma-schemas'
import { ICryptoService } from './crypto-service.interface'
import { Argon2IDChaCha20Poly1305Service } from './crypto-services/argon2id-chacha20poly1305.service'
import { ConfigType } from '@nestjs/config'
import { cryptoConfig } from '@tictactoe/backend-configuration'

@Injectable()
export class CryptographyFactory {
    constructor(
        @Inject(cryptoConfig.KEY)
        private configService: ConfigType<typeof cryptoConfig>
    ) {}

    createFromEnum(type: EncryptionAlgs): ICryptoService {
        switch (type) {
            case 'ARGON2ID_CHACHA20POLY1305':
                return new Argon2IDChaCha20Poly1305Service({
                    secret: this.configService.secret,
                })
            default:
                throw new Error('Not Implemented.')
        }
    }
}
