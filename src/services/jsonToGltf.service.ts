import { JsonConfig, MeshData } from '@/types/meshes.types'

interface GltfDocument {
    asset: { version: string; generator: string }
    scene: number
    scenes: Array<{ nodes: number[] }>
    nodes: Array<{ mesh: number; name?: string }>
    meshes: Array<{
        primitives: Array<{
            attributes: {
                POSITION: number
                NORMAL?: number
                TEXCOORD_0?: number
                COLOR_0?: number
            }
            indices: number
            mode: number
            material?: number
        }>
        name?: string
    }>
    accessors: Array<{
        bufferView: number
        componentType: number
        count: number
        type: string
        max?: number[]
        min?: number[]
    }>
    bufferViews: Array<{
        buffer: number
        byteOffset: number
        byteLength: number
        target?: number
    }>
    buffers: Array<{ byteLength: number; uri?: string }>
    materials?: Array<any>
}

export class JsonToGltfService {
    private static readonly COMPONENT_TYPES = {
        UNSIGNED_BYTE: 5121,
        UNSIGNED_SHORT: 5123,
        UNSIGNED_INT: 5125,
        FLOAT: 5126
    }

    private static readonly TARGETS = {
        ARRAY_BUFFER: 34962,
        ELEMENT_ARRAY_BUFFER: 34963
    }

    private static readonly GLB_MAGIC = 0x46546c67
    private static readonly GLB_VERSION = 2
    private static readonly CHUNK_TYPE_JSON = 0x4e4f534a
    private static readonly CHUNK_TYPE_BIN = 0x004e4942

    static async convertJsonToGltf(
        jsonConfig: JsonConfig
    ): Promise<{ data: Buffer | string; format: string }> {
        const format = jsonConfig.format || 'glb'
        const gltfDoc = this.createGltfDocument(jsonConfig)

        if (format === 'glb') {
            const glbBuffer = this.createGlbBuffer(gltfDoc)
            return { data: glbBuffer, format: 'glb' }
        } else {
            return { data: JSON.stringify(gltfDoc, null, 2), format: 'gltf' }
        }
    }

    private static createGlbBuffer(gltfDoc: GltfDocument): Buffer {
        const buffer = gltfDoc.buffers[0]
        const binaryData = Buffer.from(buffer.uri!.split(',')[1], 'base64')
        const gltfCopy = JSON.parse(JSON.stringify(gltfDoc))
        gltfCopy.buffers[0] = { byteLength: binaryData.length }

        const jsonBuffer = Buffer.from(JSON.stringify(gltfCopy), 'utf8')
        const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4
        const binPadding = (4 - (binaryData.length % 4)) % 4

        const totalSize =
            12 + 8 + jsonBuffer.length + jsonPadding + 8 + binaryData.length + binPadding
        const glbBuffer = Buffer.alloc(totalSize)

        let offset = 0
        glbBuffer.writeUInt32LE(this.GLB_MAGIC, offset)
        offset += 4
        glbBuffer.writeUInt32LE(this.GLB_VERSION, offset)
        offset += 4
        glbBuffer.writeUInt32LE(totalSize, offset)
        offset += 4

        glbBuffer.writeUInt32LE(jsonBuffer.length + jsonPadding, offset)
        offset += 4
        glbBuffer.writeUInt32LE(this.CHUNK_TYPE_JSON, offset)
        offset += 4
        jsonBuffer.copy(glbBuffer, offset)
        offset += jsonBuffer.length
        glbBuffer.fill(0x20, offset, offset + jsonPadding)
        offset += jsonPadding

        glbBuffer.writeUInt32LE(binaryData.length + binPadding, offset)
        offset += 4
        glbBuffer.writeUInt32LE(this.CHUNK_TYPE_BIN, offset)
        offset += 4
        binaryData.copy(glbBuffer, offset)
        offset += binaryData.length
        glbBuffer.fill(0x00, offset, offset + binPadding)

        return glbBuffer
    }

    private static createGltfDocument(jsonConfig: JsonConfig): GltfDocument {
        const meshes = jsonConfig.meshes
        const scale = jsonConfig.scale || 1.0
        const processedMeshes = meshes.map((mesh) =>
            this.processMesh(mesh, scale, jsonConfig.center)
        )

        const gltfDoc: GltfDocument = {
            asset: { version: '2.0', generator: 'JsonToGltfService' },
            scene: 0,
            scenes: [{ nodes: processedMeshes.map((_, i) => i) }],
            nodes: processedMeshes.map((_, i) => ({ mesh: i })),
            meshes: [],
            accessors: [],
            bufferViews: [],
            buffers: [],
            materials: [
                {
                    pbrMetallicRoughness: {
                        baseColorFactor: [1, 1, 1, 1],
                        metallicFactor: 0,
                        roughnessFactor: 1
                    },
                    doubleSided: true
                }
            ]
        }

        const vertexData: number[] = []
        const indexData: number[] = []
        let vertexOffset = 0

        processedMeshes.forEach((mesh, i) => {
            const primitive: any = {
                attributes: {},
                indices: 0,
                mode: 4,
                material: 0
            }

            const pushAccessor = (
                data: number[],
                type: 'SCALAR' | 'VEC2' | 'VEC3' | 'VEC4',
                componentType: number,
                target: number
            ) => {
                const byteOffset = vertexOffset * 4
                vertexData.push(...data)
                vertexOffset += data.length

                gltfDoc.bufferViews.push({
                    buffer: 0,
                    byteOffset,
                    byteLength: data.length * 4,
                    target
                })

                const bounds = type === 'VEC3' ? this.calculateBounds(data, 3) : undefined

                gltfDoc.accessors.push({
                    bufferView: gltfDoc.bufferViews.length - 1,
                    componentType,
                    count:
                        data.length / (type === 'SCALAR' ? 1 : parseInt(type.replace('VEC', ''))),
                    type,
                    ...(bounds || {})
                })

                return gltfDoc.accessors.length - 1
            }

            primitive.attributes.POSITION = pushAccessor(
                mesh.vertices,
                'VEC3',
                this.COMPONENT_TYPES.FLOAT,
                this.TARGETS.ARRAY_BUFFER
            )
            if (mesh.normals && mesh.normals.length) {
                primitive.attributes.NORMAL = pushAccessor(
                    mesh.normals,
                    'VEC3',
                    this.COMPONENT_TYPES.FLOAT,
                    this.TARGETS.ARRAY_BUFFER
                )
            }
            if (mesh.uvs && mesh.uvs.length) {
                primitive.attributes.TEXCOORD_0 = pushAccessor(
                    mesh.uvs,
                    'VEC2',
                    this.COMPONENT_TYPES.FLOAT,
                    this.TARGETS.ARRAY_BUFFER
                )
            }
            if (mesh.colors && mesh.colors.length) {
                primitive.attributes.COLOR_0 = pushAccessor(
                    mesh.colors,
                    'VEC4',
                    this.COMPONENT_TYPES.FLOAT,
                    this.TARGETS.ARRAY_BUFFER
                )
            }

            const indexOffset = indexData.length * 4
            indexData.push(...mesh.indices)

            gltfDoc.bufferViews.push({
                buffer: 0,
                byteOffset: vertexOffset * 4,
                byteLength: mesh.indices.length * 4,
                target: this.TARGETS.ELEMENT_ARRAY_BUFFER
            })

            gltfDoc.accessors.push({
                bufferView: gltfDoc.bufferViews.length - 1,
                componentType: this.COMPONENT_TYPES.UNSIGNED_INT,
                count: mesh.indices.length,
                type: 'SCALAR'
            })

            primitive.indices = gltfDoc.accessors.length - 1
            vertexOffset += mesh.indices.length

            gltfDoc.meshes.push({ primitives: [primitive], name: mesh.name || `Mesh_${i}` })
        })

        const vertexBuffer = new Float32Array(vertexData)
        const indexBuffer = new Uint32Array(indexData)
        const binary = Buffer.concat([
            Buffer.from(vertexBuffer.buffer),
            Buffer.from(indexBuffer.buffer)
        ])

        gltfDoc.buffers.push({
            byteLength: binary.byteLength,
            uri: `data:application/octet-stream;base64,${binary.toString('base64')}`
        })

        return gltfDoc
    }

    private static processMesh(mesh: MeshData, scale: number, center?: boolean): MeshData {
        let vertices = [...mesh.vertices]

        if (scale !== 1.0) {
            vertices = vertices.map((v) => v * scale)
        }

        if (center) {
            const bounds = this.calculateBounds(vertices, 3)
            const centerVec = bounds.max.map((v, i) => (v + bounds.min[i]) / 2)
            for (let i = 0; i < vertices.length; i += 3) {
                vertices[i] -= centerVec[0]
                vertices[i + 1] -= centerVec[1]
                vertices[i + 2] -= centerVec[2]
            }
        }

        const normals = mesh.normals?.length
            ? mesh.normals
            : this.generateNormals(vertices, mesh.indices)

        return { ...mesh, vertices, normals }
    }

    private static calculateBounds(
        data: number[],
        stride: number
    ): { min: number[]; max: number[] } {
        const min = Array(stride).fill(Infinity)
        const max = Array(stride).fill(-Infinity)
        for (let i = 0; i < data.length; i += stride) {
            for (let j = 0; j < stride; j++) {
                const val = data[i + j]
                if (val < min[j]) min[j] = val
                if (val > max[j]) max[j] = val
            }
        }
        return { min, max }
    }

    private static generateNormals(vertices: number[], indices: number[]): number[] {
        const normals = new Array(vertices.length).fill(0)
        for (let i = 0; i < indices.length; i += 3) {
            const i1 = indices[i] * 3
            const i2 = indices[i + 1] * 3
            const i3 = indices[i + 2] * 3

            const v1 = vertices.slice(i1, i1 + 3)
            const v2 = vertices.slice(i2, i2 + 3)
            const v3 = vertices.slice(i3, i3 + 3)

            const edge1 = v2.map((v, j) => v - v1[j])
            const edge2 = v3.map((v, j) => v - v1[j])

            const normal = [
                edge1[1] * edge2[2] - edge1[2] * edge2[1],
                edge1[2] * edge2[0] - edge1[0] * edge2[2],
                edge1[0] * edge2[1] - edge1[1] * edge2[0]
            ]

            ;[i1, i2, i3].forEach((idx) => {
                normals[idx] += normal[0]
                normals[idx + 1] += normal[1]
                normals[idx + 2] += normal[2]
            })
        }

        for (let i = 0; i < normals.length; i += 3) {
            const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2])
            if (len > 0) {
                normals[i] /= len
                normals[i + 1] /= len
                normals[i + 2] /= len
            }
        }

        return normals
    }
}
