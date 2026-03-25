/**
 * ViewModel: Admin
 *
 * - Generate and list invite codes
 * - List operators
 */
import { useCallback } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { queryKeys }       from '../../lib/query-keys'
import { getErrorMessage } from '../../lib/handle-error'
import {
  createInvite,
  listInvites,
  listOperators,
} from '../../api/admin.service'
import { Role } from '../../types/api'
import type { CreateInviteDto } from '../../types/api'

// ─── Admin: invite management ─────────────────────────────────────────────────

export function useInviteManagementViewModel() {
  const queryClient = useQueryClient()

  const invitesQuery = useQuery({
    queryKey: queryKeys.admin.invites(),
    queryFn:  listInvites,
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: createInvite,
    onSuccess: (newInvite) => {
      // Optimistically prepend to the list
      queryClient.setQueryData(
        queryKeys.admin.invites(),
        (prev: Awaited<ReturnType<typeof listInvites>> | undefined) =>
          prev ? [newInvite, ...prev] : [newInvite],
      )
    },
  })

  const handleCreateInvite = useCallback(
    (role: Role.CLIENT | Role.OPERATOR, expiresInHours?: number) => {
      const payload: CreateInviteDto = { role, expiresInHours }
      createMutation.mutate(payload)
    },
    [createMutation],
  )

  return {
    invites:       invitesQuery.data ?? [],
    isLoadingList: invitesQuery.isLoading,
    listError:     invitesQuery.isError ? getErrorMessage(invitesQuery.error) : null,

    handleCreateInvite,
    isCreating:    createMutation.isPending,
    createdInvite: createMutation.data,
    createError:   createMutation.isError ? getErrorMessage(createMutation.error) : null,

    // Convenience: build the invite URL for copy-to-clipboard
    getInviteUrl:  (code: string) =>
      `${window.location.origin}/register?invite=${code}`,
  }
}

// ─── Admin: operator list ─────────────────────────────────────────────────────

export function useOperatorListViewModel() {
  const { data: operators, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.operators(),
    queryFn:  listOperators,
    staleTime: 60_000,
  })

  return {
    operators:    operators ?? [],
    isLoading,
    isError,
    errorMessage: isError ? getErrorMessage(error) : null,
  }
}
