import { Injectable } from '@nestjs/common'

@Injectable()
export class DragonflyRoutes {
    rooms(game: string) {
        return `${game}:rooms`
    }

    room(game: string, roomId: string) {
        return `${game}:room:${roomId}`
    }

    roomPlayerCount(game: string, roomId: string) {
        return `${this.room(game, roomId)}:pc`
    }

    roomPlayers(game: string, roomId: string) {
        return `${this.room(game, roomId)}:p`
    }
}
