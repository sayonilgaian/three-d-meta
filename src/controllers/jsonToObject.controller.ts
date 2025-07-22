import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { ResponseUtil } from '@/utils/response.utils'

type JsonConfigRequest = FastifyRequest<{
    Body: { jsonConfig: object }
}>

export class JsonToObjectController {
    static async createObjectFromJson(request: JsonConfigRequest, reply: FastifyReply) {

        const { jsonConfig } = request.body

        return ResponseUtil.success(reply, jsonConfig, '3d Object Created!')
    }
}