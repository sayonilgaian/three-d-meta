import { GenerateJsonController } from '@/controllers/generateJson.controller'
import { FastifyInstance } from 'fastify'

export async function generateJsonRoutes(fastify: FastifyInstance) {
    fastify.get(
        '/generate-3d-json',
        {
            schema: {
                description: 'Generate 3d json config endpoint',
                tags: ['generate-3d-json'],
                headers: {
                    type: 'object',
                    properties: {
                        'open-ai-key': { type: 'string' }
                    },
                    required: ['open-ai-key']
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
        GenerateJsonController.generateJsonFromAi
    )

    fastify.post(
        '/generate-3d-json',
        {
            schema: {
                description: 'Generate 3d json config',
                tags: ['generate-3d-json'],
                headers: {
                    type: 'object',
                    properties: {
                        'open-ai-key': { type: 'string' }
                    },
                    required: ['open-ai-key']
                },
                body: {
                    type: 'object',
                    properties: {
                        prompt: { type: 'string' }
                    }
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
        GenerateJsonController.generateJsonFromAi
    )
}
