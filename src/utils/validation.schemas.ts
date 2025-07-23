import { Type, Static } from '@sinclair/typebox'

// Common schemas
export const PaginationSchema = Type.Object({
    page: Type.Number({ minimum: 1, default: 1 }),
    limit: Type.Number({ minimum: 1, maximum: 100, default: 10 })
})

export const IdParamSchema = Type.Object({
    id: Type.String({ format: 'uuid' })
})

// Export types
export type PaginationQuery = Static<typeof PaginationSchema>
export type IdParam = Static<typeof IdParamSchema>
