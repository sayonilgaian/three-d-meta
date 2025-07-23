import { FastifyInstance } from 'fastify';
import { JsonToObjectController } from '@/controllers/jsonToObject.controller';

export async function jsonToObjectRoutes(fastify: FastifyInstance) {
    fastify.post(
        '/json-to-object',
        {
            schema: {
                description: 'Convert JSON mesh data to GLTF/GLB 3D object',
                tags: ['3d', 'json', 'gltf'],
                body: {
                    type: 'object',
                    properties: {
                        jsonConfig: {
                            type: 'object',
                            properties: {
                                meshes: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            vertices: {
                                                type: 'array',
                                                items: { type: 'number' }
                                            },
                                            indices: {
                                                type: 'array',
                                                items: { type: 'number' }
                                            },
                                            normals: {
                                                type: 'array',
                                                items: { type: 'number' }
                                            },
                                            uvs: {
                                                type: 'array',
                                                items: { type: 'number' }
                                            },
                                            colors: {
                                                type: 'array',
                                                items: { type: 'number' }
                                            }
                                        },
                                        required: ['vertices', 'indices']
                                    }
                                },
                                format: {
                                    type: 'string',
                                    enum: ['gltf', 'glb']
                                },
                                scale: { type: 'number' },
                                center: { type: 'boolean' }
                            },
                            required: ['meshes']
                        }
                    },
                    required: ['jsonConfig']
                },
                response: {
                    200: {
                        description: 'Successfully generated 3D file',
                        // Note: Response will be binary for GLB or JSON string for GLTF
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
        JsonToObjectController.createObjectFromJson
    );
}