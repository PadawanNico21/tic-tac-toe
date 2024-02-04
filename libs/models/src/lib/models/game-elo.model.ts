import { IsInstance, IsInt, IsString } from 'class-validator'
import { UserModel } from './user.model'
import { Games } from '@tictactoe/prisma-schemas'

export const games: Games[] = ['TicTacToe']

export class GameELOModel {
    @IsInt()
    id: number

    @IsString()
    game: Games

    @IsInt()
    value: number

    @IsInstance(UserModel)
    user: UserModel

    constructor(data: any) {
        Object.assign(this, data)
    }
}
