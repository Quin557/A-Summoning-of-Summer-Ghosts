# 夏夜唤灵簿

**夏夜唤灵簿** 是一个以夏夜、幽灵与记忆为主题的网页叙事互动项目。  
项目现以 **GitHub Pages + PWA** 形式发布，支持在浏览器中直接游玩，也支持安装到手机或桌面主屏幕，以更接近原生应用的方式体验剧情。

在线版本：  
[https://quin557.github.io/A-Summoning-of-Summer-Ghosts/](https://quin557.github.io/A-Summoning-of-Summer-Ghosts/)

## 项目简介

这是一个纯前端实现的互动叙事作品，整体以 AVG 视觉小说体验为核心，围绕剧情节点推进、分支叙事、成就与存档系统展开。同时，项目还内嵌了一个独立小游戏模块，用于丰富整体节奏和游玩层次。

相较于早期的本地打包版本，当前仓库维护的是 **网页 / PWA 发行版本**，重点关注：

- 浏览器即开即玩
- GitHub Pages 静态部署
- PWA 安装体验
- 移动端横屏适配
- 前端本地持久化存档

## 特色亮点

- **纯前端架构**：无需后端服务，无需数据库即可运行完整流程
- **PWA 支持**：支持安装到主屏幕、离线缓存与类似应用的启动方式
- **叙事驱动**：通过 JSON 剧情节点组织主线内容，便于扩展和维护
- **多系统整合**：包含登录注册、存档、成就、设置、视频流程与小游戏
- **移动端优化**：针对横屏手机和平板做了大量界面自适应处理

## 快速开始

本项目无需构建，作为静态站点直接运行即可。

### 本地预览

建议使用本地静态服务器，而不是直接双击 `index.html`。

例如：

```bash
python3 -m http.server 8080
```

启动后访问：

[http://localhost:8080/](http://localhost:8080/)

## 在线部署

当前项目采用 **GitHub Pages Project Site** 部署，站点基础路径为：

```text
/A-Summoning-of-Summer-Ghosts/
```

如果你修改了仓库名、组织名，或迁移了 Pages 地址，需要同步检查以下文件中的路径配置：

- [index.html](/Users/qiuyun/Desktop/SummerGhost/A-Summoning-of-Summer-Ghosts/index.html)
- [manifest.webmanifest](/Users/qiuyun/Desktop/SummerGhost/A-Summoning-of-Summer-Ghosts/manifest.webmanifest)
- [sw.js](/Users/qiuyun/Desktop/SummerGhost/A-Summoning-of-Summer-Ghosts/sw.js)
- [js/main.js](/Users/qiuyun/Desktop/SummerGhost/A-Summoning-of-Summer-Ghosts/js/main.js)

## PWA 安装说明

项目已经配置：

- `Web App Manifest`
- `Service Worker`
- 应用图标与启动参数

安装方式如下：

- **iPhone / iPad Safari**：分享 -> 添加到主屏幕
- **Android Chrome**：菜单 -> 安装应用
- **桌面 Chrome / Chromium**：地址栏安装入口，或页面中的安装提示

如果主屏幕打开后仍显示旧版本，通常是缓存尚未刷新。建议按这个顺序处理：

1. 确认 GitHub Pages 已部署最新内容
2. 删除旧的主屏幕应用
3. 清除浏览器中该站点缓存
4. 重新从最新链接添加到主屏幕

## 项目结构

```text
.
├── assets/          # 图片、音频、视频、字体、全局样式
├── data/            # 剧情、成就、本地化文本等 JSON 数据
├── js/
│   ├── core/        # 核心引擎与管理器
│   ├── modules/     # 通用功能模块
│   ├── utils/       # 工具函数
│   └── views/       # 页面与界面视图
├── minigames/       # 内嵌小游戏
├── team/            # 团队成员介绍页面
├── index.html       # 应用入口
├── manifest.webmanifest
├── sw.js            # PWA Service Worker
└── README.md
```

## 核心模块

### 主叙事引擎

- 核心入口：`GameEngine`
- 负责视图切换、剧情节点推进、音视频流程、UI 联动
- 剧情数据主要来自 `data/story.json`

### 视图系统

主要页面位于 `js/views/`：

- `MainMenuView`：主菜单
- `LoginView` / `RegisterView`：账号系统
- `GameView`：游戏主界面
- `LoadView`：存档系统
- `AchievementView`：成就系统
- `SettingsView`：设置
- `OpeningView` / `PreOpeningView` / `EndingView`：视频流程

### 数据与持久化

- `DataManager`：加载剧情、成就、本地化文本等静态数据
- `SaveManager`：管理账号、密码、存档与成就数据
- 当前主要依赖浏览器 `localStorage` 与 `sessionStorage` 完成持久化

### PWA 相关

- `PwaManager`：安装提示、平台识别、Service Worker 注册
- `sw.js`：缓存、离线回退、资源版本管理

## 开发建议

### 修改静态资源后

如果改动涉及以下内容：

- JavaScript
- CSS
- `index.html`
- `manifest.webmanifest`
- `sw.js`

建议同步更新 [sw.js](/Users/qiuyun/Desktop/SummerGhost/A-Summoning-of-Summer-Ghosts/sw.js) 里的 `VERSION`，这样已安装的 PWA 更容易正确拉取新资源。

### 移动端调试重点

项目对移动端横屏做了较多适配，建议优先检查：

- `844 × 390` 一类矮横屏尺寸
- 普通手机横屏
- 平板横屏
- 主菜单、存档系统、成就系统、剧情文本区

## 技术栈

- 原生 JavaScript
- HTML5
- CSS3
- 浏览器本地存储
- Service Worker
- Web App Manifest

## 贡献者

- Wang Wanqi（王万淇）- Project Manager
- Ge Hongkang（葛洪康）- Story Director
- Wang Guangyuan（王光源）- Technical Director
- Chen Yuwei（陈煜玮）- Video Editor / Tester
- Liu Lanxuan（刘澜轩）- Frontend Developer

## 许可证

本项目基于 [MIT License](./LICENSE) 开源。
