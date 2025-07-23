import axios from 'axios'
import FormData from 'form-data'
import { v4 as uuidV4 } from 'uuid'
import refreshToken from './refreshToken'

interface UploadToCmsResponse {
    id: string
    status: string
    msg: string
    url: string
    info: {
        name: string
        contentType: string
        length: number
        tenantId: string
        version: number
        id: string
        description: string
        cdnUrl: string
        metadata: Record<string, any>
        createdOn: number
        contentTags: string[]
        tags: Record<string, any>
    }
    cdnUrl: string
}

interface UploadResult {
    success: boolean
    data: any
}

export default async function uploadToCms(fileData: Buffer): Promise<UploadResult> {
    const { data: refreshTokenData } = await refreshToken()
    const token = refreshTokenData.token

    const cmsUrl =
        'https://ig.gov-cloud.ai/mobius-content-service/v1.0/content/upload?filePath=L_zero_marketplace&contentTags=test'

    const formData = new FormData()
    formData.append('file', fileData, {
        filename: `threeDObject-${uuidV4()}.gltf`,
        contentType: 'application/octet-stream'
    })

    try {
        const response = await axios.post<UploadToCmsResponse>(cmsUrl, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${token}`
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        })

        return {
            success: true,
            data: `https://cdn.gov-cloud.ai/${response.data.cdnUrl}`
        }
    } catch (error: any) {
        return {
            success: false,
            data: error?.response?.data ?? 'Unknown error'
        }
    }
}
