import { IsArray, IsEmail, IsInt, IsString } from 'class-validator'
import { GameELOModel } from './game-elo.model'
import { EncryptionAlgs } from '@tictactoe/prisma-schemas'

export const encryptionAlgs: {
    algs: EncryptionAlgs[]
    prefered: EncryptionAlgs
} = {
    algs: ['ARGON2ID_CHACHA20POLY1305'],
    prefered: 'ARGON2ID_CHACHA20POLY1305',
}

export class UserModel {
    @IsInt()
    id: number

    @IsString()
    username: string

    @IsEmail()
    mail: string

    @IsString()
    password: string

    @IsString()
    encryption: EncryptionAlgs

    @IsArray()
    GameELO: GameELOModel[]

    constructor(data: any) {
        Object.assign(this, data)
    }
}
