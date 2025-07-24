export interface MeshData {
    name?: string
    vertices: number[] // Array of vertex positions [x1,y1,z1, x2,y2,z2, ...]
    indices: number[] // Array of triangle indices
    normals?: number[] // Array of normal vectors [nx1,ny1,nz1, ...]
    uvs?: number[] // Array of UV coordinates [u1,v1, u2,v2, ...]
    colors?: number[] // Array of vertex colors [r1,g1,b1,a1, ...]
}

export interface JsonConfig {
    meshes: MeshData[]
    scale?: number // Scale factor for the model
    center?: boolean // Whether to center the model
}
