import { GameAction, GameProto } from '@tictactoe/dragonfly-protobuf'
import { GameState } from './game-state'

export class GameStatePacketSerializer extends GameState {
    private editions: GameProto[]
    private initialTurn: number

    constructor(
        numberOfPlayers: number,
        turnId: number,
        userId: number,
        turn = 1,
        state: Map<number, number> = new Map(),
        ready = false
    ) {
        super(numberOfPlayers, turnId, userId)
        this.turn = turn
        this.initialTurn = turn
        this.state = state
        this.ready = ready
        this.editions = []
    }

    override setState(key: number, value: number): void {
        this.state.set(key, value)
        this.editions.push(
            new GameProto({
                action: GameAction.UpdateState,
                key,
                value,
                userId: this.userId,
                turnId: this.turnId,
            })
        )
    }

    override setReady(): void {
        throw new Error()
    }

    toPackets(): GameProto[] {
        if (this.initialTurn !== this.turn) {
            this.editions.push(
                new GameProto({
                    action: GameAction.SetTurn,
                    userId: this.userId,
                    turnId: this.turnId,
                    value: this.turn,
                })
            )
        }
        return this.editions
    }
}
