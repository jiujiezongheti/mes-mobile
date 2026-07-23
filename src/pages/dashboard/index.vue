<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userInfo = ref<any>(null)
const greeting = ref('')

const cards = [
  { label: '工单管理', icon: '📋', path: '/pages/order/index', color: '#007aff' },
  { label: '盘点录入', icon: '📦', path: '/pages/stock/check', color: '#00c48c' },
  { label: '质量检验', icon: '✅', path: '/pages/quality/index', color: '#ff9800' },
  { label: '设备管理', icon: '🔧', path: '/pages/device/index', color: '#9c27b0' },
]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

function navigateTo(path: string) {
  uni.navigateTo({ url: path })
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success(res) {
      if (res.confirm) {
        useUserStore.logout()
        uni.reLaunch({ url: '/pages/login/index' })
      }
    },
  })
}

onMounted(() => {
  userInfo.value = useUserStore.getUserInfo()
  greeting.value = getGreeting()
})
</script>

<template>
  <view class="dashboard">
    <view class="header">
      <view class="header-top">
        <text class="greeting">{{ greeting }}，{{ userInfo?.nickname || userInfo?.username || '用户' }}</text>
        <text class="logout" @click="handleLogout">退出</text>
      </view>
      <text class="date">{{ new Date().toLocaleDateString('zh-CN') }}</text>
    </view>

    <view class="card-grid">
      <view v-for="card in cards" :key="card.path" class="card" :style="{ borderTopColor: card.color }" @click="navigateTo(card.path)">
        <text class="card-icon">{{ card.icon }}</text>
        <text class="card-label">{{ card.label }}</text>
        <text class="card-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 30rpx;
}
.header {
  background: linear-gradient(135deg, #007aff, #00c48c);
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  color: #fff;
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.greeting {
  font-size: 36rpx;
  font-weight: 600;
}
.logout {
  font-size: 26rpx;
  opacity: 0.8;
  padding: 8rpx 16rpx;
}
.date {
  display: block;
  font-size: 26rpx;
  opacity: 0.7;
  margin-top: 12rpx;
}
.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  border-top: 6rpx solid #007aff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  position: relative;
}
.card-icon {
  font-size: 60rpx;
}
.card-label {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}
.card-arrow {
  position: absolute;
  right: 24rpx;
  top: 24rpx;
  font-size: 36rpx;
  color: #ccc;
}
</style>
