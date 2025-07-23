import { JsonConfig, MeshData } from "@/types/meshes.types";
interface GltfDocument {
    asset: {
        version: string;
        generator: string;
    };
    scene: number;
    scenes: Array<{
        nodes: number[];
    }>;
    nodes: Array<{
        mesh: number;
        name?: string;
    }>;
    meshes: Array<{
        primitives: Array<{
            attributes: {
                POSITION: number;
                NORMAL?: number;
                TEXCOORD_0?: number;
                COLOR_0?: number;
            };
            indices: number;
            mode: number;
        }>;
        name?: string;
    }>;
    accessors: Array<{
        bufferView: number;
        componentType: number;
        count: number;
        type: string;
        max?: number[];
        min?: number[];
    }>;
    bufferViews: Array<{
        buffer: number;
        byteOffset: number;
        byteLength: number;
        target?: number;
    }>;
    buffers: Array<{
        byteLength: number;
        uri?: string;
    }>;
}

export class JsonToGltfService {
    private static readonly COMPONENT_TYPES = {
        UNSIGNED_BYTE: 5121,
        UNSIGNED_SHORT: 5123,
        UNSIGNED_INT: 5125,
        FLOAT: 5126
    };

    private static readonly TARGETS = {
        ARRAY_BUFFER: 34962,
        ELEMENT_ARRAY_BUFFER: 34963
    };

    private static readonly GLB_MAGIC = 0x46546C67; // "glTF" in ASCII
    private static readonly GLB_VERSION = 2;
    private static readonly CHUNK_TYPE_JSON = 0x4E4F534A; // "JSON" in ASCII
    private static readonly CHUNK_TYPE_BIN = 0x004E4942; // "BIN\0" in ASCII

    static async convertJsonToGltf(jsonConfig: JsonConfig): Promise<{ data: Buffer | string; format: string }> {
        const format = jsonConfig.format || 'glb';
        const gltfDoc = this.createGltfDocument(jsonConfig);

        if (format === 'glb') {
            const glbBuffer = this.createGlbBuffer(gltfDoc);
            return { data: glbBuffer, format: 'glb' };
        } else {
            return { data: JSON.stringify(gltfDoc, null, 2), format: 'gltf' };
        }
    }

    private static createGlbBuffer(gltfDoc: GltfDocument): Buffer {
        // Extract binary data from the buffer
        const buffer = gltfDoc.buffers[0];
        const binaryData = Buffer.from(buffer.uri!.split(',')[1], 'base64');

        // Remove the data URI from the document for GLB
        const gltfDocCopy = JSON.parse(JSON.stringify(gltfDoc));
        gltfDocCopy.buffers[0] = { byteLength: binaryData.length };

        // Create JSON chunk
        const jsonString = JSON.stringify(gltfDocCopy);
        const jsonBuffer = Buffer.from(jsonString, 'utf8');
        const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
        const jsonChunkLength = jsonBuffer.length + jsonPadding;

        // Create binary chunk
        const binPadding = (4 - (binaryData.length % 4)) % 4;
        const binChunkLength = binaryData.length + binPadding;

        // Calculate total GLB size
        const headerSize = 12; // GLB header
        const jsonChunkHeaderSize = 8; // Chunk header
        const binChunkHeaderSize = 8; // Chunk header
        const totalSize = headerSize + jsonChunkHeaderSize + jsonChunkLength + binChunkHeaderSize + binChunkLength;

        // Create GLB buffer
        const glbBuffer = Buffer.alloc(totalSize);
        let offset = 0;

        // GLB Header
        glbBuffer.writeUInt32LE(JsonToGltfService.GLB_MAGIC, offset); offset += 4;
        glbBuffer.writeUInt32LE(JsonToGltfService.GLB_VERSION, offset); offset += 4;
        glbBuffer.writeUInt32LE(totalSize, offset); offset += 4;

        // JSON Chunk Header
        glbBuffer.writeUInt32LE(jsonChunkLength, offset); offset += 4;
        glbBuffer.writeUInt32LE(JsonToGltfService.CHUNK_TYPE_JSON, offset); offset += 4;

        // JSON Chunk Data
        jsonBuffer.copy(glbBuffer, offset);
        offset += jsonBuffer.length;

        // JSON Padding (spaces)
        for (let i = 0; i < jsonPadding; i++) {
            glbBuffer.writeUInt8(0x20, offset++); // Space character
        }

        // Binary Chunk Header
        glbBuffer.writeUInt32LE(binChunkLength, offset); offset += 4;
        glbBuffer.writeUInt32LE(JsonToGltfService.CHUNK_TYPE_BIN, offset); offset += 4;

        // Binary Chunk Data
        binaryData.copy(glbBuffer, offset);
        offset += binaryData.length;

        // Binary Padding (zeros)
        for (let i = 0; i < binPadding; i++) {
            glbBuffer.writeUInt8(0x00, offset++);
        }

        return glbBuffer;
    }

    private static createGltfDocument(jsonConfig: JsonConfig): GltfDocument {
        const meshes = jsonConfig.meshes;
        const scale = jsonConfig.scale || 1.0;

        // Process meshes and apply transformations
        const processedMeshes = meshes.map(mesh => this.processMesh(mesh, scale, jsonConfig.center));

        // Build GLTF document
        const gltfDoc: GltfDocument = {
            asset: {
                version: '2.0',
                generator: 'Custom JSON to GLTF Converter'
            },
            scene: 0,
            scenes: [{
                nodes: processedMeshes.map((_, index) => index)
            }],
            nodes: processedMeshes.map((mesh, index) => ({
                mesh: index,
                name: mesh.name || `Mesh_${index}`
            })),
            meshes: [],
            accessors: [],
            bufferViews: [],
            buffers: []
        };

        // Build buffers and accessors
        const bufferData: number[] = [];
        let byteOffset = 0;

        processedMeshes.forEach((mesh, meshIndex) => {
            const meshPrimitive: any = {
                attributes: {},
                mode: 4 // TRIANGLES
            };

            // Add position data
            const positionByteOffset = byteOffset;
            bufferData.push(...mesh.vertices);
            byteOffset += mesh.vertices.length * 4; // 4 bytes per float

            gltfDoc.bufferViews.push({
                buffer: 0,
                byteOffset: positionByteOffset,
                byteLength: mesh.vertices.length * 4,
                target: JsonToGltfService.TARGETS.ARRAY_BUFFER
            });

            const positionBounds = this.calculateBounds(mesh.vertices, 3);
            gltfDoc.accessors.push({
                bufferView: gltfDoc.bufferViews.length - 1,
                componentType: JsonToGltfService.COMPONENT_TYPES.FLOAT,
                count: mesh.vertices.length / 3,
                type: 'VEC3',
                max: positionBounds.max,
                min: positionBounds.min
            });

            meshPrimitive.attributes.POSITION = gltfDoc.accessors.length - 1;

            // Add normal data if available
            if (mesh.normals && mesh.normals.length > 0) {
                const normalByteOffset = byteOffset;
                bufferData.push(...mesh.normals);
                byteOffset += mesh.normals.length * 4;

                gltfDoc.bufferViews.push({
                    buffer: 0,
                    byteOffset: normalByteOffset,
                    byteLength: mesh.normals.length * 4,
                    target: JsonToGltfService.TARGETS.ARRAY_BUFFER
                });

                gltfDoc.accessors.push({
                    bufferView: gltfDoc.bufferViews.length - 1,
                    componentType: JsonToGltfService.COMPONENT_TYPES.FLOAT,
                    count: mesh.normals.length / 3,
                    type: 'VEC3'
                });

                meshPrimitive.attributes.NORMAL = gltfDoc.accessors.length - 1;
            }

            // Add UV data if available
            if (mesh.uvs && mesh.uvs.length > 0) {
                const uvByteOffset = byteOffset;
                bufferData.push(...mesh.uvs);
                byteOffset += mesh.uvs.length * 4;

                gltfDoc.bufferViews.push({
                    buffer: 0,
                    byteOffset: uvByteOffset,
                    byteLength: mesh.uvs.length * 4,
                    target: JsonToGltfService.TARGETS.ARRAY_BUFFER
                });

                gltfDoc.accessors.push({
                    bufferView: gltfDoc.bufferViews.length - 1,
                    componentType: JsonToGltfService.COMPONENT_TYPES.FLOAT,
                    count: mesh.uvs.length / 2,
                    type: 'VEC2'
                });

                meshPrimitive.attributes.TEXCOORD_0 = gltfDoc.accessors.length - 1;
            }

            // Add color data if available
            if (mesh.colors && mesh.colors.length > 0) {
                const colorByteOffset = byteOffset;
                bufferData.push(...mesh.colors);
                byteOffset += mesh.colors.length * 4;

                gltfDoc.bufferViews.push({
                    buffer: 0,
                    byteOffset: colorByteOffset,
                    byteLength: mesh.colors.length * 4,
                    target: JsonToGltfService.TARGETS.ARRAY_BUFFER
                });

                gltfDoc.accessors.push({
                    bufferView: gltfDoc.bufferViews.length - 1,
                    componentType: JsonToGltfService.COMPONENT_TYPES.FLOAT,
                    count: mesh.colors.length / 4,
                    type: 'VEC4'
                });

                meshPrimitive.attributes.COLOR_0 = gltfDoc.accessors.length - 1;
            }

            // Add indices
            const indicesByteOffset = byteOffset;
            bufferData.push(...mesh.indices);
            byteOffset += mesh.indices.length * 4;

            gltfDoc.bufferViews.push({
                buffer: 0,
                byteOffset: indicesByteOffset,
                byteLength: mesh.indices.length * 4,
                target: JsonToGltfService.TARGETS.ELEMENT_ARRAY_BUFFER
            });

            gltfDoc.accessors.push({
                bufferView: gltfDoc.bufferViews.length - 1,
                componentType: JsonToGltfService.COMPONENT_TYPES.UNSIGNED_INT,
                count: mesh.indices.length,
                type: 'SCALAR'
            });

            meshPrimitive.indices = gltfDoc.accessors.length - 1;

            gltfDoc.meshes.push({
                primitives: [meshPrimitive],
                name: mesh.name || `Mesh_${meshIndex}`
            });
        });

        // Create buffer with binary data
        const buffer = new Float32Array(bufferData);
        const base64Data = Buffer.from(buffer.buffer).toString('base64');

        gltfDoc.buffers.push({
            byteLength: buffer.byteLength,
            uri: `data:application/octet-stream;base64,${base64Data}`
        });

        return gltfDoc;
    }

    private static processMesh(mesh: MeshData, scale: number, center?: boolean): MeshData {
        let vertices = [...mesh.vertices];

        // Apply scaling
        if (scale !== 1.0) {
            for (let i = 0; i < vertices.length; i++) {
                vertices[i] *= scale;
            }
        }

        // Center the mesh if requested
        if (center) {
            const bounds = this.calculateBounds(vertices, 3);
            const centerX = (bounds.max[0] + bounds.min[0]) / 2;
            const centerY = (bounds.max[1] + bounds.min[1]) / 2;
            const centerZ = (bounds.max[2] + bounds.min[2]) / 2;

            for (let i = 0; i < vertices.length; i += 3) {
                vertices[i] -= centerX;
                vertices[i + 1] -= centerY;
                vertices[i + 2] -= centerZ;
            }
        }

        // Generate normals if not provided
        let normals = mesh.normals;
        if (!normals || normals.length === 0) {
            normals = this.generateNormals(vertices, mesh.indices);
        }

        return {
            ...mesh,
            vertices,
            normals
        };
    }

    private static calculateBounds(data: number[], stride: number): { min: number[], max: number[] } {
        const min = new Array(stride).fill(Infinity);
        const max = new Array(stride).fill(-Infinity);

        for (let i = 0; i < data.length; i += stride) {
            for (let j = 0; j < stride; j++) {
                min[j] = Math.min(min[j], data[i + j]);
                max[j] = Math.max(max[j], data[i + j]);
            }
        }

        return { min, max };
    }

    private static generateNormals(vertices: number[], indices: number[]): number[] {
        const normals = new Array(vertices.length).fill(0);

        // Calculate face normals and accumulate vertex normals
        for (let i = 0; i < indices.length; i += 3) {
            const i1 = indices[i] * 3;
            const i2 = indices[i + 1] * 3;
            const i3 = indices[i + 2] * 3;

            const v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]];
            const v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]];
            const v3 = [vertices[i3], vertices[i3 + 1], vertices[i3 + 2]];

            // Calculate face normal using cross product
            const edge1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
            const edge2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];

            const normal = [
                edge1[1] * edge2[2] - edge1[2] * edge2[1],
                edge1[2] * edge2[0] - edge1[0] * edge2[2],
                edge1[0] * edge2[1] - edge1[1] * edge2[0]
            ];

            // Accumulate normals for each vertex of the face
            [i1, i2, i3].forEach(idx => {
                normals[idx] += normal[0];
                normals[idx + 1] += normal[1];
                normals[idx + 2] += normal[2];
            });
        }

        // Normalize the accumulated normals
        for (let i = 0; i < normals.length; i += 3) {
            const length = Math.sqrt(normals[i] ** 2 + normals[i + 1] ** 2 + normals[i + 2] ** 2);
            if (length > 0) {
                normals[i] /= length;
                normals[i + 1] /= length;
                normals[i + 2] /= length;
            }
        }

        return normals;
    }
}