<template>
  <view class="dashboard">
    <uni-statistic
      group="今日概况"
      :columns="2"
      :items="[
        { label: '待处理工单', value: '12' },
        { label: '进行中任务', value: '8' },
      ]"
    />
  </view>
</template>
