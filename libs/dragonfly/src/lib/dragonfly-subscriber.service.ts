import {
    Inject,
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { dragonflyConfig } from '@tictactoe/backend-configuration'
import { Redis } from 'ioredis'

export type DragonflyCallback = (message: string) => any

@Injectable()
export class DragonflySubscriberService
    implements OnModuleInit, OnModuleDestroy
{
    private client: Redis
    private handlers: { [key: string]: DragonflyCallback[] } = {}

    constructor(
        @Inject(dragonflyConfig.KEY)
        config: ConfigType<typeof dragonflyConfig>
    ) {
        this.messageHandler = this.messageHandler.bind(this)
        this.client = new Redis({
            port: config.port,
            host: config.host,
            username: config.username,
            password: config.password,
            lazyConnect: true,
            autoResubscribe: false,
        })
    }

    private messageHandler(channel: string, message: string) {
        if (!this.handlers[channel]) return
        this.handlers[channel].forEach((cb) => cb(message))
    }

    async subscribe(channel: string, cb: DragonflyCallback) {
        if (this.handlers[channel]) {
            this.handlers[channel].push(cb)
            return
        }

        await this.client.subscribe(channel)
        this.handlers[channel] = [cb]
    }

    async unsubscribe(channel: string) {
        await this.client.unsubscribe(channel)
        delete this.handlers[channel]
    }

    async onModuleInit() {
        await this.client.connect()
        this.client.on('message', this.messageHandler)
    }

    async onModuleDestroy() {
        await this.client.quit()
        this.client.off('message', this.messageHandler)
    }
}
