import { request } from '@/utils/request'

export function login(data: { username: string; password: string }) {
  return request<{ token: string; userInfo: Record<string, unknown> }>({
    url: '/mobile/auth/login',
    method: 'POST',
    data,
  })
}

export function refreshToken() {
  return request<{ token: string; userInfo: Record<string, unknown> }>({
    url: '/mobile/auth/refresh',
    method: 'POST',
  })
}

export function getUserInfo() {
  return request<Record<string, unknown>>({
    url: '/mobile/auth/me',
    method: 'GET',
  })
}
