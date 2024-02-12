import { Module } from '@nestjs/common'
import { MatchmakingFactory } from './matchmaking.factory'

@Module({
    controllers: [],
    providers: [MatchmakingFactory],
    exports: [MatchmakingFactory],
})
export class MatchmakingModule {}
