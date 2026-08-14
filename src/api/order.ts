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

export function startProcess(id: number, processId: number) {
  return request<null>({
    url: '/mobile/order/process/start',
    method: 'POST',
    data: { id, process_id: processId },
  })
}

export function finishProcess(id: number, processId: number) {
  return request<null>({
    url: '/mobile/order/process/finish',
    method: 'POST',
    data: { id, process_id: processId },
  })
}

export function reportOrder(id: number, quantity: number, remark?: string, processId?: number) {
  return request<null>({
    url: '/mobile/order/report',
    method: 'POST',
    data: { id, quantity, remark, ...(processId ? { process_id: processId } : {}) },
  })
}

export function finishOrder(id: number) {
  return request<null>({
    url: '/mobile/order/finish',
    method: 'POST',
    data: { id },
  })
}
