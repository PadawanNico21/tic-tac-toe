import { registerAs } from '@nestjs/config'

export const cryptoConfig = registerAs('crypto', () => {
    if (!process.env['CRYPTO_SECRET'])
        throw new Error(
            "La variable d'environement CRYPTO_SECRET doit être définie"
        )

    return { secret: Buffer.from(process.env['CRYPTO_SECRET'], 'base64') }
})
