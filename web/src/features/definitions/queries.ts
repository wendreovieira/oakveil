import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDefinition, deleteDefinition, getDefinitionById, getDefinitions, updateDefinition } from '@/api/definitions'
import type { DefinitionType } from '@/types/definitions'

export function useDefinitionsQuery(params: {
  type: DefinitionType
  page: number
  pageSize: number
  search?: string
  includeDeleted?: boolean
}) {
  return useQuery({
    queryKey: ['definitions', params],
    queryFn: () => getDefinitions(params)
  })
}

export function useDefinitionByIdQuery(type: DefinitionType, id: string, includeDeleted = true) {
  return useQuery({
    queryKey: ['definition', type, id, includeDeleted],
    queryFn: () => getDefinitionById(type, id, includeDeleted),
    enabled: Boolean(id)
  })
}

export function useDefinitionMutations(type: DefinitionType) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['definitions'] })
  }

  return {
    createMutation: useMutation({
      mutationFn: (payload: Record<string, unknown>) => createDefinition(type, payload),
      onSuccess: invalidate
    }),
    updateMutation: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateDefinition(type, id, payload),
      onSuccess: invalidate
    }),
    deleteMutation: useMutation({
      mutationFn: (id: string) => deleteDefinition(type, id),
      onSuccess: invalidate
    })
  }
}
