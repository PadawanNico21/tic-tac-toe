import { Injectable } from '@nestjs/common'
import { DragonflyRoutes, DragonflyService } from '@tictactoe/dragonfly'
import { Games } from '@tictactoe/prisma-schemas'
import { MatchmakerBuilder } from './matchmaker.builder'

@Injectable()
export class MatchmakingFactory {
    constructor(
        private dragonflyService: DragonflyService,
        private dragonflyRoutes: DragonflyRoutes
    ) {}

    createForGame(game: Games) {
        const builder = new MatchmakerBuilder(
            this.dragonflyService,
            this.dragonflyRoutes,
            game
        )

        switch (game) {
            case 'TicTacToe':
                return builder
                    .setMinPlayers(2)
                    .setMaxPlayers(2)
                    .setMaxELODelta(100)
                    .build()
            default:
                throw new Error('Invalid game')
        }
    }
}
