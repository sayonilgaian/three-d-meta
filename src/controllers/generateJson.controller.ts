import { FastifyReply, FastifyRequest } from 'fastify'
import { ResponseUtil } from '@/utils/response.utils'
import { z } from 'zod'
import openAiStructuredJson from '@/utils/openAiStructuredJson'

type GenerateJsonConfigRequest = FastifyRequest<{
    Headers: {
        'open-ai-key': string
    }
    Body: {
        prompt?: string
    }
}>

export class GenerateJsonController {
    static async generateJsonFromAi(request: GenerateJsonConfigRequest, reply: FastifyReply) {
        const openAiToken = request.headers['open-ai-key']

        const jsonConfig3d = z.object({
            meshes: z.array(
                z.object({
                    // name: z.optional(z.string()).nullable(),
                    name: z.string(),
                    vertices: z.array(z.number()),
                    indices: z.array(z.number()),
                    uvs: z.array(z.number()),
                    colors: z.array(z.number())
                })
            )
        })

        const generatedJsonConfig = await openAiStructuredJson(openAiToken, jsonConfig3d)

        return ResponseUtil.success(reply, generatedJsonConfig, '', 200)
    }
}
