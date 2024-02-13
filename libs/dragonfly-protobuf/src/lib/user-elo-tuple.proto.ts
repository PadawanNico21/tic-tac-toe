import { Field, Message, Type } from 'protobufjs'

@Type.d('UserEloTuple')
export class UserEloTupleProto extends Message<UserEloTupleProto> {
    @Field.d(1, 'uint32', 'required')
    public userId!: number

    @Field.d(2, 'uint32', 'required')
    public elo!: number
}
