import { FastifyInstance } from 'fastify'
import { healthRoutes } from './health.routes'

export async function routes(fastify: FastifyInstance) {
    await fastify.register(healthRoutes)
    // Register other routes here
}