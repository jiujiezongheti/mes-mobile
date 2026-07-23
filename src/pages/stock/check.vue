<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onPullDownRefresh, onBackPress } from '@dcloudio/uni-app'
import { getCheckTaskList } from '@/api/stock'

const list = ref<any[]>([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await getCheckTaskList()
    list.value = (res.list || []).filter((t: any) => t.status === 0)
  } catch (e: any) {
    list.value = []
  } finally {
    loading.value = false
  }
}

function goTask(id: number) {
  uni.navigateTo({ url: `/pages/stock/check-task?id=${id}` })
}

onPullDownRefresh(() => {
  loadData().finally(() => uni.stopPullDownRefresh())
})

onMounted(() => {
  loadData()
})

onBackPress(() => {
  uni.reLaunch({ url: '/pages/dashboard/index' })
  return true
})
</script>

<template>
  <view class="check-list">
    <view v-if="loading" class="loading">加载中...</view>

    <view v-else>
      <view v-if="list.length" class="tip">共 {{ list.length }} 个待盘点任务</view>
      <view class="list">
        <view v-for="item in list" :key="item.id" class="card" @click="goTask(item.id)">
          <view class="card-top">
            <text class="code">{{ item.code }}</text>
            <text class="tag pending">待盘点</text>
          </view>
          <view class="card-row">
            <text class="label">仓库</text>
            <text class="value">{{ item.warehouse?.name || '—' }}</text>
          </view>
          <view class="card-row" v-if="item.remark">
            <text class="label">备注</text>
            <text class="value">{{ item.remark }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </view>
      <view v-if="!list.length && !loading" class="empty">暂无盘点任务</view>
    </view>
  </view>
</template>

<style scoped>
.check-list {
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
  position: relative;
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
.tag.pending { color: #007aff; background: #e8f0fe; }
.card-row { display: flex; font-size: 26rpx; margin-top: 8rpx; }
.label { color: #999; width: 80rpx; }
.value { color: #666; }
.arrow {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40rpx;
  color: #ccc;
}
.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
