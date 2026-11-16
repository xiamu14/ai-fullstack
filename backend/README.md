# Backend

NestJS 12 + TypeScript + Express，应用运行于 Node.js，使用 Bun 1.3.14 管理依赖与工具脚本。Node.js 版本要求 20.19+ 或 22.12+，默认端口 **3020**。

遵循 [API Spec](../spec/api.md) 和纯英文的 [Backend Structure](../spec/backend_structure.md)。顶层按职责分层，层内按业务组织；应用 API 只提供版本化的 oRPC `/rpc/v1`。不再挂载平行 REST API、未版本化 RPC 或 `/api` 别名。

本次分层与 RPC v1 调整未执行构建、格式检查、类型检查、lint、测试、迁移或服务启动验证，交由你验收。测试代码已同步，但尚未运行；Google、SMTP 与 PostgreSQL 认证流程需要有效配置。

## 本地准备

以下命令在 `backend/` 目录运行。安装依赖：

```bash
bun install
```

CI 使用 `bun install --frozen-lockfile`。没有 `.env` 时复制环境模板；已有文件时合并缺少的配置，保留原有凭据：

```bash
cp -n .env.example .env
```

生成随机密钥，将输出填写到 `.env` 的 `BETTER_AUTH_SECRET`：

```bash
openssl rand -base64 32
```

应用要求 `DATABASE_URL` 与至少 32 字符的 `BETTER_AUTH_SECRET`。Bun 执行 package scripts 时加载本目录 `.env`，并传给 Node.js 子进程；直接运行 `node dist/main.js` 时需自行注入环境。

本地开发前安装 Docker CLI、Compose 插件，并手动启动 Docker 引擎。脚本发现 Docker 不可用时直接报错退出，不尝试打开 Docker Desktop。

Compose 使用本机已有的 `postgres:17-alpine`，禁止自动拉取，缺少镜像会直接失败。默认监听 `127.0.0.1:5432`；端口占用时修改 `POSTGRES_PORT` 并同步修改 `DATABASE_URL`。数据保存在命名卷中。

首次配置后创建认证表；此命令会先启动本地 PostgreSQL 并等待就绪，再执行迁移：

```bash
bun run db migrate
```

完成首次配置和迁移后，日常一键启动：

```bash
bun run dev
```

`dev` 会检查 Docker CLI、Compose、引擎和本地镜像，启动 PostgreSQL 并等待健康检查通过，然后启动 NestJS。数据库就绪最多等待 120 秒；任一步失败就退出，不继续启动应用。已运行的容器会复用，退出开发服务后保留 PostgreSQL，不自动执行迁移或种子。

Docker 逻辑位于 `scripts/shared/docker.ts`，供 `dev` 和开发环境的 `db migrate/rollback/seed` 共用。`db status` 保持只读，生产环境不自动管理容器。只有 `DATABASE_URL` 指向本机且端口、数据库名与 Compose 一致时才启动本地容器，其他连接直接使用已有数据库。

使用已有的本地 PostgreSQL，可显式跳过 Docker：

```bash
bun run dev --skip-docker
```

```bash
bun run db migrate --skip-docker
```

`--help` / `-h` 不检查 Docker，也不启动容器。

## RPC v1 与文档

| 地址                                    | 用途                                   |
| --------------------------------------- | -------------------------------------- |
| `/`                                     | 重定向到 Scalar                        |
| `/docs`                                 | Scalar，切换应用 RPC v1 与身份认证文档 |
| `/openapi.json`                         | 从 v1 契约生成的应用 OpenAPI           |
| `/rpc/v1`                               | oRPC 客户端连接地址                    |
| `POST /rpc/v1/system/health`            | 应用存活信息，不查询数据库             |
| `POST /rpc/v1/account/me`               | 当前用户和会话摘要，需要登录 Cookie    |
| `/rpc/v1/auth/*`                        | Better Auth 原生认证端点               |
| `/rpc/v1/auth/open-api/generate-schema` | Better Auth 自动生成的认证 OpenAPI     |

业务 procedure 为 `system.health` 和 `account.me`，输入均为 `{}`。使用 oRPC 客户端时，将 RPCLink 的 URL 设置为 `http://localhost:3020/rpc/v1`，调用 `client.system.health({})` 或 `client.account.me({})`。浏览器请求需要 `credentials: 'include'`。

直接通过 HTTP 调用 procedure 时，直接传入和返回 JSON 对象（无需包裹 `json` 字段）：

```bash
curl -X POST http://localhost:3020/rpc/v1/system/health -H 'Content-Type: application/json' -d '{}'
```

`account.me` 只返回用户公开资料、会话 ID 和到期时间，不返回会话 token、密码或 OAuth token。ArkType/oRPC 校验输入与输出，应用错误直接返回 `code`、`status`、`message` 等字段。

Scalar 的应用文档描述实际的 POST procedure 路径和直接 JSON 结构。文档没有对应的第二套 REST API。

Better Auth 支持与 oRPC 的会话集成，但其原生登录与 Google 重定向不是 oRPC procedure。它们统一放在 `/rpc/v1/auth` 下，保留原生 JSON、Cookie、错误和重定向格式。受保护的业务 procedure 通过 oRPC 中间件读取会话，并转发 Better Auth 续期或清理会话产生的所有 `Set-Cookie`。

CORS 允许 `TRUSTED_ORIGINS` 中的精确来源和 `BETTER_AUTH_URL`，支持凭据。响应包含 `X-Request-Id`。本地开发统一使用 `localhost`，避免与 `127.0.0.1` 混用而导致 Cookie 不共享。

## 登录方式

### 客户端配置

前端使用 Better Auth 客户端时，明确配置认证路径：

```typescript
import { createAuthClient } from 'better-auth/client';
import { emailOTPClient, usernameClient } from 'better-auth/client/plugins';

const authClient = createAuthClient({
  baseURL: 'http://localhost:3020',
  basePath: '/rpc/v1/auth',
  fetchOptions: { credentials: 'include' },
  plugins: [usernameClient(), emailOTPClient()],
});
```

### 用户名与密码

注册提供邮箱与姓名，可同时提供用户名。用户名遵循插件默认规则：3–30 字符，支持字母、数字、下划线和点。密码至少 8 字符，密码账号完成邮箱验证后才能登录。

1. `POST /rpc/v1/auth/sign-up/email`，提交 `{"name":"Alice","email":"alice@example.com","password":"your-private-password","username":"alice"}`。
2. 注册后发送邮箱验证码。重发调用 `POST /rpc/v1/auth/email-otp/send-verification-otp`，提交 `{"email":"alice@example.com","type":"email-verification"}`。
3. `POST /rpc/v1/auth/email-otp/verify-email`，提交 `{"email":"alice@example.com","otp":"邮件中的验证码"}`。
4. `POST /rpc/v1/auth/sign-in/username`，提交 `{"username":"alice","password":"your-private-password"}`。也支持 `/rpc/v1/auth/sign-in/email` 使用邮箱与密码登录。
5. 保存登录 Cookie，再调用 `client.account.me({})`。`POST /rpc/v1/auth/sign-out` 注销会话。

这些认证 POST 请求使用 `Content-Type: application/json` 和原生请求体，不套 RPC 的 `json` envelope。具体参数以 Scalar 的身份认证文档为准。

### 邮箱 OTP

1. `POST /rpc/v1/auth/email-otp/send-verification-otp`，提交 `{"email":"alice@example.com","type":"sign-in"}`。
2. `POST /rpc/v1/auth/sign-in/email-otp`，提交 `{"email":"alice@example.com","otp":"邮件中的验证码"}`。
3. 保存登录 Cookie 后调用受保护的 RPC procedure。

启用 Better Auth 默认的 OTP 注册能力，未注册邮箱首次完成 OTP 登录时会创建账号。验证码为 6 位、有效期 5 分钟、最多尝试 3 次，数据库保存哈希。认证端点启用 Better Auth 内存限流，多实例部署时需要统一限流存储。

### SMTP

设置 `SMTP_HOST`、`SMTP_PORT`、`SMTP_SECURE` 和邮件服务允许的 `MAIL_FROM`。需要认证时同时填写 `SMTP_USER` 与 `SMTP_PASSWORD`；本地免认证 SMTP 可同时留空。

`SMTP_SECURE=true` 表示连接时使用 TLS，通常对应端口 465；端口 587 通常设置为 `false`，由 Nodemailer 升级到 STARTTLS。没有配置 `SMTP_HOST` 时，需要发送邮件的流程返回服务不可用错误，不打印验证码或模拟发送成功。Compose 不包含邮件服务。

### Google

同时填写 `GOOGLE_CLIENT_ID` 与 `GOOGLE_CLIENT_SECRET` 才启用 Google。Google Cloud 的 OAuth Web 客户端授权重定向 URI 改为：

```text
http://localhost:3020/rpc/v1/auth/callback/google
```

通过 `authClient.signIn.social({ provider: 'google', callbackURL: 'http://localhost:5173' })` 发起登录，或按认证文档调用 `POST /rpc/v1/auth/sign-in/social`。`callbackURL` 是登录成功后返回前端的地址，与 Google 的后端授权重定向 URI 不同；前端来源必须位于 `TRUSTED_ORIGINS`。

`BETTER_AUTH_URL` 只填写后端 origin，例如 `http://localhost:3020`，不包含认证路径。生产环境使用 HTTPS，并同步修改认证 URL、可信来源和 Google 回调地址。HTTPS 使用 Secure 会话 Cookie，OAuth token 加密保存。认证密钥需要安全持久化，不能每次重启重新生成。

## 四个命令

| 命令             | 默认行为                               | 主要参数                                                 |
| ---------------- | -------------------------------------- | -------------------------------------------------------- |
| `bun run dev`    | 等待本地 PostgreSQL 就绪后启动开发服务 | `--port 3020`、`--debug`、`--skip-docker`                |
| `bun run deploy` | 构建后在本机以生产模式启动             | `--port 3020`、`--build-only`                            |
| `bun run test`   | 类型检查、单元与端到端测试             | `--scope all`、`--watch`、`--coverage`                   |
| `bun run db`     | 查看连接与迁移状态                     | `status`、`migrate`、`rollback`、`seed`、`--skip-docker` |

每个命令和数据库子命令支持 `--help` / `-h`，帮助不启动应用或连接数据库。交互仅在显式使用 `--interactive` 时开启。端口优先级为 `--port`、环境变量 `PORT`、`3020`；改变端口时同步修改认证 URL 和 Google 配置。

`--debug` 将调试器绑定到 `127.0.0.1:9229`。`deploy` 构建成功后通过 Node.js 运行 `dist/main.js`，保持前台运行，Ctrl+C 停止；`--build-only` 只生成构建产物。

测试使用 Vitest，通过 `bun run test` 执行，不能使用 Bun 内置 `bun test`。`--scope` 可选 `all`、`check`、`unit`、`e2e`；`--watch` 仅支持 `unit`、`e2e`；`--coverage` 支持 `all`、`unit`、`e2e`。

RPC 传输测试替换数据库与会话服务，包含版本路径、输入校验、鉴权、Cookie 转发和 OpenAPI 格式的断言，尚未运行。它不覆盖真实 Google、SMTP 或数据库认证流程。数据库脚本测试默认跳过；配置 `SCRIPT_TEST_DATABASE_URL` 后使用独立临时数据库，账号需有创建数据库权限。

## 目录与数据库

- `src/bootstrap/`：应用装配、Nest 模块与端口绑定。
- `src/contracts/v1/`、`src/contracts/shared/`：版本化契约和公共协议定义。
- `src/presentation/`：HTTP 挂载、oRPC procedure、响应映射与 OpenAPI 文档。
- `src/application/`：应用身份类型、会话端口及后续业务用例。
- `src/infrastructure/`：配置、PostgreSQL、Better Auth 和 SMTP。
- `src/domain/`：出现组织权限、发布状态等实际业务规则时再创建。
- `scripts/`：四个命令与公共 CLI、数据库操作。
- `database/`：SQL 迁移与开发种子；`test/`：端到端测试。

`DATABASE_URL` 用于应用与迁移，`POSTGRES_*` 用于 Compose，改变后需同步连接串。已有数据卷的数据库名和凭据不会随 Compose 环境变量自动更改。迁移和种子规则见 [数据库说明](database/README.md)。ESM 相对导入使用 `.js` 后缀，工具脚本不进入应用构建产物。
