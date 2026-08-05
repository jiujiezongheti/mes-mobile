import { request } from '@/utils/request'

export function getRequisitionTaskList() {
  return request<{ list: any[] }>({
    url: '/mobile/requisition/task-list',
    method: 'GET',
  })
}

export function getRequisitionTaskDetail(id: number) {
  return request<{ id: number; code: string; order_code: string; status: number; items: any[] }>({
    url: '/mobile/requisition/task-detail',
    method: 'GET',
    data: { id },
  })
}

export function submitRequisition(data: { id: number; items: { material_id?: number; material_code?: string; actual_quantity: number }[] }) {
  return request<null>({
    url: '/mobile/requisition/submit',
    method: 'POST',
    data,
  })
}

export function getRequisitionMaterialByCode(code: string) {
  return request<{ id: number; code: string; name: string; spec: string }>({
    url: '/mobile/requisition/material/by-code',
    method: 'GET',
    data: { code },
  })
}
