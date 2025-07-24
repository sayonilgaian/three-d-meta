import { ResponseUtil } from "@/utils/response.utils";
import { FastifyRequest, FastifyReply } from "fastify";

type YamlToObjectRequest = FastifyRequest<{
    Body: {
        yaml: string
        scale?: number,
        center?: boolean
    }
}>

export class YamlToObjectController {
    static yamlToObject(request: YamlToObjectRequest, reply: FastifyReply) {

        ResponseUtil.success(reply, request.body.yaml, '', 200)
    }
}