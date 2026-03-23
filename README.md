# 前端原型工程（prototype-app）

这是V1.1的独立前端原型工程，统一承载采购订单、供应商主数据、客户主数据这3个常见案例。

## 目标

演示以下内容如何落到前端代码：

- 后台壳层
- Design System视觉规范总览页
- 采购订单列表页
- 列表页列设置组件（显示隐藏、顺序调整、固定列、用户自动记忆）
- 采购订单新增/编辑页
- 采购订单详情页
- 供应商主数据列表/新增/编辑/详情页
- 客户主数据列表/新增/编辑/详情页
- 导入/导出弹窗
- 状态、异常、权限、上下游和日志占位

## 技术栈

- React
- TypeScript
- TailwindCSS
- shadcn/ui风格本地组件

## 启动方式

```bash
cd prototype-app
npm install
npm run dev
```

默认访问：

- `/`：首页，可从左侧导航打开`Design System`、采购订单常见案例、供应商主数据常见案例、客户主数据常见案例

## 说明

- 工程使用[01-页面设计基线/ui-foundation.css](../01-页面设计基线/ui-foundation.css)和[01-页面设计基线/tailwind-preset.ts](../01-页面设计基线/tailwind-preset.ts)作为统一视觉与Tailwind基线
- 这不是完整业务系统，而是团队复用时的最小参考骨架
- 如果文档与页面入口存在差异，以仓库根目录README和各示例README的正式范围口径为准
