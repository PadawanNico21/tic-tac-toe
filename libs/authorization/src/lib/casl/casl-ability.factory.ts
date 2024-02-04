import { Injectable } from '@nestjs/common'
import { UserModel } from '@tictactoe/models'
import { PureAbility, AbilityBuilder } from '@casl/ability'
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma'
import { User, GameELO } from '@tictactoe/prisma-schemas'

export enum Actions {
    Manage = 'manage',
    Update = 'update',
    Create = 'create',
    Read = 'read',
    Delete = 'delete',
}

type AppAbility = PureAbility<
    [
        Actions,
        Subjects<{
            User: User
            GameELO: GameELO
        }>
    ],
    PrismaQuery
>

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: Omit<UserModel, 'GameELO'>): AppAbility {
        const { can, build } = new AbilityBuilder<AppAbility>(
            createPrismaAbility
        )

        can(Actions.Manage, 'User', { id: user.id })
        can(Actions.Read, 'GameELO')

        return build()
    }
}
