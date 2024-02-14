import { Injectable } from '@nestjs/common'
import { DeterminateOrderService } from './determinate-order.service'
import {
    DragonflyRoutes,
    DragonflyService,
    DragonflySubscriberService,
} from '@tictactoe/dragonfly'
import { GameAction, GameProto } from '@tictactoe/dragonfly-protobuf'
import { GameState } from './game-state'
import { GameStatePacketSerializer } from './game-state-packet-serializer'
import { EventEmitter } from 'events'

@Injectable()
export class GameSyncService {
    private states: Map<string, GameSyncRoom> = new Map()

    constructor(
        private orderService: DeterminateOrderService,
        private dragonflySubscriberService: DragonflySubscriberService,
        private dragonflyService: DragonflyService,
        private dragonflyRoutes: DragonflyRoutes
    ) {}

    get(game: string, roomId: string, userId: number): GameSyncRoom {
        const state = this.states.get(`${game}->${roomId}->${userId}`)
        if (!state) throw new Error('Game not found')

        return state
    }

    async connect(game: string, roomId: string, userId: number) {
        const turnId = await this.orderService.determine(game, roomId)
        //TODO: modifier le nombre de joueurs
        const state = new GameSyncRoom(2, turnId, userId)

        let mainHandler: (message: GameProto) => void
        if (turnId === 1) {
            mainHandler = this.createMainHandlerForGame(state, game, roomId)
        }

        this.states.set(`${game}->${roomId}->${userId}`, state)

        await this.dragonflySubscriberService.subscribe(
            this.dragonflyRoutes.roomConnection(game, roomId),
            async (buf: string) => {
                const message = GameProto.decode(Buffer.from(buf))
                if (mainHandler) mainHandler(message)

                switch (message.action) {
                    case GameAction.Ready:
                        state.setReady()
                        state.events.emit('ready', message)
                        break
                    case GameAction.UpdateState:
                        if (!message.key || !message.value) return
                        state.setState(message.key, message.value)
                        state.events.emit('stateChange', message)
                        break
                    case GameAction.SetTurn:
                        if (!message.value) return
                        state.setTurn(message.value)
                        state.events.emit('turnChange', message)
                        break
                    case GameAction.Error:
                    case GameAction.Stop:
                        state.events.emit('end', message)
                        this.states.delete(`${game}->${roomId}->${userId}`)
                        await this.dragonflySubscriberService.unsubscribe(
                            this.dragonflyRoutes.roomConnection(game, roomId)
                        )
                        break
                }
            }
        )
        return state
    }

    createMainHandlerForGame(
        state: GameSyncRoom,
        game: string,
        roomId: string
    ): (message: GameProto) => void {
        const key = this.dragonflyRoutes.roomConnection(game, roomId)

        const close = async () => {
            const message = GameProto.encode(
                new GameProto({
                    action: GameAction.Error,
                    userId: state.userId,
                    turnId: state.turnId,
                })
            ).finish()
            await this.dragonflyService.publish(key, Buffer.from(message))
            await this.dragonflySubscriberService.unsubscribe(key)
        }

        let timeoutHandle = setTimeout(close, 60_000)
        const connections: number[] = []

        return async (message: GameProto) => {
            clearTimeout(timeoutHandle)
            timeoutHandle = setTimeout(close, 60_000)

            switch (message.action) {
                case GameAction.Init:
                    if (!connections.includes(message.turnId))
                        connections.push(message.turnId)
                    if (connections.length === state.getNumberOfPlayers()) {
                        const message = GameProto.encode(
                            new GameProto({
                                action: GameAction.Ready,
                                userId: state.userId,
                                turnId: state.turnId,
                            })
                        ).finish()
                        await this.dragonflyService.publish(
                            key,
                            Buffer.from(message)
                        )
                    }
                    break
                case GameAction.Stop:
                    //TODO: Update dans la bdd
                    break
            }
        }
    }
}

export class GameSyncRoom extends GameState {
    public events: EventEmitter = new EventEmitter()

    transaction(cb: (room: GameStatePacketSerializer) => void) {
        const gs = new GameStatePacketSerializer(
            this.getNumberOfPlayers(),
            this.turnId,
            this.userId,
            this.turn,
            new Map(this.state),
            this.ready
        )
        cb(gs)
        gs.toPackets()
    }
}
