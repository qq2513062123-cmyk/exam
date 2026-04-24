# 在线考试与管理系统

一个基于 monorepo 的在线考试系统，包含学生端、管理端、官网首页和 Express 后端。当前 README 只聚焦部署准备与本地启动。

## 技术栈

- 前端：Next.js + TypeScript + Tailwind CSS
- 后端：Node.js + Express + PostgreSQL
- 鉴权：JWT + RBAC
- 工程：pnpm workspace（monorepo）

## 本地启动

### 1. 安装依赖

```bash
cd exam-system
pnpm install
```

### 2. 启动数据库（Docker）

首次运行：

```bash
docker run --name exam-system-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=exam_system \
  -p 5432:5432 \
  -d postgres:16
```

如果容器已经存在：

```bash
docker start exam-system-postgres
```

### 3. 配置后端环境变量

在 `server/.env` 中填写：

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/exam_system
JWT_SECRET=dev_jwt_secret_change_me
```

### 4. 初始化数据库

```bash
docker exec -i exam-system-postgres psql -U postgres -d exam_system < server/src/db/migrations/001_init_schema.sql
docker exec -i exam-system-postgres psql -U postgres -d exam_system < server/src/db/seeds/001_seed_profiles.sql
```

### 5. 启动后端

```bash
pnpm dev:server
```

### 6. 启动 student

在 `apps/student/.env.local` 中填写：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

然后运行：

```bash
pnpm dev:student
```

### 7. 启动 admin

在 `apps/admin/.env.local` 中填写：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

然后运行：

```bash
pnpm dev:admin
```

### 8. 启动 web

```bash
pnpm dev:web
```

### 9. 本地访问地址

- web：首页 `http://localhost:3000`
- server：健康检查 `http://localhost:3001/api/health`
- student：`http://localhost:3002/login`
- admin：`http://localhost:3003/login`

## 环境变量

### server/.env.example

```env
PORT=3001
DATABASE_URL=
JWT_SECRET=
```

### apps/student/.env.example

```env
NEXT_PUBLIC_API_BASE_URL=
```

### apps/admin/.env.example

```env
NEXT_PUBLIC_API_BASE_URL=
```

## 部署步骤

### 后端（Railway）

1. 将仓库推送到 GitHub。
2. 在 Railway 中选择 `Deploy from GitHub Repo`。
3. 选择当前仓库。
4. 将 `Root Directory` 设置为 `server`。
5. Railway 会使用：
   - Build Command：`tsc`
   - Start Command：`node dist/server.js`
6. 在 Railway 中设置环境变量：
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT` 可不手动固定，项目已经通过 `process.env.PORT` 读取

当前后端已经满足 Railway 部署要求：

- `server/package.json` 已包含：
  - `"build": "tsc"`
  - `"start": "node dist/server.js"`
- `server/tsconfig.json` 输出目录为 `dist`
- `server/src/server.ts` 使用 `app.listen(env.PORT)`
- 不依赖硬编码本地端口

### 数据库（Supabase）

1. 在 Supabase 创建 PostgreSQL 项目。
2. 复制数据库连接串，作为 Railway 的 `DATABASE_URL`。
3. 打开 Supabase SQL Editor。
4. 依次执行：
   - `server/src/db/migrations/001_init_schema.sql`
   - `server/src/db/seeds/001_seed_profiles.sql`

说明：

- 本项目不修改数据库结构，部署时只执行现有 migration 和 seed。
- 如果切换到其他 PostgreSQL 服务，步骤相同。

### 前端（Vercel）

建议在 Vercel 中创建 3 个独立项目。

#### web

- Import 同一个 GitHub 仓库
- Root Directory：`apps/web`
- Framework Preset：Next.js
- 无额外环境变量要求

#### student

- Import 同一个 GitHub 仓库
- Root Directory：`apps/student`
- Framework Preset：Next.js
- 设置环境变量：

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.up.railway.app/api
```

#### admin

- Import 同一个 GitHub 仓库
- Root Directory：`apps/admin`
- Framework Preset：Next.js
- 设置环境变量：

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.up.railway.app/api
```

当前三个前端项目已经满足 Vercel 基本要求：

- `apps/student/package.json`
- `apps/admin/package.json`
- `apps/web/package.json`

均包含：

- `"dev": "next dev ..."`
- `"build": "next build"`

并且：

- 三个 `next.config.ts` 均为标准配置，不依赖本地路径
- student / admin API 基址使用 `process.env.NEXT_PUBLIC_API_BASE_URL`

## 测试账号

- 管理员：`admin@example.com` / `Admin123456`
- 学生：`student@example.com` / `Student123456`

## 部署检查建议

上线前建议至少确认以下事项：

1. Railway 健康检查可访问：
   - `https://your-api.up.railway.app/api/health`
2. student 和 admin 环境变量都指向同一个后端地址
3. 能完成一次完整业务链路：
   - 管理员登录
   - 创建题目
   - 创建并发布考试
   - 学生登录并提交
   - 管理员复核
   - 学生查看历史成绩
