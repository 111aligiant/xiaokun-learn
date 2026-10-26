# 小坤学编程

**手机上的 AI 编程私教，也是一个可换课程、可换人设的教学 App 模板。**

内置 Python 与 MySQL 两条路线（各 17 节），课程、练习、进度、笔记全部离线；只有向大模型提问时才联网。
代码用 Pyodide 在手机本地执行，SQL 用 SQLite 内核本地执行——代码不经过任何服务器。

> 默认助教叫「小坤」。名字、语气、教学方式、学员背景、课程内容都可以替换，改成你自己的学科和风格。

[![CI](https://github.com/111aligiant/xiaokun-learn/actions/workflows/ci.yml/badge.svg)](https://github.com/111aligiant/xiaokun-learn/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883.svg)](https://vuejs.org/)
[![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8.svg)](./public/manifest.webmanifest)

[在线体验](https://111aligiant.github.io/xiaokun-learn/) · [下载 Android APK](https://github.com/111aligiant/xiaokun-learn/releases/latest) · [课程包格式](./docs/course-pack.md)

---

## 界面

![小坤学编程首页](./docs/screenshots/home.png)

| 课程 | 课时 | 助教对话 | 实操台 |
| --- | --- | --- | --- |
| ![课程列表](./docs/screenshots/learn.png) | ![课时内容](./docs/screenshots/lesson.png) | ![助教对话](./docs/screenshots/chat.png) | ![Python 实操台](./docs/screenshots/lab.png) |

> 截图为演示数据。应用本身不含任何预置账号或 API Key。

---

## 功能

- **手机优先**：竖屏单列、底部导航，为碎片时间设计
- **真环境练习**：Pyodide（CPython/WASM）跑 Python，sql.js 跑 SQL，代码块可一键送进实操台
- **会话隔离**：每段对话有自己的课程上下文；新对话不承接旧对话，历史随时切回
- **分层提示词**：人设（稳定）→ 学员背景（半静态）→ 当前课程（动态），稳定段在前，利于模型侧上下文缓存
- **学员画像**：称呼、目标、基础、举例领域、每周时间、偏好、约束，全部注入 system prompt；举例领域可选预设，也可自由填写；留空则明确告诉模型「别猜」
- **三种人设预设**：严谨私教 / 陪练搭子 / 面试官，可自行增删
- **首次引导**：3 步向导，可跳过；老用户数据自动迁移
- **离线优先**：课程与进度存 localStorage；备份 JSON 不包含 API Key
- **任意 OpenAI 兼容平台**：Key、base_url、模型名都可手填；内置 DeepSeek / OpenAI / 通义千问 / 智谱 GLM / Kimi / 硅基流动快捷填充
- **PWA + Android**：同一套代码可加桌面图标，也可用 Capacitor 打 APK

---

## 快速开始

需要 Node.js 20+（CI 使用 Node 22）。

```bash
git clone https://github.com/111aligiant/xiaokun-learn.git
cd xiaokun-learn
npm install
npm run dev
```

打开终端里打印的地址，首次进入会走 3 步引导。

配置模型：底部「我的 → 模型接入」填 API Key、base_url 和模型名，三者都可在任意 OpenAI 兼容平台间自由替换。
默认 `https://api.deepseek.com` + `deepseek-chat`，也可以点预设一键切换平台。

构建与打包：

```bash
npm run build      # 网页版 → dist/
npm run cap:sync   # 构建并同步到 Android 工程
npm run apk        # debug APK → android/app/build/outputs/apk/debug/app-debug.apk
```

打包 Android 需要 JDK 21 与 Android SDK；只想跑网页版可以忽略 `android/`。

---

## 下载与在线体验

- **网页版**：<https://111aligiant.github.io/xiaokun-learn/>（推送到 `main` 后由 GitHub Pages 自动发布）
- **Android**：到 [Releases](https://github.com/111aligiant/xiaokun-learn/releases) 下载最新 APK

Release 里的 APK 是 debug 签名，只适合自己安装体验；要正式分发请自行生成签名密钥并配置 release 构建。

---

## 定制成你自己的 App

模板的定制点都在 `src/data/`，不需要动视图层。

### 1. 换助教人设

`src/data/persona.js`

```js
export const PERSONA_PRESETS = {
  tutor: {
    id: 'tutor',
    label: '严谨私教',
    short: '先探底，一次只讲一个概念',
    role: '一位专精 Python 与 MySQL 的私人编程教练',
    voice: '直接、务实、有耐心但不绕弯子。',
    emphasis: ['每个概念配一个「坑」', '结束必留钩子'],
    boundaries: [],
  },
  // 加自己的预设…
}
```

提示词会按「人设 → 学员背景 → 水平 → 当前课程」的顺序拼装，见 `src/data/prompts.js`。

### 2. 换学员背景字段

`src/data/profile.js` 定义字段、举例领域与渲染方式。
`ProfileWizard.vue` 与 `Settings.vue` 会自动读取这些常量；如果新增字段，需要在向导里补一个输入项。

### 3. 换课程

课程是普通 JS 数据，结构见 `src/data/python-course.js`，完整字段说明见 [docs/course-pack.md](./docs/course-pack.md)。

新增一条路线只需在 `src/data/courses.js` 的 `TRACKS` 里注册：

```js
{
  id: 'js',
  name: 'JavaScript',
  icon: '🟨',
  lang: 'python',     // 复用哪个实操台运行时
  extension: 'js',
  course: JS_COURSE,
  lessons: JS_LESSONS,
}
```

`Home.vue` / `Learn.vue` / `Lesson.vue` 会自动读取注册表。
课程写完后跑：

```bash
npm run validate:course
```

会按 P0/P1/P2 分级报告结构问题。

### 4. 换名字

用户可见名称在三处：

- `index.html` 的 `<title>` 与 description
- `public/manifest.webmanifest` 的 `name` / `short_name`
- `capacitor.config.json` 的 `appName`（改完跑一次 `npx cap sync android`）

助教默认名在 `src/store/app.js` 的 `DEFAULT_SETTINGS.assistantName`。
版本号只在 `package.json` 里改，界面通过 Vite 注入。

> 内部标识保留历史命名：localStorage key `xiaokun.state.v1`、Android namespace `com.xiaokun.learn`、applicationId `com.xiaokun.learn.v2`、repo 目录名 `xiaokun-learn`。
> 改 localStorage key 和 applicationId 会让老用户丢数据或无法覆盖安装，模板默认不动。

---

## 技术栈

| 层 | 选型 |
| --- | --- |
| 界面 | Vue 3 + Vue Router，原生 CSS |
| 构建 | Vite 6 |
| 移动端 | Capacitor 7（Android） |
| Python 运行时 | Pyodide（CPython/WASM） |
| SQL 运行时 | sql.js（SQLite/WASM） |
| 模型调用 | OpenAI 兼容 Chat Completions（流式） |
| 本地存储 | localStorage |
| CI/CD | GitHub Actions（CI / Pages / APK） |

---

## 项目结构

```
xiaokun-learn/
├─ src/
│  ├─ views/           Home / Learn / Lesson / Chat / Lab / Settings
│  ├─ components/      MarkdownLite · ContentBlocks · CodeEditor · ProfileWizard
│  ├─ data/            courses（注册表）· python/mysql-course · persona · profile · prompts
│  ├─ runtime/         Pyodide / sql.js 封装
│  ├─ api/llm.js       OpenAI 兼容流式调用
│  └─ store/           app.js（设置/进度/会话）· lab-bus.js（跨页跳转）
├─ public/             Pyodide、sql.js、PWA manifest、Service Worker
├─ android/            Capacitor 原生工程
├─ docs/               课程包格式、界面截图
├─ scripts/            Playwright 专项测试、课程包校验
└─ .github/workflows/  CI / GitHub Pages / APK
```

---

## 部署与自动化

仓库自带三个 GitHub Actions：

| 工作流 | 触发 | 作用 |
| --- | --- | --- |
| `ci.yml` | push / PR | 课程包校验、提示词单测、构建、Playwright E2E |
| `pages.yml` | push 到 main | 构建并发布到 GitHub Pages |
| `android.yml` | 手动 / `v*` tag | 构建 debug APK 并上传为 artifact |

使用 Pages 前，在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。
`vite.config.js` 的 `base: './'` 保证子路径部署（`https://user.github.io/repo/`）可用。

PWA：`public/sw.js` 会缓存同源静态资源，断网时导航回退到缓存的 `index.html`。
模型 API 是跨域请求，不会被缓存。更新静态资源后如需强制刷新缓存，修改 `sw.js` 里的 `CACHE` 版本号。

---

## 测试

数据与提示词单测：

```bash
npm run test:qa
```

课程包结构校验：

```bash
npm run validate:course
```

E2E 用 Playwright，跑在构建产物上：

```bash
npm i -D playwright
npx playwright install chromium

npm run build
npm run preview            # 另开一个终端保持运行
npm run test:e2e
```

- `session-test`：新建 / 切换 / 删除 / 持久化
- `session-isolation-test`：新对话不承接旧消息与旧课程上下文
- `profile-persona-test`：首次引导、画像写入、提示词组装、设置页编辑、备份脱敏

如果 Playwright 装在项目外（例如共享工作区），用环境变量指过去：

```bash
PLAYWRIGHT_NODE_MODULES=/path/to/node_modules npm run test:e2e
```

---

## 隐私与数据

- API Key 只存本机 localStorage，不经过任何中转服务器
- 导出的备份 JSON **不包含** API Key；导入时沿用本机已有的 Key
- 课程、进度、笔记、对话全部离线
- 代码在设备本地执行（Pyodide / sql.js），不上传
- 只有你主动发送给助教的内容会发往你配置的模型服务

---

## 已知限制

- 首次加载 Python 运行时约 10MB；`pandas`、`openpyxl` 等第三方包在手机端装不了
- SQL 实操台跑的是 SQLite，MySQL 专属语法会报错（课程中已标注）
- 无后端：数据换设备需手动导出 / 导入

---

## 参与贡献

欢迎提 Issue 和 PR，尤其是新的课程包、人设预设与文档改进。

1. Fork 本仓库并新建分支
2. 修改后本地跑 `npm run validate:course && npm run test:qa`
3. 提交 PR，说明改了什么、为什么改

提交前请确认没有把 API Key、个人学习数据或 `.env` 文件带进仓库。

---

## 致谢

[Vue 3](https://vuejs.org/) · [Vite](https://vitejs.dev/) · [Capacitor](https://capacitorjs.com/) · [Pyodide](https://pyodide.org/) · [sql.js](https://github.com/sql-js/sql.js) · [DeepSeek](https://www.deepseek.com/)

## License

[MIT](./LICENSE)
