import { apiClient } from '@/api/client'
import type { DefinitionRecord, DefinitionType, PagedResponse } from '@/types/definitions'

export async function getDefinitions(params: {
  type: DefinitionType
  page: number
  pageSize: number
  search?: string
  includeDeleted?: boolean
}) {
  const { data } = await apiClient.get<PagedResponse<DefinitionRecord>>(`/api/definitions/${params.type}/`, {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      includeDeleted: params.includeDeleted || undefined
    }
  })

  return data
}

export async function getDefinitionById(type: DefinitionType, id: string, includeDeleted = false) {
  const { data } = await apiClient.get<DefinitionRecord>(`/api/definitions/${type}/${id}`, {
    params: { includeDeleted }
  })
  return data
}

export async function createDefinition(type: DefinitionType, payload: Record<string, unknown>) {
  const { data } = await apiClient.post<DefinitionRecord>(`/api/definitions/${type}/`, payload)
  return data
}

export async function updateDefinition(type: DefinitionType, id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.put<DefinitionRecord>(`/api/definitions/${type}/${id}`, payload)
  return data
}

export async function deleteDefinition(type: DefinitionType, id: string) {
  await apiClient.delete(`/api/definitions/${type}/${id}`)
}
