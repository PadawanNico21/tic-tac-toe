import { Module } from '@nestjs/common'
import { DragonflyService } from './dragonfly.service'
import { ConfigModule } from '@nestjs/config'
import { dragonflyConfig } from '@tictactoe/backend-configuration'

@Module({
    controllers: [],
    providers: [DragonflyService],
    exports: [DragonflyService],
    imports: [ConfigModule.forFeature(dragonflyConfig)],
})
export class DragonflyModule {}
