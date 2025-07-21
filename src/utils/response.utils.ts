import { FastifyReply } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '@/types/common.types'

export class ResponseUtil {
    static success<T>(
        reply: FastifyReply,
        data?: T,
        message?: string,
        statusCode = StatusCodes.OK
    ) {
        const response: ApiResponse<T> = {
            success: true,
            ...(message && { message }),
            ...(data && { data })
        }

        return reply.code(statusCode).send(response)
    }

    static created<T>(reply: FastifyReply, data?: T, message = 'Resource created successfully') {
        return this.success(reply, data, message, StatusCodes.CREATED)
    }

    static error(
        reply: FastifyReply,
        message = 'Internal server error',
        errors?: string[],
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    ) {
        const response: ApiResponse = {
            success: false,
            message,
            ...(errors && { errors })
        }

        return reply.code(statusCode).send(response)
    }

    static badRequest(reply: FastifyReply, message = 'Bad request', errors?: string[]) {
        return this.error(reply, message, errors, StatusCodes.BAD_REQUEST)
    }

    static unauthorized(reply: FastifyReply, message = 'Unauthorized') {
        return this.error(reply, message, undefined, StatusCodes.UNAUTHORIZED)
    }

    static forbidden(reply: FastifyReply, message = 'Forbidden') {
        return this.error(reply, message, undefined, StatusCodes.FORBIDDEN)
    }

    static notFound(reply: FastifyReply, message = 'Resource not found') {
        return this.error(reply, message, undefined, StatusCodes.NOT_FOUND)
    }

    static paginated<T>(
        reply: FastifyReply,
        data: T[],
        page: number,
        limit: number,
        total: number,
        message?: string
    ) {
        const response: ApiResponse<T[]> = {
            success: true,
            ...(message && { message }),
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }

        return reply.send(response)
    }
}