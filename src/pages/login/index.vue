<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { login } from '@/api/auth'
import { useUserStore } from '@/stores/user'

function getPayload(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

onShow(() => {
  const token = useUserStore.getToken()
  if (token) {
    const payload = getPayload(token)
    if (payload && payload.exp > Math.floor(Date.now() / 1000)) {
      uni.reLaunch({ url: '/pages/dashboard/index' })
    }
  }
})

const form = reactive({
  username: 'admin',
  password: 'admin123',
})

const loading = ref(false)

async function handleLogin() {
  if (!form.username) {
    uni.showToast({ title: '请输入账号', icon: 'none' })
    return
  }
  if (!form.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await login(form)
    useUserStore.setToken(res.token)
    useUserStore.setUserInfo(res.userInfo)
    uni.showToast({ title: '登录成功', icon: 'success' })
    uni.reLaunch({ url: '/pages/dashboard/index' })
  } catch (e: any) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="login">
    <view class="logo">MES</view>
    <view class="form-item">
      <text class="form-label">账号</text>
      <input v-model="form.username" class="form-input" placeholder="请输入账号" />
    </view>
    <view class="form-item">
      <text class="form-label">密码</text>
      <input v-model="form.password" class="form-input" type="password" placeholder="请输入密码" password />
    </view>
    <button class="login-btn u-reset-button" :disabled="loading" @click="handleLogin">
      {{ loading ? '登录中...' : '登录' }}
    </button>
  </view>
</template>

<style scoped>
.login {
  padding: 100rpx 40rpx;
}
.logo {
  text-align: center;
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 80rpx;
  color: #007aff;
}
.form-item {
  margin-bottom: 30rpx;
}
.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}
.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background: #fff;
}
.form-input:focus {
  border-color: #007aff;
}
.login-btn {
  margin-top: 60rpx;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx 0;
  width: 100%;
  font-size: 32rpx;
  line-height: 1.5;
  text-align: center;
}
.login-btn[disabled] {
  opacity: 0.6;
}
</style>
