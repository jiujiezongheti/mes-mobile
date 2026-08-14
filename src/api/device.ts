import { request } from '@/utils/request'

export function getDeviceList() {
  return request<{ id: number; code: string; name: string; model: string; type: number; status: number; location: string; responsible_user: string }[]>({
    url: '/mobile/device/list',
    method: 'GET',
  })
}