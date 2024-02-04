import { Module } from '@nestjs/common'
import { CaslModule } from './casl/casl.module'

@Module({
    controllers: [],
    providers: [],
    exports: [],
    imports: [CaslModule],
})
export class AuthorizationModule {}
