# 数据库文件

数据库命令使用 PostgreSQL 与 `node-pg-migrate`。通过 `DATABASE_URL` 配置连接，默认连接本机 `backend` 数据库；命令不会创建数据库本身。

## 本地 PostgreSQL

在 `backend/` 目录执行 `bun run dev` 时，会检查 Docker CLI、Compose 和引擎，确认本地镜像存在，再启动 PostgreSQL 并等待健康检查，最多等待 120 秒。Docker 引擎需要手动启动；脚本不会打开 Docker Desktop，也不会下载镜像。

开发环境的 `db migrate`、`db rollback`、`db seed` 也复用 `scripts/shared/docker.ts` 的启动逻辑。`db status` 始终只读，不启动容器；生产环境和外部数据库也不自动启动容器。外部数据库按连接地址判断：只有本机地址且端口、数据库名与 Compose 一致才启动本地容器。使用已有本地数据库时，给 `dev` 或 `db` 加 `--skip-docker`。

也可以手动管理容器：

```bash
docker compose up -d --wait postgres
```

```bash
docker compose logs -f postgres
```

```bash
docker compose down
```

`up` 启动数据库并等待健康检查通过，`logs` 查看日志，`down` 停止并移除容器。使用本机已有的 `postgres:17-alpine` 镜像，`pull_policy: never` 禁止下载；本机缺少该镜像时启动会失败。

默认仅监听 `127.0.0.1:5432`，创建 `backend` 数据库，用户名和密码均为 `postgres`，与 `.env.example` 的连接一致：

```dotenv
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/backend
```

可通过 shell 环境变量或 `backend/.env` 设置 `POSTGRES_PORT`、`POSTGRES_DB`、`POSTGRES_USER`、`POSTGRES_PASSWORD`；默认分别为 `5432`、`backend`、`postgres`、`postgres`。修改后需同步更新 `DATABASE_URL`，密码中的特殊字符需做 URL 编码。这些默认凭据仅用于本地开发。

数据保存在命名卷 `postgres_data`（实际名称带 Compose 项目前缀）中，重建容器或执行 `docker compose down` 都会保留数据。数据库名、用户名和密码只在空卷首次初始化时生效；修改环境变量不会更改已有数据库或凭据。`docker compose down --volumes` 会永久删除该项目的数据卷及其中的数据。

容器初始化只创建数据库和用户，不会执行迁移或种子。数据库启动后，按需运行 `bun run db migrate` 和 `bun run db seed`。

## 迁移

迁移放在 `migrations/`，文件名使用递增的毫秒时间戳，例如 `1794787200000-create-organizations.sql`。每个文件同时包含正向和回滚 SQL：

```sql
-- Up Migration
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);

-- Down Migration
DROP TABLE organizations;
```

已应用的迁移不可修改或删除，应新增文件演进结构。`db migrate` 在事务内按顺序应用待执行迁移，`db rollback` 默认回滚最近一个文件。历史记录保存在 `public.pgmigrations`，迁移通过 PostgreSQL advisory lock 避免并发执行。

`db status` 只读取数据库和本地文件，不创建迁移历史表，并显示已应用、待应用和本地缺失的迁移。

## 开发种子

种子 SQL 放在 `seeds/`，例如 `001-organizations.sql`。`db seed` 按文件名排序并在同一事务中执行，失败时整体回滚。

种子可能被重复执行，必须使用稳定主键与 `INSERT ... ON CONFLICT` 保持幂等。种子不记录迁移版本，不应包含 `BEGIN` / `COMMIT` 等事务控制语句。`NODE_ENV=production` 时禁用种子命令。

当前包含 `1794787200000-create-auth.sql` 认证迁移，创建 `auth_user`、`auth_session`、`auth_account`、`auth_verification` 四张表，并包含用户名插件所需字段。迁移尚未执行；启动数据库后手动运行 `bun run db migrate`。

当前没有开发种子数据。认证迁移的回滚会删除上述四张表及其中的用户、会话和认证数据。
