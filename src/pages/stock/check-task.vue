<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'
import { getCheckTaskDetail, createCheckRecord, completeCheckTask, getMaterialByCode, getBatchControl } from '@/api/stock'

const id = ref(0)
const task = ref<any>(null)
const records = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const batchEnabled = ref(false)

onLoad((query) => {
  id.value = Number(query?.id || 0)
  loadData()
  loadConfig()
})

// scan overlay
const showScan = ref(false)
const scanMaterial = ref<any>(null)
const scanQty = ref('')
const scanBatch = ref('')
const scanning = ref(false)

// manual code input (H5 fallback)
const showCodeInput = ref(false)
const manualCode = ref('')

async function loadData() {
  loading.value = true
  try {
    const res = await getCheckTaskDetail(id.value)
    task.value = res.task
    records.value = res.records || []
  } catch (_) {
    records.value = []
  } finally {
    loading.value = false
  }
}

async function loadConfig() {
  try {
    const res = await getBatchControl()
    batchEnabled.value = res.enabled
  } catch (_) {
    batchEnabled.value = false
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
    const material = await getMaterialByCode(code)
    scanMaterial.value = material
    scanQty.value = ''
    scanBatch.value = ''
    showScan.value = true
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

async function confirmScan() {
  if (!scanMaterial.value || !scanQty.value || Number(scanQty.value) <= 0) {
    uni.showToast({ title: '请输入有效数量', icon: 'none' })
    return
  }
  if (batchEnabled.value && !scanBatch.value) {
    uni.showToast({ title: '请输入批次号', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await createCheckRecord({
      task_id: id.value,
      material_code: scanMaterial.value.code,
      actual_quantity: Number(scanQty.value),
      batch_no: scanBatch.value,
    })
    uni.showToast({ title: '录入成功', icon: 'success' })
    showScan.value = false
    loadData()
  } catch (_) {
  } finally {
    submitting.value = false
  }
}

async function handleComplete() {
  if (records.value.length === 0) {
    uni.showToast({ title: '请先扫码录入物料', icon: 'none' })
    return
  }

  uni.showModal({
    title: '提示',
    content: `确定完成盘点？共 ${records.value.length} 条记录，提交后将进入审核流程。`,
    success: async (res) => {
      if (res.confirm) {
        submitting.value = true
        try {
          await completeCheckTask(id.value)
          uni.showToast({ title: '已提交审核', icon: 'success' })
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
  <view class="check-task">
    <view v-if="loading" class="loading">加载中...</view>

    <template v-else>
      <view class="header">
        <view class="header-left">
          <text class="code">{{ task?.code }}</text>
          <text class="warehouse">{{ task?.warehouse_name }}</text>
        </view>
        <text class="count">已扫 {{ records.length }} 条</text>
      </view>

      <scroll-view scroll-y class="record-list">
        <view v-for="item in records" :key="item.id" class="record-item">
          <view class="record-info">
            <text class="name">{{ item.material_name }}</text>
            <text class="code">{{ item.material_code }} {{ item.material_spec }}</text>
            <text v-if="item.batch_no" class="batch">批次: {{ item.batch_no }}</text>
          </view>
          <view class="record-qty">
            <text class="qty">{{ item.actual_quantity }}</text>
          </view>
        </view>

        <view v-if="!records.length && !loading" class="empty">暂无记录，请扫码录入</view>
      </scroll-view>

      <view class="footer">
        <button class="scan-btn" :disabled="scanning" @click="handleScan">
          {{ scanning ? '扫码中...' : '扫码录入' }}
        </button>
        <button class="complete-btn" :disabled="submitting" @click="handleComplete">
          {{ submitting ? '提交中...' : '完成盘点' }}
        </button>
      </view>
    </template>

    <!-- scan overlay: qty input -->
    <view v-if="showScan" class="overlay" @click="showScan = false">
      <view class="overlay-box" @click.stop>
        <text class="overlay-title">盘点录入</text>
        <view class="overlay-row">
          <text class="overlay-label">物料</text>
          <text class="overlay-value">{{ scanMaterial?.name }}</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">编码</text>
          <text class="overlay-value">{{ scanMaterial?.code }}</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">规格</text>
          <text class="overlay-value">{{ scanMaterial?.spec || '—' }}</text>
        </view>
        <view class="overlay-row" v-if="batchEnabled">
          <text class="overlay-label">批次</text>
          <input v-model="scanBatch" class="overlay-input" placeholder="请输入批次号" />
        </view>
        <view class="overlay-row">
          <text class="overlay-label">数量</text>
          <input v-model="scanQty" type="number" class="overlay-input" placeholder="请输入实盘数量" />
        </view>
        <view class="overlay-actions">
          <button class="overlay-btn cancel" @click="showScan = false">取消</button>
          <button class="overlay-btn confirm" :disabled="submitting" @click="confirmScan">
            {{ submitting ? '提交中...' : '确定' }}
          </button>
        </view>
      </view>
    </view>

    <!-- manual code input (H5 fallback) -->
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
.check-task {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}
.loading {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
.header {
  background: #fff;
  padding: 24rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2rpx solid #eee;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.code {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}
.warehouse {
  font-size: 24rpx;
  color: #007aff;
  background: #e8f0fe;
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
}
.count {
  font-size: 24rpx;
  color: #999;
}
.record-list {
  flex: 1;
}
.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  background: #fff;
  border-bottom: 2rpx solid #f0f0f0;
}
.record-info {
  flex: 1;
}
.name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}
.code {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}
.batch {
  font-size: 22rpx;
  color: #ff9800;
  margin-top: 4rpx;
  display: block;
}
.record-qty {
  text-align: center;
  min-width: 100rpx;
}
.qty {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}
.footer {
  padding: 20rpx 30rpx;
  background: #fff;
  border-top: 2rpx solid #eee;
  display: flex;
  gap: 20rpx;
}
.scan-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  background: #007aff;
  color: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
  text-align: center;
  border: none;
}
.complete-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  background: #00c48c;
  color: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
  text-align: center;
  border: none;
}
.scan-btn:disabled,
.complete-btn:disabled {
  opacity: 0.5;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.overlay-box {
  background: #fff;
  border-radius: 16rpx;
  width: 620rpx;
  padding: 40rpx;
}
.overlay-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}
.overlay-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.overlay-label {
  width: 100rpx;
  font-size: 26rpx;
  color: #999;
}
.overlay-value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}
.overlay-input {
  flex: 1;
  height: 64rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
  background: #fafafa;
}
.overlay-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}
.overlay-btn {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  text-align: center;
  border: none;
}
.overlay-btn.cancel {
  background: #f0f0f0;
  color: #666;
}
.overlay-btn.confirm {
  background: #007aff;
  color: #fff;
}
.overlay-btn.confirm:disabled {
  opacity: 0.5;
}
</style>
