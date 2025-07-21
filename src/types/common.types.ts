export interface ApiResponse<T = any> {
    success: boolean
    message?: string
    data?: T
    errors?: string[]
    pagination?: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export interface PaginationOptions {
    page: number
    limit: number
    offset: number
}

export interface DatabaseEntity {
    id: string
    createdAt: Date
    updatedAt: Date
}