# Benchmark

`gaia/` 保存测试结果、Dashboard、历史页面和数据缓存。

在仓库根目录启动 Dashboard，并保持终端开启：

```bash
python3 -m http.server 8876 --bind 127.0.0.1 --directory benchmark/gaia
```

访问 [Dashboard](http://127.0.0.1:8876/)。

在 `coder-cli/` 运行评测，新结果自动保存到本目录并刷新 Dashboard：

```bash
uv run --group eval python -m evaluation.gaia --subset text
```

终端显示总进度、逐题状态和耗时。结果与数据缓存已加入 Git 忽略规则。
