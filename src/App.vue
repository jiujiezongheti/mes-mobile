<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app";
import { useUserStore } from "@/stores/user";

onLaunch(() => {
  const token = useUserStore.getToken();
  if (!token) {
    uni.reLaunch({ url: "/pages/login/index" });
  }
});
</script>

<style lang="scss">
@import "uview-plus/index.scss";

page {
  background-color: #f5f5f5;
}
</style>
