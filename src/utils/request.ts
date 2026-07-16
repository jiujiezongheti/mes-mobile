const BASE_URL = "http://127.0.0.1:8787";

type RequestOptions = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: Record<string, unknown>;
  loading?: boolean;
};

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
        } else {
          uni.showToast({ title: data.message, icon: "none" });
          reject(new Error(data.message));
        }
      },
      fail(err) {
        if (options.loading) uni.hideLoading();
        uni.showToast({ title: "网络错误", icon: "none" });
        reject(err);
      },
    });
  });
}
