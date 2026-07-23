const BASE_URL = "http://127.0.0.1:8787";

type RequestOptions = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: Record<string, unknown>;
  loading?: boolean;
};

type PendingTask = (token: string) => void;

let isRefreshing = false;
let pendingQueue: PendingTask[] = [];

function getPayload(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function request<T = unknown>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync("token");
    const header: Record<string, string> = {};
    if (token) {
      header["Authorization"] = `Bearer ${token}`;
    }

    if (options.loading) {
      uni.showLoading({ title: "加载中..." });
    }

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data,
      header,
      success(res) {
        if (options.loading) uni.hideLoading();

        const data = res.data as { code: number; message: string; data: T };

        if (data.code === 0) {
          resolve(data.data);
          return;
        }

        if (data.code === 20000 || data.code === 20001) {
          const token = uni.getStorageSync('token')
          if (!token) {
            // No token → real auth error (wrong credentials), not expiry
            uni.showToast({ title: data.message, icon: 'none' })
            reject(new Error(data.message))
            return
          }
          handleTokenExpired(options, resolve, reject);
          return;
        }

        uni.showToast({ title: data.message, icon: "none" });
        reject(new Error(data.message));
      },
      fail(err) {
        if (options.loading) uni.hideLoading();
        uni.showToast({ title: "网络错误", icon: "none" });
        reject(err);
      },
    });
  });
}

function handleTokenExpired<T>(
  options: RequestOptions,
  resolve: (value: T) => void,
  reject: (reason?: unknown) => void,
) {
  const token = uni.getStorageSync("token");
  if (!token) {
    uni.reLaunch({ url: "/pages/login/index" });
    return;
  }

  const payload = getPayload(token);
  if (!payload || payload.refresh_exp < Math.floor(Date.now() / 1000)) {
    uni.removeStorageSync("token");
    uni.reLaunch({ url: "/pages/login/index" });
    return;
  }

  if (!isRefreshing) {
    isRefreshing = true;
    uni.request({
      url: BASE_URL + "/mobile/auth/refresh",
      method: "POST",
      header: { Authorization: `Bearer ${token}` },
      success(res) {
        const data = res.data as { code: number; message: string; data: { token: string } };
        if (data.code === 0) {
          const newToken = data.data.token;
          uni.setStorageSync("token", newToken);
          isRefreshing = false;
          pendingQueue.forEach((cb) => cb(newToken));
          pendingQueue = [];
          retryRequest(options, resolve, reject);
        } else {
          isRefreshing = false;
          pendingQueue = [];
          uni.removeStorageSync("token");
          uni.reLaunch({ url: "/pages/login/index" });
        }
      },
      fail() {
        isRefreshing = false;
        pendingQueue = [];
        uni.removeStorageSync("token");
        uni.reLaunch({ url: "/pages/login/index" });
      },
    });
  } else {
    pendingQueue.push((newToken: string) => {
      uni.setStorageSync("token", newToken);
      retryRequest(options, resolve, reject);
    });
  }
}

function retryRequest<T>(
  options: RequestOptions,
  resolve: (value: T) => void,
  reject: (reason?: unknown) => void,
) {
  const token = uni.getStorageSync("token");
  uni.request({
    url: BASE_URL + options.url,
    method: options.method || "GET",
    data: options.data,
    header: { Authorization: `Bearer ${token}` },
    success(res) {
      const data = res.data as { code: number; message: string; data: T };
      if (data.code === 0) {
        resolve(data.data);
      } else {
        reject(new Error(data.message));
      }
    },
    fail(err) {
      reject(err);
    },
  });
}
