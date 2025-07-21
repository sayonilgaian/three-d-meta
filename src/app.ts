import Fastify, { FastifyInstance } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import env from '@fastify/env'
import path from 'path'

import { envSchema } from '@/config/environment'
import { errorHandler } from '@/middleware/error.middleware'
import logger from '@/utils/logger'
import { routes } from '@/routes'

// Import type declarations to extend Fastify types
import '@/types/fastify'

export async function buildApp(): Promise<FastifyInstance> {
    const app = Fastify({
        logger: {
            level: process.env.LOG_LEVEL || 'info',
            transport: process.env.NODE_ENV === 'development' ? {
                target: 'pino-pretty',
                options: {
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname',
                    colorize: true
                }
            } : undefined
        },
        trustProxy: true,
        disableRequestLogging: process.env.NODE_ENV === 'production'
    })

    // Register environment variables - this adds the config property
    await app.register(env, {
        schema: envSchema,
        dotenv: true
    })

    // Now app.config is available and typed

    // Security plugins
    await app.register(helmet, {
        contentSecurityPolicy: false
    })

    await app.register(cors, {
        origin: app.config.CORS_ORIGIN.split(','),
        credentials: true
    })

    await app.register(rateLimit, {
        max: app.config.RATE_LIMIT_MAX,
        timeWindow: app.config.RATE_LIMIT_TIME_WINDOW
    })

    // Swagger documentation
    await app.register(swagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'Fastify API',
                description: 'A well-structured Fastify API with TypeScript',
                version: '1.0.0'
            },
            servers: [
                {
                    url: `http://localhost:${app.config.PORT}`,
                    description: 'Development server'
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        }
    })

    await app.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false
        }
    })

    // File upload support
    await app.register(multipart)

    // Static files
    await app.register(staticFiles, {
        root: path.join(__dirname, '../public'),
        prefix: '/static/'
    })

    // Error handler
    app.setErrorHandler(errorHandler)

    // Not found handler
    app.setNotFoundHandler(async (request, reply) => {
        return reply.code(404).send({
            success: false,
            message: 'Route not found',
            statusCode: 404
        })
    })

    // Register routes
    await app.register(routes, { prefix: app.config.API_PREFIX })

    return app
}