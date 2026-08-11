import { request } from '@/utils/request'

export function getQualityList(params?: { status?: number; order_id?: number }) {
  return request<{ list: any[] }>({
    url: '/mobile/quality/list',
    method: 'GET',
    data: params || {},
  })
}

export function getQualityDetail(id: number) {
  return request<any>({
    url: '/mobile/quality/detail',
    method: 'GET',
    data: { id },
  })
}

export function completeQuality(data: {
  id: number
  inspection_quantity: number
  qualified_quantity: number
  defective_quantity: number
  status: number
  defect_reason?: string
}) {
  return request<null>({
    url: '/mobile/quality/complete',
    method: 'POST',
    data,
  })
}
