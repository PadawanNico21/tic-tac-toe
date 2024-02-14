import { Field, Message, Type } from 'protobufjs'

export enum GameAction {
    Init,
    Ready,
    UpdateState,
    SetTurn,
    Stop,
    Error,
}

@Type.d('Game')
export class GameProto extends Message<GameProto> {
    @Field.d(1, GameAction, 'required')
    public action!: GameAction

    @Field.d(2, 'uint32', 'required')
    public userId!: number

    @Field.d(3, 'uint32', 'required')
    public turnId!: number

    @Field.d(4, 'uint32', 'optional')
    public key?: number

    @Field.d(5, 'uint32', 'optional')
    public value?: number
}

@Type.d('GameTransaction')
export class GameTransactionProto extends Message<GameTransactionProto> {
    @Field.d(1, GameProto, 'repeated')
    public actions!: GameProto[]
}
