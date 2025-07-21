import { Type, Static } from '@sinclair/typebox'

// Common schemas
export const PaginationSchema = Type.Object({
    page: Type.Number({ minimum: 1, default: 1 }),
    limit: Type.Number({ minimum: 1, maximum: 100, default: 10 })
})

export const IdParamSchema = Type.Object({
    id: Type.String({ format: 'uuid' })
})

// User schemas
export const CreateUserSchema = Type.Object({
    name: Type.String({ minLength: 2, maxLength: 100 }),
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8, maxLength: 128 })
})

export const UpdateUserSchema = Type.Partial(Type.Omit(CreateUserSchema, ['password']))

export const UserResponseSchema = Type.Object({
    id: Type.String(),
    name: Type.String(),
    email: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
})

// Export types
export type PaginationQuery = Static<typeof PaginationSchema>
export type IdParam = Static<typeof IdParamSchema>
export type CreateUserBody = Static<typeof CreateUserSchema>
export type UpdateUserBody = Static<typeof UpdateUserSchema>
export type UserResponse = Static<typeof UserResponseSchema>
