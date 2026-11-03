---
name: web-download
description: 下载网页中指定图片到工作目录。适用于提供网页地址和目标图片 CSS 选择器的任务，需要浏览器渲染；不用于普通网页阅读或批量爬取。
---

# 网页图片下载

使用本技能的 `scripts/download.py`，不要重新编写下载代码，也不先用 web_fetch 获取整页 HTML。

通过 Coder 的 shell 执行。把 `<技能目录>` 替换为加载时给出的绝对路径，URL 和选择器使用 shell 安全引用：

```bash
uv run --locked --project "<技能目录>/../.." python "<技能目录>/scripts/download.py" '<网页 URL>' '<CSS 选择器>' --workspace . --output-dir outputs
```

脚本打开有界面的 Chromium，保存第一张匹配图片，输出 JSON。`--workspace .` 指向当前工作目录；保存目录使用用户指定的相对路径，默认 outputs。

成功时报告 JSON 中的路径和大小。失败时报告原因并结束，不重复调用，也不换用其他工具重试。若缺少目标选择器，先向用户确认，不猜测图片。
