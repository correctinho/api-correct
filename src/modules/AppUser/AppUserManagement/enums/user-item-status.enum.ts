// Este enum reflete os status possíveis no domínio.
// Os valores (strings à direita) estão em minúsculo para bater
// exatamente com o que o Prisma espera no banco de dados.

export enum UserItemStatusEnum {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BLOCKED = 'blocked',
    CANCELLED = 'cancelled',
    TO_BE_CANCELLED = 'to_be_cancelled'
}