import { EnvConfig } from '@/config/environment'

declare module 'fastify' {
    interface FastifyInstance {
        config: EnvConfig
    }
}
