import { registerAs } from '@nestjs/config'

export default registerAs('dragonfly', () => ({
    host: process.env['DRAGONFLY_HOST'],
    port: process.env['DRAGONFLY_PORT'] ?? 6379,
}))
