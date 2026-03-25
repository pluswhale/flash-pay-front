/**
 * API layer — Admin service.
 * All endpoints require Role.ADMIN.
 */
import { api } from '../lib/api'
import type { Invite, User, CreateInviteDto } from '../types/api'

/** Generate a new single-use invite code */
export const createInvite = (payload: CreateInviteDto) =>
  api.post<Invite>('/admin/invites', payload).then((r) => r.data)

/** List all generated invite codes */
export const listInvites = () =>
  api.get<Invite[]>('/admin/invites').then((r) => r.data)

/** List all registered operators */
export const listOperators = () =>
  api.get<User[]>('/admin/operators').then((r) => r.data)
