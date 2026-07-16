<template>
  <view class="login">
    <view class="logo">MES</view>
    <uni-forms>
      <uni-forms-item label="账号">
        <uni-easyinput type="text" placeholder="请输入账号" />
      </uni-forms-item>
      <uni-forms-item label="密码">
        <uni-easyinput type="password" placeholder="请输入密码" />
      </uni-forms-item>
      <button class="login-btn u-reset-button">登录</button>
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
}
</style>
