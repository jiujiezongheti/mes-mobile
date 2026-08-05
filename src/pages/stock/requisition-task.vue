<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'
import { getRequisitionTaskDetail, submitRequisition, getRequisitionMaterialByCode } from '@/api/requisition'

const id = ref(0)
const task = ref<any>(null)
const items = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)

// scan overlay
const showScan = ref(false)
const scanTarget = ref<any>(null)
const scanQty = ref('')
const scanning = ref(false)

// manual code input (H5 fallback)
const showCodeInput = ref(false)
const manualCode = ref('')

onLoad((query) => {
  id.value = Number(query?.id || 0)
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getRequisitionTaskDetail(id.value)
    task.value = res
    items.value = (res.items || []).map((m: any) => ({ ...m, _filled_qty: m.actual_quantity || '', _actual_material_id: null }))
  } catch (_) {
    items.value = []
  } finally {
    loading.value = false
  }
}

async function handleScan() {
  scanning.value = true
  try {
    uni.scanCode({
      success: async (res) => {
        const code = res.result
        await lookupAndShow(code)
      },
      fail() {
        showCodeInput.value = true
      },
    })
  } finally {
    scanning.value = false
  }
}

async function lookupAndShow(code: string) {
  try {
    const material = await getRequisitionMaterialByCode(code)
    const target = items.value.find((m: any) => m.material_code === code)
    if (target) {
      scanTarget.value = target
      scanQty.value = target._filled_qty ? String(target._filled_qty) : ''
      showScan.value = true
      return
    }
    const altTarget = items.value.find((m: any) => (m.allowed_material_ids || []).includes(material.id))
    if (altTarget) {
      altTarget._actual_material_id = material.id
      scanTarget.value = altTarget
      scanQty.value = altTarget._filled_qty ? String(altTarget._filled_qty) : ''
      showScan.value = true
      return
    }
    uni.showToast({ title: '该物料不在领料单中', icon: 'none' })
  } catch (_) {
    uni.showToast({ title: '未匹配物料编码', icon: 'none' })
  }
}

async function confirmCode() {
  if (!manualCode.value) return
  showCodeInput.value = false
  await lookupAndShow(manualCode.value)
  manualCode.value = ''
}

function confirmScan() {
  if (!scanTarget.value || !scanQty.value || Number(scanQty.value) <= 0) {
    uni.showToast({ title: '请输入有效数量', icon: 'none' })
    return
  }
  const qty = Number(scanQty.value)
  if (qty > scanTarget.value.required_quantity) {
    uni.showToast({ title: '实领数量不能超过需求数量', icon: 'none' })
    return
  }
  scanTarget.value._filled_qty = qty
  showScan.value = false
  uni.showToast({ title: '录入成功', icon: 'success' })
}

async function handleSubmit() {
  const filled = items.value.filter((m: any) => m._filled_qty && Number(m._filled_qty) > 0)
  if (filled.length === 0) {
    uni.showToast({ title: '请先扫码录入物料', icon: 'none' })
    return
  }

  uni.showModal({
    title: '提示',
    content: `确认提交领料单？共 ${filled.length} 种物料，提交后将进入审核流程。`,
    success: async (res) => {
      if (res.confirm) {
        submitting.value = true
        try {
          await submitRequisition({
            id: id.value,
            items: filled.map((m: any) => ({
              material_id: m.material_id,
              material_code: m.material_code,
              actual_quantity: Number(m._filled_qty),
              actual_material_id: m._actual_material_id || null,
            })),
          })
          uni.showToast({ title: '提交成功', icon: 'success' })
          setTimeout(() => uni.navigateBack(), 1500)
        } catch (_) {
        } finally {
          submitting.value = false
        }
      }
    },
  })
}

onBackPress(() => {
  uni.reLaunch({ url: '/pages/dashboard/index' })
  return true
})
</script>

<template>
  <view class="requisition-task">
    <view v-if="loading" class="loading">加载中...</view>

    <template v-else>
      <view class="header">
        <view class="header-left">
          <text class="code">{{ task?.code }}</text>
          <text class="tag pending">待领料</text>
        </view>
        <text class="count">已扫 {{ items.filter(m => m._filled_qty).length }} / {{ items.length }}</text>
      </view>

      <view class="order-info">
        <text class="info-label">工单</text>
        <text class="info-value">{{ task?.order_code || '—' }}</text>
      </view>

      <scroll-view scroll-y class="item-list">
        <view v-for="item in items" :key="item.id" class="item-row" @click="handleScan">
          <view class="item-info">
            <text class="name">
              {{ item.material_name }}
              <text v-if="item._actual_material_id" class="tag-sub">替代</text>
            </text>
            <text class="code">{{ item.material_code }} {{ item.material_spec }}</text>
            <text class="qty-req">需求: {{ item.required_quantity }}</text>
            <text class="warehouse">仓库: {{ item.warehouse_name }}</text>
          </view>
          <view class="item-qty">
            <text v-if="item._filled_qty" class="qty filled">{{ item._filled_qty }}</text>
            <text v-else class="qty empty">扫码</text>
          </view>
        </view>

        <view v-if="!items.length && !loading" class="empty">暂无物料</view>
      </scroll-view>

      <view class="footer">
        <button class="scan-btn" :disabled="scanning" @click="handleScan">
          {{ scanning ? '扫码中...' : '扫码录入' }}
        </button>
        <button class="submit-btn" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? '提交中...' : '提交领料' }}
        </button>
      </view>
    </template>

    <view v-if="showScan" class="overlay" @click="showScan = false">
      <view class="overlay-box" @click.stop>
        <text class="overlay-title">领料录入</text>
        <view class="overlay-row">
          <text class="overlay-label">物料</text>
          <text class="overlay-value">
            {{ scanTarget?.material_name }}
            <text v-if="scanTarget?._actual_material_id" class="tag-sub">替代</text>
          </text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">编码</text>
          <text class="overlay-value">{{ scanTarget?.material_code }}</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">需求</text>
          <text class="overlay-value">{{ scanTarget?.required_quantity }}</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">仓库</text>
          <text class="overlay-value">{{ scanTarget?.warehouse_name }}</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">实领</text>
          <input v-model="scanQty" type="number" class="overlay-input" placeholder="请输入实领数量" />
        </view>
        <view class="overlay-actions">
          <button class="overlay-btn cancel" @click="showScan = false">取消</button>
          <button class="overlay-btn confirm" @click="confirmScan">确定</button>
        </view>
      </view>
    </view>

    <view v-if="showCodeInput" class="overlay" @click="showCodeInput = false">
      <view class="overlay-box" @click.stop>
        <text class="overlay-title">手动输入物料编码</text>
        <view class="overlay-row">
          <text class="overlay-label">编码</text>
          <input v-model="manualCode" class="overlay-input" placeholder="输入或粘贴物料编码" autofocus />
        </view>
        <view class="overlay-actions">
          <button class="overlay-btn cancel" @click="showCodeInput = false">取消</button>
          <button class="overlay-btn confirm" @click="confirmCode">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.requisition-task {
  min-height: 100vh; background: #f5f5f5; display: flex; flex-direction: column;
}
.loading { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
.header {
  background: #fff; padding: 24rpx 30rpx; display: flex; justify-content: space-between;
  align-items: center; border-bottom: 2rpx solid #eee;
}
.header-left { display: flex; align-items: center; gap: 16rpx; }
.code { font-size: 32rpx; font-weight: 600; color: #333; }
.tag { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 20rpx; }
.tag.pending { color: #007aff; background: #e8f0fe; }
.tag-sub { font-size: 20rpx; color: #ff9800; background: #fff3e0; padding: 2rpx 10rpx; border-radius: 10rpx; margin-left: 6rpx; }
.count { font-size: 24rpx; color: #999; }
.order-info {
  background: #fff; padding: 16rpx 30rpx; display: flex; align-items: center;
  border-bottom: 2rpx solid #eee; gap: 16rpx; font-size: 26rpx;
}
.info-label { color: #999; }
.info-value { color: #333; }
.item-list { flex: 1; }
.item-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24rpx 30rpx; background: #fff; border-bottom: 2rpx solid #f0f0f0;
}
.item-info { flex: 1; }
.name { font-size: 28rpx; font-weight: 500; color: #333; display: block; }
.code { font-size: 22rpx; color: #999; margin-top: 4rpx; display: block; }
.qty-req { font-size: 22rpx; color: #ff9800; margin-top: 4rpx; display: block; }
.warehouse { font-size: 22rpx; color: #007aff; margin-top: 4rpx; display: block; }
.item-qty { text-align: center; min-width: 100rpx; }
.qty { font-size: 36rpx; font-weight: 700; }
.qty.filled { color: #00c48c; }
.qty.empty { color: #ccc; font-size: 28rpx; font-weight: 400; }
.footer {
  padding: 20rpx 30rpx; background: #fff; border-top: 2rpx solid #eee;
  display: flex; gap: 20rpx;
}
.scan-btn {
  flex: 1; height: 88rpx; line-height: 88rpx; background: #007aff; color: #fff;
  border-radius: 44rpx; font-size: 30rpx; text-align: center; border: none;
}
.submit-btn {
  flex: 1; height: 88rpx; line-height: 88rpx; background: #00c48c; color: #fff;
  border-radius: 44rpx; font-size: 30rpx; text-align: center; border: none;
}
.scan-btn:disabled, .submit-btn:disabled { opacity: 0.5; }

.overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5);
  z-index: 100; display: flex; align-items: center; justify-content: center;
}
.overlay-box {
  background: #fff; border-radius: 16rpx; width: 620rpx; padding: 40rpx;
}
.overlay-title {
  display: block; font-size: 32rpx; font-weight: 600; color: #333;
  text-align: center; margin-bottom: 30rpx;
}
.overlay-row {
  display: flex; align-items: center; margin-bottom: 20rpx;
}
.overlay-label { width: 100rpx; font-size: 26rpx; color: #999; }
.overlay-value { flex: 1; font-size: 26rpx; color: #333; }
.overlay-input {
  flex: 1; height: 64rpx; border: 2rpx solid #ddd; border-radius: 8rpx;
  padding: 0 16rpx; font-size: 26rpx; background: #fafafa;
}
.overlay-actions { display: flex; gap: 20rpx; margin-top: 30rpx; }
.overlay-btn {
  flex: 1; height: 72rpx; line-height: 72rpx; border-radius: 36rpx;
  font-size: 28rpx; text-align: center; border: none;
}
.overlay-btn.cancel { background: #f0f0f0; color: #666; }
.overlay-btn.confirm { background: #007aff; color: #fff; }
.overlay-btn.confirm:disabled { opacity: 0.5; }
</style>
