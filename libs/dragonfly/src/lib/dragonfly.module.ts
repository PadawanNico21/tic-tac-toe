import { Module } from '@nestjs/common'
import { DragonflyService } from './dragonfly.service'
import { ConfigModule } from '@nestjs/config'
import { dragonflyConfig } from '@tictactoe/backend-configuration'
import { DragonflyRoutes } from './dragonfly-routes.service'

@Module({
    controllers: [],
    providers: [DragonflyService, DragonflyRoutes],
    exports: [DragonflyService, DragonflyRoutes],
    imports: [ConfigModule.forFeature(dragonflyConfig)],
})
export class DragonflyModule {}
