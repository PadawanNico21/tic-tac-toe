import { Module } from '@nestjs/common'
import { GameBackboneService } from './game-backbone.service'

@Module({
    controllers: [],
    providers: [GameBackboneService],
    exports: [GameBackboneService],
})
export class GameBackboneModule {}
