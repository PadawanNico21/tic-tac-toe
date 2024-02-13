import { Field, Message, Type } from 'protobufjs'

@Type.d('RoomIdAverageEloTuple')
export class RoomIdAverageEloTupleProto extends Message<RoomIdAverageEloTupleProto> {
    @Field.d(1, 'string', 'required')
    public roomId!: string

    @Field.d(2, 'float', 'required')
    public averageElo!: number
}
