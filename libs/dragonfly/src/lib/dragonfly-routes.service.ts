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

    roomConnection(game: string, roomId: string) {
        return `c:${this.room(game, roomId)}`
    }

    roomConnectionOrder(game: string, roomId: string) {
        return `c:${this.room(game, roomId)}:o`
    }

    session(token: string) {
        return `user-session:${token}`
    }
}
