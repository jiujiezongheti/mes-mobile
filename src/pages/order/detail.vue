<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, startOrder, reportOrder, finishOrder } from '@/api/order'

const id = ref(0)
const detail = ref<any>(null)
const loading = ref(false)
const submitting = ref(false)

const showReport = ref(false)
const reportQty = ref('')
const reportRemark = ref('')

const showFinish = ref(false)

const hasPendingQuality = computed(() =>
  (detail.value?.quality_checks || []).some((q: any) => q.status === 1),
)

const statusColor: Record<number, string> = {
  1: '#007aff',
  2: '#ff9800',
  3: '#00c48c',
  4: '#999',
}

const qualityColor: Record<number, string> = {
  1: '#ff9800',
  2: '#00c48c',
  3: '#e6a23c',
  4: '#f56c6c',
  5: '#007aff',
}

onLoad((query) => {
  id.value = Number(query?.id || 0)
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    detail.value = await getOrderDetail(id.value)
  } catch (_) {
    detail.value = null
  } finally {
    loading.value = false
  }
}

function handleStart() {
  uni.showModal({
    title: '提示',
    content: '确定开始生产？',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await startOrder(id.value)
        uni.showToast({ title: '已开始生产', icon: 'success' })
        loadData()
      } catch (_) {}
    },
  })
}

function openReport() {
  reportQty.value = ''
  reportRemark.value = ''
  showReport.value = true
}

async function confirmReport() {
  const qty = Number(reportQty.value)
  if (!qty || qty <= 0) {
    uni.showToast({ title: '请输入有效数量', icon: 'none' })
    return
  }
  const totalCap = Number(detail.value.quantity) * 2
  if (Number(detail.value.total_produced || 0) + qty > totalCap) {
    uni.showToast({ title: `累计报工不能超过 ${totalCap}`, icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await reportOrder(id.value, qty, reportRemark.value)
    uni.showToast({ title: '报工成功，已生成待检质检单', icon: 'success' })
    showReport.value = false
    loadData()
  } catch (_) {
  } finally {
    submitting.value = false
  }
}

function openFinish() {
  showFinish.value = true
}

async function confirmFinish() {
  const qty = Number(detail.value.produced_quantity)
  uni.showModal({
    title: '提示',
    content: `按质检合格数 ${qty} 生成入库待办，确认完工？`,
    success: async (res) => {
      if (!res.confirm) return
      submitting.value = true
      try {
        await finishOrder(id.value)
        uni.showToast({ title: '已完工', icon: 'success' })
        showFinish.value = false
        loadData()
      } catch (_) {
      } finally {
        submitting.value = false
      }
    },
  })
}
</script>

<template>
  <view class="page">
    <view v-if="loading" class="loading">加载中...</view>
    <template v-else-if="detail">
      <view class="card header-card">
        <view class="card-top">
          <text class="code">{{ detail.code }}</text>
          <text class="tag" :style="{ color: statusColor[detail.status] || '#999', background: '#f0f0f0' }">
            {{ detail.status_name }}
          </text>
        </view>
        <view class="row">
          <text class="label">产品</text>
          <text class="value">{{ detail.material_name }} {{ detail.material_spec }}</text>
        </view>
        <view class="row">
          <text class="label">计划数量</text>
          <text class="value">{{ detail.quantity }}</text>
        </view>
        <view class="row">
          <text class="label">质检合格</text>
          <text class="value" style="color:#ff9800">{{ detail.produced_quantity }}</text>
        </view>
        <view class="row">
          <text class="label">累计报工</text>
          <text class="value">{{ detail.total_produced }}</text>
        </view>
        <view class="row">
          <text class="label">计划时间</text>
          <text class="value">{{ detail.plan_start_date || '—' }} ~ {{ detail.plan_end_date || '—' }}</text>
        </view>
        <view class="row" v-if="detail.actual_start_date">
          <text class="label">开始时间</text>
          <text class="value">{{ detail.actual_start_date }}</text>
        </view>
        <view class="row" v-if="detail.actual_end_date">
          <text class="label">完工时间</text>
          <text class="value">{{ detail.actual_end_date }}</text>
        </view>

        <view class="progress">
          <view class="progress-bar">
            <view
              class="progress-inner"
              :style="{ width: (Number(detail.produced_quantity) / Number(detail.quantity) * 100) + '%' }"
            />
          </view>
          <text class="progress-text">
            {{ Number(detail.produced_quantity) / Number(detail.quantity) * 100 >= 100 ? '已完成' : '进行中' }}
          </text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">物料需求</text>
        <view v-for="m in detail.materials" :key="m.material_id" class="mat-row">
          <view class="mat-info">
            <text class="mat-name">{{ m.material_name }}</text>
            <text class="mat-code">{{ m.material_code }} {{ m.material_spec }}</text>
          </view>
          <text class="mat-qty">{{ m.required_quantity }}<text class="mat-unit">需求</text></text>
        </view>
        <view v-if="!detail.materials.length" class="empty">暂无物料需求</view>
      </view>

      <view class="section">
        <text class="section-title">报工记录</text>
        <view v-for="r in detail.reports" :key="r.id" class="report-row">
          <view class="report-info">
            <text class="report-qty">+{{ r.quantity }}</text>
            <text class="report-time">{{ r.created_at }}</text>
          </view>
          <view class="report-right">
            <text class="report-qualified">报工 {{ r.quantity }}</text>
          </view>
        </view>
        <view v-if="!detail.reports.length" class="empty">暂无报工记录</view>
      </view>

      <view class="section">
        <text class="section-title">质检记录</text>
        <view v-for="q in detail.quality_checks" :key="q.id" class="report-row">
          <view class="report-info">
            <text class="report-code">{{ q.code }}</text>
            <text class="report-time">检验 {{ q.inspection_quantity }}</text>
          </view>
          <view class="report-right">
            <text class="tag" :style="{ color: qualityColor[q.status] || '#999', background: '#f0f0f0' }">{{ q.status_name }}</text>
            <text v-if="q.status !== 1" class="report-qualified">合格 {{ q.qualified_quantity }}</text>
            <text v-if="q.defective_quantity > 0" class="report-defect">不良 {{ q.defective_quantity }}</text>
          </view>
        </view>
        <view v-if="!detail.quality_checks.length" class="empty">暂无质检记录，报工后自动生成</view>
      </view>

      <view class="footer" v-if="detail.status === 1 || detail.status === 2">
        <button v-if="detail.status === 1" class="action-btn start" :disabled="submitting" @click="handleStart">
          开始生产
        </button>
        <template v-if="detail.status === 2">
          <button class="action-btn report" :disabled="submitting" @click="openReport">报工</button>
          <button
            class="action-btn finish"
            :disabled="submitting || hasPendingQuality"
            @click="openFinish"
          >
            完工
          </button>
        </template>
      </view>
    </template>
    <view v-else class="empty">工单不存在</view>

    <view v-if="showReport" class="overlay" @click="showReport = false">
      <view class="overlay-box" @click.stop>
        <text class="overlay-title">报工</text>
        <view class="overlay-row">
          <text class="overlay-label">数量</text>
          <input v-model="reportQty" type="digit" class="overlay-input" placeholder="本次完成总数" />
        </view>
        <view class="overlay-row">
          <text class="overlay-label">备注</text>
          <input v-model="reportRemark" class="overlay-input" placeholder="选填" />
        </view>
        <view class="overlay-row">
          <text class="overlay-label">提示</text>
          <text class="overlay-tip">报工后自动生成待检质检单，由质检员判定合格数</text>
        </view>
        <view class="overlay-actions">
          <button class="overlay-btn cancel" @click="showReport = false">取消</button>
          <button class="overlay-btn confirm" :disabled="submitting" @click="confirmReport">确定</button>
        </view>
      </view>
    </view>

    <view v-if="showFinish" class="overlay" @click="showFinish = false">
      <view class="overlay-box" @click.stop>
        <text class="overlay-title">完工确认</text>
        <view class="overlay-row">
          <text class="overlay-label">入库数量</text>
          <text class="overlay-tip">按质检合格数 {{ detail.produced_quantity }} 生成入库待办</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">提示</text>
          <text class="overlay-tip">需全部质检单判定完成；确认后由 PC 端确认入库</text>
        </view>
        <view class="overlay-actions">
          <button class="overlay-btn cancel" @click="showFinish = false">取消</button>
          <button class="overlay-btn confirm" :disabled="submitting" @click="confirmFinish">确认完工</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; padding: 20rpx 20rpx 160rpx; }
.loading { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
.empty { text-align: center; padding: 60rpx 0; color: #999; font-size: 26rpx; }
.card {
  background: #fff; border-radius: 16rpx; padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.code { font-size: 32rpx; font-weight: 600; color: #333; }
.tag { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 20rpx; }
.row { display: flex; font-size: 26rpx; margin-top: 10rpx; }
.label { color: #999; width: 130rpx; }
.value { color: #333; flex: 1; }
.progress { display: flex; align-items: center; gap: 16rpx; margin-top: 24rpx; }
.progress-bar { flex: 1; height: 16rpx; background: #eee; border-radius: 8rpx; overflow: hidden; }
.progress-inner { height: 100%; background: linear-gradient(90deg, #007aff, #00c48c); border-radius: 8rpx; }
.progress-text { font-size: 22rpx; color: #999; }
.section { margin-top: 20rpx; background: #fff; border-radius: 16rpx; padding: 30rpx; }
.section-title { font-size: 28rpx; font-weight: 600; color: #333; display: block; margin-bottom: 16rpx; }
.mat-row { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; border-bottom: 2rpx solid #f5f5f5; }
.mat-row:last-child { border-bottom: none; }
.mat-name { font-size: 28rpx; color: #333; display: block; }
.mat-code { font-size: 22rpx; color: #999; display: block; margin-top: 4rpx; }
.mat-qty { font-size: 30rpx; color: #007aff; font-weight: 600; }
.mat-unit { font-size: 20rpx; color: #999; font-weight: 400; margin-left: 6rpx; }
.report-row { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; border-bottom: 2rpx solid #f5f5f5; }
.report-row:last-child { border-bottom: none; }
.report-qty { font-size: 30rpx; color: #00c48c; font-weight: 600; display: block; }
.report-code { font-size: 28rpx; color: #ff9800; font-weight: 600; display: block; }
.report-time { font-size: 22rpx; color: #999; display: block; margin-top: 4rpx; }
.report-right { text-align: right; }
.report-qualified { font-size: 24rpx; color: #00c48c; display: block; }
.report-defect { font-size: 22rpx; color: #f56c6c; display: block; margin-top: 4rpx; }
.footer {
  position: fixed; left: 0; right: 0; bottom: 0; padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #fff; border-top: 2rpx solid #eee; display: flex; gap: 20rpx;
}
.action-btn { flex: 1; height: 88rpx; line-height: 88rpx; border-radius: 44rpx; font-size: 30rpx; text-align: center; border: none; color: #fff; }
.action-btn.start { background: #007aff; }
.action-btn.report { background: #ff9800; }
.action-btn.finish { background: #00c48c; }
.action-btn:disabled { opacity: 0.5; }
.overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; }
.overlay-box { background: #fff; border-radius: 16rpx; width: 620rpx; padding: 40rpx; }
.overlay-title { display: block; font-size: 32rpx; font-weight: 600; color: #333; text-align: center; margin-bottom: 30rpx; }
.overlay-row { display: flex; align-items: center; margin-bottom: 20rpx; }
.overlay-label { width: 130rpx; font-size: 26rpx; color: #999; }
.overlay-input { flex: 1; height: 64rpx; border: 2rpx solid #ddd; border-radius: 8rpx; padding: 0 16rpx; font-size: 26rpx; background: #fafafa; }
.overlay-tip { flex: 1; font-size: 24rpx; color: #ff9800; }
.overlay-actions { display: flex; gap: 20rpx; margin-top: 30rpx; }
.overlay-btn { flex: 1; height: 72rpx; line-height: 72rpx; border-radius: 36rpx; font-size: 28rpx; text-align: center; border: none; }
.overlay-btn.cancel { background: #f0f0f0; color: #666; }
.overlay-btn.confirm { background: #007aff; color: #fff; }
.overlay-btn:disabled { opacity: 0.5; }
</style>
