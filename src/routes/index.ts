import { FastifyInstance } from 'fastify'
import { jsonToObjectRoutes } from './jsonToObject.routes'
import { generateJsonRoutes } from './generateJsonConfig.routes'
import { yamlToObjectRoutes } from './yamlConfigToObjects.routes'

export async function routes(fastify: FastifyInstance) {
    await fastify.register(jsonToObjectRoutes)
    await fastify.register(generateJsonRoutes)
    await fastify.register(yamlToObjectRoutes)
}
