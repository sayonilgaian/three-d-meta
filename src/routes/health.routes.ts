import { FastifyInstance } from 'fastify'
import { HealthController } from '@/controllers/health.controller'

export async function healthRoutes(fastify: FastifyInstance) {
    fastify.get(
        '/health',
        {
            schema: {
                description: 'Health check endpoint',
                tags: ['Health'],
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string' },
                                    timestamp: { type: 'string' },
                                    uptime: { type: 'number' },
                                    version: { type: 'string' },
                                    environment: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        },
        HealthController.check
    )

    fastify.get(
        '/ready',
        {
            schema: {
                description: 'Readiness check endpoint',
                tags: ['Health']
            }
        },
        HealthController.ready
    )
}
