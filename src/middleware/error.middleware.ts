import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import logger from '@/utils/logger'
import { ResponseUtil } from '@/utils/response.utils'

export async function errorHandler(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) {
    logger.error({ err: error, req: request }, 'Request error')

    // Validation errors
    if (error.validation) {
        const validationErrors = error.validation.map((err) =>
            `${err.instancePath} ${err.message}`.trim()
        )
        return ResponseUtil.badRequest(reply, 'Validation failed', validationErrors)
    }

    // Rate limit errors
    if (error.statusCode === 429) {
        return ResponseUtil.error(
            reply,
            'Too many requests',
            undefined,
            StatusCodes.TOO_MANY_REQUESTS
        )
    }

    // Not found errors
    if (error.statusCode === 404) {
        return ResponseUtil.notFound(reply, 'Route not found')
    }

    // Authentication errors
    if (error.statusCode === 401) {
        return ResponseUtil.unauthorized(reply)
    }

    // Authorization errors
    if (error.statusCode === 403) {
        return ResponseUtil.forbidden(reply)
    }

    // Default to 500 server error
    const isDevelopment = process.env.NODE_ENV === 'development'
    const message = isDevelopment ? error.message : 'Internal server error'

    return ResponseUtil.error(reply, message, undefined, StatusCodes.INTERNAL_SERVER_ERROR)
}
