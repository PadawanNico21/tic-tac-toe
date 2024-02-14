import {
    INestApplication,
    WebSocketAdapter,
    WsMessageHandler,
} from '@nestjs/common'
import { IncomingMessage } from 'http'
import { Observable, filter } from 'rxjs'
import { WebSocket, WebSocketServer } from 'ws'
import { Match, MatchFunction, match } from 'path-to-regexp'

export interface WsAdapterOptions {
    path: string
}

export class WebSocketServerWrapper {
    constructor(
        public readonly wss: WebSocketServer,
        public readonly adapterOptions: { pathMatchFunction: MatchFunction }
    ) {}
}

export interface WebSocketClientMetadata {
    pathMatch: Match
}

export class WebSocketClientWrapper {
    constructor(
        public readonly client: WebSocket,
        public readonly metadata: WebSocketClientMetadata
    ) {}
}

export class WsAdapter
    implements
        WebSocketAdapter<
            WebSocketServerWrapper,
            WebSocketClientWrapper,
            Partial<WsAdapterOptions>
        >
{
    private servers: Map<number, WebSocketServer> = new Map()

    constructor(private app: INestApplication) {}

    create(
        port: number,
        options: Partial<WsAdapterOptions> = {}
    ): WebSocketServerWrapper {
        if (!this.servers.has(port)) {
            this.servers.set(
                port,
                new WebSocketServer({ server: this.app.getHttpServer() })
            )
        }
        const wss = this.servers.get(port)
        return new WebSocketServerWrapper(wss, {
            pathMatchFunction: match(options.path ?? '/'),
        })
    }

    bindClientConnect(
        server: WebSocketServerWrapper,
        callback: (
            socket: WebSocketClientWrapper,
            request: IncomingMessage
        ) => void
    ) {
        if (server.wss.listeners('connection').length > 0) return

        server.wss.on('connection', (socket, request) => {
            const match = server.adapterOptions.pathMatchFunction(request.url)
            if (!match) return socket.terminate()

            const wrapper = new WebSocketClientWrapper(socket, {
                pathMatch: match,
            })

            callback(wrapper, request)
        })
    }

    bindClientDisconnect(client: WebSocketClientWrapper, callback: () => void) {
        client.client.on('close', () => {
            callback()
        })
    }

    bindMessageHandlers(
        client: WebSocketClientWrapper,
        handlers: WsMessageHandler<string>[],
        transform: (data: any) => Observable<any>
    ) {
        client.client.on('message', (data, isBuffer) => {
            if (isBuffer) return // TODO: Implement protobuf
            const [event, payload] = JSON.parse(data.toString())

            const handler = handlers.find(
                (handler) => handler.message === event
            )

            transform(handler.callback(payload))
                .pipe(filter((val) => val))
                .subscribe((data) => client.client.send(JSON.stringify(data)))
        })
    }

    close(server: WebSocketServerWrapper) {
        server.wss.close()
    }

    /**
     *   bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ) {
    fromEvent(client, 'message')
      .pipe(
        mergeMap(data => this.bindMessageHandler(data, handlers, process)),
        filter(result => result),
      )
      .subscribe(response => client.send(JSON.stringify(response)));
  }

  bindMessageHandler(
    buffer,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    const message = JSON.parse(buffer.data);
    const messageHandler = handlers.find(
      handler => handler.message === message.event,
    );
    if (!messageHandler) {
      return EMPTY;
    }
    return process(messageHandler.callback(message.data));
  }
     */
}
