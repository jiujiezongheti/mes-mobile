# mes-mobile

MES 制造执行系统移动端，基于 UniApp 3 + Vue 3 + uview-plus 开发，支持 H5 / 小程序 / App 多端运行。

## 技术栈

| 名称 | 版本 |
|------|------|
| UniApp | ^3.0 |
| Vue | ^3.4 |
| uview-plus | ^3.8 |
| TypeScript | ^4.9 |
| Vite | ^5.2 |
| Sass | ^1.10 |

## 功能列表

- [x] 登录 / 退出
- [x] 首页工作台（功能卡片入口）
- [x] 工单执行：列表 / 详情 / 开始生产 / 按工序流转（开始工序 / 按工序报工 / 完成工序）/ 完工（自动生成质检单）
- [x] 质量检验：质检单列表 / 判定（合格 / 返工 / 报废 / 让步接收）
- [x] 领料管理：待领任务列表 / 扫码领料录入
- [x] 库存盘点：待盘任务列表 / 扫码录入 / 提交审核
- [x] 设备管理：设备列表
- [ ] 设备点检巡检
- [ ] 生产进度看板

## 快速开始

```bash
# 环境要求
# Node.js 18+

# 安装依赖
npm install

# H5 模式开发
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# 类型检查
npm run type-check
```

> 默认账号：`admin` / `admin123`

## 目录结构

```
src/
├── api/            # API 请求层（按模块拆分）
├── pages/          # 页面（文件全小写）
│   ├── login/
│   ├── dashboard/
│   ├── order/      # 工单列表 / 详情
│   ├── quality/    # 质检
│   ├── device/     # 设备
│   └── stock/      # 盘点 / 领料
├── stores/         # 状态管理（uni.storage）
└── utils/          # 工具（request 网络请求 / native 原生能力）
```

## 相关项目

- [mes-api](https://github.com/jiujiezongheti/mes-api) — 后端 API 服务
- [mes-admin](https://github.com/jiujiezongheti/mes-admin) — PC 管理后台

## 开源协议

MIT
