# 灵犀静态站点

这是一个适合本地预览和 GitHub Pages 部署的多页面静态站点。

## 页面结构

- `index.html`: 首页
- `today/index.html`: 今日简报
- `connection/index.html`: 接管关系
- `profile/index.html`: 我的画像
- `data.js`: 页面数据
- `app.js`: 前端逻辑
- `styles.css`: 样式
- `start-demo.ps1`: 本地启动脚本
- `.github/workflows/deploy-pages.yml`: GitHub Pages 自动部署

## 本地运行

```powershell
cd lingxi-demo
.\start-demo.ps1
```

本机访问：

```text
http://localhost:4173
```

同一局域网设备访问：

```text
http://你的电脑IP:4173
```

## 为什么局域网地址有时打不开

常见原因：

1. 本地服务窗口没有持续运行
2. Windows 防火墙没有放行 Python
3. 手机和电脑不在同一个 Wi-Fi / 局域网
4. 服务只监听本地回环地址

现在脚本已经改成显式监听 `0.0.0.0`，并会打印局域网地址。

## GitHub Pages 发布

推荐做法：

1. 把 `lingxi-demo` 这个目录单独作为一个 GitHub 仓库
2. 推送到 `main` 分支
3. 在 GitHub 仓库 Settings -> Pages 里确认 Source 使用 GitHub Actions
4. 等待工作流执行完成

发布后可用路径示例：

- `/`
- `/today/`
- `/connection/`
- `/profile/`
