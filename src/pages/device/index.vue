<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { getDeviceList } from '@/api/device'

const TYPE_OPTIONS: Record<number, string> = { 1: '生产设备', 2: '检测设备', 3: '辅助设备' }
const STATUS_OPTIONS: Record<number, string> = { 1: '运行中', 2: '停机', 3: '维修中', 4: '已报废' }

const list = ref<any[]>([])
const loading = ref(false)

function statusTagClass(status: number) {
  return { 1: 'running', 2: 'stopped', 3: 'repairing', 4: 'scrapped' }[status] || ''
}

async function loadData() {
  loading.value = true
  try {
    const res = await getDeviceList()
    list.value = res || []
  } catch (e: any) {
    list.value = []
  } finally {
    loading.value = false
  }
}

onPullDownRefresh(() => {
  loadData().finally(() => uni.stopPullDownRefresh())
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <view class="device-list">
    <view v-if="loading" class="loading">加载中...</view>

    <view v-else>
      <view v-if="list.length" class="tip">共 {{ list.length }} 台设备</view>
      <view class="list">
        <view v-for="item in list" :key="item.id" class="card">
          <view class="card-top">
            <text class="code">{{ item.code }}</text>
            <text class="tag" :class="statusTagClass(item.status)">{{ STATUS_OPTIONS[item.status] || '未知' }}</text>
          </view>
          <view class="card-row">
            <text class="label">名称</text>
            <text class="value">{{ item.name }}</text>
          </view>
          <view class="card-row" v-if="item.model">
            <text class="label">型号</text>
            <text class="value">{{ item.model }}</text>
          </view>
          <view class="card-row" v-if="item.location">
            <text class="label">位置</text>
            <text class="value">{{ item.location }}</text>
          </view>
          <view class="card-row" v-if="item.responsible_user">
            <text class="label">负责人</text>
            <text class="value">{{ item.responsible_user }}</text>
          </view>
          <view class="card-row">
            <text class="label">类型</text>
            <text class="value">{{ TYPE_OPTIONS[item.type] || '—' }}</text>
          </view>
        </view>
      </view>
      <view v-if="!list.length && !loading" class="empty">暂无设备</view>
    </view>
  </view>
</template>

<style scoped>
.device-list {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}
.loading {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
.tip {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}
.list { display: flex; flex-direction: column; gap: 20rpx; }
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.code { font-size: 32rpx; font-weight: 600; color: #333; }
.tag { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 20rpx; }
.tag.running { color: #52c41a; background: #e8f7e6; }
.tag.stopped { color: #666; background: #f0f0f0; }
.tag.repairing { color: #fa8c16; background: #fff3e6; }
.tag.scrapped { color: #f5222d; background: #ffecec; }
.card-row { display: flex; font-size: 26rpx; margin-top: 8rpx; }
.label { color: #999; width: 100rpx; }
.value { color: #666; flex: 1; }
.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>