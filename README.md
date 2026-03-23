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

- 样式入口：`src/index.css` → `./ui-foundation.css`（CSS 变量与语义类）；Tailwind 使用工程内 `tailwind-preset.ts`（见下「部署与 Token 同步」）
- 这不是完整业务系统，而是团队复用时的最小参考骨架
- 如果文档与页面入口存在差异，以仓库根目录 README 和各示例 README 的正式范围口径为准

## 部署与 Token 同步（必读）

**为什么单独写一节：** `prototype-app` 常会单独推到 GitHub 并由 Vercel 等平台构建。构建环境**没有**仓库外的 `../01-页面设计基线/` 目录，任何指向该路径的引用都会导致 `npm run build` 失败（`tsc -b`、PostCSS/Vite 处理 CSS 时均会报错）。

**必须遵守：**

1. **自包含引用**  
   - CSS 基线只使用工程内文件：`src/ui-foundation.css`，由 `src/index.css` 以 `@import "./ui-foundation.css"` 引入。**禁止**再写 `@import "../../01-页面设计基线/ui-foundation.css"` 等仓库外路径。  
   - Tailwind 预设只使用工程内文件：`prototype-app/tailwind-preset.ts`。  
   - `tailwind.config.ts` / `tailwind.config.js` / `tsconfig.node.json` 中**禁止**再出现对 `../01-页面设计基线/tailwind-preset` 或仓库外路径的引用。

2. **与《页面设计基线》双端同步**  
   - 在**整仓**里，规范源仍是 [01-页面设计基线/ui-foundation.css](../01-页面设计基线/ui-foundation.css) 与 [01-页面设计基线/tailwind-preset.ts](../01-页面设计基线/tailwind-preset.ts)（二者配套）。  
   - 只要修改了其中任一份，**必须同步**到 `prototype-app/src/ui-foundation.css` 与 `prototype-app/tailwind-preset.ts`，再提交推送，这样本地整仓与单独部署的线上表现一致。

3. **改前自检**  
   - 修改基线后在本目录执行 `npm run build`，确保通过后再推送。  
   - AI/协作者若只改了整仓文件、未同步 `prototype-app` 内两份文件，视为未完成。
