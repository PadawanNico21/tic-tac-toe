import { Injectable } from '@nestjs/common'
import { EncryptionAlgs } from '@tictactoe/prisma-schemas'
import { ICryptoService } from './crypto-service.interface'
import { Argon2IDChaCha20Poly1305Service } from './crypto-services/argon2id-chacha20poly1305.service'

@Injectable()
export class CryptographyFactory {
    createFromEnum(type: EncryptionAlgs): ICryptoService {
        switch (type) {
            case 'ARGON2ID_CHACHA20POLY1305':
                //TODO: Add env provider
                return new Argon2IDChaCha20Poly1305Service({
                    secret: Buffer.from('TODO: Add env provider', 'utf-8'),
                })
            default:
                throw new Error('Not Implemented.')
        }
    }
}
