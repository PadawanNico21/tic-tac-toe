import { Games } from '@tictactoe/prisma-schemas'
import { DragonflyRoutes, DragonflyService } from '@tictactoe/dragonfly'
import { Matchmaker, MatchmakerOptions } from './matchmaker'

export class MatchmakerBuilder {
    private options: MatchmakerOptions = {
        name: undefined!,
        maxPlayers: 2,
        minPlayers: 2,
        maxELODelta: 100,
        roomTTL: 3600,
        maxRetries: 3,
    }

    constructor(
        private dragonflyService: DragonflyService,
        private dragonflyRoutes: DragonflyRoutes,
        game: Games
    ) {
        this.options.name = game.toLowerCase()
    }

    setMinPlayers(players: number): this {
        this.options.minPlayers = players
        return this
    }

    setMaxPlayers(players: number): this {
        this.options.maxPlayers = players
        return this
    }

    setMaxELODelta(delta: number): this {
        this.options.maxELODelta = delta
        return this
    }

    setRommTTL(ttl: number): this {
        this.options.roomTTL = ttl
        return this
    }

    build(): Matchmaker {
        return new Matchmaker(
            this.dragonflyService,
            this.dragonflyRoutes,
            this.options
        )
    }
}
