import { FastifyInstance } from 'fastify'
import { healthRoutes } from './health.routes'
import { jsonToObjectRoutes } from './jsonToObject.routes'

export async function routes(fastify: FastifyInstance) {
    await fastify.register(healthRoutes)
    await fastify.register(jsonToObjectRoutes)
}
