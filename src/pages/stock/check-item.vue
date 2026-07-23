<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'
import { getCheckItems, completeCheck } from '@/api/stock'

const id = ref(0)
const checkInfo = ref<any>(null)
const items = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)

onLoad((query) => {
  id.value = Number(query?.id || 0)
  loadData()
})

function scan(item: any) {
  uni.scanCode({
    success(res) {
      const code = res.result
      const matched = items.value.find(
        (it: any) => it.material_code === code,
      )
      if (matched) {
        item._actual = String(matched.book_quantity)
        uni.showToast({ title: `已填入 ${matched.book_quantity}`, icon: 'none' })
      } else {
        uni.showToast({ title: '未匹配物料', icon: 'none' })
      }
    },
  })
}

async function handleSubmit() {
  const payload = items.value.map((it: any) => ({
    material_id: it.material_id,
    actual_quantity: Number(it._actual) || 0,
    remark: it._remark || '',
  }))

  submitting.value = true
  try {
    await completeCheck({ id: id.value, items: payload })
    uni.showToast({ title: '盘点完成', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch (_) {
    // error handled by request interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})

onBackPress(() => {
  uni.reLaunch({ url: '/pages/dashboard/index' })
  return true
})
</script>

<template>
  <view class="check-item">
    <uv-loading v-if="loading" type="circle" />

    <template v-else>
      <view class="header">
        <text class="code">{{ checkInfo?.code }}</text>
        <text class="warehouse">{{ checkInfo?.warehouse_name }}</text>
      </view>

      <view class="table-header">
        <text class="col-name">物料</text>
        <text class="col-book">账面</text>
        <text class="col-actual">实际</text>
        <text class="col-op"></text>
      </view>

      <scroll-view scroll-y class="list">
        <view v-for="(item, idx) in items" :key="item.id" class="row">
          <view class="col-name">
            <text class="material-name">{{ item.material_name }}</text>
            <text class="material-code">{{ item.material_code }}</text>
          </view>
          <view class="col-book">
            <text class="book-num">{{ item.book_quantity }}</text>
          </view>
          <view class="col-actual">
            <input
              v-model="item._actual"
              type="number"
              class="input-num"
              placeholder="输入"
            />
          </view>
          <view class="col-op">
            <text class="scan-btn" @click="scan(item)">扫码</text>
          </view>
        </view>
      </scroll-view>

      <view class="footer">
        <button class="submit-btn" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? '提交中...' : '完成盘点' }}
        </button>
      </view>
    </template>
  </view>
</template>

<style scoped>
.check-item {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}
.header {
  background: #fff;
  padding: 24rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2rpx solid #eee;
}
.code {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}
.warehouse {
  font-size: 26rpx;
  color: #00c48c;
  background: #e8faf0;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}
.table-header {
  display: flex;
  padding: 20rpx 24rpx;
  font-size: 24rpx;
  color: #999;
  background: #fafafa;
}
.col-name { flex: 2; }
.col-book { flex: 1; text-align: center; }
.col-actual { flex: 1.5; text-align: center; }
.col-op { width: 80rpx; text-align: center; }
.list { flex: 1; }
.row {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff;
  border-bottom: 2rpx solid #f0f0f0;
}
.material-name {
  display: block;
  font-size: 26rpx;
  color: #333;
}
.material-code {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}
.book-num {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
.input-num {
  width: 100%;
  height: 60rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  text-align: center;
  font-size: 28rpx;
  background: #fafafa;
}
.scan-btn {
  color: #007aff;
  font-size: 24rpx;
  padding: 8rpx 12rpx;
}
.footer {
  padding: 24rpx 30rpx;
  background: #fff;
  border-top: 2rpx solid #eee;
}
.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #00c48c;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  text-align: center;
  border: none;
}
.submit-btn:disabled {
  opacity: 0.5;
}
</style>
