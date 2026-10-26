# 课程包格式

课程包是普通的 JS 数据文件。内置的 `python-course.js` / `sql-course.js` 就是两个完整示例。

## 1. 一条路线（track）

所有可学的路线都注册在 `src/data/courses.js`：

```js
import { PYTHON_COURSE, PY_LESSONS } from './python-course.js'

export const TRACKS = [
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    lang: 'python',      // 实操台语言：python | sql
    extension: 'py',     // 练习文件后缀
    course: PYTHON_COURSE,
    lessons: PY_LESSONS,
  },
]
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | 是 | URL 与进度存储使用的唯一标识，不要随意改 |
| `name` | 是 | 界面显示名 |
| `icon` | 否 | 路线切换按钮里的 emoji |
| `lang` | 是 | `python` 或 `sql`，决定练习送进哪个实操台 |
| `extension` | 是 | 练习文件名后缀，例如 `py` / `sql` / `js` |
| `course` | 是 | 含 `tagline` / `desc` / `notice` / `chapters` |
| `lessons` | 是 | 扁平化后的课时数组，必须与章节内课时一致 |

> 新增路线时，`Home.vue`、`Learn.vue`、`Lesson.vue` 会自动读取注册表，无需改页面。
> 只有一种例外：实操台目前只实现了 Python / SQL 两种运行时。

## 2. 课程（course）

```js
export const SQL_COURSE = {
  id: 'sql',
  tagline: '从零把数据管起来',
  desc: '一句话介绍这条路线',
  notice: '',            // 可选，显示在课程页顶部
  chapters: [
    {
      id: 'my-01',
      no: 1,
      title: '认识数据库',
      desc: '本章的一句话说明',
      lessons: [ /* 见下 */ ],
    },
  ],
}
```

## 3. 课时（lesson）

```js
{
  id: 'my-01-01',        // 全局唯一
  no: 1,                 // 展示序号
  title: '表和行',
  minutes: 8,
  level: '入门',          // 入门 / 进阶 / 实战
  objectives: ['能说出表与行的关系'],
  summary: '会作为课程上下文发给助教，建议 50~200 字。',
  blocks: [ /* 见下 */ ],
  exercise: {
    task: '任务描述',
    hint: '提示',
    starter: '初始代码',
    answer: '参考答案',
    note: '补充说明（可选）',
  },
  quiz: [
    { q: '题干', options: ['A', 'B', 'C'], answer: 0, explain: '为什么' },
  ],
}
```

### 内容块 blocks

| 类型 | 结构 | 说明 |
|---|---|---|
| `h` | `['h', '小标题']` | 正文小标题 |
| `p` | `['p', '段落']` | 普通段落 |
| `code` | `['code', 'python', '代码']` | 语言支持 `python` / `sql` / `bash` / `text`；`python` 与 `sql` 会显示「在实操台运行」 |
| `ul` | `['ul', ['要点一', '要点二']]` | 无序列表 |
| `ol` | `['ol', ['第一步', '第二步']]` | 有序列表 |
| `tip` | `['tip', '提示']` | 绿色提示块 |
| `warn` | `['warn', '警告']` | 橙色警示块 |
| `note` | `['note', '备注']` | 蓝色备注块 |
| `kv` | `['kv', [['术语', '解释']]]` | 术语表 |
| `table` | `['table', ['表头1', '表头2'], ['行1', '行2']]` | 表格，行列数必须一致 |

> 用单引号定界字符串时，内容里不要再出现单引号（用「」或双引号），否则会被 JS 提前截断。校验器会把这类 `NaN/null` 内容报出来。

## 4. 校验

```bash
npm run validate:course                  # 校验内置课程
npm run validate:course my-course.json   # 校验外部课程包
npm run test:qa                          # 课程包 + 提示词逻辑
```

外部 JSON 支持两种结构：

```json
{ "name": "我的课程", "course": { "chapters": [] }, "lessons": [] }
```

```json
{ "tracks": [
  { "id": "js", "name": "JavaScript", "lang": "python", "extension": "js",
    "course": { "chapters": [] }, "lessons": [] }
] }
```

校验分级：

- **P0**：结构错误，App 会显示异常或交互失效（重复 id、非法块类型、答案越界等）
- **P1**：内容缺失，助教上下文或练习不完整
- **P2**：建议项，例如缺 `hint`、`explain`

CI 会对内置课程跑 P0/P1，任何问题都会让构建失败。

## 5. 当前限制

- 课程包在**构建时**注册，不支持运行时下载安装
- 实操台只有 Python（Pyodide）与 SQL（SQLite）两个运行时
- 课时 `summary` 会进入每条对话的 system prompt，太长会显著增加 token 成本
