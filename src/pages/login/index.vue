<script setup lang="ts">
import { ref, reactive } from 'vue'
import { login } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const form = reactive({
  username: 'admin',
  password: 'admin123',
})

const loading = ref(false)
const formRef = ref()

function validateForm(): boolean {
  if (!form.username) {
    uni.showToast({ title: '请输入账号', icon: 'none' })
    return false
  }
  if (!form.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return false
  }
  return true
}

async function handleLogin() {
  if (!validateForm()) return

  loading.value = true
  try {
    const res = await login(form)
    useUserStore.setToken(res.token)
    useUserStore.setUserInfo(res.userInfo)
    uni.showToast({ title: '登录成功', icon: 'success' })
    uni.switchTab({ url: '/pages/dashboard/index' })
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
    <uni-forms ref="formRef">
      <uni-forms-item label="账号">
        <uni-easyinput v-model="form.username" type="text" placeholder="请输入账号" />
      </uni-forms-item>
      <uni-forms-item label="密码">
        <uni-easyinput v-model="form.password" type="password" placeholder="请输入密码" />
      </uni-forms-item>
      <button class="login-btn u-reset-button" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </uni-forms>
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
.login-btn {
  margin-top: 60rpx;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx 0;
  width: 100%;
  font-size: 32rpx;
}
.login-btn[disabled] {
  opacity: 0.6;
}
</style>
