# SBTI 人格测试（Next.js）

一个基于 Next.js 16 构建的 SBTI 测试站点，包含题目流程、自动下一题、结果计算、结果图展示，以及原站文案与图片资产的本地化。

## 功能概览

- 首页：标题、副标题、恶搞引导文案
- 测试流程：单题展示 + 选择后自动跳到下一题
- 结果页：人格类型、描述、维度解读、结果海报图
- 特殊题逻辑：按条件动态插入题目
- 资源优化：结果图片做了无损压缩，减小带宽消耗

## 技术栈

- Next.js 16（App Router）
- React 19 + TypeScript
- Vitest + Testing Library
- ESLint

## 本地开发

```bash
npm install
npm run dev
```

默认访问：`http://localhost:3000`

## 常用脚本

```bash
npm run test       # 运行测试
npm run typecheck  # TypeScript 检查
npm run lint       # ESLint
npm run build      # 生产构建
npm run optimize:images  # 无损压缩结果图片
```

## 部署（Vercel）

### 方法一：推荐（从 GitHub 导入）

1. 将本仓库推送到 GitHub（例如：`MaydayV/sbti`）
2. 打开 Vercel：`https://vercel.com/new`
3. 选择 `MaydayV/sbti` 并导入
4. Framework Preset 选择 **Next.js**（通常自动识别）
5. 保持默认构建配置并点击 Deploy

默认配置：

- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

### 方法二：CLI 一键部署

在仓库目录执行：

```bash
npx -y vercel@49.0.0
```

首次部署按提示选择：

- Scope: `maydayv`
- Link to existing project: `No`（新建项目）
- Project name: `sbti`
- In which directory is your code located?: `./`

生产发布：

```bash
npx -y vercel@49.0.0 --prod
```

## 本次实际可用部署方式（已验证）

由于当前 Node 版本下最新 `vercel` CLI 存在依赖引擎兼容问题，建议固定使用以下命令：

```bash
npx -y vercel@49.0.0
npx -y vercel@49.0.0 --prod
```

## License

MIT
