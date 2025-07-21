import { FastifyReply, FastifyRequest } from 'fastify'
import { ResponseUtil } from '@/utils/response.utils'

export class HealthController {
    static async check(request: FastifyRequest, reply: FastifyReply) {
        const healthData = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        }

        return ResponseUtil.success(reply, healthData, 'Service is healthy')
    }

    static async ready(request: FastifyRequest, reply: FastifyReply) {
        // Add database connectivity checks here
        return ResponseUtil.success(reply, { status: 'ready' }, 'Service is ready')
    }
}