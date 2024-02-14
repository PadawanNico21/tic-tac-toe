import { Module } from '@nestjs/common'
import { DragonflyModule } from '@tictactoe/dragonfly'
import { GameSyncService } from './game-sync.service'
import { DeterminateOrderService } from './determinate-order.service'

@Module({
    controllers: [],
    imports: [DragonflyModule],
    providers: [GameSyncService, DeterminateOrderService],
    exports: [GameSyncService, DeterminateOrderService],
})
export class GameBackboneModule {}
