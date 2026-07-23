import { request } from '@/utils/request'

export function getCheckList() {
  return request<{ list: any[]; total: number }>({
    url: '/mobile/stock/check-list',
    method: 'GET',
  })
}

export function getCheckItems(id: number) {
  return request<{ check: any; items: any[] }>({
    url: '/mobile/stock/check-items',
    method: 'GET',
    data: { id },
  })
}

export function completeCheck(data: { id: number; items: { material_id: number; actual_quantity: number; remark?: string }[] }) {
  return request<null>({
    url: '/mobile/stock/check-complete',
    method: 'POST',
    data,
  })
}

export function getCheckTaskList() {
  return request<{ list: any[]; total: number }>({
    url: '/mobile/stock/check-task/list',
    method: 'GET',
  })
}

export function getCheckTaskDetail(id: number) {
  return request<{ task: any; records: any[]; record_count: number }>({
    url: '/mobile/stock/check-task/detail',
    method: 'GET',
    data: { id },
  })
}

export function createCheckRecord(data: { task_id: number; material_code: string; actual_quantity: number; batch_no?: string; remark?: string }) {
  return request<null>({
    url: '/mobile/stock/check-record/create',
    method: 'POST',
    data,
  })
}

export function completeCheckTask(id: number) {
  return request<null>({
    url: '/mobile/stock/check-task/complete',
    method: 'POST',
    data: { id },
  })
}

export function getMaterialByCode(code: string) {
  return request<{ id: number; code: string; name: string; spec: string }>({
    url: '/mobile/stock/material/by-code',
    method: 'GET',
    data: { code },
  })
}

export function getBatchControl() {
  return request<{ enabled: boolean }>({
    url: '/mobile/config/batch-control',
    method: 'GET',
  })
}
