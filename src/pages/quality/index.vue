<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onPullDownRefresh, onBackPress } from '@dcloudio/uni-app'
import { getQualityList, completeQuality } from '@/api/quality'

const list = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const statusFilter = ref<number | ''>('')

const tabs = [
  { label: '全部', value: '' as number | '' },
  { label: '待检', value: 1 },
  { label: '已判定', value: -1 },
]

const statusColor: Record<number, string> = {
  1: '#ff9800',
  2: '#00c48c',
  3: '#e6a23c',
  4: '#f56c6c',
  5: '#007aff',
}

async function loadData() {
  loading.value = true
  try {
    const res = await getQualityList(statusFilter.value === -1 ? {} : statusFilter.value === '' ? {} : { status: statusFilter.value })
    let rows = res.list || []
    if (statusFilter.value === -1) rows = rows.filter((r: any) => r.status !== 1)
    list.value = rows
  } catch (_) {
    list.value = []
  } finally {
    loading.value = false
  }
}

function onTabChange(v: number | '') {
  statusFilter.value = v
  loadData()
}

// 判定 overlay
const showCheck = ref(false)
const checkTarget = ref<any>(null)
const checkForm = ref({ inspection_quantity: '', qualified_quantity: '', defective_quantity: '', status: null as number | null, defect_reason: '' })

const statusOptions = [
  { label: '合格', value: 2 },
  { label: '返工', value: 3 },
  { label: '报废', value: 4 },
  { label: '让步接收', value: 5 },
]

// 详情 overlay
const showDetail = ref(false)
const detailTarget = ref<any>(null)

function openCheck(item: any) {
  if (item.status !== 1) {
    detailTarget.value = item
    showDetail.value = true
    return
  }
  checkTarget.value = item
  checkForm.value = {
    inspection_quantity: String(item.report_quantity),
    qualified_quantity: '',
    defective_quantity: '',
    status: null,
    defect_reason: '',
  }
  showCheck.value = true
}

function setStatus(v: number) {
  checkForm.value.status = v
}

async function confirmCheck() {
  const target = checkTarget.value
  if (!target) return
  const insp = Number(checkForm.value.inspection_quantity)
  const qual = Number(checkForm.value.qualified_quantity)
  const def = Number(checkForm.value.defective_quantity || 0)
  if (!insp || insp <= 0 || insp > Number(target.report_quantity)) {
    uni.showToast({ title: `检验数量需在 0 ~ ${target.report_quantity} 之间`, icon: 'none' })
    return
  }
  if (checkForm.value.status === null) {
    uni.showToast({ title: '请选择质检结论', icon: 'none' })
    return
  }
  if (qual < 0 || def < 0) {
    uni.showToast({ title: '数量不能为负', icon: 'none' })
    return
  }
  if (qual + def > insp) {
    uni.showToast({ title: '合格数 + 不合格数不能超过检验数量', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await completeQuality({
      id: target.id,
      inspection_quantity: insp,
      qualified_quantity: qual,
      defective_quantity: def,
      status: checkForm.value.status,
      defect_reason: checkForm.value.defect_reason || undefined,
    })
    uni.showToast({ title: '质检完成', icon: 'success' })
    showCheck.value = false
    loadData()
  } catch (_) {
  } finally {
    submitting.value = false
  }
}

onPullDownRefresh(() => {
  loadData().finally(() => uni.stopPullDownRefresh())
})

onMounted(() => { loadData() })

onBackPress(() => {
  uni.reLaunch({ url: '/pages/dashboard/index' })
  return true
})
</script>

<template>
  <view class="page">
    <scroll-view scroll-x class="tabs">
      <view
        v-for="t in tabs"
        :key="String(t.value)"
        class="tab"
        :class="{ active: statusFilter === t.value }"
        @click="onTabChange(t.value)"
      >
        {{ t.label }}
      </view>
    </scroll-view>

    <view v-if="loading" class="loading">加载中...</view>
    <view v-else class="list">
      <view v-for="item in list" :key="item.id" class="card" @click="openCheck(item)">
        <view class="card-top">
          <text class="code">{{ item.code }}</text>
          <text class="tag" :style="{ color: statusColor[item.status] || '#999', background: '#f0f0f0' }">
            {{ item.status_name }}
          </text>
        </view>
        <view class="card-row">
          <text class="label">工单</text>
          <text class="value">{{ item.order_code }}</text>
        </view>
        <view class="card-row">
          <text class="label">物料</text>
          <text class="value">{{ item.material_name }} {{ item.material_spec }}</text>
        </view>
        <view class="card-row">
          <text class="label">报工</text>
          <text class="value">{{ item.report_quantity }}</text>
        </view>
        <view v-if="item.status !== 1" class="card-row">
          <text class="label">合格</text>
          <text class="value" style="color:#00c48c">{{ item.qualified_quantity }}</text>
          <text v-if="item.defective_quantity > 0" class="value" style="color:#f56c6c;margin-left:16rpx">不良 {{ item.defective_quantity }}</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view v-if="!list.length && !loading" class="empty">暂无质检任务</view>
    </view>

    <!-- 判定 -->
    <view v-if="showCheck" class="overlay" @click="showCheck = false">
      <view class="overlay-box" @click.stop>
        <text class="overlay-title">质检判定 · {{ checkTarget?.code }}</text>
        <view class="overlay-row">
          <text class="overlay-label">报工数量</text>
          <text class="overlay-static">{{ checkTarget?.report_quantity }}</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">检验数量</text>
          <input v-model="checkForm.inspection_quantity" type="digit" class="overlay-input" placeholder="0 ~ 报工数量" />
        </view>
        <view class="overlay-row">
          <text class="overlay-label">合格数</text>
          <input v-model="checkForm.qualified_quantity" type="digit" class="overlay-input" placeholder="本次合格数" />
        </view>
        <view class="overlay-row">
          <text class="overlay-label">不合格数</text>
          <input v-model="checkForm.defective_quantity" type="digit" class="overlay-input" placeholder="默认0" />
        </view>
        <view class="overlay-row">
          <text class="overlay-label">结论</text>
          <view class="overlay-opts">
            <view
              v-for="s in statusOptions"
              :key="s.value"
              class="opt"
              :class="{ active: checkForm.status === s.value }"
              @click="setStatus(s.value)"
            >
              {{ s.label }}
            </view>
          </view>
        </view>
        <view v-if="checkForm.status === 3 || checkForm.status === 4" class="overlay-row">
          <text class="overlay-label">原因</text>
          <input v-model="checkForm.defect_reason" class="overlay-input" placeholder="不合格原因" />
        </view>
        <view class="overlay-actions">
          <button class="overlay-btn cancel" @click="showCheck = false">取消</button>
          <button class="overlay-btn confirm" :disabled="submitting" @click="confirmCheck">确认判定</button>
        </view>
      </view>
    </view>

    <!-- 详情 -->
    <view v-if="showDetail" class="overlay" @click="showDetail = false">
      <view class="overlay-box" @click.stop>
        <text class="overlay-title">质检详情 · {{ detailTarget?.code }}</text>
        <view class="overlay-row">
          <text class="overlay-label">工单</text>
          <text class="overlay-static">{{ detailTarget?.order_code }}</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">物料</text>
          <text class="overlay-static">{{ detailTarget?.material_name }} {{ detailTarget?.material_spec }}</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">检验数量</text>
          <text class="overlay-static">{{ detailTarget?.inspection_quantity }}</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">合格数</text>
          <text class="overlay-static" style="color:#00c48c">{{ detailTarget?.qualified_quantity }}</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">不合格数</text>
          <text class="overlay-static" style="color:#f56c6c">{{ detailTarget?.defective_quantity }}</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">结论</text>
          <text class="overlay-static">{{ detailTarget?.status_name }}</text>
        </view>
        <view v-if="detailTarget?.defect_reason" class="overlay-row">
          <text class="overlay-label">原因</text>
          <text class="overlay-static">{{ detailTarget.defect_reason }}</text>
        </view>
        <view class="overlay-row">
          <text class="overlay-label">质检时间</text>
          <text class="overlay-static">{{ detailTarget?.checked_at }}</text>
        </view>
        <view class="overlay-actions">
          <button class="overlay-btn cancel" @click="showDetail = false">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.tabs { display: flex; gap: 20rpx; margin-bottom: 20rpx; white-space: nowrap; }
.tab { font-size: 26rpx; color: #666; padding: 12rpx 28rpx; background: #fff; border-radius: 30rpx; }
.tab.active { color: #fff; background: #ff9800; }
.loading { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
.list { display: flex; flex-direction: column; gap: 20rpx; }
.card {
  background: #fff; border-radius: 16rpx; padding: 30rpx; position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.code { font-size: 30rpx; font-weight: 600; color: #333; }
.tag { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 20rpx; }
.card-row { display: flex; font-size: 26rpx; margin-top: 8rpx; align-items: center; }
.label { color: #999; width: 90rpx; flex-shrink: 0; }
.value { color: #666; }
.arrow { position: absolute; right: 24rpx; top: 50%; transform: translateY(-50%); font-size: 40rpx; color: #ccc; }
.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }

.overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; }
.overlay-box { background: #fff; border-radius: 16rpx; width: 640rpx; padding: 40rpx; max-height: 80vh; overflow-y: auto; }
.overlay-title { display: block; font-size: 32rpx; font-weight: 600; color: #333; text-align: center; margin-bottom: 30rpx; }
.overlay-row { display: flex; align-items: center; margin-bottom: 20rpx; }
.overlay-label { width: 150rpx; font-size: 26rpx; color: #999; flex-shrink: 0; }
.overlay-input { flex: 1; height: 64rpx; border: 2rpx solid #ddd; border-radius: 8rpx; padding: 0 16rpx; font-size: 26rpx; background: #fafafa; }
.overlay-static { flex: 1; font-size: 26rpx; color: #333; }
.overlay-opts { flex: 1; display: flex; flex-wrap: wrap; gap: 16rpx; }
.opt { font-size: 24rpx; padding: 10rpx 22rpx; border: 2rpx solid #ddd; border-radius: 30rpx; color: #666; }
.opt.active { color: #fff; background: #ff9800; border-color: #ff9800; }
.overlay-actions { display: flex; gap: 20rpx; margin-top: 30rpx; }
.overlay-btn { flex: 1; height: 72rpx; line-height: 72rpx; border-radius: 36rpx; font-size: 28rpx; text-align: center; border: none; }
.overlay-btn.cancel { background: #f0f0f0; color: #666; }
.overlay-btn.confirm { background: #ff9800; color: #fff; }
.overlay-btn:disabled { opacity: 0.5; }
</style>
