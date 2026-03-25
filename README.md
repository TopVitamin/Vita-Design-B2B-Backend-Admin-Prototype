# 前端原型工程（prototype-app）

这是V1.1的独立前端原型工程，统一承载采购订单、即时库存查询、库存流水查询、供应商主数据、客户主数据、壳层能力与消息中心、系统状态页这7个常见案例。

## 目标

演示以下内容如何落到前端代码：

- 后台壳层
- 壳层能力参考页（全局搜索、消息通知、用户菜单、工作台Tab、顶部轻提示、覆盖式抽屉）
- 系统状态参考页（403、404、登录过期、系统维护）
- Design System视觉规范总览页
- 消息中心页
- 采购订单列表页
- 即时库存查询列表页
- 库存流水查询列表页
- 列表页列设置组件（显示隐藏、顺序调整、固定列、用户自动记忆）
- 采购订单新增/编辑页
- 采购订单详情页
- 供应商主数据列表/新增/编辑/详情页
- 客户主数据列表/新增/编辑/详情页
- 导入/导出弹窗
- Banner / Notice共享组件
- Input基础控件族（Input、Textarea、Checkbox、RadioGroup、Switch）
- FilterChip
- UploadDropzone与导入弹窗骨架
- PageHeader与列表页主卡片骨架
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

- `/`：首页，可从首页快捷入口、顶部壳层和辅助菜单打开`Design System`、`壳层能力`、`系统状态`、消息中心、导出任务中心、采购订单常见案例、即时库存查询常见案例、库存流水查询常见案例、供应商主数据常见案例、客户主数据常见案例

## 说明

- 样式入口：`src/index.css` → `./ui-foundation.css`（CSS 变量与语义类）；Tailwind 使用工程内 `tailwind-preset.ts`（见下「部署与唯一真相源」）
- 这不是完整业务系统，而是团队复用时的最小参考骨架
- 如果文档与页面入口存在差异，以仓库根目录 README 和各示例 README 的正式范围口径为准

## 部署与唯一真相源（必读）

**为什么单独写一节：** `prototype-app` 很可能会被单独作为项目导入GitHub/Vercel，或者在Vercel里被设置为单独的 Root Directory。无论哪种方式，真正参与构建的都只能是工程内文件。任何把样式和TS基线放回文档目录、再跨目录引用的做法，都会让部署和协作变脆弱。

**必须遵守：**

1. **Vercel部署方式**
   - 如果整仓上传到GitHub，Vercel里的 Root Directory 设为 `prototype-app`
   - Framework Preset 选 `Vite`
   - Build Command 使用 `npm run build`
   - Output Directory 使用 `dist`

2. **自包含引用**  
   - CSS 基线只使用工程内文件：`src/ui-foundation.css`，由 `src/index.css` 以 `@import "./ui-foundation.css"` 引入。**禁止**再写 `@import "../../01-页面设计基线/ui-foundation.css"` 等仓库外路径。  
   - Tailwind 预设只使用工程内文件：`prototype-app/tailwind-preset.ts`。  
   - `tailwind.config.ts` / `tailwind.config.js` / `tsconfig.node.json` 中**禁止**再出现对 `../01-页面设计基线/tailwind-preset` 或仓库外路径的引用。

3. **唯一真相源就在工程内**  
   - 真正参与构建的CSS基线只有 [src/ui-foundation.css](src/ui-foundation.css)  
   - 真正参与构建的Tailwind预设只有 [tailwind-preset.ts](tailwind-preset.ts)  
   - 仓库根目录的 `01-页面设计基线` 只保留规则说明（与可执行代码分离）；本工程内的 [01-页面设计基线/](01-页面设计基线/) 为同名文档**副本**，便于单独上传本工程到 GitHub 时链接仍有效（与根目录平行维护，更新规则后请把 Markdown 同步复制到该副本）

4. **改前自检**  
   - 修改基线后在本目录执行 `npm run build`，确保通过后再推送。  
   - 如果你改了Token、语义类或Tailwind映射，记得同时回看工程内的 [01-页面设计基线/README.md](01-页面设计基线/README.md) 与 [视觉与Token规则 V1.1.md](01-页面设计基线/视觉与Token规则%20V1.1.md)；权威说明仍以完整仓库根目录下 `01-页面设计基线` 为准，避免文档与代码漂移。
