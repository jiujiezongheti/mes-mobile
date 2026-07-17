# mes-mobile

MES 制造执行系统移动端，基于 UniApp 3 + Vue 3 开发，支持 H5 / 小程序 / App 多端运行。

## 技术栈

| 名称 | 版本 |
|------|------|
| Vue | ^3.5 |
| UniApp | ^3.0 |
| uview-plus | ^3.3 |
| TypeScript | ~5.7 |
| Vite | ^6.0 |

## 功能列表

- [ ] PDA 扫码作业
- [ ] 工单执行与报工
- [ ] 质量检验录入
- [ ] 设备点检巡检
- [ ] 物料扫码追溯
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

# App 打包
npm run dev:app
```

> 默认账号：`admin` / `admin123`

## 目录结构

```
src/
├── api/            # API 请求层
├── pages/          # 页面
│   ├── login/
│   ├── dashboard/
│   ├── order/
│   ├── task/
│   ├── quality/
│   └── device/
├── components/     # 公共组件
├── stores/         # 状态管理
└── utils/          # 工具函数
```

## 相关项目

- [mes-api](https://github.com/jiujiezongheti/mes-api) — 后端 API 服务
- [mes-admin](https://github.com/jiujiezongheti/mes-admin) — PC 管理后台

## 开源协议

MIT
