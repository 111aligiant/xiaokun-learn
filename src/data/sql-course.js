/* ============================================================
   SQLite 路线课程内容
   说明：课程与实操区使用同一个 SQLite 内核（sql.js / WebAssembly）。
   学到的语法可以直接用于 Python 内置的 sqlite3 模块和真实 .db 文件。
   ============================================================ */

import { PYTHON_COURSE, PY_LESSONS } from './python-course.js'

export const SQL_COURSE = {
  id: 'sql',
  name: 'SQLite',
  icon: '🗄️',
  tagline: '看得懂、写得出、查得快',
  desc: '从"表长什么样"开始，到能写 JOIN、能加索引、能用 Python 的 sqlite3 读写数据库。',
  notice: '课程与实操区都使用 SQLite。它不需要安装服务，数据就是一个文件，手机上也能完整运行。',
  chapters: [
    /* ================= 第 1 章 ================= */
    {
      id: 'my-c1',
      no: 1,
      title: '认识数据库',
      desc: '库、表、行、列 —— 先把"数据放在哪"这件事想清楚。',
      lessons: [
        {
          id: 'my-01',
          no: 1,
          title: '数据库、表、行、列',
          minutes: 7,
          level: '入门',
          objectives: ['用表格类比理解数据库结构', '理解主键的作用', '知道关系型数据库的核心思想'],
          summary: '数据库 ≈ 一个 Excel 工作簿；表 ≈ 一张 Sheet；行 ≈ 一条记录；列 ≈ 一个字段。主键是行的唯一身份证。',
          blocks: [
            ['p', '如果你用过 Excel，数据库一点都不神秘。'],
            ['kv', [
              ['数据库 database', '一个工作簿（一个项目的数据放一起）'],
              ['表 table', '一张 Sheet（同一类东西放一张表）'],
              ['列 / 字段 column', '表头（商品编号、商品名称、销售额…）'],
              ['行 / 记录 row', '每一行数据（一件商品就是一行）'],
              ['主键 primary key', '唯一标识一行的字段，相当于身份证号'],
            ]],
            ['h', '那为什么不直接用 Excel？'],
            ['ul', [
              '数据量大：几十万行 Excel 就卡，数据库轻松处理千万行',
              '多人同时改：Excel 容易互相覆盖，数据库有事务和锁',
              '查询能力：一条 SQL 就能完成跨表关联统计，Excel 要拖半天',
              '约束保护：数据库能强制"商品编号不能重复""销售额不能为空"',
            ]],
            ['h', '看一张真实的表'],
            ['p', '下面是 App 实操区里就有的商品清单表（equipment）的前几行：'],
            ['table',
              ['id', 'code', 'name', 'model', 'price', 'status'],
              ['1', 'SKU-001', '蓝牙耳机', 'TWS-40h', '128000', '在用'],
              ['2', 'SKU-002', '智能手表', 'Watch S2', '456000', '在用'],
              ['3', 'SKU-003', '便携音箱', 'SoundBox mini', '86000', '维修'],
            ],
            ['p', 'id 就是主键：它保证每一行能被唯一定位，即使两件商品名字一样也不怕。'],
            ['h', '关系型数据库的核心：用编号连起来'],
            ['p', '你有一张商品表，还有一张销售记录表。销售记录里不需要重复写商品名称，只写商品编号就行：'],
            ['table',
              ['id', 'equipment_code', 'item', 'value', 'verdict'],
              ['1', 'SKU-002', '销售额', '38.2', '合格'],
              ['2', 'SKU-002', '销量', '55.4', '合格'],
              ['4', 'SKU-009', '复购率', '4.2', '合格'],
            ],
            ['p', '两张表通过 equipment_code ↔ code 关联起来。想查"SKU-002 这件商品的所有销售记录"，靠的就是这个关联字段。把这个动作交给数据库，就是 JOIN（第 11 节）。'],
            ['note', '这种"用编号关联、不重复存名称"的做法叫**范式化**。好处是：商品改名了只需要改一张表，不会出现前后不一致。'],
            ['tip', '实操区的演示库已经把这两张表和数据都建好了，学到第 5 节你就能直接查它。'],
          ],
          exercise: {
            task: '用 SQL 看看商品表里都有什么：查询 equipment 表的所有数据，只取前 5 行。',
            hint: 'SELECT * FROM 表名 LIMIT 5;',
            starter: `-- 查询 equipment 表前 5 行
`,
            answer: `SELECT * FROM equipment LIMIT 5;`,
            note: 'SELECT * 的 * 表示"所有列"。LIMIT 5 限制只返回 5 行，避免一次拉太多数据。',
          },
          quiz: [
            {
              q: '主键最重要的性质是？',
              options: ['必须叫 id', '必须唯一且不为空', '必须是数字', '必须自动增长'],
              answer: 1,
              explain: '主键的核心要求是"能唯一标识一行"，所以必须唯一、不能为 NULL。叫不叫 id、是不是数字都不是硬性要求。',
            },
          ],
        },
        {
          id: 'my-02',
          no: 2,
          title: 'SQLite 是什么，以及本 App 怎么练',
          minutes: 8,
          level: '入门',
          objectives: ['知道 SQLite 是嵌入式数据库', '理解"一个数据库就是一个文件"', '明确实操区的边界'],
          summary: 'SQLite 是一个嵌入在程序里的关系型数据库引擎，不需要安装服务、不需要账号，数据就是一个 .db 文件。',
          blocks: [
            ['p', '先说清楚：SQLite 不是一个要单独启动的服务，而是一个**嵌入到程序里的数据库引擎**。'],
            ['h', '和"数据库服务器"的区别'],
            ['ul', [
              'SQLite：以库的形式链接进你的程序，直接读写本地文件',
              '数据库服务器：单独常驻运行，客户端通过网络连上去',
              'SQLite 不需要账号、端口、安装包，复制一个 .db 文件就是复制整个数据库',
            ]],
            ['p', '因为足够简单可靠，SQLite 被大量用在手机 App、桌面软件、浏览器和嵌入式商品里。'],
            ['h', '本 App 里的 SQLite'],
            ['table',
              ['环境', '运行方式', '数据在哪'],
              ['本 App 实操区', 'sql.js（SQLite 编译成 WebAssembly）', '内存，点「重置演示库」会恢复初始数据'],
              ['电脑上的 Python', '内置 sqlite3 模块', '一个 .db 文件，关掉程序数据仍在'],
              ['手机 App 内部', 'SQLite 库', 'App 私有目录下的 .db 文件'],
            ],
            ['p', '语法是同一套。你在实操区练的 SELECT / WHERE / JOIN / GROUP BY / 增删改 / 建表，换到 Python 的 sqlite3 里可以直接用。'],
            ['h', '它不适合什么'],
            ['ul', [
              '高并发、多台机器同时写入的网络服务',
              '需要按用户分配权限、远程登录的场景',
              '超大规模数据仓库',
            ]],
            ['p', '但个人工具、桌面应用、手机 App、数据分析脚本，SQLite 往往是最省事的选择。'],
            ['h', '几条通用规范（现在就该养成）'],
            ['ul', [
              'SQL 关键字大写：SELECT、FROM、WHERE，可读性好',
              '语句以分号 ; 结尾',
              '-- 是单行注释，/* */ 是多行注释',
              '表名/字段名用小写 + 下划线，和 Python 习惯一致',
            ]],
          ],
          exercise: {
            task: '查一下演示库里有哪些表，以及商品表有多少行数据。',
            hint: 'SQLite 里表清单在 sqlite_master；行数用 COUNT(*)。',
            starter: `-- 表清单
SELECT name FROM sqlite_master WHERE type='table';

-- 商品表行数
`,
            answer: `SELECT name FROM sqlite_master WHERE type='table';

SELECT COUNT(*) AS 商品总数 FROM equipment;`,
            note: 'AS 是给结果列起别名，让输出表头更好看。中文别名在 SQLite 里可以直接用。',
          },
          quiz: [
            {
              q: 'SQLite 的本质是？',
              options: ['一个需要单独启动的服务', '一个嵌入程序的数据库引擎', '一个编程语言', '一个文件格式'],
              answer: 1,
              explain: 'SQLite 以库的形式嵌入程序，不需要服务端进程。数据库本身是一个文件，但 SQLite 是读写它的引擎。',
            },
          ],
        },
        {
          id: 'my-03',
          no: 3,
          title: '建表：CREATE TABLE 与数据类型',
          minutes: 13,
          level: '入门',
          objectives: ['写出完整的建表语句', '选对数据类型', '理解 NOT NULL / DEFAULT / 主键约束'],
          summary: '建表要定三件事：字段名、数据类型、约束。类型选错后面很难改。',
          blocks: [
            ['p', '建表是数据库设计的第一步，也是最需要想清楚的一步。'],
            ['h', '完整语法'],
            ['code', 'sql', `CREATE TABLE equipment (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  code      TEXT    NOT NULL UNIQUE,      -- 商品编号，不能重复
  name      TEXT    NOT NULL,             -- 商品名称
  model     TEXT,                         -- 规格，允许为空
  maker     TEXT,
  price     REAL    DEFAULT 0,            -- 默认 0
  dept      TEXT,
  buy_date  TEXT,
  status    TEXT    DEFAULT '在用',
  CHECK (price >= 0)                      -- 销售额不能为负
);`],
            ['h', 'SQLite 的类型很灵活'],
            ['p', 'SQLite 只有五种存储类型：INTEGER、REAL、TEXT、BLOB、NULL。建表时写的类型主要决定"亲和性"，不是硬性限制。'],
            ['warn', '灵活不等于随便：ID 用 INTEGER、数值用 REAL、文本用 TEXT。金额如果要求精确到分，建议用 INTEGER 存"分"，避免浮点误差。'],
            ['h', '数据类型怎么选'],
            ['table',
              ['用途', 'SQLite 类型', '说明'],
              ['整数 ID', 'INTEGER', '配合 PRIMARY KEY 自动增长'],
              ['金额', 'INTEGER（存分）', '最稳；用 REAL 存元可能有一分钱的误差'],
              ['短文本 / 长文本', 'TEXT', '不限制长度，按内容存'],
              ['日期时间', 'TEXT', '推荐 ISO 格式：2026-10-26 或 2026-10-26 12:30:00'],
              ['布尔', 'INTEGER', '用 0 / 1 表示'],
            ],
            ['warn', '金额字段用浮点数要小心：0.1 + 0.2 会得到 0.30000000000000004。要精确到分，就用整数存分。'],
            ['h', '约束：让数据库帮你把关'],
            ['kv', [
              ['NOT NULL', '这个字段必须有值，不能留空'],
              ['UNIQUE', '值不能重复（商品编号、身份证号这类）'],
              ['DEFAULT', '不填时用什么默认值'],
              ['PRIMARY KEY', '主键 = NOT NULL + UNIQUE'],
              ['FOREIGN KEY', '外键，指向另一张表的主键，防止引用不存在的数据'],
              ['CHECK', '自定义条件，如 price >= 0'],
            ]],
            ['h', '外键的例子'],
            ['code', 'sql', `CREATE TABLE test_record (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_code TEXT NOT NULL,
  item           TEXT NOT NULL,
  value          REAL,
  limit_value    TEXT,
  verdict        TEXT,
  test_date      TEXT,
  FOREIGN KEY (equipment_code) REFERENCES equipment(code)
);`],
            ['p', '加了外键后，插入一条 equipment_code = "SKU-999" 的记录会被数据库拒绝 —— 因为商品表里没有 SKU-999。这叫**引用完整性**。'],
            ['warn', '生产环境外键有争议：它保证了一致性，但高并发下会带来锁开销。很多互联网公司选择在应用层保证，不加物理外键。面试时这是个可以展开聊的点。'],
            ['h', '改表结构'],
            ['code', 'sql', `-- SQLite 常用改表操作
ALTER TABLE equipment ADD COLUMN remark TEXT;
ALTER TABLE equipment RENAME COLUMN remark TO memo;
ALTER TABLE equipment DROP COLUMN memo;   -- 需要 SQLite 3.35+

-- 改类型仍要"建新表 + 迁数据 + 删旧表"`],
            ['note', 'SQLite 的 ALTER TABLE 保持克制：加列、改名、删列都有对应语法，但改类型需要重建表。'],
            ['h', '删表（危险）'],
            ['code', 'sql', `DROP TABLE equipment;     -- 表结构和数据全删，无法恢复
DELETE FROM equipment;    -- 清空数据，保留表结构`],
          ],
          exercise: {
            task: '建一张 calibration（盘点记录）表：字段有 id 主键、equipment_code、cal_date、cal_org（盘点机构）、result（结论），其中 equipment_code 和 cal_date 不能为空。再用 INSERT 插一条数据。',
            hint: '建表后 INSERT INTO 表名 (字段列表) VALUES (值列表);',
            starter: `CREATE TABLE calibration (
  -- 补全
);

-- 插入一条测试数据
`,
            answer: `CREATE TABLE calibration (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_code TEXT NOT NULL,
  cal_date       TEXT NOT NULL,
  cal_org        TEXT,
  result         TEXT DEFAULT '合格'
);

INSERT INTO calibration (equipment_code, cal_date, cal_org, result)
VALUES ('SKU-001', '2026-08-01', '浙江省平台质检组', '合格');

SELECT * FROM calibration;`,
            note: '注意 INSERT 时 id 没有写 —— 它是 AUTOINCREMENT 主键，数据库会自动分配。',
          },
          quiz: [
            {
              q: 'SQLite 里想精确记录金额（到分），最稳的做法是？',
              options: ['用 REAL 存元', '用 INTEGER 存分', '用 TEXT 存元', '用 BLOB 存元'],
              answer: 1,
              explain: '把金额换算成整数分再存，加减求和都不会有浮点误差。REAL 是二进制浮点，算钱可能出现一分钱的偏差；TEXT 则无法直接求和。',
            },
            {
              q: 'UNIQUE 和 PRIMARY KEY 的区别是？',
              options: [
                '完全一样',
                'PRIMARY KEY 不允许 NULL，UNIQUE 允许（且一张表只能有一个主键，可以有多个 UNIQUE）',
                'UNIQUE 只能用在数字上',
                'PRIMARY KEY 只能是字符串',
              ],
              answer: 1,
              explain: '一张表只有一个主键，但可以有多个唯一约束。主键严格要求非空，UNIQUE 字段在多数情况下允许 NULL。',
            },
          ],
        },
      ],
    },

    /* ================= 第 2 章 ================= */
    {
      id: 'my-c2',
      no: 2,
      title: '增删改查：SQL 的日常',
      desc: 'INSERT / SELECT / WHERE / ORDER BY / UPDATE / DELETE —— 覆盖 90% 的日常操作。',
      lessons: [
        {
          id: 'my-04',
          no: 4,
          title: 'INSERT：往表里填数据',
          minutes: 9,
          level: '入门',
          objectives: ['单行和多行插入', '只给部分字段赋值', '知道插入失败的原因'],
          summary: 'INSERT INTO 表名 (字段...) VALUES (值...)。字段顺序和值顺序必须一一对应。',
          blocks: [
            ['h', '插入单行'],
            ['code', 'sql', `INSERT INTO equipment (code, name, model, price, dept, status)
VALUES ('SKU-013', '智能音箱', 'E5071C', 218000, '影音商品', '在用');`],
            ['p', '字段顺序和值顺序要一一对应。字段名写全是个好习惯 —— 即使表结构以后加字段，你的语句也不会错位。'],
            ['h', '一次插多行（效率高得多）'],
            ['code', 'sql', `INSERT INTO equipment (code, name, model, price, dept, status) VALUES
  ('SKU-014', '充电宝',     'N1911A',   62000, '影音商品', '在用'),
  ('SKU-015', '无线鼠标', 'SMB100A', 156000, '影音商品', '在用'),
  ('SKU-016', '桌面风扇',     'FAN-01',  48000, '智能穿戴', '维修');`],
            ['tip', '插 1000 行时，一条 INSERT 带 1000 组 VALUES 比执行 1000 条 INSERT 快几十倍。因为网络往返和事务提交的次数少得多。'],
            ['h', '省略字段（用默认值 / 允许空）'],
            ['code', 'sql', `-- 只给必填字段，其余用默认值
INSERT INTO equipment (code, name) VALUES ('SKU-017', '待上架商品');`],
            ['h', '插入报错？对号入座'],
            ['kv', [
              ['UNIQUE constraint failed', '字段值重复了，比如插了个已存在的 code'],
              ['NOT NULL constraint failed', '必填字段没给值'],
              ['FOREIGN KEY constraint failed', '引用了另一张表里不存在的值'],
              ['table has no column named xxx', '字段名写错了'],
              ['N values for M columns', '值的个数和字段个数不一致'],
            ]],
            ['h', '拿到刚插入的自增 ID'],
            ['code', 'sql', `SELECT last_insert_rowid();`],
            ['note', '在 Python 的 sqlite3 里，插入后可以用 cursor.lastrowid 直接拿到新 ID，比再发一条查询方便。第 15 节会用到。'],
            ['h', '安全的写法：参数化'],
            ['p', '永远不要用字符串拼接把用户输入塞进 SQL —— 这是 SQL 注入的根源。'],
            ['code', 'python', `# 危险！用户输入 ' OR '1'='1 就能删库
sql = f"DELETE FROM equipment WHERE code = '{user_input}'"

# 正确：用占位符
sql = "DELETE FROM equipment WHERE code = %s"
cursor.execute(sql, (user_input,))`],
            ['warn', 'SQL 注入是最经典的安全漏洞之一。记住一条规则：**值永远走参数占位符，只有表名/字段名这类标识符才可能拼接（且必须白名单校验）**。'],
          ],
          exercise: {
            task: '往 equipment 表插入两台新商品，然后查询验证插入成功。',
            hint: 'INSERT 之后用 SELECT * FROM equipment WHERE code IN (...)；',
            starter: `-- 插入两件商品
`,
            answer: `INSERT INTO equipment (code, name, model, maker, price, dept, buy_date, status) VALUES
  ('SKU-018', '降噪耳机', 'Buds Pro', '索尼', 286000, '数码配件', '2025-03-10', '在用'),
  ('SKU-019', '游戏手柄',   'G502', '罗技', 32000, '日用百货', '2025-01-15', '在用');

SELECT * FROM equipment WHERE code IN ('SKU-018', 'SKU-019');`,
            note: '如果这条 SQL 重复执行两次，第二条会因为 code 重复而报 UNIQUE 错误 —— 这正是唯一约束在保护数据。',
          },
          quiz: [
            {
              q: 'INSERT INTO t (a, b) VALUES (1) 会怎样？',
              options: ['b 自动填 0', '报错：值的个数和字段个数不一致', 'b 填 NULL', '自动忽略 a'],
              answer: 1,
              explain: '字段列了 2 个，值只给了 1 个，必须一一对应。要么补上 b 的值，要么把 b 从字段列表里去掉。',
            },
          ],
        },
        {
          id: 'my-05',
          no: 5,
          title: 'SELECT 基础：把数据取出来',
          minutes: 11,
          level: '入门',
          objectives: ['写出完整 SELECT 语句', '用 AS 起别名', '用 DISTINCT 去重'],
          summary: 'SELECT 字段 FROM 表。字段可以算、可以起别名、可以取不重复值。',
          blocks: [
            ['h', '最小可用查询'],
            ['code', 'sql', `SELECT * FROM equipment;              -- 所有列
SELECT code, name, price FROM equipment; -- 指定列（推荐）`],
            ['tip', '别总用 SELECT *。只取需要的列能减少网络传输、也避免表结构变化时程序出错。'],
            ['h', '列可以是表达式'],
            ['code', 'sql', `SELECT
  name,
  price,
  price * 0.13 AS tax,          -- 增值税
  price * 1.13 AS total
FROM equipment;`],
            ['h', 'AS 别名'],
            ['code', 'sql', `SELECT
  name AS 商品名称,
  price AS 销售额
FROM equipment;

-- 别名也可以用来改表达式结果的表头
SELECT COUNT(*) AS 商品总数 FROM equipment;`],
            ['note', '别名里如果有空格或特殊字符，要用双引号或反引号包起来：price AS "进货销售额(元)"。'],
            ['h', 'DISTINCT 去重'],
            ['code', 'sql', `-- 有哪些品类？（每件商品重复出现会很难看）
SELECT DISTINCT dept FROM equipment;

-- 多列组合去重：品类和状态的组合
SELECT DISTINCT dept, status FROM equipment;`],
            ['h', '拼接字段'],
            ['code', 'sql', `-- 用 || 拼接字符串
SELECT code || ' - ' || name AS 标识 FROM equipment;`],
            ['p', 'SQLite 用 || 拼接字符串，数字参与时会自动转成文本。'],
            ['h', '限制返回行数'],
            ['code', 'sql', `SELECT * FROM equipment LIMIT 5;              -- 前 5 行
SELECT * FROM equipment LIMIT 5 OFFSET 5;     -- 第 6~10 行（第二页）`],
            ['h', '给 NULL 一个兜底显示'],
            ['code', 'sql', `-- IFNULL 和 COALESCE 都能兜底
SELECT name, IFNULL(model, '未填') AS model FROM equipment;

-- COALESCE 可以依次尝试多个字段
SELECT name, COALESCE(model, maker, '未填') AS model FROM equipment;`],
            ['note', 'COALESCE 是标准 SQL 函数，返回参数里第一个非 NULL 的值。SQLite 里和 IFNULL 一样好用。'],
          ],
          exercise: {
            task: '查询所有品类的名称（去重），并按品类名排序。再列出商品名称和销售额，要求销售额放大 10000 倍后除以 10000 显示成「万元」列。',
            hint: 'DISTINCT + ORDER BY；第二个用 price / 10000 AS 万元。',
            starter: `-- 品类清单
`,
            answer: `SELECT DISTINCT dept FROM equipment ORDER BY dept;

SELECT
  name AS 商品名称,
  price / 10000 AS 万元
FROM equipment;`,
            note: 'ORDER BY 在不指定排序方向时默认升序（ASC）。下一节详细讲排序。',
          },
          quiz: [
            {
              q: 'SELECT price * 1.13 FROM equipment 返回的列名是什么？',
              options: ['price', '1.13', 'price * 1.13', '报错'],
              answer: 2,
              explain: '没有 AS 别名时，结果列名就是表达式本身。这在实际开发里很难看，所以建议一定起别名。',
            },
          ],
        },
        {
          id: 'my-06',
          no: 6,
          title: 'WHERE：精准筛选',
          minutes: 13,
          level: '入门',
          objectives: ['掌握比较与逻辑运算符', '处理 NULL', '用 BETWEEN / IN / LIKE 简化条件'],
          summary: 'WHERE 在取数阶段就过滤，比取回来再用程序筛更高效。NULL 的比较要用 IS NULL。',
          blocks: [
            ['h', '基本比较'],
            ['code', 'sql', `SELECT * FROM equipment WHERE price > 100000;
SELECT * FROM equipment WHERE status = '在用';
SELECT * FROM equipment WHERE status != '报废';
SELECT * FROM equipment WHERE price >= 50000 AND price <= 200000;`],
            ['h', '逻辑运算符'],
            ['code', 'sql', `-- AND：都要满足
SELECT * FROM equipment
WHERE status = '在用' AND dept = '数码配件';

-- OR：满足一个就行（记得加括号！）
SELECT * FROM equipment
WHERE dept = '数码配件' OR dept = '影音商品';

-- NOT：取反
SELECT * FROM equipment WHERE NOT status = '在用';`],
            ['warn', 'AND 和 OR 混用时必须加括号。SQL 里 AND 的优先级高于 OR，写 WHERE a = 1 OR a = 2 AND b = 3 会得到出乎意料的结果。'],
            ['h', '范围与集合：BETWEEN、IN'],
            ['code', 'sql', `-- BETWEEN：包含两端
SELECT * FROM equipment WHERE price BETWEEN 50000 AND 200000;

-- IN：命中列表里任意一个
SELECT * FROM equipment WHERE dept IN ('数码配件', '影音商品');
SELECT * FROM equipment WHERE status IN ('维修', '报废');`],
            ['note', 'IN 列表里放几百个值时会变慢，可以考虑用临时表 + JOIN。但几百个以内放心用。'],
            ['h', '模糊匹配：LIKE'],
            ['code', 'sql', `-- % 匹配任意多个字符
SELECT * FROM equipment WHERE name LIKE '频谱%';        -- 以"频谱"开头
SELECT * FROM equipment WHERE name LIKE '%分析仪';      -- 以"分析仪"结尾
SELECT * FROM equipment WHERE name LIKE '%销售%';       -- 包含"销售"

-- _ 匹配单个字符
SELECT * FROM equipment WHERE code LIKE 'SKU-00_';       -- SKU-001 到 SKU-009`],
            ['warn', "LIKE '%xxx%' 前后都带 % 时，索引会失效，全表扫描。数据量大时要考虑全文索引或改写条件。这是面试高频考点。"],
            ['h', 'NULL：不是"空字符串"，也不是 0'],
            ['code', 'sql', `-- 错：= NULL 永远不成立
SELECT * FROM equipment WHERE model = NULL;       -- 返回 0 行

-- 对：用 IS NULL / IS NOT NULL
SELECT * FROM equipment WHERE model IS NULL;
SELECT * FROM equipment WHERE model IS NOT NULL;`],
            ['warn', 'NULL 表示"未知"。任何和 NULL 的比较运算结果都是"未知"（既不是真也不是假），所以必须用 IS NULL。这是 SQL 新手第一大坑。'],
            ['h', '组合实战'],
            ['code', 'sql', `-- 找出：数码配件或影音商品里、状态为在用、且销售额超过 10 万的商品
SELECT code, name, dept, price
FROM equipment
WHERE dept IN ('数码配件', '影音商品')
  AND status = '在用'
  AND price > 100000
ORDER BY price DESC;`],
            ['tip', '复杂 WHERE 建议每个条件单独一行，缩进对齐。三个月后你自己看也能秒懂。'],
          ],
          exercise: {
            task: '查出所有「销售」相关商品（名称里含"销售"）以及所有状态为「维修」或「报废」的商品编号和状态。',
            hint: '两个条件用 OR 连接，每个条件加括号；用 IN 处理两个状态。',
            starter: `-- 补全
`,
            answer: `SELECT code, name, status
FROM equipment
WHERE name LIKE '%销售%'
   OR status IN ('维修', '报废');`,
            note: '注意 OR 两侧分别是一个完整条件。这个查询会返回所有销售类商品（不管状态）+ 所有维修/报废的商品。',
          },
          quiz: [
            {
              q: 'WHERE price = NULL 会返回什么？',
              options: ['price 为空的那些行', '所有行', '0 行', '报错'],
              answer: 2,
              explain: 'NULL 参与的任何比较都是"未知"，不为真，所以一行都不返回。必须写 WHERE price IS NULL。',
            },
            {
              q: 'WHERE a = 1 OR a = 2 AND b = 3 的实际含义是？',
              options: ['a=1 且 a=2 且 b=3', 'a=1，或者（a=2 且 b=3）', '(a=1 或 a=2) 且 b=3', '报错'],
              answer: 1,
              explain: 'AND 优先级高于 OR，所以等价于 a=1 OR (a=2 AND b=3)。要表达选项 3 的意思必须自己加括号。',
            },
          ],
        },
        {
          id: 'my-07',
          no: 7,
          title: 'ORDER BY 与分页',
          minutes: 9,
          level: '入门',
          objectives: ['单列/多列排序', '处理 NULL 的排序位置', '写出正确的分页语句'],
          summary: 'ORDER BY 排序，可指定多个字段。分页用 LIMIT + OFFSET 或 LIMIT offset, count。',
          blocks: [
            ['h', '基本排序'],
            ['code', 'sql', `SELECT code, name, price FROM equipment ORDER BY price;          -- 升序（默认）
SELECT code, name, price FROM equipment ORDER BY price DESC;     -- 降序`],
            ['h', '多列排序：先按一个、再按另一个'],
            ['code', 'sql', `-- 先按品类升序，同品类内再按销售额降序
SELECT dept, name, price
FROM equipment
ORDER BY dept ASC, price DESC;`],
            ['p', '这个"分层排序"很实用：比如先按品类分组展示，品类内把最贵的排前面。'],
            ['h', '按表达式或别名排序'],
            ['code', 'sql', `SELECT name, price, price * 1.13 AS total
FROM equipment
ORDER BY total DESC;          -- 可以用别名，因为 ORDER BY 在 SELECT 之后执行`],
            ['note', '执行顺序是 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT。所以 WHERE 里不能用 SELECT 定义的别名，但 ORDER BY 可以。这是 SQL 面试常问的点。'],
            ['h', 'NULL 排在哪？'],
            ['code', 'sql', `-- SQLite：NULL 视为最小值，升序排最前
SELECT name, model FROM equipment ORDER BY model ASC;

-- 想让 NULL 排最后：加一个排序键
SELECT name, model FROM equipment ORDER BY (model IS NULL) ASC, model ASC;`],
            ['h', '分页'],
            ['code', 'sql', `-- 第 1 页，每页 5 条
SELECT * FROM equipment ORDER BY id LIMIT 5 OFFSET 0;

-- 第 2 页
SELECT * FROM equipment ORDER BY id LIMIT 5 OFFSET 5;

-- 简写：LIMIT offset, count
SELECT * FROM equipment ORDER BY id LIMIT 5, 5;`],
            ['warn', '分页一定要带 ORDER BY！没有排序时数据库返回的顺序在理论上是"不确定"的，翻页会出现重复或漏行。'],
            ['warn', '深分页性能问题：LIMIT 10 OFFSET 1000000 时，数据库仍要扫描并丢弃前 100 万行。优化方式是用"游标分页"（WHERE id > 上次最后一行的 id LIMIT 10）。'],
            ['h', '取 TopN：LIMIT + ORDER BY'],
            ['code', 'sql', `-- 最贵的 3 件商品
SELECT name, price FROM equipment ORDER BY price DESC LIMIT 3;`],
            ['tip', 'ORDER BY + LIMIT 是最常用的组合，记住"先排序再截断"这个语义就够用了。'],
          ],
          exercise: {
            task: '按品类升序、销售额降序列出所有商品；再单独查出销售额最高的 3 件商品。',
            hint: '第一个用 ORDER BY dept ASC, price DESC；第二个 COUNT 前用 LIMIT 3。',
            starter: `-- 补全
`,
            answer: `SELECT dept, name, price
FROM equipment
ORDER BY dept ASC, price DESC;

SELECT name, price
FROM equipment
ORDER BY price DESC
LIMIT 3;`,
            note: '销售额最高的 3 台：无线耳机 Buds Pro（512000）、智能手表 Watch S2（456000）、无线耳机 WH-1000XM5（398000）。',
          },
          quiz: [
            {
              q: '分页时不写 ORDER BY 会有什么问题？',
              options: [
                '语法错误',
                '返回顺序不确定，翻页可能重复或漏数据',
                '没有影响',
                '速度变慢',
              ],
              answer: 1,
              explain: 'SQL 标准不保证无序查询的结果顺序。要分页就必须显式指定排序字段。',
            },
          ],
        },
        {
          id: 'my-08',
          no: 8,
          title: 'UPDATE 与 DELETE：改数据要慎之又慎',
          minutes: 10,
          level: '入门',
          objectives: ['正确写出 UPDATE / DELETE', '用 SELECT 先验证影响范围', '知道怎么保住一条命'],
          summary: 'UPDATE / DELETE 必须带 WHERE。执行前先用同样的 WHERE 跑一次 SELECT 确认范围。',
          blocks: [
            ['h', 'UPDATE'],
            ['code', 'sql', `UPDATE equipment
SET status = '维修', dept = '日用百货'
WHERE code = 'SKU-003';`],
            ['p', 'SET 后面是要改的字段，WHERE 决定改哪些行。多个字段用逗号分隔。'],
            ['h', 'UPDATE 里做计算'],
            ['code', 'sql', `-- 所有在用商品销售额上浮 5%
UPDATE equipment
SET price = price * 1.05
WHERE status = '在用';`],
            ['h', 'DELETE'],
            ['code', 'sql', `DELETE FROM equipment WHERE code = 'SKU-017';

-- 删多行
DELETE FROM equipment WHERE status = '报废';`],
            ['warn', 'UPDATE 或 DELETE 忘了写 WHERE —— 全表被改 / 全表被删。这是新人最惨的翻车现场，真实生产环境里出过无数次事故。'],
            ['h', '保命三招'],
            ['ol', [
              '先用同样的 WHERE 跑一次 SELECT COUNT(*)，看清要影响多少行',
              '在事务里执行：BEGIN; ... 确认无误再 COMMIT;（SQLite 支持）',
              '生产库上操作前先备份，或用 UPDATE ... LIMIT 分批小步走',
            ]],
            ['code', 'sql', `-- 第 1 步：先看看会命中几行
SELECT COUNT(*) FROM equipment WHERE status = '报废';

-- 第 2 步：在事务里改，确认后再提交
BEGIN;
UPDATE equipment SET status = '待处置' WHERE status = '报废';
SELECT * FROM equipment WHERE status = '待处置';    -- 检查
-- 结果不对就 ROLLBACK;
COMMIT;`],
            ['tip', '养成肌肉记忆：写 UPDATE/DELETE 时先把 WHERE 写好，再回头补 SET / DELETE 部分。顺序反过来最容易漏 WHERE。'],
            ['h', 'SQL 的软删除'],
            ['p', '真实项目里很少物理删除数据，而是加一个字段标记"已删除"：'],
            ['code', 'sql', `-- 加字段
ALTER TABLE equipment ADD COLUMN is_deleted INTEGER DEFAULT 0;

-- 软删除
UPDATE equipment SET is_deleted = 1 WHERE code = 'SKU-017';

-- 查询时过滤掉
SELECT * FROM equipment WHERE is_deleted = 0;`],
            ['note', '软删除的好处：数据可恢复、历史记录完整（审计要求）；坏处：每条查询都要带条件，容易漏。实践中常用视图或 ORM 的默认过滤来兜底。'],
          ],
          exercise: {
            task: '把「SKU-003 便携音箱」的状态改成「在用」，同时把它的销售额改成 92000；然后删除所有 id 大于 17 的商品（先 SELECT 确认范围）。',
            hint: '分两步：先 SELECT COUNT(*) 看范围，再执行。',
            starter: `-- 1. 先确认范围

-- 2. 再执行
`,
            answer: `-- 1. 确认要删的范围
SELECT COUNT(*) FROM equipment WHERE id > 17;

-- 2. 更新
UPDATE equipment
SET status = '在用', price = 92000
WHERE code = 'SKU-003';

-- 3. 删除
DELETE FROM equipment WHERE id > 17;

-- 4. 验证
SELECT * FROM equipment WHERE code = 'SKU-003';`,
            note: '注意这个操作是不可逆的（SQLite 里没有回收站）。练完之后可以用实操区的「重置演示库」恢复到初始数据。',
          },
          quiz: [
            {
              q: 'DELETE FROM equipment; 这条语句的作用是？',
              options: ['删除表结构', '删除表里所有数据（表还在）', '报错，必须带 WHERE', '删除数据库'],
              answer: 1,
              explain: '不带 WHERE 的 DELETE 会清空整张表的所有行，但表结构保留。要连结构一起删得用 DROP TABLE。',
            },
          ],
        },
      ],
    },

    /* ================= 第 3 章 ================= */
    {
      id: 'my-c3',
      no: 3,
      title: '让查询变聪明',
      desc: '聚合、分组、多表连接、子查询 —— 从"取数"升级到"分析"。',
      lessons: [
        {
          id: 'my-09',
          no: 9,
          title: '聚合函数：COUNT / SUM / AVG / MAX / MIN',
          minutes: 11,
          level: '进阶',
          objectives: ['掌握五个聚合函数', '理解 COUNT(*) 与 COUNT(字段) 的区别', '会用 GROUP_CONCAT 汇总'],
          summary: '聚合函数把多行压成一行。COUNT(*) 数行数，COUNT(字段) 会跳过 NULL，这个区别很重要。',
          blocks: [
            ['h', '五个基本聚合'],
            ['code', 'sql', `SELECT
  COUNT(*)        AS 商品总数,
  SUM(price)      AS 总销售额值,
  AVG(price)      AS 平均销售额,
  MAX(price)      AS 最贵,
  MIN(price)      AS 最便宜
FROM equipment;`],
            ['h', 'COUNT(*) vs COUNT(字段) vs COUNT(DISTINCT 字段)'],
            ['code', 'sql', `SELECT
  COUNT(*)             AS 全部行数,       -- 12（含 NULL 字段的行也算）
  COUNT(model)         AS 有规格的行数,    -- 跳过 model 为 NULL 的行
  COUNT(DISTINCT dept) AS 品类数量        -- 去重后统计
FROM equipment;`],
            ['warn', 'COUNT(*) 数的是"行数"，COUNT(字段) 数的是"该字段非 NULL 的个数"。两者结果可能不同，用错会算错业务指标。'],
            ['h', '聚合函数忽略 NULL'],
            ['code', 'sql', `-- 如果 price 有 NULL，AVG 是"非 NULL 值的平均"，不是"除以总行数"
SELECT AVG(price) FROM equipment;

-- 想按总行数算，先兜底
SELECT AVG(COALESCE(price, 0)) FROM equipment;`],
            ['h', '条件统计：一个很实用的技巧'],
            ['code', 'sql', `-- 一条 SQL 同时算出各种数量
SELECT
  COUNT(*)                                          AS 总数,
  SUM(CASE WHEN status = '在用' THEN 1 ELSE 0 END)  AS 在用数,
  SUM(CASE WHEN status = '维修' THEN 1 ELSE 0 END)  AS 维修数,
  SUM(CASE WHEN price > 100000 THEN 1 ELSE 0 END)   AS 高销售额商品数
FROM equipment;`],
            ['tip', 'CASE WHEN 是 SQL 里的 if-else，配合 SUM/AVG 能做出很灵活的条件统计，强烈建议掌握。'],
            ['h', '把多行拼成一行：GROUP_CONCAT'],
            ['code', 'sql', `SELECT dept, GROUP_CONCAT(name) AS 商品清单
FROM equipment
GROUP BY dept;`],
            ['note', 'GROUP_CONCAT 默认用逗号分隔。SQLite 也支持自定义分隔符：GROUP_CONCAT(name, \' / \')。'],
            ['h', '聚合 + CASE 算占比'],
            ['code', 'sql', `SELECT
  ROUND(100.0 * SUM(CASE WHEN verdict = '合格' THEN 1 ELSE 0 END) / COUNT(*), 2) AS 合格率百分比
FROM test_record;`],
            ['p', '注意 100.0 而不是 100 —— 整数相除在 SQL 里会截断成整数（部分数据库如此），乘个 100.0 就能强制走浮点。'],
          ],
          exercise: {
            task: '统计：商品总数、总销售额值、平均销售额、最贵商品的销售额；再统计有多少个不同品类。',
            hint: '一条 SELECT 全搞定，用 COUNT / SUM / AVG / MAX，品类数用 COUNT(DISTINCT dept)。',
            starter: `-- 补全
`,
            answer: `SELECT
  COUNT(*)             AS 商品总数,
  SUM(price)           AS 总销售额值,
  ROUND(AVG(price), 2) AS 平均销售额,
  MAX(price)           AS 最贵销售额,
  COUNT(DISTINCT dept) AS 品类数量
FROM equipment;`,
            note: 'ROUND(x, 2) 保留两位小数。金额类展示建议都套一层 ROUND，避免出现 12345.678901234。',
          },
          quiz: [
            {
              q: '表里 10 行，其中 3 行的 model 是 NULL。COUNT(model) 返回？',
              options: ['10', '7', '3', '0'],
              answer: 1,
              explain: 'COUNT(字段) 只统计非 NULL 的个数，所以是 10 - 3 = 7。而 COUNT(*) 会返回 10。',
            },
          ],
        },
        {
          id: 'my-10',
          no: 10,
          title: 'GROUP BY 与 HAVING',
          minutes: 13,
          level: '进阶',
          objectives: ['按字段分组统计', '分清 WHERE 与 HAVING', '掌握 SQL 的执行顺序'],
          summary: 'GROUP BY 把行按字段分组，每组算一个结果。WHERE 在分组前过滤，HAVING 在分组后过滤。',
          blocks: [
            ['h', '按品类统计'],
            ['code', 'sql', `SELECT
  dept                       AS 品类,
  COUNT(*)                   AS 商品数,
  SUM(price)                 AS 总销售额值,
  ROUND(AVG(price), 2)       AS 平均销售额
FROM equipment
GROUP BY dept
ORDER BY 总销售额值 DESC;`],
            ['p', '理解方式：数据库先把所有行按 dept 分成几堆，然后对每一堆分别做 Count/Sum/Avg，最后每个品类输出一行。'],
            ['h', '一个铁律'],
            ['warn', 'SELECT 列表里只能出现「分组字段」和「聚合函数」，其他字段不允许出现。'],
            ['code', 'sql', `-- 错：name 既没分组也没聚合，不知道要显示哪一行的 name
SELECT dept, name, COUNT(*) FROM equipment GROUP BY dept;

-- 对
SELECT dept, COUNT(*) FROM equipment GROUP BY dept;

-- SQLite 里上面那句"错"的写法通常不报错，
-- 但结果里的 name 是随机的，千万不要依赖这个行为。`],
            ['h', 'HAVING：对分组结果再筛'],
            ['code', 'sql', `-- 找出商品数超过 2 台的品类
SELECT dept, COUNT(*) AS cnt
FROM equipment
GROUP BY dept
HAVING COUNT(*) > 2
ORDER BY cnt DESC;`],
            ['h', 'WHERE 和 HAVING 的区别（重点）'],
            ['table',
              ['', 'WHERE', 'HAVING'],
              ['作用时机', '分组**之前**过滤行', '分组**之后**过滤组'],
              ['能用聚合函数吗', '不能', '能'],
              ['性能', '更好（先减少数据量）', '较慢（先分组再筛）'],
            ],
            ['code', 'sql', `-- 找出：在用商品里，平均销售额超过 20 万的品类
SELECT
  dept,
  COUNT(*)             AS 在用数,
  ROUND(AVG(price), 2) AS 平均销售额
FROM equipment
WHERE status = '在用'          -- 先过滤掉非在用商品（行级）
GROUP BY dept
HAVING AVG(price) > 200000     -- 再过滤掉平均销售额不够的品类（组级）
ORDER BY 平均销售额 DESC;`],
            ['tip', '原则：能放 WHERE 的条件就不要放 HAVING。因为 WHERE 先把数据量降下来，后续分组计算都更省。'],
            ['h', '完整执行顺序（背下来，面试常问）'],
            ['code', 'sql', `FROM  →  WHERE  →  GROUP BY  →  HAVING  →  SELECT  →  ORDER BY  →  LIMIT`],
            ['p', '这个顺序解释了很多"为什么"：'],
            ['ul', [
              '为什么 WHERE 里不能用 SELECT 的别名？因为 WHERE 执行时 SELECT 还没跑。',
              '为什么 ORDER BY 可以用别名？因为它排在 SELECT 之后。',
              '为什么 HAVING 能用聚合函数？因为它在 GROUP BY 之后。',
            ]],
            ['h', '多字段分组'],
            ['code', 'sql', `SELECT dept, status, COUNT(*) AS 数量
FROM equipment
GROUP BY dept, status
ORDER BY dept, status;`],
          ],
          exercise: {
            task: '按品类统计：商品数量、总销售额值；只要「在用」状态的商品；筛出商品数 ≥ 2 的品类，按总销售额值降序排列。',
            hint: 'WHERE status = ... 在 GROUP BY 前，HAVING COUNT(*) >= 2 在 GROUP BY 后。',
            starter: `-- 补全
`,
            answer: `SELECT
  dept                 AS 品类,
  COUNT(*)             AS 商品数,
  SUM(price)           AS 总销售额值
FROM equipment
WHERE status = '在用'
GROUP BY dept
HAVING COUNT(*) >= 2
ORDER BY 总销售额值 DESC;`,
            note: '注意 HAVING 里的条件用的是聚合函数 COUNT(*)，这正是 HAVING 存在的意义。',
          },
          quiz: [
            {
              q: '要筛选"平均销售额大于 10 万的品类"，应该用？',
              options: ['WHERE AVG(price) > 100000', 'HAVING AVG(price) > 100000', 'ORDER BY AVG(price)', 'WHERE price > 100000'],
              answer: 1,
              explain: '聚合函数不能出现在 WHERE 里，因为 WHERE 执行时还没分组。这类条件必须用 HAVING。',
            },
          ],
        },
        {
          id: 'my-11',
          no: 11,
          title: 'JOIN：把两张表连起来',
          minutes: 15,
          level: '进阶',
          objectives: ['理解 JOIN 的本质是"按条件配对"', '分清 INNER / LEFT JOIN', '会拆解多表连接'],
          summary: 'JOIN 按关联字段把两张表配对。INNER 只保留能配上的，LEFT 保留左表全部（配不上的右表字段为 NULL）。',
          blocks: [
            ['p', 'JOIN 是 SQL 最重要也最难的一块。理解了它，你的查询能力会有质变。'],
            ['h', '为什么需要 JOIN'],
            ['p', '两张表示例如下。商品名称只在 equipment 里，销售结果只在 test_record 里。想知道"每台销售商品叫什么"，就必须把两张表连起来。'],
            ['table',
              ['equipment.code', 'equipment.name', 'test_record.equipment_code', 'test_record.item'],
              ['SKU-001', '蓝牙耳机', 'SKU-001', '退货率'],
              ['SKU-002', '智能手表', 'SKU-002', '销售额'],
              ['SKU-004', '机械键盘', 'SKU-004', '客销售额'],
            ],
            ['h', 'INNER JOIN：只要两边都有的'],
            ['code', 'sql', `SELECT
  e.code,
  e.name,
  t.item,
  t.value,
  t.verdict
FROM equipment AS e
INNER JOIN test_record AS t
  ON e.code = t.equipment_code
ORDER BY e.code;`],
            ['p', '读法：从 equipment 取一行，拿它的 code 去 test_record 里找 equipment_code 相等的行，配上的组合成一行结果。'],
            ['kv', [
              ['e / t', '表的别名。多表查询一定要用别名，否则字段名会写疯'],
              ['ON', '连接条件，说明两张表怎么配对'],
              ['INNER JOIN', '只保留两边都匹配成功的行'],
            ]],
            ['h', 'LEFT JOIN：以左表为准，右边配不上就填 NULL'],
            ['code', 'sql', `-- 列出所有商品，以及它们的销售次数（没做过销售的也要列出来）
SELECT
  e.code,
  e.name,
  COUNT(t.id) AS 销售次数
FROM equipment AS e
LEFT JOIN test_record AS t
  ON e.code = t.equipment_code
GROUP BY e.code, e.name
ORDER BY 销售次数 DESC;`],
            ['warn', '这里必须写 COUNT(t.id) 而不是 COUNT(*)。用 COUNT(*) 会把"没配上的那一行"也数成 1，没做过销售的商品会显示 1 次而不是 0 次。这是 LEFT JOIN 最经典的坑。'],
            ['h', '四种连接的对比'],
            ['table',
              ['类型', '含义', '典型场景'],
              ['INNER JOIN', '两边都匹配', '只要有效数据'],
              ['LEFT JOIN', '左表全部 + 右表匹配的', '主表全列出，看有无关联数据'],
              ['RIGHT JOIN', '右表全部 + 左表匹配的', '少用，改写表顺序用 LEFT 更清晰'],
              ['FULL OUTER JOIN', '两边都保留', 'SQLite 3.39+ 支持；旧版本用 UNION 模拟'],
            ],
            ['h', '三张表连起来'],
            ['code', 'sql', `SELECT
  e.dept,
  e.name  AS 商品名称,
  t.item  AS 销售指标,
  t.value AS 实测值
FROM equipment AS e
JOIN test_record AS t ON e.code = t.equipment_code
ORDER BY e.dept, e.name;`],
            ['tip', '多表 JOIN 的书写顺序建议：先写主表，然后每个 JOIN 单独一行、ON 单独一行。缩进对齐后，复杂查询也能一眼看懂结构。'],
            ['h', 'JOIN 的常见错误'],
            ['ul', [
              '忘了写 ON → 变成笛卡尔积，行数是两表行数相乘，可能瞬间把内存打爆',
              'ON 条件写错字段 → 结果数量暴涨或静默变少',
              'LEFT JOIN 后用 WHERE 过滤右表字段 → 等于退化成 INNER JOIN（因为 NULL 不满足条件）',
            ]],
            ['code', 'sql', `-- 想保留没销售的商品，但这样写会退化：
SELECT e.code, t.item
FROM equipment e
LEFT JOIN test_record t ON e.code = t.equipment_code
WHERE t.verdict = '合格';       -- NULL 不等于 '合格'，没销售的商品消失了

-- 正确写法：把条件放到 ON 里
SELECT e.code, t.item
FROM equipment e
LEFT JOIN test_record t
  ON e.code = t.equipment_code AND t.verdict = '合格';`],
            ['note', '为什么放 ON 里就对？因为 LEFT JOIN 的逻辑是"保留左表全部行"，ON 只决定右表怎么配；而 WHERE 是在连接完成后对整体结果过滤，会剔掉左表中配不上的行。'],
          ],
          exercise: {
            task: '列出每件商品的编号、名称，以及它的销售指标列表；要求把所有商品都列出来（做过没做过销售的都要）。',
            hint: 'equipment LEFT JOIN test_record，用 GROUP_CONCAT(t.item) 把项目拼起来。',
            starter: `-- 补全
`,
            answer: `SELECT
  e.code,
  e.name,
  GROUP_CONCAT(t.item) AS 销售指标
FROM equipment AS e
LEFT JOIN test_record AS t
  ON e.code = t.equipment_code
GROUP BY e.code, e.name
ORDER BY e.code;`,
            note: "没做过销售的商品这一列会显示 NULL。想显示「暂无」可以用 COALESCE(GROUP_CONCAT(t.item), '暂无销售记录')。",
          },
          quiz: [
            {
              q: 'LEFT JOIN 后，右表某行没匹配上时，右表字段的值是？',
              options: ['0', '空字符串', 'NULL', '这一行不返回'],
              answer: 2,
              explain: 'LEFT JOIN 保留左表全部行，右表配不上的部分填 NULL。所以判断"有没有关联数据"要用 IS NULL。',
            },
            {
              q: 'JOIN 时忘记写 ON 会发生什么？',
              options: ['语法错误', '笛卡尔积，结果行数 = 两表行数之积', '自动按同名字段连接', '返回空'],
              answer: 1,
              explain: '没有连接条件就是笛卡尔积。1000 行 × 1000 行 = 100 万行结果，很容易拖垮数据库。',
            },
          ],
        },
        {
          id: 'my-12',
          no: 12,
          title: '子查询与视图',
          minutes: 12,
          level: '进阶',
          objectives: ['写标量/列/表子查询', '用 EXISTS 做存在性判断', '用视图封装复杂查询'],
          summary: '子查询是"查询里套查询"。视图是把复杂查询保存成一个虚拟表，之后像查表一样查它。',
          blocks: [
            ['h', '标量子查询：返回一个值'],
            ['code', 'sql', `-- 找出比平均销售额贵的商品
SELECT name, price
FROM equipment
WHERE price > (SELECT AVG(price) FROM equipment);`],
            ['p', '括号里的子查询先执行，返回一个数，外层再拿这个数去比较。'],
            ['h', 'IN 子查询：返回一列值'],
            ['code', 'sql', `-- 找出所有做过销售的商品
SELECT code, name
FROM equipment
WHERE code IN (
  SELECT DISTINCT equipment_code FROM test_record
);`],
            ['h', 'EXISTS：存在性判断（通常比 IN 更快）'],
            ['code', 'sql', `-- 找出做过销售的商品（EXISTS 写法）
SELECT e.code, e.name
FROM equipment AS e
WHERE EXISTS (
  SELECT 1 FROM test_record AS t
  WHERE t.equipment_code = e.code
);`],
            ['kv', [
              ['EXISTS', '相关子查询，只关心"有没有"，找到一条就返回真'],
              ['NOT EXISTS', '找出"没有关联数据"的行，比 NOT IN 更安全'],
            ]],
            ['warn', 'NOT IN 遇到 NULL 会出问题：如果子查询结果里包含 NULL，NOT IN 会返回空集。所以排查"不存在"时优先用 NOT EXISTS。'],
            ['code', 'sql', `-- 找出没有任何销售记录的商品
SELECT e.code, e.name
FROM equipment AS e
WHERE NOT EXISTS (
  SELECT 1 FROM test_record AS t WHERE t.equipment_code = e.code
);`],
            ['h', '派生表：把子查询当表用'],
            ['code', 'sql', `SELECT dept, 平均销售额
FROM (
  SELECT dept, ROUND(AVG(price), 2) AS 平均销售额
  FROM equipment
  GROUP BY dept
) AS 品类统计
WHERE 平均销售额 > 150000;`],
            ['p', '括号里的查询结果被当成一张临时表，外层再对它查询。这层"套娃"在很多复杂报表里不可避免。'],
            ['h', '视图：给复杂查询起个名字'],
            ['code', 'sql', `CREATE VIEW v_equipment_test AS
SELECT
  e.code      AS 商品编号,
  e.name      AS 商品名称,
  e.dept      AS 品类,
  t.item      AS 销售指标,
  t.value     AS 实测值,
  t.verdict   AS 结论,
  t.test_date AS 销售日期
FROM equipment AS e
LEFT JOIN test_record AS t
  ON e.code = t.equipment_code;

-- 之后就像查普通表一样简单
SELECT * FROM v_equipment_test WHERE 结论 = '不合格';`],
            ['kv', [
              ['视图不存数据', '它只是一个"保存下来的查询"，每次查询视图都会重新执行底层 SQL'],
              ['简化调用', '把 5 张表的 JOIN 封装起来，使用者只写 SELECT * FROM 视图'],
              ['权限控制', '可以只把视图授权给某类用户，隐藏敏感字段'],
              ['修改限制', '带 JOIN / GROUP BY 的视图通常不能直接 INSERT/UPDATE'],
            ]],
            ['note', '视图在报表场景极其常用：把复杂的多表统计固化成视图，前端/BI 工具直接查视图，逻辑集中在一处，改起来也方便。'],
            ['h', '什么时候用子查询，什么时候用 JOIN'],
            ['ul', [
              '只是"拿一个值去比较" → 子查询更直观',
              '需要用到两边的多个字段 → JOIN 更合适',
              '性能上现代优化器对两者经常给出相同计划，不必过度纠结，可读性优先',
              '可以用 EXPLAIN QUERY PLAN 对比 IN 子查询和 JOIN 的执行计划',
            ]],
          ],
          exercise: {
            task: '找出所有「销售结论为不合格」的商品编号和名称；再用 NOT EXISTS 找出「从来没做过销售」的商品。',
            hint: '第一个用 IN 子查询，第二个用 NOT EXISTS。',
            starter: `-- 1. 有不合格记录的商品

-- 2. 从没做过销售的商品
`,
            answer: `-- 1. 有不合格记录的商品
SELECT code, name
FROM equipment
WHERE code IN (
  SELECT equipment_code FROM test_record WHERE verdict = '不合格'
);

-- 2. 从没做过销售的商品
SELECT e.code, e.name
FROM equipment e
WHERE NOT EXISTS (
  SELECT 1 FROM test_record t WHERE t.equipment_code = e.code
);`,
            note: '第二个查询会返回大部分商品（因为演示库里只有 5 件商品有销售记录）。这类"找出遗漏项"的查询在清单核对场景非常实用。',
          },
          quiz: [
            {
              q: '视图和表的本质区别是？',
              options: [
                '没有区别',
                '视图不存储数据，只是一个保存下来的查询',
                '视图不能查询',
                '视图只能有一列',
              ],
              answer: 1,
              explain: '视图是"虚拟表"，每次访问都会重新执行定义它的 SQL。所以底层表数据一变，视图结果立刻跟着变。',
            },
          ],
        },
      ],
    },

    /* ================= 第 4 章 ================= */
    {
      id: 'my-c4',
      no: 4,
      title: '进阶与实战',
      desc: '索引、事务，以及用 Python 把数据库接进你的工作流。',
      lessons: [
        {
          id: 'my-13',
          no: 13,
          title: '索引：为什么查询会慢',
          minutes: 13,
          level: '进阶',
          objectives: ['理解索引的原理与代价', '知道哪些字段该建索引', '会用 EXPLAIN 看执行计划'],
          summary: '索引像书的目录，能大幅加速查找，但会占空间、拖慢写入。WHERE / JOIN / ORDER BY 用到的字段优先考虑。',
          blocks: [
            ['h', '没有索引时发生了什么'],
            ['p', '一张 100 万行的表，执行 SELECT * FROM t WHERE code = \'SKU-99999\'，数据库只能从第一行开始一行行比对 —— 这叫**全表扫描**，最坏情况要读 100 万行。'],
            ['p', '建了索引后，数据库内部维护一棵排序好的 B+ 树结构，找 SKU-99999 只需要几次跳转（约 log₂(100万) ≈ 20 次），速度差几个数量级。'],
            ['h', '创建与删除索引'],
            ['code', 'sql', `CREATE INDEX idx_equipment_code ON equipment(code);
CREATE UNIQUE INDEX idx_code_unique ON equipment(code);
CREATE INDEX idx_dept_status ON equipment(dept, status);   -- 复合索引

DROP INDEX idx_equipment_code;

-- SQLite 的索引要单独建，不能写在 CREATE TABLE 里`],
            ['h', '索引不是越多越好'],
            ['table',
              ['代价', '说明'],
              ['占空间', '索引本身要存储，可能和表一样大甚至更大'],
              ['拖慢写入', '每次 INSERT/UPDATE/DELETE 都要同步维护所有索引'],
              ['优化器负担', '索引太多，选错索引的概率上升'],
            ],
            ['tip', '经验法则：一张表 5 个以内的索引比较健康。按"实际查询用到的条件"来建，别凭想象建。'],
            ['h', '哪些字段该建索引'],
            ['ul', [
              '经常出现在 WHERE 里的字段',
              'JOIN 的关联字段（如 test_record.equipment_code）',
              'ORDER BY / GROUP BY 用到的字段',
              '区分度高的字段（性别只有 2 个值，建索引意义不大；商品编号几万个不同值，很适合）',
              '唯一性字段（编号、手机号）自然要建唯一索引',
            ]],
            ['h', '复合索引的最左前缀原则（面试必考）'],
            ['code', 'sql', `CREATE INDEX idx_a_b_c ON t(a, b, c);

-- 能用到索引
WHERE a = 1
WHERE a = 1 AND b = 2
WHERE a = 1 AND b = 2 AND c = 3
WHERE a = 1 AND c = 3        -- 只用到 a 那一段

-- 用不到索引
WHERE b = 2                  -- 跳过了最左的 a
WHERE c = 3`],
            ['p', '原因：复合索引是按 (a, b, c) 的顺序排序的，就像电话簿先按姓排、同姓再按名排。你不知道姓，就没法快速翻到某个名。'],
            ['h', '索引失效的常见情况'],
            ['ul', [
              '在索引字段上做运算或函数：WHERE YEAR(buy_date) = 2024 → 改成 WHERE buy_date >= \'2024-01-01\' AND buy_date < \'2025-01-01\'',
              'LIKE 以 % 开头：WHERE name LIKE \'%分析仪\'',
              '隐式类型转换：code 是 TEXT，却写 WHERE code = 123',
              'OR 连接了非索引字段',
              '使用了 != 或 NOT IN（多数情况下无法走索引）',
            ]],
            ['h', 'EXPLAIN QUERY PLAN：看 SQLite 怎么执行你的查询'],
            ['code', 'sql', `EXPLAIN QUERY PLAN SELECT * FROM equipment WHERE dept = '数码配件';`],
            ['kv', [
              ['SCAN equipment', '全表扫描。数据量大时要警惕'],
              ['SEARCH equipment USING INDEX …', '走了索引，括号里会写明用哪个索引'],
              ['USING COVERING INDEX', '查询要的列都在索引里，连表都不用回读，最快'],
              ['USE TEMP B-TREE FOR ORDER BY', '需要额外排序，考虑给排序字段建索引'],
            ]],
            ['note', 'SQLite 的执行计划输出是"一步一行"的树状描述，看两件事就够：有没有 SCAN 大表、有没有用上索引。本 App 实操区可以直接试。'],
            ['warn', '别凭直觉加索引。正确流程是：先 EXPLAIN 找到慢查询 → 判断是否缺索引 → 加索引 → 再 EXPLAIN 对比验证。'],
          ],
          exercise: {
            task: '在 equipment 表上创建一个 dept + status 的复合索引，然后用 EXPLAIN QUERY PLAN 看看按 dept 查询是否走索引。',
            hint: 'CREATE INDEX 建索引；SQLite 用 EXPLAIN QUERY PLAN 前缀。',
            starter: `-- 建索引
CREATE INDEX idx_dept_status ON equipment(dept, status);

-- 查看执行计划
`,
            answer: `CREATE INDEX idx_dept_status ON equipment(dept, status);

EXPLAIN QUERY PLAN
SELECT * FROM equipment WHERE dept = '数码配件';

-- 对比：只按 status 查（复合索引最左是 dept，这个查询用不上索引）
EXPLAIN QUERY PLAN
SELECT * FROM equipment WHERE status = '在用';`,
            note: '演示库只有 12 行，优化器很可能仍选择全表扫描（因为小表扫描更快）。索引的销售额要在数据量大时才明显 —— 这也是为什么第 4 行那个"跳过了最左字段"的查询值得单独验证。',
          },
          quiz: [
            {
              q: 'CREATE INDEX idx(a, b, c) 后，WHERE b = 1 能用上索引吗？',
              options: ['能，完全用上', '不能，因为跳过了最左前缀 a', '部分用上', '会报错'],
              answer: 1,
              explain: '复合索引遵循最左前缀原则，必须先用到 a 才能继续用 b、c。所以 WHERE b = 1 用不上这个索引。',
            },
            {
              q: '索引带来的主要代价是什么？',
              options: ['查询变慢', '占用存储空间，并拖慢写入操作', '数据丢失', '不能排序'],
              answer: 1,
              explain: '索引加速读，但代价是额外存储和维护开销。每次写数据都要更新索引，所以写多的表索引不宜过多。',
            },
          ],
        },
        {
          id: 'my-14',
          no: 14,
          title: '事务：一组操作要么全成、要么全撤',
          minutes: 12,
          level: '进阶',
          objectives: ['理解事务的 ACID', '会写 BEGIN / COMMIT / ROLLBACK', '知道 SQLite 的并发特点'],
          summary: '事务保证一组操作要么全部生效、要么全部撤销。SQLite 采用单写者模型，写事务会短暂锁住数据库。',
          blocks: [
            ['h', '一个真实场景'],
            ['p', '商品进货流程要同时做两件事：① 在 equipment 表插入新商品 ② 在 purchase_log 表记录进货流水。如果第 ① 步成功、第 ② 步失败，数据就不一致了 —— 有商品却没进货记录。事务就是解决这个的。'],
            ['h', '事务的基本操作'],
            ['code', 'sql', `BEGIN;

INSERT INTO equipment (code, name, price) VALUES ('SKU-020', '新商品', 100000);
INSERT INTO purchase_log (equipment_code, amount) VALUES ('SKU-020', 100000);

COMMIT;           -- 两条都成功，一起生效

-- 如果中途出错，撤销全部
-- ROLLBACK;`],
            ['p', 'COMMIT 之前，其他连接看不到你的改动；ROLLBACK 之后，一切像没发生过。'],
            ['h', 'ACID 四个特性'],
            ['kv', [
              ['A 原子性 Atomicity', '事务里的操作要么全做，要么全不做'],
              ['C 一致性 Consistency', '事务前后数据都满足约束（如总额守恒）'],
              ['I 隔离性 Isolation', '并发事务之间互不干扰'],
              ['D 持久性 Durability', 'COMMIT 后的数据即使断电也不丢'],
            ]],
            ['h', 'SQLite 的并发模型'],
            ['ul', [
              '同一时刻只允许一个写事务，写入天然是串行的',
              '读可以并发；开启 WAL 模式后，读写互不阻塞',
              '没有"每个会话单独设置隔离级别"这种开关，事务语义由 SQLite 统一保证',
              '需要立刻拿写锁时，可以用 BEGIN IMMEDIATE',
            ]],
            ['warn', '长事务会一直占着写锁，其他写入只能排队。原则是"事务要短"——不要在事务里做网络请求、等用户输入或做大量计算。'],
            ['h', 'Python 里怎么用事务'],
            ['code', 'python', `import sqlite3

conn = sqlite3.connect("lab.db")
try:
    with conn:                      # 成功自动 commit，异常自动 rollback
        conn.execute(
            "INSERT INTO equipment (code, name) VALUES (?, ?)",
            ("SKU-020", "新商品"),
        )
        conn.execute(
            "INSERT INTO purchase_log (equipment_code) VALUES (?)",
            ("SKU-020",),
        )
except sqlite3.Error as e:
    print(f"失败，已回滚：{e}")
finally:
    conn.close()`],
            ['tip', 'sqlite3 的占位符是 ?（也支持 :name 命名参数）。值一律走参数占位符，不要拼字符串。'],
          ],
          exercise: {
            task: '在一个事务里：给 equipment 插入一台新商品，然后故意执行一条会报错的语句（如插入重复编号），观察是否整体回滚。',
            hint: '先 BEGIN，插入一条，再用 ROLLBACK 或 COMMIT 看结果差异。',
            starter: `BEGIN;

INSERT INTO equipment (code, name, price) VALUES ('SKU-021', '测试商品', 50000);

-- 这条会失败（编号重复）
INSERT INTO equipment (code, name, price) VALUES ('SKU-001', '重复编号', 1);

-- 试试 COMMIT 和 ROLLBACK，分别观察结果
`,
            answer: `BEGIN;

-- 第一条（正常）
INSERT INTO equipment (code, name, price) VALUES ('SKU-021', '测试商品', 50000);

-- 第二条：SKU-001 已存在，会触发 UNIQUE 约束错误
INSERT INTO equipment (code, name, price) VALUES ('SKU-001', '重复编号', 1);

-- 出错后检查：新商品有没有进去？
SELECT * FROM equipment WHERE code = 'SKU-021';

-- 回滚，让第一条也失效
ROLLBACK;

-- 再查一次，确认完全没留下痕迹
SELECT * FROM equipment WHERE code = 'SKU-021';`,
            note: '关键观察点：在 SQLite 命令行/客户端里，第二条失败并不会自动回滚第一条 —— 事务不会因为一条语句报错就自动撤销。所以生产代码必须用 try/except 显式 rollback（就像上面 Python 的例子）。',
          },
          quiz: [
            {
              q: 'SQLite 的写入并发模型是？',
              options: ['允许多个写事务同时进行', '同一时刻只允许一个写事务', '完全不支持事务', '只允许读'],
              answer: 1,
              explain: 'SQLite 采用单写者模型：读可以并发，但写是串行的。开启 WAL 模式后读写互不阻塞，但仍然只有一个写者。',
            },
            {
              q: 'Python sqlite3 里 with conn: 的作用是？',
              options: ['只负责关闭连接', '成功时自动 commit，异常时自动 rollback', '禁止写入', '自动创建所有表'],
              answer: 1,
              explain: 'with conn: 是一个事务上下文：代码块正常结束就提交，抛异常就回滚。连接本身仍要自己 close()。',
            },
          ],
        },
        {
          id: 'my-15',
          no: 15,
          title: 'Python + SQLite：sqlite3 实战',
          minutes: 16,
          level: '实战',
          objectives: ['用 sqlite3 连接 .db 文件', '安全地执行查询和写入', '把查询结果转成字典列表'],
          summary: 'sqlite3 是 Python 标准库，不用安装。记住：参数化传值、用完关闭、row_factory 拿字典。',
          blocks: [
            ['h', '不用安装'],
            ['p', 'sqlite3 是 Python 自带的模块，直接 import 就能用。手机上实操区跑的也是同一个 SQLite 引擎，语法完全一致。'],
            ['code', 'bash', `python -c "import sqlite3; print(sqlite3.sqlite_version)"`],
            ['h', '连接与最小示例'],
            ['code', 'python', `import sqlite3

conn = sqlite3.connect("lab.db")      # 文件不存在会自动创建
conn.row_factory = sqlite3.Row        # 结果可以按列名取值

with conn:
    rows = conn.execute(
        "SELECT code, name, price FROM equipment WHERE dept = ?",
        ("数码配件",),
    ).fetchall()
    for r in rows:
        print(r["code"], r["name"], r["price"])

conn.close()`],
            ['h', '三个关键点'],
            ['ol', [
              'connect("lab.db") —— 数据库就是一个文件，路径写错会悄悄新建一个空库',
              'row_factory = sqlite3.Row —— 结果按列名取值，比 r[1] 可读性高太多',
              '参数用 ? 占位符 —— execute 的第二个参数传元组，驱动会自动转义，防注入',
            ]],
            ['warn', '? 占位符和参数一一对应，数量必须一致。即使值是数字也要走参数，不要用 f-string 拼进 SQL。'],
            ['h', '写入数据'],
            ['code', 'python', `data = [
    ("SKU-030", "智能音箱", 218000, "影音商品"),
    ("SKU-031", "迷你主机",      35000, "数码配件"),
]

with conn:
    conn.executemany(
        "INSERT INTO equipment (code, name, price, dept) VALUES (?, ?, ?, ?)",
        data,
    )
print(f"插入了 {len(data)} 条")`],
            ['tip', 'executemany 一次处理一批数据，比循环 execute 快；with conn 会在成功时自动提交。'],
            ['h', '一个可复用的查询函数'],
            ['code', 'python', `import sqlite3

def query(sql, params=()):
    """执行查询，返回 sqlite3.Row 列表"""
    conn = sqlite3.connect("lab.db")
    conn.row_factory = sqlite3.Row
    try:
        return conn.execute(sql, params).fetchall()
    finally:
        conn.close()


def execute(sql, params=()):
    """执行写入，返回受影响行数"""
    conn = sqlite3.connect("lab.db")
    try:
        with conn:
            cur = conn.execute(sql, params)
        return cur.rowcount
    finally:
        conn.close()`],
            ['note', '脚本和小工具每次新建连接足够清晰。高频调用时再考虑复用连接，或使用 ORM（SQLAlchemy）。'],
            ['h', '实战：把销售数据存进数据库'],
            ['code', 'python', `import sqlite3

records = [
    ("SKU-001", "退货率",   2.0,   ">= 1",   "合格",   "2024-08-01"),
    ("SKU-003", "缺货率",  -41.5,  "-40±2",  "不合格", "2024-05-19"),
    ("SKU-005", "月销售额", -118.0,  "<= -110", "合格",   "2024-08-20"),
]

conn = sqlite3.connect("lab.db")
conn.row_factory = sqlite3.Row
try:
    with conn:
        conn.executemany(
            """INSERT INTO test_record
               (equipment_code, item, value, limit_value, verdict, test_date)
               VALUES (?, ?, ?, ?, ?, ?)""",
            records,
        )

    rows = conn.execute("""
        SELECT t.item, t.value, t.verdict, e.name
        FROM test_record t
        JOIN equipment e ON e.code = t.equipment_code
        WHERE t.verdict = ?
    """, ("不合格",)).fetchall()
    for r in rows:
        print(f"{r['name']} 的 {r['item']} 不合格，实测 {r['value']}")
finally:
    conn.close()`],
            ['tip', '上面这段就是"销售数据入库 + 异常项汇总"的完整雏形。把它改成从 Excel 读数据，就是一个真实可用的销售数据管理脚本。'],
            ['h', '常见报错对照'],
            ['kv', [
              ['no such table: equipment', '库文件不对，或表还没建'],
              ['UNIQUE constraint failed', '插入了重复的编号'],
              ['Incorrect number of bindings', '? 的个数和参数个数不一致'],
              ['database is locked', '另一个写事务还没结束；缩短事务或开启 WAL'],
              ['no such column: xxx', '字段名写错了'],
            ]],
          ],
          exercise: {
            task: '写一个函数 top_expensive(n)，返回销售额最高的 n 件商品（编号、名称、销售额）。先用实操区的 SQL 把语句调通，再套进 sqlite3。',
            hint: 'SQL 用 ORDER BY price DESC LIMIT ?，把 n 作为参数传入。',
            starter: `import sqlite3

def top_expensive(n):
    # 补全
    pass
`,
            answer: `import sqlite3

def top_expensive(n):
    """返回销售额最高的 n 件商品"""
    conn = sqlite3.connect("lab.db")
    conn.row_factory = sqlite3.Row
    try:
        return conn.execute(
            "SELECT code, name, price FROM equipment ORDER BY price DESC LIMIT ?",
            (n,),
        ).fetchall()
    finally:
        conn.close()


for r in top_expensive(3):
    print(f"{r['code']}  {r['name']}  {r['price']:,.0f} 元")`,
            note: 'sqlite3 支持用 ? 参数化 LIMIT。n 必须是整数，不能把用户输入直接拼进 SQL。',
          },
          quiz: [
            {
              q: 'sqlite3 里防止 SQL 注入的正确做法是？',
              options: [
                '用 f-string 拼接',
                '用 ? 占位符并把参数作为第二个参数传给 execute',
                '手动把引号替换掉',
                '只在查询时防，写入不用管',
              ],
              answer: 1,
              explain: 'sqlite3 的 ? 占位符会把值当作数据处理并自动转义，参数和数据分离。任何形式的字符串拼接都是危险的。',
            },
          ],
        },
        {
          id: 'my-16',
          no: 16,
          title: '综合实战：商品清单查询系统',
          minutes: 18,
          level: '实战',
          objectives: ['把建表、插入、多表查询、统计串起来', '写出一个"清单核对"实用脚本', '掌握分页查询与条件组装'],
          summary: '把前面 15 节全部用上：建表 → 灌数据 → 复杂查询 → 输出报表。这是最接近真实工作的一节。',
          blocks: [
            ['p', '最后这节，我们做一个你工作里真会遇到的东西：**商品清单与销售记录的核对系统**。'],
            ['h', '需求'],
            ['ol', [
              '找出所有"有销售记录但不合格"的商品',
              '找出所有"从没做过销售"的商品（清单漏项）',
              '按品类统计商品销售额与销售合格率',
              '生成一份可读的核对报告',
            ]],
            ['h', '第一步：把关键查询写出来'],
            ['code', 'sql', `-- ① 有不合格记录的商品
SELECT DISTINCT e.code, e.name, e.dept
FROM equipment e
JOIN test_record t ON e.code = t.equipment_code
WHERE t.verdict = '不合格';

-- ② 从没做过销售的商品（清单漏项）
SELECT e.code, e.name, e.dept
FROM equipment e
WHERE NOT EXISTS (
  SELECT 1 FROM test_record t WHERE t.equipment_code = e.code
);

-- ③ 按品类统计：商品数、总销售额值、销售总数、不合格数、合格率
SELECT
  e.dept                                            AS 品类,
  COUNT(DISTINCT e.code)                            AS 商品数,
  SUM(DISTINCT e.price)                             AS 说明_需特殊处理,
  COUNT(t.id)                                       AS 销售记录数
FROM equipment e
LEFT JOIN test_record t ON t.equipment_code = e.code
GROUP BY e.dept;`],
            ['warn', '上面第 ③ 条里 SUM(DISTINCT e.price) 是**典型的错误写法**！因为 JOIN 会让同一件商品的行重复出现（一件商品有 3 条销售记录就出现 3 次），销售额会被重复累加。正确做法是先聚合再去 JOIN，或者用子查询。'],
            ['h', 'JOIN + 聚合的经典陷阱与正确解法'],
            ['code', 'sql', `-- 错误：商品销售额被销售记录条数放大
SELECT e.dept, SUM(e.price)
FROM equipment e
LEFT JOIN test_record t ON t.equipment_code = e.code
GROUP BY e.dept;
-- 数码配件 3 件商品 700000 元，但因为有 5 条销售记录，会算成 1180000


-- 正确解法 A：先算商品侧，再算销售侧，最后合并
SELECT
  d.dept        AS 品类,
  d.商品数,
  d.总销售额值,
  COALESCE(t.销售记录数, 0)   AS 销售记录数,
  COALESCE(t.不合格数, 0) AS 不合格数
FROM (
  SELECT dept, COUNT(*) AS 商品数, SUM(price) AS 总销售额值
  FROM equipment
  GROUP BY dept
) AS d
LEFT JOIN (
  SELECT e.dept,
         COUNT(*) AS 销售记录数,
         SUM(CASE WHEN t.verdict = '不合格' THEN 1 ELSE 0 END) AS 不合格数
  FROM test_record t
  JOIN equipment e ON e.code = t.equipment_code
  GROUP BY e.dept
) AS t ON t.dept = d.dept
ORDER BY d.总销售额值 DESC;`],
            ['tip', '记住这个模式：「先分组聚合，再 JOIN」是解决"JOIN 导致重复计数"的通用解法。这在做报表时几乎每天都会遇到。'],
            ['h', '第二步：用 Python 串成报告'],
            ['code', 'python', `import sqlite3

DB_PATH = "lab.db"


def q(sql, params=()):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        return conn.execute(sql, params).fetchall()
    finally:
        conn.close()


def build_report():
    lines = []
    lines.append("=" * 46)
    lines.append("           商品清单核对报告")
    lines.append("=" * 46)

    # ① 不合格项
    bad = q("""
        SELECT DISTINCT e.code, e.name, e.dept
        FROM equipment e
        JOIN test_record t ON e.code = t.equipment_code
        WHERE t.verdict = '不合格'
    """)
    lines.append(f"\\n【一】存在不合格销售记录的商品（{len(bad)} 台）")
    for r in bad:
        lines.append(f"  ! {r['code']}  {r['name']}  （{r['dept']}）")

    # ② 清单漏项
    miss = q("""
        SELECT e.code, e.name, e.dept
        FROM equipment e
        WHERE NOT EXISTS (
          SELECT 1 FROM test_record t WHERE t.equipment_code = e.code
        )
    """)
    lines.append(f"\\n【二】从未做过销售的商品（{len(miss)} 台）")
    for r in miss:
        lines.append(f"  ? {r['code']}  {r['name']}  （{r['dept']}）")

    # ③ 品类统计
    stat = q("""
        SELECT d.dept AS dept, d.商品数, d.总销售额值,
               COALESCE(t.销售记录数, 0) AS 销售记录数,
               COALESCE(t.不合格数, 0) AS 不合格数
        FROM (
          SELECT dept, COUNT(*) AS 商品数, SUM(price) AS 总销售额值
          FROM equipment GROUP BY dept
        ) d
        LEFT JOIN (
          SELECT e.dept, COUNT(*) AS 销售记录数,
                 SUM(CASE WHEN t.verdict = '不合格' THEN 1 ELSE 0 END) AS 不合格数
          FROM test_record t JOIN equipment e ON e.code = t.equipment_code
          GROUP BY e.dept
        ) t ON t.dept = d.dept
        ORDER BY d.总销售额值 DESC
    """)
    lines.append("\\n【三】品类汇总")
    lines.append(f"  {'品类':<12}{'商品数':>6}{'总销售额值(万元)':>14}{'销售记录数':>8}{'不合格':>8}")
    for r in stat:
        lines.append(
            f"  {r['dept']:<12}{r['商品数']:>6}"
            f"{float(r['总销售额值'] or 0) / 10000:>14.2f}"
            f"{r['销售记录数']:>8}{r['不合格数']:>8}"
        )

    lines.append("\\n" + "=" * 46)
    return "\\n".join(lines)


if __name__ == '__main__':
    print(build_report())`],
            ['h', '输出长这样'],
            ['code', 'text', `==============================================
           商品清单核对报告
==============================================

【一】存在不合格销售记录的商品（1 台）
  ! SKU-003  便携音箱  （智能穿戴）

【二】从未做过销售的商品（7 台）
  ? SKU-006  充电宝  （日用百货）
  ? SKU-007  数据线  （日用百货）
  ...

【三】品类汇总
  品类             商品数    总销售额值(万元)    销售记录数    不合格
  数码配件            3         72.00        5        0
  智能穿戴            3         18.50        2        1
  影音商品            2         91.00        1        0
  ...`],
            ['h', '这个脚本能直接用的原因'],
            ['ul', [
              'SQL 集中在一处，改查询不用动 Python 逻辑',
              'q() 函数统一处理连接，不重复代码',
              '分批输出（不合格 / 漏项 / 汇总），每块都能独立看懂',
              '用 :<12 / :>6 做对齐，纯文本也能出正式报表',
            ]],
            ['h', '再往前一步'],
            ['ol', [
              '数据源换成从 Excel 读（openpyxl / pandas），实现"Excel 清单 → 数据库"自动同步',
              '报告写入文件：Path("核对报告.txt").write_text(report, encoding="utf-8")',
              '加个 --date 参数，只核对某个月的数据',
              '做成定时任务，每周一自动跑并邮件发出',
            ]],
            ['note', '到这里，你已经走完了「Python 语法 → SQL 查询 → 两者结合解决真实问题」的完整路径。接下来最有销售额的动作是：拿你手上真实的一份清单，用这套方法重新做一遍。'],
          ],
          exercise: {
            task: '在上面基础上增加一个查询：找出「销售记录中涉及的商品编号，在 equipment 表里不存在」的情况（也就是销售记录引用了不存在的商品，属于数据质量问题）。',
            hint: '从 test_record 出发 LEFT JOIN equipment，筛 e.code IS NULL。',
            starter: `-- 找出孤儿销售记录
`,
            answer: `-- 找出引用了不存在商品的销售记录（孤儿记录）
SELECT t.id, t.equipment_code, t.item, t.verdict
FROM test_record t
LEFT JOIN equipment e ON e.code = t.equipment_code
WHERE e.code IS NULL;

-- 汇总统计有多少条
SELECT COUNT(*) AS 孤儿记录数
FROM test_record t
LEFT JOIN equipment e ON e.code = t.equipment_code
WHERE e.code IS NULL;`,
            note: '演示库里数据是干净的，所以会返回 0 行。但真实清单里，这种"引用了不存在编号"的情况非常常见 —— 比如商品报废后从商品表删了，销售记录还留着。这是 LEFT JOIN + IS NULL 最经典的用法。',
          },
          quiz: [
            {
              q: 'JOIN 后再 SUM(销售额字段)，为什么结果会偏大？',
              options: [
                'SUM 本身有 bug',
                '因为 JOIN 让主表行重复了，同一行的值被累加多次',
                '因为浮点精度问题',
                '因为没加 DISTINCT',
              ],
              answer: 1,
              explain: '一对多 JOIN 会把主表的行复制多份，聚合时同一个值就被算了多次。解法是"先各自聚合，再 JOIN"，而不是硬套 DISTINCT。',
            },
            {
              q: '要查"左表有、右表没有"的记录，最稳妥的写法是？',
              options: [
                'INNER JOIN',
                'LEFT JOIN ... WHERE 右表字段 IS NULL',
                'CROSS JOIN',
                'UNION',
              ],
              answer: 1,
              explain: 'LEFT JOIN 保留左表全部行，配不上的右表字段为 NULL，因此用 IS NULL 就能筛出"没有关联"的行。配合 NOT EXISTS 也可以，但 LEFT JOIN 更直观。',
            },
          ],
        },
      ],
    },

    /* ================= 第 5 章 ================= */
    {
      id: 'my-c5',
      no: 5,
      title: '从练习到真实数据库',
      desc: '把实操区写的 SQL 落到真实的 .db 文件，学会导入导出、备份与查询计划。',
      lessons: [
        {
          id: 'my-17',
          no: 17,
          title: '从实操台到真实 .db 文件',
          minutes: 15,
          level: '实战',
          objectives: ['把实操区的表结构复制到本地 .db 文件', '用 Python 批量导入和导出 CSV', '会做备份并看懂查询计划'],
          summary: '实操区是内存库，真实项目是一个 .db 文件。SQL 基本不变，换的是连接方式与数据来源。',
          blocks: [
            ['p', '前面 16 节，你一直在实操区的内存 SQLite 上练手。这一节把它落到一个真实的 .db 文件里。'],
            ['h', '先确认：SQL 不用重学'],
            ['p', '你写过的 SELECT / WHERE / JOIN / GROUP BY / 子查询 / CASE WHEN / INSERT / UPDATE / DELETE / LIMIT / 事务，在文件数据库里逐字通用。要适应的只有两件事：连接文件，以及数据从哪来。'],
            ['h', '第一步：把表结构建进 lab.db'],
            ['code', 'python', `import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS equipment (
  id       INTEGER PRIMARY KEY,
  code     TEXT NOT NULL UNIQUE,
  name     TEXT NOT NULL,
  price    REAL DEFAULT 0,
  dept     TEXT,
  buy_date TEXT,
  status   TEXT DEFAULT '在用'
);

CREATE TABLE IF NOT EXISTS test_record (
  id             INTEGER PRIMARY KEY,
  equipment_code TEXT,
  item           TEXT,
  value          REAL,
  verdict        TEXT,
  test_date      TEXT
);
"""

conn = sqlite3.connect("lab.db")
conn.executescript(SCHEMA)
conn.close()`],
            ['note', 'executescript 可以一次执行多条用分号隔开的语句，适合初始化表结构。IF NOT EXISTS 保证重复运行不会报错。'],
            ['h', '第二步：从 CSV 导入数据'],
            ['code', 'python', `import csv
import sqlite3

with open("equipment.csv", encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))

conn = sqlite3.connect("lab.db")
try:
    with conn:
        conn.executemany(
            """INSERT OR REPLACE INTO equipment
               (id, code, name, price, dept, buy_date, status)
               VALUES (:id, :code, :name, :price, :dept, :buy_date, :status)""",
            rows,
        )
    print(f"导入 {len(rows)} 条")
finally:
    conn.close()`],
            ['tip', 'executemany 配合命名参数 :name，可以直接把 DictReader 产生的字典喂进去。INSERT OR REPLACE 让重复导入变成"更新"而不是报错。'],
            ['h', '第三步：把查询结果导出成 CSV'],
            ['code', 'python', `import csv
import sqlite3

conn = sqlite3.connect("lab.db")
conn.row_factory = sqlite3.Row
rows = conn.execute("""
    SELECT code, name, dept, price
    FROM equipment
    WHERE status = ?
    ORDER BY price DESC
""", ("在用",)).fetchall()
conn.close()

with open("在用商品.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["编号", "名称", "品类", "销售额"])
    for r in rows:
        writer.writerow([r["code"], r["name"], r["dept"], r["price"]])

print(f"导出 {len(rows)} 行")`],
            ['warn', 'CSV 用 utf-8-sig 编码，Excel 打开中文才不会乱码；newline="" 可以避免 Windows 上多出空行。'],
            ['h', '备份：别直接复制正在写入的文件'],
            ['code', 'python', `import sqlite3

src = sqlite3.connect("lab.db")
dst = sqlite3.connect("lab-backup.db")
with dst:
    src.backup(dst)      # 一致性备份，写入过程中也能安全执行
dst.close()
src.close()`],
            ['warn', '如果数据库正在被写入，直接复制 .db 文件可能得到不一致的副本。用 Connection.backup()，或先停止写入再复制。'],
            ['h', '看懂查询计划'],
            ['code', 'sql', `EXPLAIN QUERY PLAN
SELECT * FROM equipment WHERE code = 'SKU-001';

-- 输出里看到 SEARCH ... USING INDEX 说明走了索引
-- 看到 SCAN equipment 说明是全表扫描`],
            ['tip', '数据量小的时候全表扫描也很快，不必为了消除 SCAN 而乱加索引。等表大了、查询慢了，再回来看查询计划。'],
            ['note', '到这里，你已经能把课程里的 SQL 用到真实 .db 文件、CSV 导入导出和备份上。剩下的就是拿自己的数据练。'],
          ],
          exercise: {
            task: '写一段 Python：连接 lab.db，查询每个品类的商品数与总销售额值，按总销售额值降序打印。',
            hint: 'SQL 用 GROUP BY dept、SUM(price)；结果用 row_factory 按列名取值。',
            starter: `import sqlite3

conn = sqlite3.connect("lab.db")
conn.row_factory = sqlite3.Row
# 补全查询与打印
conn.close()
`,
            answer: `import sqlite3

conn = sqlite3.connect("lab.db")
conn.row_factory = sqlite3.Row

rows = conn.execute("""
    SELECT dept AS 品类, COUNT(*) AS 商品数, SUM(price) AS 总销售额值
    FROM equipment
    GROUP BY dept
    ORDER BY 总销售额值 DESC
""").fetchall()

for r in rows:
    print(f"{r['品类']:<12} {r['商品数']:>4} 台  {r['总销售额值']:>12,.0f} 元")

conn.close()`,
            note: 'GROUP BY 后 SELECT 的列必须能按组唯一确定；这里按 dept 分组，取 dept、COUNT、SUM 都是安全的。',
          },
          quiz: [
            {
              q: 'sqlite3.connect("new.db") 时文件不存在，会怎样？',
              options: ['报错', '自动创建一个空数据库文件', '连接内存库', '只读打开'],
              answer: 1,
              explain: 'SQLite 默认在文件不存在时自动创建。路径写错时最容易"悄悄建了个空库"，然后报 no such table。',
            },
            {
              q: 'EXPLAIN QUERY PLAN 输出 SCAN equipment 表示？',
              options: ['走了索引', '全表扫描', '语法错误', '使用了缓存'],
              answer: 1,
              explain: 'SCAN 表示逐行扫描整张表；SEARCH ... USING INDEX 才表示用到了索引。',
            },
            {
              q: '数据库正在被写入时，最稳妥的备份方式是？',
              options: ['直接复制 .db 文件', '用 Connection.backup()', '把表导出成截图', '停止程序后删除原文件'],
              answer: 1,
              explain: 'backup() 会做一致性快照，写入过程中也能安全执行；直接复制可能拿到写了一半的文件。',
            },
          ],
        },
      ],
    },
  ],
}

export const SQL_LESSONS = SQL_COURSE.chapters.flatMap((c) =>
  c.lessons.map((l) => ({ ...l, chapterId: c.id, chapterTitle: c.title, track: 'sql' }))
)

export function findSqlLesson(id) {
  return SQL_LESSONS.find((l) => l.id === id) || null
}

export const COURSES = {
  python: { ...PYTHON_COURSE, lessons: PY_LESSONS },
  sql: { ...SQL_COURSE, lessons: SQL_LESSONS },
}
