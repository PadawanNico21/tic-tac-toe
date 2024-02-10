import { registerAs } from '@nestjs/config'

export const dragonflyConfig = registerAs('dragonfly', () => ({
    host: process.env['DRAGONFLY_HOST'] ?? '127.0.0.1',
    port: parseInt(process.env['DRAGONFLY_PORT'] ?? '6379', 10),
    username: process.env['DRAGONFLY_USERNAME'],
    password: process.env['DRAGONFLY_PASSWORD'],
}))
