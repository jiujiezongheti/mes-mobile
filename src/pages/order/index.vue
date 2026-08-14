<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onPullDownRefresh, onBackPress } from '@dcloudio/uni-app'
import { getOrderList } from '@/api/order'

const list = ref<any[]>([])
const loading = ref(false)
const statusFilter = ref<number | ''>('')

const tabs = [
  { label: '全部', value: '' as number | '' },
  { label: '待生产', value: 1 },
  { label: '生产中', value: 2 },
  { label: '已完成', value: 3 },
]

const statusColor: Record<number, string> = {
  1: '#007aff',
  2: '#ff9800',
  3: '#00c48c',
  4: '#999',
}

async function loadData() {
  loading.value = true
  try {
    const res = await getOrderList(statusFilter.value === '' ? {} : { status: statusFilter.value })
    list.value = res.list || []
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

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
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
      <view v-for="item in list" :key="item.id" class="card" @click="goDetail(item.id)">
        <view class="card-top">
          <text class="code">{{ item.code }}</text>
          <text class="tag" :style="{ color: statusColor[item.status] || '#999', background: '#f0f0f0' }">
            {{ item.status_name }}
          </text>
        </view>
        <view class="card-row">
          <text class="label">产品</text>
          <text class="value">{{ item.material_name }} {{ item.material_spec }}</text>
        </view>
        <view class="card-row">
          <text class="label">计划</text>
          <text class="value">{{ item.quantity }}</text>
        </view>
        <view class="card-row">
          <text class="label">报工</text>
          <text class="value">{{ item.total_reported || 0 }}</text>
        </view>
        <view class="card-row">
          <text class="label">已产</text>
          <text class="value" :style="{ color: item.status === 3 ? '#00c48c' : '#ff9800' }">{{ item.produced_quantity }}</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view v-if="!list.length && !loading" class="empty">暂无工单</view>
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.tabs { display: flex; white-space: nowrap; margin-bottom: 20rpx; }
.tab {
  display: inline-block; padding: 12rpx 32rpx; margin-right: 16rpx;
  background: #fff; border-radius: 32rpx; font-size: 26rpx; color: #666;
}
.tab.active { background: #007aff; color: #fff; }
.loading { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
.list { display: flex; flex-direction: column; gap: 20rpx; }
.card {
  background: #fff; border-radius: 16rpx; padding: 30rpx; position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.code { font-size: 30rpx; font-weight: 600; color: #333; }
.tag { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 20rpx; }
.card-row { display: flex; font-size: 26rpx; margin-top: 8rpx; }
.label { color: #999; width: 80rpx; }
.value { color: #666; flex: 1; }
.arrow { position: absolute; right: 24rpx; top: 50%; transform: translateY(-50%); font-size: 40rpx; color: #ccc; }
.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
</style>
