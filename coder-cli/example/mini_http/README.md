# mini_http

基于 Python 标准库（`http.server`）的最小 HTTP 服务框架：API Router + JSON 进出 + 统一错误语义，零第三方依赖。

## 特性

- **API Router**：`get/post/patch/put/delete` 装饰器注册，`{param}` 路径参数（`/items/{id}` → `request.path_params["id"]`）
- **JSON 请求/响应**：`request.json()` 解析请求体（缺失或非法 JSON 自动 400）；`Response.json(data, status=...)` 序列化响应
- **错误语义**：404（路径无路由 / 资源不存在）、405（方法不允许，响应带 `Allow` 头）、400（非法 JSON、字段校验失败），错误统一为 `{"error": "..."}` JSON
- **线程安全**：`ThreadingHTTPServer` 并发处理；示例 API 用 `threading.Lock` 保护内存存储
- **不吞编程错误**：框架只把自身 `HTTPError` 转成 JSON 响应；其他异常直接抛出（由标准库打印 traceback 并断开连接），无通用 500 兜底

## 目录结构

```text
mini_http/
├── mini_http/
│   ├── __init__.py    # 导出 Router / Request / Response / HTTPError / make_server / serve
│   ├── core.py        # Request、Response、HTTPError、InvalidJSONError
│   ├── router.py      # 路由表与解析（区分 404 / 405）
│   └── server.py      # HTTP 服务与请求分发
├── app.py             # 示例：内存 items API
├── test_app.py        # unittest 测试（临时本地端口）
└── README.md
```

## 环境要求

- Python ≥ 3.10（本机开发环境为 3.13.13；注意 `/usr/bin/python3` 是 Xcode shim，沙箱环境下可直接用 uv 管理的解释器）
- 无任何第三方依赖

## 启动示例服务

```sh
cd mini_http
python3 app.py            # 默认 http://127.0.0.1:8000
python3 app.py 9000       # 指定端口
```

### curl 示例

```sh
# 列表（初始为空数组）
curl http://127.0.0.1:8000/items

# 创建（201，返回带 id 的对象）
curl -X POST http://127.0.0.1:8000/items \
     -H 'Content-Type: application/json' -d '{"name": "apple"}'

# 详情 / 部分更新 / 整体替换 / 删除
curl http://127.0.0.1:8000/items/1
curl -X PATCH http://127.0.0.1:8000/items/1 \
     -H 'Content-Type: application/json' -d '{"name": "green apple"}'
curl -X PUT http://127.0.0.1:8000/items/1 \
     -H 'Content-Type: application/json' -d '{"name": "pear"}'
curl -X DELETE http://127.0.0.1:8000/items/1   # 204 无响应体

# 错误演示
curl -i -X POST http://127.0.0.1:8000/items -d '{oops'   # 400 非法 JSON
curl -i http://127.0.0.1:8000/items/999                  # 404 不存在
curl -i -X DELETE http://127.0.0.1:8000/items            # 405（带 Allow: GET, POST）
```

## 运行测试

```sh
cd mini_http
python3 -m unittest test_app -v
```

每个用例都在 `127.0.0.1` 的临时空闲端口（port 0，由系统分配）上启动全新服务并在结束时关闭，只测试本目录的示例 API，不访问任何外部服务。

## 在自己的代码中使用

```python
from mini_http import Response, Router, serve

router = Router()

@router.get("/hello/{name}")
def hello(request):
    return Response.json({"hello": request.path_params["name"]})

serve(router)   # 阻塞运行，默认 127.0.0.1:8000
```

测试或嵌入场景用 `make_server(router, port=0)`：返回已绑定端口的服务对象（不阻塞），可自行在后台线程调用 `serve_forever()`。

## 错误语义

| 状态码 | 触发条件 | 响应体 |
| --- | --- | --- |
| 400 | 请求体缺失 / 非法 JSON、字段校验失败、非法 Content-Length | `{"error": "..."}` |
| 404 | 路径无路由、资源不存在、`{id}` 非数字 | `{"error": "..."}` |
| 405 | 路径存在但该方法未注册 | `{"error": "..."}` + `Allow` 头 |
| 其他异常 | 编程错误 | 不捕获：连接关闭，stderr 打印 traceback |

## 已知边界

- 路径精确匹配，末尾斜杠视为不同路径（`/items/` ≠ `/items`）
- 不支持 `Transfer-Encoding: chunked` 请求体与 HEAD 方法（未实现的 method 由标准库返回 501）
- 请求体按 `Content-Length` 一次性读入内存
- 修改数据的处理器必须在持锁状态下读写存储（见 `app.py` 中 `existing_item` 的调用约定）
