import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { dragonflyConfig } from '@tictactoe/backend-configuration'
import { Redis } from 'ioredis'

@Injectable()
export class DragonflyService extends Redis implements OnModuleInit {
    constructor(
        @Inject(dragonflyConfig.KEY)
        config: ConfigType<typeof dragonflyConfig>
    ) {
        super({
            port: config.port,
            host: config.host,
            username: config.username,
            password: config.password,
            lazyConnect: true,
        })
    }

    async onModuleInit() {
        await this.connect()
    }
}
