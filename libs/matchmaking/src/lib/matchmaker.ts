import { DragonflyRoutes, DragonflyService } from '@tictactoe/dragonfly'
import { randomBytes } from 'crypto'

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
            await this.dragonflyService.smembers(
                this.dragonflyRoutes.rooms(this.options.name)
            )
        ).map(this.parseTupleRoom)

        let eloDelta = this.options.maxELODelta
        let bestRoom: [string, number] = ['', -1]

        for (const [roomId, averageElo] of rooms) {
            const currentEloDelta = Math.abs(averageElo - elo)
            if (currentEloDelta < eloDelta) {
                eloDelta = currentEloDelta
                bestRoom = [roomId, averageElo]
            }
        }

        if (!bestRoom[0]) throw new Error('No room found')

        return {
            id: bestRoom[0],
            averageELO: bestRoom[1],
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

        if (playerPos > this.options.maxPlayers) {
            await this.dragonflyService.srem(
                this.dragonflyRoutes.rooms(this.options.name),
                `${room.id},${room.averageELO}`
            )
            await this.dragonflyService.del(
                this.dragonflyRoutes.roomPlayerCount(this.options.name, room.id)
            )
            await this.dragonflyService.del(
                this.dragonflyRoutes.roomPlayers(this.options.name, room.id)
            )
            return false
        }

        await this.runAndExpire(
            this.dragonflyRoutes.roomPlayers(this.options.name, room.id),
            (k) => this.dragonflyService.sadd(k, `${userId},${userElo}`)
        )

        const players = (
            await this.dragonflyService.smembers(
                this.dragonflyRoutes.roomPlayers(this.options.name, room.id)
            )
        ).map(this.parseTuplePlayer)

        const newAverage =
            players.reduce((acc, [_, elo]) => acc + elo, 0) / players.length

        await this.dragonflyService.srem(
            this.dragonflyRoutes.rooms(this.options.name),
            `${room.id},${room.averageELO}`
        )
        await this.dragonflyService.saddex(
            this.dragonflyRoutes.rooms(this.options.name),
            this.options.roomTTL,
            `${room.id},${newAverage}`
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

        await this.runAndExpire(
            this.dragonflyRoutes.roomPlayers(this.options.name, roomId),
            (k) => this.dragonflyService.sadd(k, `${userId},${userElo}`)
        )

        await this.dragonflyService.saddex(
            this.dragonflyRoutes.rooms(this.options.name),
            this.options.roomTTL,
            `${roomId},${userElo}`
        )

        return {
            averageELO: userElo,
            id: roomId,
            owner: true,
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

    private parseTupleRoom(tuple: string): [string, number] {
        const parsedTuple = tuple.split(',', 2)

        if (parsedTuple.length !== 2) throw new Error('Invalid tuple')

        return [parsedTuple[0], parseInt(parsedTuple[1], 10)]
    }

    private parseTuplePlayer(tuple: string): [number, number] {
        const parsedTuple = tuple.split(',', 2).map((val) => parseInt(val, 10))

        if (parsedTuple.length !== 2) throw new Error('Invalid tuple')

        return parsedTuple as [number, number]
    }
}
