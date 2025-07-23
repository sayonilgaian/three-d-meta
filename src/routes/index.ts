import { FastifyInstance } from 'fastify'
import { healthRoutes } from './health.routes'
import { jsonToObjectRoutes } from './jsonToObject.routes'
import { generateJsonRoutes } from './generateJsonConfig.routes'

export async function routes(fastify: FastifyInstance) {
    await fastify.register(healthRoutes)
    await fastify.register(jsonToObjectRoutes)
    await fastify.register(generateJsonRoutes)
}
