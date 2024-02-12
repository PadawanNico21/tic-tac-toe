import { Module } from '@nestjs/common'
import { DragonflyService } from './dragonfly.service'
import { ConfigModule } from '@nestjs/config'
import { dragonflyConfig } from '@tictactoe/backend-configuration'
import { DragonflyRoutes } from './dragonfly-routes.service'
import { DragonflySubscriberService } from './dragonfly-subscriber.service'

@Module({
    controllers: [],
    providers: [DragonflyService, DragonflyRoutes, DragonflySubscriberService],
    exports: [DragonflyService, DragonflyRoutes, DragonflySubscriberService],
    imports: [ConfigModule.forFeature(dragonflyConfig)],
})
export class DragonflyModule {}
