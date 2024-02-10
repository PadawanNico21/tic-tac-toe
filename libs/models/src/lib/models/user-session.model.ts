import { IsInt, IsString } from 'class-validator'

export class UserSessionModel {
    @IsInt()
    id: number

    @IsString()
    userAgent: string

    @IsString()
    os: string

    @IsInt()
    creationDate: number

    @IsInt()
    expirationDate: number

    @IsString()
    token: string

    constructor(data: UserSessionModel) {
        Object.assign(this, data)
    }
}
