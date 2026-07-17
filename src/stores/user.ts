export const useUserStore = {
  getToken(): string {
    return uni.getStorageSync('token') || ''
  },

  setToken(token: string) {
    uni.setStorageSync('token', token)
  },

  getUserInfo(): Record<string, unknown> | null {
    const info = uni.getStorageSync('userInfo')
    return info || null
  },

  setUserInfo(info: Record<string, unknown>) {
    uni.setStorageSync('userInfo', info)
  },

  logout() {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  },
}
