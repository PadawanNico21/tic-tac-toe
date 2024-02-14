import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { instrumentate } from '@tictactoe/otel-instrumentations'
import { WsAdapter } from './app/WsAdapter'

instrumentate('tictactoe-backend')

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const defaultVersion = '1'

    app.enableVersioning({ defaultVersion, type: VersioningType.URI })
    app.useGlobalPipes(new ValidationPipe())
    app.useWebSocketAdapter(new WsAdapter(app))

    const port = process.env.PORT ?? 3000
    await app.listen(port, '0.0.0.0')
    Logger.log(
        `🚀 Application is running on: http://0.0.0.0:${port}/v${defaultVersion}}`
    )
}

bootstrap()
