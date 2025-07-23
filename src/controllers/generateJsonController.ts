import { FastifyReply, FastifyRequest } from 'fastify'
import { ResponseUtil } from '@/utils/response.utils'

type GenerateJsonConfigRequest = FastifyRequest<
    {
        Headers: {
            'open-ai-key': string
        }
    }
>

export class GenerateJsonController {
    static async generateJsonFromAi(request: GenerateJsonConfigRequest, reply: FastifyReply) {
        const data = request.headers['open-ai-key']

        return ResponseUtil.success(reply, { data }, '', 200)

    }
}