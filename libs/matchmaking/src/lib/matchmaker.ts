import { DragonflyRoutes, DragonflyService } from '@tictactoe/dragonfly'
import { randomBytes } from 'crypto'
import {
    RoomIdAverageEloTupleProto,
    UserEloTupleProto,
} from '@tictactoe/dragonfly-protobuf'

export interface MatchmakerOptions {
    name: string

    maxPlayers: number
    minPlayers: number

    maxELODelta: number

    roomTTL: number

    maxRetries: number
}

export interface MatchemakerRoom {
    id: string
    averageELO: number
    owner: boolean
    playerPos?: number
}

export class Matchmaker {
    constructor(
        private dragonflyService: DragonflyService,
        private dragonflyRoutes: DragonflyRoutes,
        private options: MatchmakerOptions
    ) {}

    async make(userId: number, userElo: number): Promise<MatchemakerRoom> {
        for (let i = 0; i < this.options.maxRetries; i++) {
            try {
                const room = await this.findBestOpponents(userElo)
                const joined = await this.joinRoom(userId, userElo, room)
                if (joined) return room
            } catch {
                /**/
            }
        }
        return this.createRoom(userId, userElo)
    }

    async findBestOpponents(elo: number): Promise<MatchemakerRoom> {
        const rooms = (
            await this.dragonflyService.smembersBuffer(
                this.dragonflyRoutes.rooms(this.options.name)
            )
        ).map(RoomIdAverageEloTupleProto.decode<RoomIdAverageEloTupleProto>)

        let eloDelta = this.options.maxELODelta
        const bestRoom: { roomId: string; averageElo: number } = {
            roomId: '',
            averageElo: 0,
        }

        for (const { roomId, averageElo } of rooms) {
            const currentEloDelta = Math.abs(averageElo - elo)
            if (currentEloDelta < eloDelta) {
                eloDelta = currentEloDelta
                bestRoom.roomId = roomId
                bestRoom.averageElo = averageElo
            }
        }

        if (!bestRoom.roomId) throw new Error('No room found')

        return {
            id: bestRoom.roomId,
            averageELO: bestRoom.averageElo,
            owner: false,
        }
    }

    async joinRoom(
        userId: number,
        userElo: number,
        room: MatchemakerRoom
    ): Promise<boolean> {
        const playerPos = await this.runAndExpire(
            this.dragonflyRoutes.roomPlayerCount(this.options.name, room.id),
            (k) => this.dragonflyService.incr(k)
        )

        const currentRoom = new RoomIdAverageEloTupleProto({
            roomId: room.id,
            averageElo: room.averageELO,
        })

        const currentRoomBuffer = Buffer.from(
            RoomIdAverageEloTupleProto.encode(currentRoom).finish()
        )

        if (playerPos > this.options.maxPlayers) {
            await this.dragonflyService.srem(
                this.dragonflyRoutes.rooms(this.options.name),
                currentRoomBuffer
            )
            await this.dragonflyService.del(
                this.dragonflyRoutes.roomPlayerCount(this.options.name, room.id)
            )
            await this.dragonflyService.del(
                this.dragonflyRoutes.roomPlayers(this.options.name, room.id)
            )
            return false
        }

        room.playerPos = playerPos

        const user = new UserEloTupleProto({ userId, elo: userElo })

        await this.runAndExpire(
            this.dragonflyRoutes.roomPlayers(this.options.name, room.id),
            (k) =>
                this.dragonflyService.sadd(
                    k,
                    Buffer.from(UserEloTupleProto.encode(user).finish())
                )
        )

        const players = (
            await this.dragonflyService.smembersBuffer(
                this.dragonflyRoutes.roomPlayers(this.options.name, room.id)
            )
        ).map(UserEloTupleProto.decode<UserEloTupleProto>)

        const newAverage =
            players.reduce((acc, { elo }) => acc + elo, 0) / players.length

        const newRoom = new RoomIdAverageEloTupleProto({
            roomId: room.id,
            averageElo: newAverage,
        })

        await this.dragonflyService.srem(
            this.dragonflyRoutes.rooms(this.options.name),
            currentRoomBuffer
        )
        await this.dragonflyService.saddex(
            this.dragonflyRoutes.rooms(this.options.name),
            this.options.roomTTL,
            Buffer.from(RoomIdAverageEloTupleProto.encode(newRoom).finish())
        )

        return true
    }

    async createRoom(
        userId: number,
        userElo: number
    ): Promise<MatchemakerRoom> {
        const roomIdBuffer = Buffer.concat([
            Buffer.alloc(8, 0),
            randomBytes(16),
        ])
        roomIdBuffer.writeUInt32BE(userId)
        roomIdBuffer.writeUInt32BE(Date.now(), 4)

        const roomId = roomIdBuffer.toString('base64url')
        await this.runAndExpire(
            this.dragonflyRoutes.roomPlayerCount(this.options.name, roomId),
            (k) => this.dragonflyService.incr(k)
        )

        const user = new UserEloTupleProto({ userId, elo: userElo })

        await this.runAndExpire(
            this.dragonflyRoutes.roomPlayers(this.options.name, roomId),
            (k) =>
                this.dragonflyService.sadd(
                    k,
                    Buffer.from(UserEloTupleProto.encode(user).finish())
                )
        )

        const room = new RoomIdAverageEloTupleProto({
            roomId,
            averageElo: userElo,
        })

        await this.dragonflyService.saddex(
            this.dragonflyRoutes.rooms(this.options.name),
            this.options.roomTTL,
            Buffer.from(RoomIdAverageEloTupleProto.encode(room).finish())
        )

        return {
            averageELO: userElo,
            id: roomId,
            owner: true,
            playerPos: 1,
        }
    }

    private async runAndExpire<T>(
        key: string,
        command: (key: string) => Promise<T>,
        ttl: number = this.options.roomTTL
    ): Promise<T> {
        const result = await command(key)
        await this.dragonflyService.expire(key, ttl)
        return result
    }
}
