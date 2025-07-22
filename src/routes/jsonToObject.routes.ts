import { FastifyInstance } from 'fastify'
import { JsonToObjectController } from '@/controllers/jsonToObject.controller'

export async function jsonToObjectRoutes(fastify: FastifyInstance) {
    fastify.post(
        '/json-to-object',
        {
            schema: {
                description: 'Json to 3d object endpoint',
                tags: ['3d', 'json'],
                body: {
                    type: 'object',
                    properties: {
                        jsonConfig: {
                            type: 'object'
                        }
                    },
                    required: ['jsonConfig']
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: {
                                type: 'object',
                                additionalProperties: true
                            }
                        }
                    }
                }
            }
        },
        JsonToObjectController.createObjectFromJson
    )
}
