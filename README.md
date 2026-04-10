# SBTI 人格测试（Next.js）

这是一个一本正经胡说八道的 SBTI（傻逼人格测试）站点：
你认真答题，它认真给你下定义；你随便乱选，它也会非常自信地告诉你“这就是你”。

> 温馨提示：本项目主要用于娱乐、整活与前端练习，不构成任何心理学、社会学或人生规划建议。

## 功能概览

- 首页：高浓度恶搞文案，先把气氛烘托到“人类必须测 SBTI”
- 测试流程：单题展示 + 选择后自动下一题，节奏干脆不拖泥带水
- 结果页：给出“认证的 SBTI 人格类型”、描述、维度解读和结果海报图
- 特殊题逻辑：按条件动态插入，确保离谱中仍有一点点严谨
- 资源优化：结果图片按目标体积压缩（默认每张约 <= 50KB），节省带宽，整活也讲基本法

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
npm run optimize:images  # 按目标体积压缩结果图片（默认每张约 <= 50KB）
```

## 部署（Vercel）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MaydayV/sbti)

### 方法一：推荐（从 GitHub 导入）

1. 将代码推送到 `MaydayV/sbti`
2. 打开 Vercel：`https://vercel.com/new`
3. 选择 `MaydayV/sbti` 并导入
4. Framework Preset 保持 **Next.js**（自动识别）
5. 点击 Deploy

默认配置：

- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

### 方法二：CLI（本项目已验证）

> 当前环境下使用 `vercel@49.0.0` 已验证可用。

```bash
# 登录状态检查
npx -y vercel@49.0.0 whoami

# 首次将本地目录绑定到项目（已验证参数）
npx -y vercel@49.0.0 link --cwd . --yes --project sbti --scope maydayvs-projects

# 生产部署
npx -y vercel@49.0.0 deploy --cwd . --prod --yes --scope maydayvs-projects
```

### 已部署地址

- 正式域名：`https://sbti.caodan.io/`
- Vercel 生产 URL：`https://sbti-38rms5hvj-maydayvs-projects.vercel.app`
- 其他别名：
  - `https://sbti-maydayvs-projects.vercel.app`
  - `https://sbti-maydayv-maydayvs-projects.vercel.app`
  - `https://sbsbti.vercel.app`
## License

MIT
