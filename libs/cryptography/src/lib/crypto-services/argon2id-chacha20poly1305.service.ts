import * as argon2 from 'argon2'
import { ICryptoService } from '../crypto-service.interface'
import {
    CipherGCM,
    DecipherGCM,
    createCipheriv,
    createDecipheriv,
} from 'crypto'

export class Argon2IDChaCha20Poly1305Service implements ICryptoService {
    constructor(private options: { secret: Buffer }) {}

    hash(data: string): Promise<string> {
        return argon2.hash(data, { secret: this.options.secret })
    }

    verifyHash(hash: string, data: string): Promise<boolean> {
        return argon2.verify(hash, data, { secret: this.options.secret })
    }

    async encrypt(
        data: string,
        key: Buffer,
        iv: Buffer
    ): Promise<{ data: Buffer; tag: Buffer }> {
        // Erreur dans les déclarations typescript ?
        const chacha20 = createCipheriv(
            'chacha20-poly1305',
            key,
            iv
        ) as CipherGCM

        const encrypted = chacha20.update(data)
        const tag = chacha20.getAuthTag()
        chacha20.final()

        return { data: encrypted, tag }
    }
    async decrypt(
        data: string,
        key: Buffer,
        iv: Buffer,
        tag: Buffer
    ): Promise<Buffer> {
        const chacha20 = createDecipheriv(
            'chacha20-poly1305',
            key,
            iv
        ) as DecipherGCM
        chacha20.setAuthTag(tag)
        // Erreur dans le type de la variable ?
        const decrypted = chacha20.update(data as any)
        chacha20.final()
        return decrypted
    }
}
