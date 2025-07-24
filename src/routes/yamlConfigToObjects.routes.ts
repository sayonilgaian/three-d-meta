import { YamlToObjectController } from '@/controllers/yamlToObject.controller'
import { FastifyInstance } from 'fastify'

export async function yamlToObjectRoutes(fastify: FastifyInstance) {
    fastify.post(
        '/yaml-to-gltf',
        {
            schema: {
                description: 'Convert Yaml mesh data to GLTF/GLB 3D object',
                tags: ['yaml-to-gtlf'],
                body: {
                    type: 'object',
                    properties: {
                        yaml: {
                            type: 'string'
                        },
                        scale: { type: 'number' },
                        center: { type: 'boolean' }
                    },
                    required: ['yaml']
                },
                response: {
                    200: {
                        description: 'Successfully generated 3D file'
                    },
                    400: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: { type: 'null' }
                        }
                    },
                    500: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: { type: 'null' }
                        }
                    }
                }
            }
        },
        YamlToObjectController.yamlToObject
    )
}
