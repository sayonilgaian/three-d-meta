import { Static, Type } from '@sinclair/typebox'

const EnvSchema = Type.Object({
    NODE_ENV: Type.Union([
        Type.Literal('development'),
        Type.Literal('production'),
        Type.Literal('test')
    ]),
    PORT: Type.Number({ default: 3000 }),
    HOST: Type.String({ default: '0.0.0.0' }),
    LOG_LEVEL: Type.Union(
        [
            Type.Literal('fatal'),
            Type.Literal('error'),
            Type.Literal('warn'),
            Type.Literal('info'),
            Type.Literal('debug'),
            Type.Literal('trace')
        ],
        { default: 'info' }
    ),
    API_PREFIX: Type.String({ default: '/api/v1' }),
    DATABASE_URL: Type.String(),
    JWT_SECRET: Type.String(),
    BCRYPT_ROUNDS: Type.Number({ default: 12 }),
    RATE_LIMIT_MAX: Type.Number({ default: 100 }),
    RATE_LIMIT_TIME_WINDOW: Type.Number({ default: 60000 }),
    CORS_ORIGIN: Type.String({ default: 'http://localhost:3000' })
})

export type EnvConfig = Static<typeof EnvSchema>

export const envSchema = {
    type: 'object',
    required: ['DATABASE_URL', 'JWT_SECRET'],
    properties: {
        NODE_ENV: {
            type: 'string',
            enum: ['development', 'production', 'test'],
            default: 'development'
        },
        PORT: {
            type: 'number',
            default: 3000
        },
        HOST: {
            type: 'string',
            default: '0.0.0.0'
        },
        LOG_LEVEL: {
            type: 'string',
            enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
            default: 'info'
        },
        API_PREFIX: {
            type: 'string',
            default: '/api/v1'
        },
        DATABASE_URL: {
            type: 'string'
        },
        JWT_SECRET: {
            type: 'string'
        },
        BCRYPT_ROUNDS: {
            type: 'number',
            default: 12
        },
        RATE_LIMIT_MAX: {
            type: 'number',
            default: 100
        },
        RATE_LIMIT_TIME_WINDOW: {
            type: 'number',
            default: 60000
        },
        CORS_ORIGIN: {
            type: 'string',
            default: 'http://localhost:3000'
        }
    }
}
