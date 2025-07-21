import { FastifyInstance } from 'fastify'

declare module 'fastify' {
    interface FastifyInstance {
        config: {
            NODE_ENV: 'development' | 'production' | 'test'
            PORT: number
            HOST: string
            LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
            API_PREFIX: string
            DATABASE_URL: string
            JWT_SECRET: string
            BCRYPT_ROUNDS: number
            RATE_LIMIT_MAX: number
            RATE_LIMIT_TIME_WINDOW: number
            CORS_ORIGIN: string
        }
    }
}

// Export the config type for use in other files
export type FastifyConfig = {
    NODE_ENV: 'development' | 'production' | 'test'
    PORT: number
    HOST: string
    LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
    API_PREFIX: string
    DATABASE_URL: string
    JWT_SECRET: string
    BCRYPT_ROUNDS: number
    RATE_LIMIT_MAX: number
    RATE_LIMIT_TIME_WINDOW: number
    CORS_ORIGIN: string
}