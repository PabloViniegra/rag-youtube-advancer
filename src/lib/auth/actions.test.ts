import { beforeEach, describe, expect, it, vi } from 'vitest'

const REDIRECT_ERROR = new Error('redirect')

const { createClientMock, headersMock, redirectMock } = vi.hoisted(() => {
  return {
    headersMock: vi.fn(),
    redirectMock: vi.fn(() => {
      throw REDIRECT_ERROR
    }),
    createClientMock: vi.fn(),
  }
})

vi.mock('next/headers', () => ({
  headers: headersMock,
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

import {
  getCurrentUser,
  signInWithGithub,
  signInWithGoogle,
  signOut,
} from './actions'

describe('auth actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts Google OAuth and redirects to provider URL', async () => {
    const signInWithOAuthMock = vi.fn().mockResolvedValue({
      data: { url: 'https://accounts.google.com/oauth' },
      error: null,
    })

    createClientMock.mockResolvedValue({
      auth: {
        signInWithOAuth: signInWithOAuthMock,
      },
    })

    headersMock.mockResolvedValue({
      get: vi.fn((key: string) => (key === 'host' ? 'app.example.com' : null)),
    })

    await expect(signInWithGoogle('/dashboard')).rejects.toThrow(REDIRECT_ERROR)

    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'https://app.example.com/auth/callback?next=%2Fdashboard',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    expect(redirectMock).toHaveBeenCalledWith(
      'https://accounts.google.com/oauth',
    )
  })

  it('redirects to auth error when Google OAuth fails', async () => {
    const signInWithOAuthMock = vi.fn().mockResolvedValue({
      data: { url: null },
      error: new Error('oauth failed'),
    })

    createClientMock.mockResolvedValue({
      auth: {
        signInWithOAuth: signInWithOAuthMock,
      },
    })

    headersMock.mockResolvedValue({
      get: vi.fn((key: string) => (key === 'host' ? 'localhost:3000' : null)),
    })

    await expect(signInWithGoogle()).rejects.toThrow(REDIRECT_ERROR)
    expect(redirectMock).toHaveBeenCalledWith(
      '/auth/error?reason=oauth_callback_failed',
    )
  })

  it('starts GitHub OAuth and redirects to provider URL', async () => {
    const signInWithOAuthMock = vi.fn().mockResolvedValue({
      data: { url: 'https://github.com/login/oauth/authorize' },
      error: null,
    })

    createClientMock.mockResolvedValue({
      auth: {
        signInWithOAuth: signInWithOAuthMock,
      },
    })

    headersMock.mockResolvedValue({
      get: vi.fn((key: string) => (key === 'host' ? 'localhost:3000' : null)),
    })

    await expect(signInWithGithub('/projects')).rejects.toThrow(REDIRECT_ERROR)

    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: 'github',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback?next=%2Fprojects',
      },
    })

    expect(redirectMock).toHaveBeenCalledWith(
      'https://github.com/login/oauth/authorize',
    )
  })

  it('redirects to auth error when GitHub OAuth fails', async () => {
    const signInWithOAuthMock = vi.fn().mockResolvedValue({
      data: { url: null },
      error: new Error('oauth failed'),
    })

    createClientMock.mockResolvedValue({
      auth: {
        signInWithOAuth: signInWithOAuthMock,
      },
    })

    headersMock.mockResolvedValue({
      get: vi.fn((key: string) => (key === 'host' ? 'localhost:3000' : null)),
    })

    await expect(signInWithGithub()).rejects.toThrow(REDIRECT_ERROR)
    expect(redirectMock).toHaveBeenCalledWith(
      '/auth/error?reason=oauth_callback_failed',
    )
  })

  it('signs out and redirects to home', async () => {
    const signOutApiMock = vi.fn().mockResolvedValue({ error: null })

    createClientMock.mockResolvedValue({
      auth: {
        signOut: signOutApiMock,
      },
    })

    await expect(signOut()).rejects.toThrow(REDIRECT_ERROR)

    expect(signOutApiMock).toHaveBeenCalledOnce()
    expect(redirectMock).toHaveBeenCalledWith('/')
  })

  it('returns current user when auth.getUser succeeds', async () => {
    const user = { id: 'u1', email: 'u1@example.com' }

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user },
          error: null,
        }),
      },
    })

    await expect(getCurrentUser()).resolves.toEqual(user)
  })

  it('returns null when auth.getUser fails', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('invalid token'),
        }),
      },
    })

    await expect(getCurrentUser()).resolves.toBeNull()
  })
})
