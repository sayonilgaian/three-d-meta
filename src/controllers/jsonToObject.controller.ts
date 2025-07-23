import { JsonConfig } from './../types/meshes.types';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ResponseUtil } from '@/utils/response.utils';
import { JsonToGltfService } from '@/services/jsonToGltf.service';
import uploadToCms from '@/utils/cmsUpload';

type JsonConfigRequest = FastifyRequest<{
    Body: { jsonConfig: JsonConfig }
}>

export class JsonToObjectController {
    static async createObjectFromJson(request: JsonConfigRequest, reply: FastifyReply) {
        try {
            const { jsonConfig } = request.body;

            // Validate input
            if (!jsonConfig.meshes || !Array.isArray(jsonConfig.meshes) || jsonConfig.meshes.length === 0) {
                return ResponseUtil.error(reply, 'Invalid JSON config: meshes array is required', [], 400);
            }

            // Validate each mesh
            for (const mesh of jsonConfig.meshes) {
                if (!mesh.vertices || !Array.isArray(mesh.vertices) || mesh.vertices.length === 0) {
                    return ResponseUtil.error(reply, 'Invalid mesh: vertices array is required', [], 400);
                }
                if (!mesh.indices || !Array.isArray(mesh.indices) || mesh.indices.length === 0) {
                    return ResponseUtil.error(reply, 'Invalid mesh: indices array is required', [], 400);
                }
                if (mesh.vertices.length % 3 !== 0) {
                    return ResponseUtil.error(reply, 'Invalid mesh: vertices array length must be divisible by 3', [], 400);
                }
            }

            const result = await JsonToGltfService.convertJsonToGltf(jsonConfig);

            // Set appropriate headers for file download
            const format = jsonConfig.format || 'glb';

            if (Buffer.isBuffer(result.data)) {
                const uploadToCmsData = await uploadToCms(result.data)
                if (uploadToCmsData.success) {
                    ResponseUtil.success(reply, uploadToCmsData.data, '3D asset created succesfully!', 200)
                } else {
                    ResponseUtil.success(reply, uploadToCmsData.data, '3D asset creation failed!', 500)
                }
            }

        } catch (error) {
            console.error('Error creating 3D object:', error);
            return ResponseUtil.error(reply, 'Failed to create 3D object', [], 500);
        }
    }
}