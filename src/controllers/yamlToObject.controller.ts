// controllers/yamlToObject.controller.ts
import { ResponseUtil } from '@/utils/response.utils'
import { FastifyRequest, FastifyReply } from 'fastify'
import * as yaml from 'yaml'
import { JsonToObjectController } from './jsonToObject.controller'
import { MeshData, JsonConfig } from '@/types/meshes.types'

type YamlToObjectRequest = FastifyRequest<{
    Body: {
        yaml: string
        scale?: number
        center?: boolean
    }
}>

type JsonConfigRequest = FastifyRequest<{
    Body: { jsonConfig: JsonConfig }
}>

export class YamlToObjectController {
    static async yamlToObject(request: YamlToObjectRequest, reply: FastifyReply) {
        try {
            // Parse YAML with proper error handling
            const parsedYaml: { meshes: MeshData[] } = yaml.parse(request.body.yaml)

            if (!parsedYaml.meshes) {
                return ResponseUtil.badRequest(reply, 'YAML must contain a "meshes" property')
            }

            // Create the transformed request object with proper typing
            const transformedRequest: JsonConfigRequest = {
                ...request,
                body: {
                    jsonConfig: {
                        meshes: parsedYaml.meshes,
                        scale: request.body.scale,
                        center: request.body.center
                    }
                }
            }

            // Delegate to JSON controller (tight coupling by design)
            return await JsonToObjectController.createObjectFromJson(transformedRequest, reply)
        } catch (error) {
            console.error('Error processing YAML:', error)

            if (error instanceof yaml.YAMLParseError) {
                return ResponseUtil.badRequest(reply, 'Invalid YAML format', [error.message])
            }

            return ResponseUtil.error(reply, 'Failed to process YAML')
        }
    }
}
