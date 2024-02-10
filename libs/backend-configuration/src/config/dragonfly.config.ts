import { registerAs } from '@nestjs/config'

export const dragonflyConfig = registerAs('dragonfly', () => ({
    host: process.env['DRAGONFLY_HOST'],
    port: parseInt(process.env['DRAGONFLY_PORT'] ?? '6379', 10),
}))
