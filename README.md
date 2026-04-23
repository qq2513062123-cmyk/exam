# 在线考试与管理系统

一个基于 monorepo 的在线考试系统，包含学生端、管理端和 Express 后端，支持登录、考试、判分、复核和统计等完整闭环。本 README 仅聚焦本地启动和部署准备。

## 技术栈

- 前端：Next.js App Router + TypeScript + Tailwind CSS
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

首次启动：

```bash
docker run --name exam-system-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=exam_system \
  -p 5432:5432 \
  -d postgres:16
```

如果容器已存在：

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

### 6. 启动学生端

在 `apps/student/.env.local` 中填写：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

然后启动：

```bash
pnpm dev:student
```

### 7. 启动管理端

在 `apps/admin/.env.local` 中填写：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

然后启动：

```bash
pnpm dev:admin
```

### 8. 本地访问地址

- 官网首页：[http://localhost:3000](http://localhost:3000)
- 学生端：[http://localhost:3002](http://localhost:3002)
- 管理端：[http://localhost:3003](http://localhost:3003)
- 后端健康检查：[http://localhost:3001/api/health](http://localhost:3001/api/health)

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
2. 在 Railway 中选择 `Deploy from GitHub repo`。
3. 选择本仓库。
4. 将 `Root Directory` 设置为 `server`。
5. Railway 会使用：
   - `build`: `tsc`
   - `start`: `node dist/server.js`
6. 在 Railway 项目中设置环境变量：
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT` 不必手动固定，Railway 会自动注入；本项目已通过 `process.env.PORT` 读取
7. 部署完成后，记下后端公网地址，例如：
   - `https://your-api.up.railway.app`

后端当前已经满足 Railway 部署要求：

- `server/package.json` 已包含 `build` 和 `start`
- `server/tsconfig.json` 输出目录为 `dist`
- `server/src/server.ts` 使用 `app.listen(env.PORT)`
- 未硬编码本地数据库地址

### 数据库（Supabase）

1. 在 Supabase 创建 PostgreSQL 项目。
2. 复制连接字符串，填入 Railway 的 `DATABASE_URL`。
3. 打开 Supabase SQL Editor。
4. 执行：
   - `server/src/db/migrations/001_init_schema.sql`
   - `server/src/db/seeds/001_seed_profiles.sql`
5. 确认已创建测试账号和基础表结构。

说明：

- 本项目不修改数据库结构，部署时只需要执行现有 migration 和 seed。
- 生产环境建议替换默认测试账号密码，或只保留管理员初始化方式。

### 前端（Vercel）

建议在 Vercel 中创建 3 个独立项目。

#### 1. web

- Import 同一个 GitHub 仓库
- Root Directory：`apps/web`
- Framework Preset：Next.js
- 无额外环境变量要求

#### 2. student

- Import 同一个 GitHub 仓库
- Root Directory：`apps/student`
- Framework Preset：Next.js
- 设置环境变量：

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.up.railway.app/api
```

#### 3. admin

- Import 同一个 GitHub 仓库
- Root Directory：`apps/admin`
- Framework Preset：Next.js
- 设置环境变量：

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.up.railway.app/api
```

说明：

- `apps/student/package.json`、`apps/admin/package.json`、`apps/web/package.json` 都已包含：
  - `dev`
  - `build`
  - `start`
- 三个 `next.config.ts` 均为标准空配置，不依赖本地路径
- student/admin 当前 API 请求统一通过 `process.env.NEXT_PUBLIC_API_BASE_URL`

## 测试账号

- 管理员：`admin@example.com` / `Admin123456`
- 学生：`student@example.com` / `Student123456`

## 部署后联调建议

1. 先确认 Railway 后端健康检查可访问：
   - `https://your-api.up.railway.app/api/health`
2. 再部署 `student` 和 `admin`
3. 登录管理端创建题目和考试
4. 登录学生端完成一次答题和提交
5. 回到管理端复核简答题
6. 检查学生历史成绩和后台统计页面

## 当前部署结论

当前项目已经具备基础上线条件：

- 后端可部署到 Railway
- 数据库可部署到 Supabase
- 三个前端应用可分别部署到 Vercel

本次仅完成部署准备，没有改业务逻辑、接口或数据库结构。
