import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import {
    SimpleSpanProcessor,
    ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { Resource } from '@opentelemetry/resources'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core'
import { PrismaInstrumentation } from '@prisma/instrumentation'
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis'
import { hostname } from 'os'

export function instrumentate(serviceName: string) {
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
            [SemanticResourceAttributes.HOST_NAME]: hostname(),
        }),
    })
    provider.register()

    if (!process.env['OTEL_URL'])
        provider.addSpanProcessor(
            new SimpleSpanProcessor(new ConsoleSpanExporter())
        )
    else
        provider.addSpanProcessor(
            new SimpleSpanProcessor(
                new OTLPTraceExporter({
                    url: process.env['OTEL_URL'],
                })
            )
        )

    registerInstrumentations({
        tracerProvider: provider,
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new NestInstrumentation(),
            new PrismaInstrumentation(),
            new IORedisInstrumentation(),
        ],
    })

    return provider
}
