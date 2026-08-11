import { request } from '@/utils/request'

export function getOrderList(params?: { status?: number }) {
  return request<{ list: any[] }>({
    url: '/mobile/order/list',
    method: 'GET',
    data: params || {},
  })
}

export function getOrderDetail(id: number) {
  return request<any>({
    url: '/mobile/order/detail',
    method: 'GET',
    data: { id },
  })
}

export function startOrder(id: number) {
  return request<null>({
    url: '/mobile/order/start',
    method: 'POST',
    data: { id },
  })
}

export function reportOrder(id: number, quantity: number, remark?: string) {
  return request<null>({
    url: '/mobile/order/report',
    method: 'POST',
    data: { id, quantity, remark },
  })
}

export function finishOrder(id: number) {
  return request<null>({
    url: '/mobile/order/finish',
    method: 'POST',
    data: { id },
  })
}
