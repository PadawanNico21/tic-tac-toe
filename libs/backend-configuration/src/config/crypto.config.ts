import { registerAs } from '@nestjs/config'

export const cryptoConfig = registerAs('crypto', () => ({
    secret: process.env['CRYPTO_SECRET'],
}))
