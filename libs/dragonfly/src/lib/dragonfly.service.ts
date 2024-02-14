import {
    Inject,
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { dragonflyConfig } from '@tictactoe/backend-configuration'
import { Callback, Redis } from 'ioredis'

@Injectable()
export class DragonflyService
    extends Redis
    implements OnModuleInit, OnModuleDestroy
{
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

    async onModuleDestroy() {
        await this.quit()
    }

    async onModuleInit() {
        await this.connect()
    }

    async saddex(
        key: string | Buffer,
        ttl: number,
        ...keys: (string | Buffer)[]
    ): Promise<unknown> {
        return this.call('saddex', key, ttl, ...keys)
    }

    /**
     * @deprecated ❗ Ne fonctionnera pas
     */
    override subscribe(...args: any[]): Promise<any> {
        throw new Error('The DragonflyService can only publish messages')
    }

    /**
     * @deprecated ❗ Ne fonctionnera pas
     */
    override unsubscribe(...args: any[]): Promise<any> {
        throw new Error('The DragonflyService can only publish messages')
    }
}
