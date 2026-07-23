import { createContext } from 'react'
import type { User } from '../types'

export type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, remember: boolean) => Promise<User>
  logout: () => void
  changePassword: (password: string) => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
