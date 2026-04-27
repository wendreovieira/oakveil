export const definitionTypes = [
  'animation',
  'characterrig',
  'characterskin',
  'interaction',
  'item',
  'quest',
  'riganimation',
  'skin',
  'slot',
  'texture',
  'uv',
  'uvvariant'
] as const

export type DefinitionType = (typeof definitionTypes)[number]

export type DefinitionRecord = {
  id: string
  type: string
  key: string
  payload: Record<string, unknown>
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  updatedBy?: string | null
  isDeleted: boolean
}

export type PagedResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}
