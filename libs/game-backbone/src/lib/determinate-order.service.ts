import { Injectable } from '@nestjs/common'
import { DragonflyRoutes, DragonflyService } from '@tictactoe/dragonfly'

@Injectable()
export class DeterminateOrderService {
    constructor(
        private dragonflyService: DragonflyService,
        private dragonflyRoutes: DragonflyRoutes
    ) {}

    async determine(game: string, roomId: string): Promise<number> {
        return await this.dragonflyService.incr(
            this.dragonflyRoutes.roomConnectionOrder(game, roomId)
        )
    }
}
