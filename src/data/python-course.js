/* ============================================================
   Python 路线课程内容
   块结构约定（数组形式，便于手机上稳定渲染）：
     ['h', 标题]  ['p', 段落]  ['code', 语言, 代码]  ['ul', [项...]]
     ['ol', [项...]] ['tip', 文字] ['warn', 文字] ['note', 文字]
     ['kv', [[术语, 解释], ...]]  ['table', [表头...], [行...], ...]
   ============================================================ */

export const PYTHON_COURSE = {
  id: 'python',
  name: 'Python',
  icon: '🐍',
  tagline: '从零到能写自动化小工具',
  desc: '面向零基础。学完能看懂别人的代码、能自己写脚本处理表格、文本和日常重复工作。',
  chapters: [
    /* ================= 第 1 章 ================= */
    {
      id: 'py-c1',
      no: 1,
      title: '起步：让电脑听你说话',
      desc: '装好环境、打出第一行字、理解"变量"这个最基本的概念。',
      lessons: [
        {
          id: 'py-01',
          no: 1,
          title: '第一个程序：print 与注释',
          minutes: 6,
          level: '入门',
          objectives: ['让 Python 输出一行文字', '知道什么是注释、为什么要写注释', '遇到报错不慌，会看报错信息的最后一行'],
          summary: 'print 是把内容显示到屏幕上的函数；# 后面是注释，给人看的，程序不会执行；报错看最后一行。',
          blocks: [
            ['p', '编程最难的一步永远是"跑起来"。这节课结束时，你会亲手让手机输出一句话。'],
            ['h', 'print —— 把东西显示出来'],
            ['p', 'print 是 Python 里最常用的函数。括号里放什么，屏幕上就显示什么。'],
            ['code', 'python', `print("你好，世界")
print(123)
print("小坤", "学编程")     # 多个值用逗号隔开，会带空格输出`],
            ['note', '在下面「练习台」里直接改这段代码，点运行就能看到结果。'],
            ['h', '注释：写给未来的自己'],
            ['p', '井号 # 之后的内容，Python 完全不看。它是写给人看的，用来解释"这段代码在干什么"。'],
            ['code', 'python', `# 这是注释，Python 会忽略
print("这行会输出")   # 行尾也能写注释`],
            ['p', '为什么必须写注释？因为三个月后你回头看自己的代码，会像看陌生人写的。'],
            ['h', '报错不可怕'],
            ['p', '新手最大的心理障碍是"看到红字就懵"。其实 Python 的报错信息很有礼貌，重点看两处：'],
            ['ol', [
              '最后一行 —— 错误的类型和原因（如 SyntaxError: invalid syntax 表示语法写错了）',
              '往上数第二块 —— 出错的文件和行号（line 3）',
            ]],
            ['kv', [
              ['SyntaxError', '语法错误：括号、引号没配对，少了冒号'],
              ['NameError', '用了一个没定义过的名字（多半是拼错了）'],
              ['IndentationError', '缩进不对（Python 靠缩进划分代码块）'],
              ['TypeError', '类型不匹配，比如把数字和文字相加'],
            ]],
            ['tip', '把报错信息整段复制粘贴给「小坤」助教，它会告诉你哪错了、为什么错。'],
          ],
          exercise: {
            task: '让程序输出三行字：第一行是你的名字，第二行是「正在学 Python」，第三行用注释写一句给自己的话。',
            hint: '三个 print，最后一行以 # 开头。',
            starter: `print("小林")
# 在这里补两行
`,
            answer: `print("小林")
print("正在学 Python")
# 三个月后我要用 Python 把重复的表格工作全自动化`,
            note: '注意引号必须是英文引号。中文引号""看起来一样，但 Python 不认识，会报 SyntaxError。',
          },
          quiz: [
            {
              q: 'print("3 + 4") 会输出什么？',
              options: ['7', '3 + 4', '报错', '什么都没有'],
              answer: 1,
              explain: '加了引号就是"文字"，Python 不会去算它。想输出 7 要写成 print(3 + 4)。这个区别就是「字符串」和「表达式」的分水岭。',
            },
            {
              q: '代码第 5 行报错，你应该先看哪里？',
              options: ['报错的最后一行', '第一行', '随便找一行', '把代码全删了重写'],
              answer: 0,
              explain: '最后一行给出错误类型和原因，这是定位问题的第一把钥匙。',
            },
          ],
        },
        {
          id: 'py-02',
          no: 2,
          title: '变量：给数据起个名字',
          minutes: 8,
          level: '入门',
          objectives: ['理解变量就是"贴了标签的盒子"', '掌握合法命名规则', '会用变量做计算与拼字符串'],
          summary: '变量是带名字的存储位置；用 = 赋值；命名要见名知意，不能数字开头、不能有空格。',
          blocks: [
            ['p', '程序要处理数据，就得先把数据存起来。变量就是"带名字的盒子"。'],
            ['code', 'python', `price = 299            # 把 299 装进名为 price 的盒子
name = "蓝牙耳机"
print(name, price)`],
            ['p', '这里的 = 不是数学里的"等于"，而是"赋值"：把右边的值放进左边的名字里。读作"把 299 赋给 price"。'],
            ['h', '命名规则（必须遵守）'],
            ['ul', [
              '只能用字母、数字、下划线，不能有空格、不能有中文标点',
              '不能以数字开头 —— price1 可以，1price 不行',
              '不能和 Python 保留字重名 —— if、for、class、None、True 都不行',
              '区分大小写 —— Price 和 price 是两个不同的变量',
            ]],
            ['h', '命名习惯（决定代码能不能给别人看）'],
            ['code', 'python', `# 差：看不出是什么
a = 86.5
b = "张三"

# 好：一眼知道含义
score = 86.5
name = "张三"`],
            ['p', 'Python 圈子的约定是「小写字母 + 下划线」，叫蛇形命名法（snake_case）。'],
            ['h', '变量可以反复使用'],
            ['code', 'python', `count = 1
count = count + 1     # 取出旧值 1，加 1，再放回去
print(count)          # 输出 2`],
            ['tip', 'count = count + 1 可以简写成 count += 1，后面循环里会天天用到。'],
            ['h', '变量的类型是自动的'],
            ['p', 'Python 不需要你声明"这是整数还是文字"，它自己看值就知道。这叫动态类型。'],
            ['code', 'python', `x = 10          # 现在是整数
x = "十"        # 现在变成字符串了，完全合法
print(type(x))  # <class 'str'>  type() 用来查看类型`],
          ],
          exercise: {
            task: '定义三个变量：商品名称、单价、数量。计算总价并输出成「蓝牙耳机 共 2 件，总价 598 元」。',
            hint: '用 print 一次输出多个值，逗号隔开；总价用 单价 * 数量。',
            starter: `name = "蓝牙耳机"
price = 299
qty = 2
# 补全下面这行
`,
            answer: `name = "蓝牙耳机"
price = 299
qty = 2
print(name, "共", qty, "件，总价", price * qty, "元")`,
            note: 'print 用逗号分隔多个值时，会自动在中间插入空格，正好符合中文习惯。',
          },
          quiz: [
            {
              q: '下面哪个变量名是合法的？',
              options: ['2price', 'my price', 'my_price', 'class'],
              answer: 2,
              explain: '2price 数字开头；my price 有空格；class 是保留字。只有 my_price 合法。',
            },
          ],
        },
        {
          id: 'py-03',
          no: 3,
          title: '数据类型：数字、字符串、布尔',
          minutes: 10,
          level: '入门',
          objectives: ['区分 int / float / str / bool', '会用 f-string 拼接文字', '知道 + 在两个字符串之间的含义'],
          summary: '四种最基本的类型：整数 int、小数 float、文字 str、真假 bool。f-string 是最推荐的拼接方式。',
          blocks: [
            ['p', '数据分很多种"类型"。类型决定了这个数据能做什么操作。'],
            ['kv', [
              ['int 整数', '10、-3、0，没有小数点'],
              ['float 浮点数', '3.14、-0.5、1.0，带小数点'],
              ['str 字符串', '"你好"、"2026-10-26"，用引号包起来的都是'],
              ['bool 布尔值', '只有 True 和 False 两个值'],
            ]],
            ['h', '字符串：三种引号都能用'],
            ['code', 'python', `a = "双引号"
b = '单引号'        # 效果一样
c = """三引号可以
跨很多行"""`],
            ['p', '常用技巧：引号里面还要用引号时，内外换着用。'],
            ['code', 'python', `msg = '他说"这本书不错"'`],
            ['h', 'f-string：拼接字符串的最佳方式'],
            ['p', '要在文字里插入变量值，最推荐 f-string：在引号前加个 f，变量用花括号 {} 包起来。'],
            ['code', 'python', `city = "北京"
temp = 26.5
print(f"{city} 今天 {temp} ℃")     # 北京 今天 26.5 ℃`],
            ['p', '对比一下老写法，你就知道 f-string 好在哪：'],
            ['code', 'python', `# 老写法：容易漏空格、搞错顺序
print(city + " 今天 " + str(temp) + " ℃")

# f-string：所见即所得
print(f"{city} 今天 {temp} ℃")`],
            ['h', 'f-string 还能格式化小数位'],
            ['code', 'python', `rate = 0.6666666
print(f"完成率 {rate:.2%}")     # 完成率 66.67%
print(f"单价 {299:.2f} 元")     # 单价 299.00 元`],
            ['warn', '数字和字符串不能直接相加：10 + "个" 会报 TypeError。要么先把数字转成字符串 str(10) + "个"，要么用 f-string。'],
            ['h', '布尔值：判断的结果'],
            ['code', 'python', `print(3 > 2)        # True
print(1 == 2)       # False，注意 == 是比较，= 是赋值
print(True and False)  # False`],
            ['note', 'bool 看起来简单，但它是程序中所有"分支"的源头 —— 下一章的条件判断全靠它。'],
          ],
          exercise: {
            task: '给定书名 name，价格 value=38.2，预算 limit_=42。用 f-string 输出一行：「Python 入门：38.2 元（预算 42），预算内」。',
            hint: '结论可以先写死 "预算内"；判断逻辑下节课就学。',
            starter: `name = "Python 入门"
value = 38.2
limit_ = 42
# 用 f-string 输出
`,
            answer: `name = "Python 入门"
value = 38.2
limit_ = 42
print(f"{name}：{value} 元（预算 {limit_}），预算内")`,
            note: '变量名末尾加下划线是常见约定，用来避开和关键字、内置名字冲突，比如 class_。',
          },
          quiz: [
            {
              q: 'print(f"{1 + 1}") 输出什么？',
              options: ['1 + 1', '2', '{1 + 1}', '报错'],
              answer: 1,
              explain: 'f-string 里的花括号是"表达式占位符"，Python 会真的去计算它，所以输出 2。',
            },
            {
              q: '9 / 3 的结果是什么类型？',
              options: ['int', 'float', 'str', 'bool'],
              answer: 1,
              explain: 'Python 的 / 除法永远得到 float，结果是 3.0。想要整数商要用 //，也就是 9 // 3 得 3。这是个经典坑。',
            },
          ],
        },
      ],
    },

    /* ================= 第 2 章 ================= */
    {
      id: 'py-c2',
      no: 2,
      title: '让程序会思考',
      desc: '输入、判断、循环 —— 有了这三样，程序才算"活"了。',
      lessons: [
        {
          id: 'py-04',
          no: 4,
          title: '输入与类型转换',
          minutes: 9,
          level: '入门',
          objectives: ['用 input() 接收输入', '理解 input 拿到的永远是字符串', '掌握 int() / float() 转换'],
          summary: 'input() 暂停程序等用户输入，返回值一定是字符串；要做计算必须先 int() 或 float() 转换。',
          blocks: [
            ['p', '前面的程序都是写死的。要让程序"问"用户，用 input()。'],
            ['code', 'python', `name = input("请输入商品名称：")
print("收到：" + name)`],
            ['p', '程序运行到 input 会停下来，等你在下方输入框里输入并回车。'],
            ['warn', 'input() 拿回来的**永远是字符串**。即使你输入 100，类型也是 str。'],
            ['code', 'python', `age = input("年龄：")
print(type(age))     # <class 'str'>，不是 int！`],
            ['h', '类型转换：str / int / float'],
            ['p', '要参与数学计算，必须先"转"过来。'],
            ['code', 'python', `n = int(input("请输入数量："))       # 转整数
p = float(input("请输入单价："))     # 转小数
total = n * p
print(f"总价 {total:.2f} 元")`],
            ['kv', [
              ['int("12")', '字符串 → 整数，得到 12'],
              ['float("3.14")', '字符串 → 小数，得到 3.14'],
              ['str(128)', '整数 → 字符串，得到 "128"'],
              ['int(3.9)', '小数 → 整数，**直接砍掉小数**得 3，不是四舍五入'],
            ]],
            ['tip', '想四舍五入用 round(3.9) 得 4；想保留两位小数用 round(3.14159, 2) 得 3.14。'],
            ['h', '一个常见的崩溃点'],
            ['code', 'python', `age = int(input("年龄："))   # 如果这时输入"十八"而不是 18
# ValueError: invalid syntax for integer: '十八'`],
            ['p', '用户输入的格式永远不可信。这个坑会用 try / except 来兜住，第 13 节讲。'],
            ['note', '在「练习台」里运行带 input() 的代码时，App 会自动弹出输入框，你把要输入的内容按行填进去即可。'],
          ],
          exercise: {
            task: '写一个程序：问用户商品名称和购买数量，然后输出「XX 需要买 N 件」。',
            hint: '第一个用普通 input()，第二个要参与运算或直接用，按需求决定要不要转换。',
            starter: `name = input("商品名称：")
qty = input("数量：")
# 输出一句话
`,
            answer: `name = input("商品名称：")
qty = input("数量：")
print(f"{name} 需要买 {qty} 件")`,
            note: '这里 qty 不需要参与计算，所以不用转 int，直接用在 f-string 里就行。这就是"按需转换"。',
          },
          quiz: [
            {
              q: 'a = input("数字：") 输入 5 后，type(a) 是什么？',
              options: ["<class 'int'>", "<class 'str'>", "<class 'float'>", '<class NoneType>'],
              answer: 1,
              explain: 'input 永远返回字符串。所以 5 + 3 会变成 "5" + 3，直接报 TypeError。必须先 int(a)。',
            },
          ],
        },
        {
          id: 'py-05',
          no: 5,
          title: '条件判断 if / elif / else',
          minutes: 11,
          level: '入门',
          objectives: ['写出 if / elif / else 分支', '掌握比较运算符与 and/or/not', '理解冒号与缩进的作用'],
          summary: 'if 条件为真就执行缩进的代码块；elif 处理多种情况；缩进在 Python 里是语法，不是排版。',
          blocks: [
            ['p', '程序要"做决定"，靠的就是 if。'],
            ['code', 'python', `score = 78
pass_line = 60

if score >= pass_line:
    print("及格")
else:
    print("不及格")`],
            ['warn', '两个硬性规定：条件后面必须有冒号 :，下面必须缩进（4 个空格）。缩进在 Python 里是语法，缩错就报 IndentationError。'],
            ['h', '多种情况：elif'],
            ['p', 'elif 是 else if 的缩写，用来处理"还有其他可能"。它从上往下依次判断，命中一个就跳过后面所有分支。'],
            ['code', 'python', `status = "已发货"

if status == "待付款":
    print("等待买家付款")
elif status == "已发货":
    print("包裹在路上")
elif status == "已完成":
    print("交易完成")
else:
    print("状态未知，需要核查")`],
            ['note', '顺序很重要：elif 判断是从上到下的。如果把最宽的条件放最前面，后面的分支永远不会被执行 —— 这叫"死代码"。'],
            ['h', '比较与逻辑运算符'],
            ['kv', [
              ['==', '等于（两个等号！一个等号是赋值）'],
              ['!=', '不等于'],
              ['> < >= <=', '大小比较'],
              ['and', '并且，两边都为真才为真'],
              ['or', '或者，有一个为真就为真'],
              ['not', '取反'],
            ]],
            ['code', 'python', `temp = 26.5
humidity = 45

if 20 <= temp <= 28 and humidity < 60:
    print("体感舒适")

is_valid = temp > 0 and not (humidity > 90)
print(is_valid)`],
            ['h', '配合 in 判断包含'],
            ['code', 'python', `city = "北京"

if city in ["北京", "上海", "广州"]:
    print("这是一线城市")`],
            ['tip', '注意 Python 用 True / False（首字母大写），写 true / false 会报 NameError。'],
          ],
          exercise: {
            task: '给定温度 temp 和湿度 humidity：温度在 15~28 之间且湿度在 30~70 之间算「适合出门」，否则「不太适合」。写 if 判断并输出。',
            hint: '用 and 把两个条件连起来，区间判断可以写成 15 <= temp <= 28。',
            starter: `temp = 26.5
humidity = 45
# 补全判断
`,
            answer: `temp = 26.5
humidity = 45

if 15 <= temp <= 28 and 30 <= humidity <= 70:
    print("适合出门")
else:
    print("不太适合")`,
            note: 'Python 支持链式比较 15 <= temp <= 28，比写成 temp >= 15 and temp <= 28 更接近数学习惯。',
          },
          quiz: [
            {
              q: '下面哪段写法是对的？',
              options: [
                'if x > 5 print("大")',
                'if x > 5: print("大")',
                'if (x > 5) { print("大") }',
                'if x > 5 then print("大")',
              ],
              answer: 1,
              explain: 'Python 用冒号 + 缩进表示代码块，不用花括号也不用 then。选项 1 少了冒号。',
            },
          ],
        },
        {
          id: 'py-06',
          no: 6,
          title: '循环：for 与 while',
          minutes: 12,
          level: '入门',
          objectives: ['用 for 遍历列表和 range', '用 while 做条件循环', '知道该选哪一个'],
          summary: 'for 用于"对每个元素做一遍"；while 用于"满足条件就一直做"。能确定次数就优先用 for。',
          blocks: [
            ['p', '重复劳动交给循环。Python 有两种循环：for 和 while。'],
            ['h', 'for：对一批数据逐个处理'],
            ['code', 'python', `fruits = ["苹果", "香蕉", "橙子"]

for name in fruits:
    print(f"我喜欢吃：{name}")`],
            ['p', '读法：从 fruits 里逐个取出元素，每次赋给 name，然后执行缩进里的代码。'],
            ['h', 'range()：生成一串数字'],
            ['code', 'python', `for i in range(5):        # 0 1 2 3 4
    print(i)

for i in range(1, 6):     # 1 2 3 4 5，左闭右开
    print(i)

for i in range(1, 10, 2): # 1 3 5 7 9，步长 2
    print(i)`],
            ['warn', 'range(1, 6) 不包含 6。这个"含头不含尾"的规则在 Python 里到处都有（切片也一样），一定要记牢。'],
            ['h', 'while：条件为真就一直转'],
            ['code', 'python', `count = 0
while count < 3:
    print(f"第 {count + 1} 次打卡")
    count += 1        # 忘了这行就是死循环！`],
            ['warn', 'while 循环里必须有一行能改变条件，否则程序会卡死。这是新手最容易犯的错。'],
            ['h', '怎么选？'],
            ['kv', [
              ['for', '知道要循环多少次，或者要遍历一批数据 → 首选'],
              ['while', '"只要…就一直做"，次数事先不确定（如等水烧开） → 用 while'],
            ]],
            ['h', '带下标的遍历：enumerate'],
            ['code', 'python', `items = ["语文", "数学", "英语"]

for idx, name in enumerate(items, start=1):
    print(f"{idx}. {name}")`],
            ['tip', 'enumerate 比 range(len(items)) 更 Pythonic，能少写很多方括号。'],
          ],
          exercise: {
            task: '给定成绩列表 scores = [58, 72, 91, 45]，用 for 循环逐个输出，并统计及格（≥60）的个数。',
            hint: '循环外先 count = 0，循环里用 if 判断，满足就 count += 1。',
            starter: `scores = [58, 72, 91, 45]
count = 0
# 补全循环
`,
            answer: `scores = [58, 72, 91, 45]
count = 0

for s in scores:
    print(f"成绩 {s}")
    if s >= 60:
        count += 1

print(f"及格的有 {count} 个")`,
            note: '总共 4 个成绩，72 和 91 及格，所以输出 2。这种"边遍历边统计"是数据处理的基本模式。',
          },
          quiz: [
            {
              q: 'range(2, 8) 会产生哪些数字？',
              options: ['2,3,4,5,6,7,8', '2,3,4,5,6,7', '3,4,5,6,7,8', '2,4,6,8'],
              answer: 1,
              explain: '含头不含尾，所以包含 2 到 7，共 6 个数。',
            },
            {
              q: 'while 循环最危险的写法是？',
              options: ['循环里 print', '循环里改条件变量', '循环体里没有任何改变条件的语句', '循环里有 if'],
              answer: 2,
              explain: '条件永远为真就是死循环，程序会一直卡住（手机上表现为卡死）。',
            },
          ],
        },
        {
          id: 'py-07',
          no: 7,
          title: '循环控制：break、continue 与嵌套',
          minutes: 10,
          level: '入门',
          objectives: ['用 break 提前跳出循环', '用 continue 跳过本次', '理解 for-else 结构'],
          summary: 'break 直接结束整个循环；continue 只跳过这一次，继续下一次。循环里还能再套循环处理表格。',
          blocks: [
            ['p', '有时候循环要"提前收工"。break 和 continue 就是两个刹车。'],
            ['h', 'break：整个循环到此为止'],
            ['code', 'python', `scores = [58, 72, 48, 61]

for s in scores:
    if s >= 60:
        print(f"发现及格成绩 {s}，停止检查")
        break
    print(f"{s} 不及格")`],
            ['p', '输出顺序是：58 不及格 → 发现及格成绩 72，停止检查。后面的元素不再处理。'],
            ['h', 'continue：跳过这一个，继续下一个'],
            ['code', 'python', `for v in [0, 12, 38.2, -1]:
    if v <= 0:
        continue          # 无效值跳过，不参与统计
    print(f"有效值 {v}")`],
            ['h', 'for … else：一个很多人不知道的语法'],
            ['code', 'python', `for s in [58, 72, 48]:
    if s == 100:
        print("找到满分")
        break
else:
    # 只有循环"正常跑完"（没被 break 打断）才执行
    print("没有满分")`],
            ['note', 'else 在这里不是"否则"，而是"如果没被打断"。用在"查找不存在元素"这类场景特别顺手。'],
            ['h', '嵌套循环：处理表格数据'],
            ['p', '外层循环走行，内层循环走列 —— 这就是 Excel 表格的处理逻辑。'],
            ['code', 'python', `# 每个学生有 3 门成绩
students = [
    ("小林", [78, 85, 92]),
    ("小周", [66, 71, 80]),
]

for name, scores in students:
    total = 0
    for s in scores:
        total += s
    print(f"{name} 平均分 {total / len(scores):.2f}")`],
            ['tip', '嵌套超过 3 层就该重构了（用函数拆开）。看到 4 层嵌套的循环，基本可以判定代码需要重写。'],
          ],
          exercise: {
            task: '遍历成绩列表 [88, 0, 95, -1, 120, 60]，跳过所有小于等于 0 的值，遇到大于 100 的立即停止，最后输出处理过的有效成绩数量。',
            hint: 'continue 处理 <=0，break 处理 >100，用一个 count 变量累加。',
            starter: `scores = [88, 0, 95, -1, 120, 60]
count = 0
# 补全
`,
            answer: `scores = [88, 0, 95, -1, 120, 60]
count = 0

for s in scores:
    if s <= 0:
        continue
    if s > 100:
        print(f"遇到异常分数 {s}，中止")
        break
    count += 1
    print(f"有效成绩 {s}")

print(f"共处理有效成绩 {count} 个")`,
            note: '结果：88、95 被统计，120 触发 break，所以 count = 2。60 根本没被遍历到。',
          },
          quiz: [
            {
              q: 'break 和 continue 的区别是？',
              options: [
                'break 跳过本次，continue 结束循环',
                'break 结束整个循环，continue 跳过本次继续下一轮',
                '两个完全一样',
                'break 只能用在 while 里',
              ],
              answer: 1,
              explain: '记法：break = 打破整个循环，continue = 继续下一轮。',
            },
          ],
        },
      ],
    },

    /* ================= 第 3 章 ================= */
    {
      id: 'py-c3',
      no: 3,
      title: '装数据的容器',
      desc: '列表、字典、字符串操作 —— 真正开始处理"一批数据"。',
      lessons: [
        {
          id: 'py-08',
          no: 8,
          title: '列表 list：一排格子',
          minutes: 12,
          level: '入门',
          objectives: ['创建、索引、切片列表', '增删改查列表元素', '掌握 len/sum/sorted 等常用函数'],
          summary: '列表是有序可变的一串数据，用下标从 0 开始访问，支持切片取子集。',
          blocks: [
            ['p', '一个变量只能装一个值。要装一批数据，用列表。'],
            ['code', 'python', `prices = [299, 89, 159, 45]
names = ["蓝牙耳机", "笔记本", "台灯"]
mixed = ["A-001", 299, True]      # 可以混装，但不推荐`],
            ['h', '下标：从 0 开始数'],
            ['code', 'python', `names = ["苹果", "香蕉", "橙子"]

print(names[0])      # 苹果，第一个
print(names[2])      # 橙子，第三个
print(names[-1])     # 橙子，倒数第一个
print(names[-2])     # 香蕉`],
            ['warn', '访问不存在的下标会报 IndexError: list index out of range。有 3 个元素时，最大下标是 2，names[3] 就崩了。'],
            ['h', '切片：取一段'],
            ['code', 'python', `nums = [0, 1, 2, 3, 4, 5, 6]

print(nums[1:4])     # [1, 2, 3]  含头不含尾
print(nums[:3])      # [0, 1, 2]  从头开始
print(nums[4:])      # [4, 5, 6]  取到末尾
print(nums[::2])     # [0, 2, 4, 6] 步长 2
print(nums[::-1])    # [6, 5, 4, 3, 2, 1, 0] 反转`],
            ['tip', '切片超出范围不会报错！nums[1:100] 只会返回能取到的部分。这点和下标访问完全不同。'],
            ['h', '增删改'],
            ['code', 'python', `cart = ["耳机", "台灯"]

cart.append("水杯")        # 末尾追加 → ["耳机", "台灯", "水杯"]
cart.insert(1, "笔记本")   # 插到下标 1 → 耳机, 笔记本, 台灯, 水杯
cart.remove("台灯")        # 按值删除
last = cart.pop()          # 弹出末尾并返回
cart[0] = "蓝牙耳机"       # 按下标改
print(cart, last)`],
            ['h', '不改变原列表的常用函数'],
            ['code', 'python', `prices = [299, 89, 159]

print(len(prices))          # 3  长度
print(sum(prices))          # 547  求和
print(max(prices))          # 299  最大
print(min(prices))          # 89
print(sorted(prices))       # 返回从小到大排序的新列表`],
            ['warn', 'sort() 和 sorted() 不一样：prices.sort() 直接改原列表、返回 None；sorted(prices) 返回新列表、原列表不变。把 sort() 的返回值赋给变量是经典错误。'],
            ['code', 'python', `result = prices.sort()     # 错！result 是 None
result = sorted(prices)    # 对，result 是新列表`],
            ['h', '判断元素在不在'],
            ['code', 'python', `if "苹果" in names:
    print("找到了")

print(names.index("香蕉"))   # 返回下标，找不到会报 ValueError`],
          ],
          exercise: {
            task: '给定成绩列表 [58, 72, 91, 45, 88]，输出最高分、最低分、平均分，以及最高分所在的下标。',
            hint: '求和用 sum，长度用 len，最大下标用 index(max(...))。',
            starter: `scores = [58, 72, 91, 45, 88]
# 补全
`,
            answer: `scores = [58, 72, 91, 45, 88]

print(f"最高分 {max(scores)}")
print(f"最低分 {min(scores)}")
print(f"平均分 {sum(scores) / len(scores):.2f}")
print(f"最高分下标 {scores.index(max(scores))}")`,
            note: '平均分 = 总分 / 个数，这是最基础也最常用的统计操作。',
          },
          quiz: [
            {
              q: 'nums = [10, 20, 30, 40]，nums[-2] 是什么？',
              options: ['20', '30', '40', '报错'],
              answer: 1,
              explain: '负数下标从末尾倒着数，-1 是 40，-2 是 30。',
            },
            {
              q: '下面哪句会报错？',
              options: ['nums = [1,2,3]; nums[3:]', 'nums = [1,2,3]; nums[3]', 'nums = [1,2,3]; nums[0:3]', 'nums = [1,2,3]; nums[-1]'],
              answer: 1,
              explain: 'nums[3] 是下标访问，越界报 IndexError；而 nums[3:] 是切片，越界只是返回空列表 []，不报错。',
            },
          ],
        },
        {
          id: 'py-09',
          no: 9,
          title: '字典 dict：按名字取数据',
          minutes: 12,
          level: '入门',
          objectives: ['创建与访问字典', '安全访问 get()', '遍历字典的键值对'],
          summary: '字典是"键 → 值"的映射，用名字取值而不是位置。适合表示一条有多个字段的记录。',
          blocks: [
            ['p', '列表用位置取值。但如果一个商品有 8 个属性，用列表很难记哪个位置是什么。这时该用字典。'],
            ['code', 'python', `product = {
    "code": "A-001",
    "name": "蓝牙耳机",
    "brand": "SoundX",
    "price": 299,
    "status": "在售",
}

print(product["name"])      # 蓝牙耳机
print(product["price"])     # 299`],
            ['p', '这就是数据库里"一行记录"的样子：表里每一行，本质就是一个字典。'],
            ['h', '增删改'],
            ['code', 'python', `product["category"] = "数码配件"   # 键不存在就是新增
product["status"] = "缺货"              # 键已存在就是修改

del product["brand"]                    # 删除某个键

print(len(product))                     # 还剩几个键`],
            ['h', '安全取值：get()'],
            ['warn', '直接访问不存在的键会报 KeyError。这是字典最高频的崩溃原因。'],
            ['code', 'python', `# 危险写法
# print(product["maker"])   → KeyError

# 安全写法：取不到返回 None
print(product.get("maker"))

# 给个默认值
print(product.get("maker", "未知厂商"))`],
            ['tip', '从接口或 Excel 读来的数据，字段经常缺失。养成用 get() 的习惯能省掉一堆崩溃。'],
            ['h', '遍历字典'],
            ['code', 'python', `for key in product:
    print(key)                       # 只遍历键

for key, value in product.items():   # 键和值都要
    print(f"{key} = {value}")`],
            ['h', '字典列表：最常见的数据结构'],
            ['p', '真正处理数据时，几乎都是"一个列表，里面装一堆字典"。'],
            ['code', 'python', `products = [
    {"code": "A-001", "name": "蓝牙耳机", "price": 299, "status": "在售"},
    {"code": "A-002", "name": "机械键盘", "price": 459, "status": "缺货"},
    {"code": "A-003", "name": "显示器", "price": 1299, "status": "在售"},
]

total = 0
for p in products:
    if p["status"] == "在售":
        total += p["price"]
        print(f"{p['name']} 价格 {p['price']}")

print(f"在售商品总价 {total}")`],
            ['note', "注意 f-string 里嵌套引号的问题：外层用双引号，里层就用单引号 p['name']。反过来也行，但别两个都用双引号。"]  ,
            ['h', '键的要求'],
            ['ul', [
              '键必须是不可变的：字符串、数字、元组可以；列表不行',
              '键必须唯一，重复赋值会覆盖前一个',
              'Python 3.7 起字典会保持插入顺序',
            ]],
          ],
          exercise: {
            task: '用字典表示一条消费记录（分类、金额、预算、是否超支），然后输出格式化的报告行。',
            hint: '是否超支可以先写死，或者简单判断一下。',
            starter: `record = {
    "category": "餐饮",
    # 补全其余字段
}
`,
            answer: `record = {
    "category": "餐饮",
    "amount": 86.5,
    "budget": 100,
    "over": False,
}

print(f"[{record['category']}] 花费 {record['amount']} 元，预算 {record['budget']} 元，超支：{record['over']}")`,
            note: '试着把 amount 改成 120 再跑一次，观察输出。下一步可以自己加个 if 让结论自动判断。',
          },
          quiz: [
            {
              q: 'd = {"a": 1}，执行 print(d.get("b")) 会怎样？',
              options: ['报 KeyError', '输出 None', '输出 0', '输出空字符串'],
              answer: 1,
              explain: 'get() 键不存在时返回 None 而不是报错。如果写 d["b"] 就会报 KeyError。',
            },
          ],
        },
        {
          id: 'py-10',
          no: 10,
          title: '列表推导式与常用统计',
          minutes: 11,
          level: '进阶',
          objectives: ['用推导式一行完成筛选和转换', '掌握 sum/len/max 的配合', '会用 zip 并行遍历'],
          summary: '列表推导式把"循环 + 判断 + 追加"压缩成一行，是 Python 最标志性的写法。',
          blocks: [
            ['p', '先看老写法，再看新写法，你就理解列表推导式的价值了。'],
            ['code', 'python', `scores = [58, 72, 91, 45, 88]

# 老写法：四行
passed = []
for s in scores:
    if s >= 60:
        passed.append(s)

# 列表推导式：一行
passed = [s for s in scores if s >= 60]

print(passed)     # [72, 91, 88]`],
            ['p', '结构是：[对每个元素做什么 for 元素 in 数据 if 条件]。'],
            ['h', '带转换的推导式'],
            ['code', 'python', `raw = ["  A-001 ", "A-002  ", " A-003"]

clean = [s.strip() for s in raw]           # .strip() 去掉两端空格——下一节专门讲，这里先照着用
print(clean)     # ['A-001', 'A-002', 'A-003']

prices = ["299", "89"]
nums = [int(p) for p in prices]            # 批量转数字
print(nums)      # [299, 89]

squares = [n ** 2 for n in range(1, 6)]
print(squares)   # [1, 4, 9, 16, 25]`],
            ['h', '字典推导式'],
            ['code', 'python', `products = [
    {"code": "A-001", "price": 299},
    {"code": "A-003", "price": 1299},
]

# 商品编号 → 价格，快速查找
price_map = {p["code"]: p["price"] for p in products}
print(price_map["A-003"])     # 1299，O(1) 查找`],
            ['tip', '字典按 key 查找是"瞬间"的（哈希），列表要一个个比对。数据量大时差距明显。'],
            ['h', 'zip：两个列表并排走'],
            ['code', 'python', `items = ["语文", "数学", "英语"]
values = [78, 92, 85]

for name, v in zip(items, values):
    print(f"{name} = {v}")

# 合成字典
data = dict(zip(items, values))
print(data["英语"])     # 85`],
            ['warn', '推导式里不要塞太复杂的逻辑。如果需要超过一个 if + 一个 else，老老实实写循环更清楚。'],
            ['h', '和统计函数配合'],
            ['code', 'python', `scores = [58, 72, 91, 45, 88]

passed = [s for s in scores if s >= 60]
print(f"及格 {len(passed)} 个，平均 {sum(passed) / len(passed):.2f}")`],
          ],
          exercise: {
            task: '给定商品字典列表，用列表推导式取出所有"在售"商品的名称，并计算它们的总价。',
            hint: '先推导出 names 列表，再推导出 prices 列表用 sum() 相加。',
            starter: `products = [
    {"name": "蓝牙耳机", "price": 299, "status": "在售"},
    {"name": "机械键盘", "price": 459, "status": "缺货"},
    {"name": "显示器", "price": 1299, "status": "在售"},
]
# 补全
`,
            answer: `products = [
    {"name": "蓝牙耳机", "price": 299, "status": "在售"},
    {"name": "机械键盘", "price": 459, "status": "缺货"},
    {"name": "显示器", "price": 1299, "status": "在售"},
]

on_sale = [p for p in products if p["status"] == "在售"]
names = [p["name"] for p in on_sale]
total = sum(p["price"] for p in on_sale)

print(f"在售商品：{names}")
print(f"总价 {total} 元")`,
            note: 'sum() 里也可以直接写生成器表达式，省掉一对方括号，更省内存。',
          },
          quiz: [
            {
              q: '[x * 2 for x in [1, 2, 3]] 的结果是？',
              options: ['[1, 2, 3]', '[2, 4, 6]', '[1, 4, 9]', '报错'],
              answer: 1,
              explain: '对每个元素乘 2 再收集，得到 [2, 4, 6]。',
            },
          ],
        },
        {
          id: 'py-11',
          no: 11,
          title: '字符串进阶与文本处理',
          minutes: 12,
          level: '进阶',
          objectives: ['掌握 strip/split/replace/join', '判断与查找子串', '搞定从文本里提取数据'],
          summary: '文本处理是自动化的第一战场：切分、清洗、拼接、查找是四大基础操作。',
          blocks: [
            ['p', '工作中大量时间在跟文本打交道：日志、报表、订单导出、聊天记录。这节课把字符串工具备齐。'],
            ['h', '清洗：strip / replace'],
            ['code', 'python', `s = "  A-001 \\n"

print(s.strip())                  # "A-001"  去两端空白（含换行）
print(s.lstrip())                 # 只去左边
print(s.rstrip())                 # 只去右边

t = "2024/03/11"
print(t.replace("/", "-"))        # 2024-03-11`],
            ['h', '切分：split'],
            ['code', 'python', `line = "A-002,蓝牙耳机,299,2"

parts = line.split(",")
print(parts)          # ['A-002', '蓝牙耳机', '299', '2']
print(parts[0])       # A-002

# 按任意空白切（多个空格/制表符都能处理）
print("a   b\\tc".split())     # ['a', 'b', 'c']`],
            ['h', '拼接：join'],
            ['code', 'python', `items = ["A-001", "A-002", "A-003"]

print(", ".join(items))       # A-001, A-002, A-003
print("\\n".join(items))       # 每行一个

# 写成 CSV 一行
row = ["A-003", "机械键盘", "459"]
print(",".join(row))`],
            ['note', 'join 的调用方向容易记反：是"分隔符.join(列表)"，不是"列表.join(分隔符)"。'],
            ['h', '查找与判断'],
            ['code', 'python', `s = "A-001 蓝牙耳机"

print("A" in s)               # True
print(s.startswith("A"))      # True
print(s.endswith("耳机"))      # True
print(s.find("蓝牙"))          # 6  返回起始下标，找不到返回 -1
print(len(s))                 # 10`],
            ['warn', 'find() 找不到返回 -1，不是报错。所以判断"有没有"要用 in，别用 find。'],
            ['h', '大小写与数字判断'],
            ['code', 'python', `print("abc".upper())        # ABC
print("ABC".lower())        # abc
print("123".isdigit())      # True
print("12a".isdigit())      # False
print("  ".isspace())       # True`],
            ['h', '实战：解析一行订单文本'],
            ['code', 'python', `raw = "  A-002, 蓝牙耳机, 299, <= 300, 预算内  "

fields = [f.strip() for f in raw.split(",")]
code, item, value, budget, verdict = fields

print(f"编号: {code}")
print(f"商品: {item}")
print(f"价格: {float(value):.1f}")
print(f"判定: {verdict}")`],
            ['tip', '看到"拆分 + 去空格"，就该条件反射想起 [x.strip() for x in s.split(",")] 这个组合，它能解决 80% 的文本解析问题。'],
          ],
          exercise: {
            task: '给定多行文本（每行格式：编号,名称,价格），解析出所有商品，计算平均价格。',
            hint: '用 split("\\n") 分行，每行再 split(",")，转成 float 累加。',
            starter: `text = """A-001,蓝牙耳机,299
A-003,机械键盘,459
A-005,显示器,1299"""

# 补全
`,
            answer: `text = """A-001,蓝牙耳机,299
A-003,机械键盘,459
A-005,显示器,1299"""

prices = []
for line in text.strip().split("\\n"):
    fields = [f.strip() for f in line.split(",")]
    code, name, price = fields
    prices.append(float(price))
    print(f"{code} {name} {price} 元")

print(f"平均价格 {sum(prices) / len(prices):.2f} 元")`,
            note: 'text.strip() 先去掉首尾换行，避免 split("\\n") 产生空行。这种"防御性"处理是脚本健壮性的关键。',
          },
          quiz: [
            {
              q: '"a,b,c".split(",") 的结果是？',
              options: ["'abc'", "['a', 'b', 'c']", "['a,b,c']", '报错'],
              answer: 1,
              explain: 'split 按分隔符切开，返回字符串列表。注意结果是列表，不是字符串。',
            },
          ],
        },
      ],
    },

    /* ================= 第 4 章 ================= */
    {
      id: 'py-c4',
      no: 4,
      title: '把代码变成工具',
      desc: '函数、异常、文件、模块、类 —— 从"写脚本"到"写工具"。',
      lessons: [
        {
          id: 'py-12',
          no: 12,
          title: '函数：把逻辑打包',
          minutes: 14,
          level: '进阶',
          objectives: ['定义与调用函数', '参数、默认值、返回值', '理解作用域'],
          summary: '函数把一段逻辑包起来并起个名字，可以反复调用。带默认值的参数让调用更省事。',
          blocks: [
            ['p', '同一个逻辑写第三遍的时候，就该把它变成函数了。'],
            ['code', 'python', `def order_total(price, count):
    """计算一笔订单的总价"""
    return price * count

print(order_total(299, 2))     # 598
print(order_total(89, 3))      # 267`],
            ['h', '拆开看每个部分'],
            ['ul', [
              'def —— 声明"我要定义一个函数"',
              'order_total —— 函数名，命名用动词+名词，见名知意',
              '括号里的 price, count —— 参数，调用时传进来的值',
              '"""...""" —— 文档字符串，说明这个函数干什么',
              'return —— 把结果交出去，同时结束函数',
              '冒号 + 缩进 —— 和 if / for 一样，缩进里就是函数体',
            ]],
            ['h', '返回值：一个还是多个'],
            ['code', 'python', `# 没有 return 就返回 None
def greet(name):
    print(f"你好 {name}")

x = greet("小林")     # 会打印，但 x 是 None
print(x)              # None


# return 多个值，实际是返回元组
def stats(values):
    return min(values), max(values), sum(values) / len(values)

low, high, avg = stats([299, 89, 159])
print(f"最低 {low} 最高 {high} 平均 {avg:.2f}")`],
            ['h', '默认值参数'],
            ['code', 'python', `def order_total(price, count, unit="元"):
    return f"{price * count} {unit}"

print(order_total(299, 2))                  # 用默认单位
print(order_total(89, 3, "人民币"))          # 覆盖单位`],
            ['warn', '带默认值的参数必须放在不带默认值的后面。def f(a=1, b) 会报 SyntaxError。'],
            ['h', '关键字参数：让调用看得懂'],
            ['code', 'python', `# 位置参数：得记住顺序
order_total(89, 3, "人民币")

# 关键字参数：一眼看懂
order_total(price=89, count=3, unit="人民币")`],
            ['h', '作用域：函数里的变量外面看不见'],
            ['code', 'python', `def calc():
    inner = 100       # 局部变量，函数外访问不到
    return inner

calc()
# print(inner)      → NameError`],
            ['note', '函数应该"一件事一个函数"。如果一个函数超过 30 行、或者需要写"并且"来描述它做什么，就该拆了。'],
          ],
          exercise: {
            task: '写一个函数 parse_line(line)，把 "A-001,蓝牙耳机,299,2" 这样的文本解析成字典返回。再调用它处理两行数据。',
            hint: '函数内 split(",") 后解包赋值，组装成字典 return。',
            starter: `def parse_line(line):
    # 补全
    pass

print(parse_line("A-001,蓝牙耳机,299,2"))
`,
            answer: `def parse_line(line):
    """把一行 CSV 文本解析成字典"""
    order_id, name, price, qty = [f.strip() for f in line.split(",")]
    return {
        "order_id": order_id,
        "name": name,
        "price": float(price),
        "qty": int(qty),
    }

r = parse_line("A-001,蓝牙耳机,299,2")
print(r)
print(f"{r['name']} 单价 {r['price']}，共 {r['qty']} 件")`,
            note: 'pass 是"占位符"，表示这里先什么都不做，避免语法错误。写函数骨架时常用。',
          },
          quiz: [
            {
              q: 'def f(x): print(x) 这个函数调用后返回什么？',
              options: ['打印的内容', 'None', '0', '报错'],
              answer: 1,
              explain: '没有 return 的函数返回 None。print 只是"显示"，不是"返回"，这两件事经常被新手混淆。',
            },
          ],
        },
        {
          id: 'py-13',
          no: 13,
          title: '异常处理：让程序不崩',
          minutes: 11,
          level: '进阶',
          objectives: ['用 try/except 兜住错误', '捕获特定异常类型', '知道什么时候不该用'],
          summary: 'try 里放可能出错的代码，except 里放出错后的处理。要捕获具体异常，别一把抓 Exception。',
          blocks: [
            ['p', '前面的程序只要输入不合规范就崩。真实工具不能这样。'],
            ['code', 'python', `try:
    n = int(input("请输入购买数量："))
    print(f"总价 {n * 299} 元")
except ValueError:
    print("输入的不是数字，请重新输入")`],
            ['p', '流程：try 里的代码一旦抛异常，立刻跳到 except，后面的 try 代码不再执行。'],
            ['h', '常见异常类型'],
            ['kv', [
              ['ValueError', '值不对，如 int("abc")'],
              ['TypeError', '类型不对，如 "a" + 1'],
              ['KeyError', '字典里没这个键'],
              ['IndexError', '列表下标越界'],
              ['ZeroDivisionError', '除以 0'],
              ['FileNotFoundError', '文件不存在'],
            ]],
            ['h', '捕获多种异常'],
            ['code', 'python', `try:
    count = int(input("要处理几条订单？"))
    print("好的，", count, "条订单待处理")
except ValueError:
    print("你输入的不是整数，程序没崩，被 except 兜住了")`],
            ['h', '拿到错误信息'],
            ['code', 'python', `try:
    n = int("abc")
except ValueError as e:
    print(f"转换失败：{e}")     # invalid literal for int() with base 10: 'abc'`],
            ['h', 'finally：无论成败都执行'],
            ['code', 'python', `f = None
try:
    f = open("data.txt")
    data = f.read()
except FileNotFoundError:
    print("文件没找到")
finally:
    if f:
        f.close()      # 保证一定会关闭
    print("处理结束")`],
            ['warn', '不要写 except: pass 或者 except Exception: pass —— 这是把错误藏起来。程序看起来不崩了，但结果可能是错的，问题会在更晚的时候以更难查的方式爆发。'],
            ['tip', '写 except 时先问自己："我到底预期哪一种错误？"能回答这个问题，就知道该捕获哪个具体异常。'],
            ['h', '主动抛异常'],
            ['code', 'python', `def average(values):
    if not values:
        raise ValueError("列表不能为空")
    return sum(values) / len(values)

try:
    average([])
except ValueError as e:
    print(f"参数错误：{e}")`],
          ],
          exercise: {
            task: '写一个安全转数字的函数 to_float(s, default=0.0)：转换成功返回值，失败返回默认值，绝不崩。',
            hint: 'try 里 return float(s)，except ValueError 里 return default。',
            starter: `def to_float(s, default=0.0):
    # 补全
    pass

print(to_float("299.9"))
print(to_float("abc"))        # 应该返回 0.0
print(to_float("abc", -1))    # 应该返回 -1
`,
            answer: `def to_float(s, default=0.0):
    """安全地把字符串转成小数，失败返回默认值"""
    try:
        return float(s)
    except (ValueError, TypeError):
        return default

print(to_float("299.9"))       # 299.9
print(to_float("abc"))         # 0.0
print(to_float("abc", -1))     # -1
print(to_float(None))          # 0.0`,
            note: '这种"安全转换"函数在真实项目里非常常见。处理外部数据时，每一步都要假设数据是脏的。',
          },
          quiz: [
            {
              q: 'try 块里第 3 行抛异常了，try 里第 4、5 行会怎样？',
              options: ['继续执行', '跳过不执行，直接进 except', '整个程序退出', '重新从第 1 行开始'],
              answer: 1,
              explain: '异常发生后，try 块剩余代码被跳过，控制权交给 except。',
            },
          ],
        },
        {
          id: 'py-14',
          no: 14,
          title: '文件读写与 with',
          minutes: 12,
          level: '进阶',
          objectives: ['用 with open 读写文本文件', '理解编码 utf-8 的重要性', '处理逐行读取'],
          summary: 'with open(...) as f 是标准写法，自动关文件。中文务必指定 encoding="utf-8"。',
          blocks: [
            ['p', '自动化的核心往往是"读文件 → 处理 → 写文件"。'],
            ['h', '写文件'],
            ['code', 'python', `with open("结果.txt", "w", encoding="utf-8") as f:
    f.write("商品,销量\\n")
    f.write("蓝牙耳机,120\\n")`],
            ['h', '读文件'],
            ['code', 'python', `with open("结果.txt", "r", encoding="utf-8") as f:
    content = f.read()          # 一次性读全部
    print(content)`],
            ['warn', '不写 encoding="utf-8" 时，Windows 上默认用 GBK。中文会出现乱码，或者直接抛 UnicodeDecodeError。这个坑必须绕开。'],
            ['h', '四种打开模式'],
            ['kv', [
              ['"r"', '只读，文件必须存在（默认）'],
              ['"w"', '写入，**会清空原内容**，文件不存在则创建'],
              ['"a"', '追加，在末尾接着写，不覆盖'],
              ['"r+"', '读写都要，用得较少'],
            ]],
            ['warn', '"w" 模式是清空重写！想保留原内容要加内容时用 "a"。用 "w" 覆盖了重要文件，是新手最惨的翻车之一。'],
            ['h', '逐行读：处理大文件的标准姿势'],
            ['code', 'python', `with open("data.csv", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue              # 跳过空行
        fields = line.split(",")
        print(fields)`],
            ['tip', '逐行读不会把整个文件塞进内存。处理几十 MB 的日志时，这是唯一可行的方式。'],
            ['h', '检查文件是否存在'],
            ['code', 'python', `import os    # import 是下一节的主角，这里先照着写，感受"用模块干活"

if os.path.exists("结果.txt"):
    print("文件存在")
else:
    print("文件不存在")`],
            ['h', '完整例子：CSV 数据清洗'],
            ['code', 'python', `# 假设源文件每行是：商品编号,商品名称,单价（价格可能带空格或为空）
cleaned = []

with open("源数据.csv", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if i == 0:
            continue                      # 跳过表头
        parts = [p.strip() for p in line.strip().split(",")]
        if len(parts) < 3:
            continue                      # 字段不全，跳过
        code, name, price = parts
        try:
            price = float(price)
        except ValueError:
            price = 0.0                   # 价格异常按 0 处理
        cleaned.append((code, name, price))

with open("清洗结果.csv", "w", encoding="utf-8") as f:
    f.write("商品编号,商品名称,单价\\n")
    for code, name, price in cleaned:
        f.write(f"{code},{name},{price:.2f}\\n")

print(f"处理完成，共 {len(cleaned)} 条")`],
            ['note', '这段 20 行的脚本，就是"批处理"的本质。理解了它，你已经能写出解决真实工作问题的工具了。'],
          ],
          exercise: {
            task: '把一段文本写入 result.txt，然后读回来按行打印，最后统计行数（不含空行）。',
            hint: '先用 "w" 写，再用 "r" 读，循环里判断 line.strip() 非空才计数。',
            starter: `text = """A-001,已发货

A-002,待付款
A-003,已发货"""

# 1. 写入文件  2. 读回来按行打印  3. 统计非空行数
`,
            answer: `text = """A-001,已发货

A-002,待付款
A-003,已发货"""

with open("result.txt", "w", encoding="utf-8") as f:
    f.write(text)

count = 0
with open("result.txt", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        count += 1
        print(f"{count}. {line}")

print(f"共 {count} 行有效数据")`,
            note: '练习台里的文件写在内存虚拟文件系统中，重启后会清空。这只影响练习，不影响你理解概念。',
          },
          quiz: [
            {
              q: 'open("a.txt", "w") 对已存在的文件做什么？',
              options: ['什么都不做', '在末尾追加', '清空原有内容', '报错'],
              answer: 2,
              explain: '"w" 会截断文件（清空）。要追加必须用 "a"。这个区别一旦搞错，损失的是真实数据。',
            },
          ],
        },
        {
          id: 'py-15',
          no: 15,
          title: '模块与第三方库',
          minutes: 10,
          level: '进阶',
          objectives: ['import 标准库', '理解 pip 安装第三方库', '会用 datetime 和 json'],
          summary: 'Python 的强大来自生态。标准库直接 import，第三方库要先 pip install。',
          blocks: [
            ['p', '不用从头造轮子。Python 自带 200 多个标准库，社区还有 50 万个第三方库。'],
            ['h', '三种 import 写法'],
            ['code', 'python', `import math                     # 用的时候 math.sqrt(16)
from math import sqrt, pi       # 直接用 sqrt(16)
from math import sqrt as s      # 起个别名

import os.path                  # 模块下的子模块`],
            ['h', 'datetime：处理日期时间'],
            ['code', 'python', `from datetime import datetime, timedelta

now = datetime.now()
print(now.strftime("%Y-%m-%d %H:%M:%S"))     # 2026-09-14 12:30:00

# 字符串 → 日期
d = datetime.strptime("2024-03-11", "%Y-%m-%d")

# 日期计算：加 90 天（会员有效期）
next_renew = d + timedelta(days=90)
print(next_renew.strftime("%Y-%m-%d"))         # 2024-06-09

# 算间隔天数
diff = datetime(2024, 9, 1) - d
print(diff.days)                             # 174`],
            ['tip', 'strftime 是"日期 → 字符串"，strptime 是"字符串 → 日期"（p 可以记成 parse）。方向别搞反。'],
            ['h', 'json：和接口、配置文件打交道'],
            ['code', 'python', `import json

data = {
    "order_id": "A-001",
    "items": ["蓝牙耳机", "数据线"],
    "total": 358,
}

# 字典 → JSON 文本
text = json.dumps(data, ensure_ascii=False, indent=2)
print(text)

# JSON 文本 → 字典
back = json.loads(text)
print(back["items"][0])`],
            ['warn', 'json.dumps 默认会把中文转成 \\uXXXX 转义。加 ensure_ascii=False 才能输出可读中文。'],
            ['h', 'os / pathlib：文件路径操作'],
            ['code', 'python', `from pathlib import Path

p = Path("data/销售记录.csv")
print(p.name)        # 销售记录.csv
print(p.suffix)      # .csv
print(p.parent)      # data

# 遍历目录下所有 txt
for f in Path("data").glob("*.txt"):
    print(f.name)`],
            ['h', '第三方库：必须先装'],
            ['code', 'bash', `# 在电脑上、命令行里执行（不是 Python 里）
pip install pandas openpyxl requests rich`],
            ['kv', [
              ['pandas', '表格数据处理（Excel/CSV 的瑞士军刀）'],
              ['openpyxl', '读写 Excel .xlsx 文件'],
              ['requests', '发 HTTP 请求、调接口'],
              ['rich', '终端里输出彩色表格、进度条'],
              ['python-docx', '读写 Word 文档'],
            ]],
            ['note', '数据库不用装：Python 标准库自带 sqlite3，直接 import 就能读写 .db 文件（详见 SQLite 路线第 15、17 节）。'],
            ['warn', '手机练习台（网页版 Python）里，pandas / openpyxl 这类库体积太大，可能装不上或很慢，标准库基本都能用。真实项目请在电脑上跑。'],
            ['h', '看一个真实的小工具骨架'],
            ['code', 'python', `from pathlib import Path
from datetime import datetime
import json

def scan_folder(folder):
    """扫描目录，汇总文件信息"""
    result = []
    for f in Path(folder).glob("*"):
        if f.is_file():
            result.append({
                "name": f.name,
                "size_kb": round(f.stat().st_size / 1024, 1),
                "mtime": datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d"),
            })
    return result

# print(json.dumps(scan_folder("."), ensure_ascii=False, indent=2))`],
            ['note', '看到没？15 行代码，一个"目录清点工具"就成了。这就是 Python 在办公自动化里的威力。'],
          ],
          exercise: {
            task: '用 datetime 计算：从今天起 30 天后是几号？再算一下 2026-01-01 到今天过了多少天。',
            hint: 'timedelta(days=30) 加；两个 datetime 相减得到 timedelta，取 .days。',
            starter: `from datetime import datetime, timedelta
# 补全
`,
            answer: `from datetime import datetime, timedelta

today = datetime.now()
print(f"今天：{today.strftime('%Y-%m-%d')}")

future = today + timedelta(days=30)
print(f"30 天后：{future.strftime('%Y-%m-%d')}")

start = datetime(2026, 1, 1)
print(f"已过去 {(today - start).days} 天")`,
            note: '会员到期、活动截止、报表时效检查，本质都是这种日期运算。',
          },
          quiz: [
            {
              q: '"2024-03-11" 这样的文本要变成可计算的日期，用哪个？',
              options: ['strftime', 'strptime', 'timedelta', 'datetime.now'],
              answer: 1,
              explain: 'strptime = string parse time，把字符串解析成 datetime 对象。strftime 是反过来格式化输出。',
            },
          ],
        },
        {
          id: 'py-16',
          no: 16,
          title: '面向对象：类与对象',
          minutes: 14,
          level: '进阶',
          objectives: ['理解类与实例的关系', '写 __init__ 初始化方法', '让对象自带方法'],
          summary: '类是一个"模板"，对象是按模板造出来的实例。数据和行为打包在一起。',
          blocks: [
            ['p', '前面用字典表示商品，但字典没法"自带行为"。类可以把数据和操作绑在一起。'],
            ['code', 'python', `class Product:
    """商品"""

    def __init__(self, sku, name, price):
        self.sku = sku           # 每个对象自己的数据
        self.name = name
        self.price = price

    def label(self):
        """返回显示用的标签"""
        return f"[{self.sku}] {self.name}"

    def is_expensive(self, threshold=500):
        return self.price > threshold

p1 = Product("A-001", "蓝牙耳机", 299)
p2 = Product("A-006", "数据线", 39)

print(p1.label())                # [A-001] 蓝牙耳机
print(p1.is_expensive())         # False
print(p2.is_expensive())         # False`],
            ['h', '三个关键概念'],
            ['kv', [
              ['class', '类，是模板 / 图纸'],
              ['对象（实例）', '按模板造出来的具体东西，p1 和 p2 是两个不同对象'],
              ['self', '指向"当前这个对象"，所有方法第一个参数都得是它'],
            ]],
            ['warn', '方法定义时第一个参数 self 不能省。调用时却不用传 p1.label()，Python 会自动把 p1 塞给 self。'],
            ['h', '__init__ 是"造对象时自动执行的"""'],
            ['code', 'python', `class Counter:
    def __init__(self, start=0):
        self.count = start       # 初始化时就会执行

    def inc(self):
        self.count += 1

c = Counter(10)
c.inc()
c.inc()
print(c.count)                   # 12`],
            ['h', '类属性 vs 实例属性'],
            ['code', 'python', `class Product:
    category = "在售商品"        # 类属性：所有实例共享

    def __init__(self, name):
        self.name = name         # 实例属性：每个对象独有

a = Product("蓝牙耳机")
b = Product("数据线")

print(a.category)     # 在售商品
print(b.category)     # 在售商品
print(a.name, b.name) # 蓝牙耳机 数据线`],
            ['h', '继承：复用已有类的行为'],
            ['code', 'python', `class Product:
    def __init__(self, sku, name, price):
        self.sku = sku
        self.name = name
        self.price = price

    def describe(self):
        return f"{self.sku} - {self.name}"


class DiscountedProduct(Product):        # 继承 Product
    def __init__(self, sku, name, price, discount):
        super().__init__(sku, name, price)   # 先调用父类的初始化
        self.discount = discount             # 再补自己的字段

    def final_price(self):
        return self.price * self.discount


d = DiscountedProduct("A-001", "蓝牙耳机", 299, 0.8)
print(d.describe())                          # 继承来的方法，直接能用
print(d.final_price())                       # 239.2`],
            ['tip', '什么时候该用类？当你有"一堆数据 + 一组专门操作这些数据的函数"，且它们反复成对出现时。否则字典 + 函数就够了，别为了用类而用类。'],
            ['warn', '初学者常见误区：给每个小功能都建一个类。真实工程里，简单的数据用字典/元组，需要行为才上类。'],
          ],
          exercise: {
            task: '写一个 Order 类：字段有 product_name、price、qty；方法 total() 返回总价；方法 report() 返回一行格式化文本。',
            hint: 'total 里返回 price * qty；report 用 f-string 把商品名、数量、总价拼起来。',
            starter: `class Order:
    def __init__(self, product_name, price, qty):
        # 补全
        pass

    def total(self):
        pass

    def report(self):
        pass

o = Order("蓝牙耳机", 299, 2)
print(o.report())
`,
            answer: `class Order:
    def __init__(self, product_name, price, qty):
        self.product_name = product_name
        self.price = price
        self.qty = qty

    def total(self):
        return self.price * self.qty

    def report(self):
        return f"{self.product_name} × {self.qty} = {self.total()} 元"

o = Order("蓝牙耳机", 299, 2)
print(o.report())      # 蓝牙耳机 × 2 = 598 元

o2 = Order("数据线", 39, 3)
print(o2.report())     # 数据线 × 3 = 117 元`,
          },
          quiz: [
            {
              q: 'self 的作用是什么？',
              options: ['表示类本身', '表示当前这个对象', '固定写法，没有意义', '表示父类'],
              answer: 1,
              explain: 'self 指向调用方法的那个实例。Python 自动传递它，所以调用时不用手写。',
            },
          ],
        },
        {
          id: 'py-17',
          no: 17,
          title: '综合实战：账单批处理脚本',
          minutes: 20,
          level: '实战',
          objectives: ['把前面所有知识串成一个完整工具', '掌握 读→清洗→计算→输出 的流程', '学会写可直接复用的脚本结构'],
          summary: '一个完整脚本 = 读取 + 清洗 + 处理 + 输出。按函数拆分，main 里串起来。',
          blocks: [
            ['p', '这节课把前面 16 节的知识全部用上，做一个你日常真能用的东西。'],
            ['h', '需求'],
            ['p', '有一份账单文本，格式是「日期,分类,金额,预算」。要完成：'],
            ['ol', [
              '解析每一行数据',
              '逐条判断是否在预算/目标内（有些分类是支出上限，有些是收入目标）',
              '统计正常率',
              '输出一份结构化的报告',
            ]],
            ['h', '关键设计：用方向区分判定规则'],
            ['p', '餐饮、交通这类支出要求金额不超过预算（≤），工资、兼职这类收入要求达到预期（≥）。所以要给每个分类带上方向。'],
            ['code', 'python', `# 分类 → 判定方向
LIMIT_TYPE = {
    "餐饮": "<=",   # 支出，控制在预算内
    "交通": "<=",
    "购物": "<=",
    "娱乐": "<=",
    "工资": ">=",   # 收入，达到预期
    "兼职": ">=",
}


def judge(value, limit_, direction):
    """按方向判定，返回 True/False"""
    if direction == "<=":
        return value <= limit_
    elif direction == ">=":
        return value >= limit_
    else:
        return False


def parse_record(line):
    """解析一行：2026-09-01,餐饮,45,50  →  字典"""
    parts = [p.strip() for p in line.split(",")]
    if len(parts) != 4:
        return None                       # 格式不对，放弃这条

    date, category, value_s, limit_s = parts

    try:
        value = float(value_s)
        limit_ = float(limit_s)
    except ValueError:
        return None                       # 数字解析失败，放弃

    return {
        "date": date,
        "category": category,
        "value": value,
        "limit_": limit_,
        "direction": LIMIT_TYPE.get(category, "<="),
    }


def analyze(records):
    """统计"""
    total = len(records)
    passed = [r for r in records if judge(r["value"], r["limit_"], r["direction"])]
    failed = [r for r in records if not judge(r["value"], r["limit_"], r["direction"])]

    return {
        "total": total,
        "pass_count": len(passed),
        "fail_count": len(failed),
        "pass_rate": len(passed) / total if total else 0.0,
        "failed_items": failed,
    }


def build_report(records, result):
    """生成文本报告"""
    lines = []
    lines.append("=" * 40)
    lines.append("          账单预算核对报告")
    lines.append("=" * 40)

    for r in records:
        ok = judge(r["value"], r["limit_"], r["direction"])
        flag = "正常  " if ok else "异常"
        lines.append(
            f"{r['date']} {r['category']:<6} {r['value']:>8.2f}  "
            f"({r['direction']} {r['limit_']:.2f})  {flag}"
        )

    lines.append("-" * 40)
    lines.append(f"总计 {result['total']} 条  "
                 f"正常 {result['pass_count']}  异常 {result['fail_count']}")
    lines.append(f"正常率：{result['pass_rate']:.1%}")

    if result["failed_items"]:
        lines.append("")
        lines.append("需要关注的项：")
        for r in result["failed_items"]:
            lines.append(f"  · {r['date']} {r['category']} 实际 {r['value']}（要求 {r['direction']} {r['limit_']}）")

    return "\\n".join(lines)


def main(raw_text):
    records = []
    for line in raw_text.strip().split("\\n"):
        rec = parse_record(line)
        if rec:
            records.append(rec)

    if not records:
        print("没有解析到有效数据，请检查输入格式")
        return

    result = analyze(records)
    print(build_report(records, result))


# ---------- 测试数据 ----------
DATA = """2026-09-01,餐饮,45,50
2026-09-01,交通,12,30
2026-09-02,购物,399,300
2026-09-03,娱乐,680,500
2026-09-05,工资,12000,10000
2026-09-08,兼职,800,1000"""

main(DATA)`],
            ['h', '跑起来看结果'],
            ['p', '把上面代码整个贴进练习台运行。你会看到一份对齐的账单报告，还有正常率和需要关注的项。'],
            ['h', '这个脚本为什么"像个工具"了'],
            ['ul', [
              '函数拆分：parse_record / judge / analyze / build_report 各管一件事',
              '容错：格式不对的数据被跳过而不是让程序崩掉',
              '可扩展：加新分类只要往 LIMIT_TYPE 里加一行',
              'main() 收口：整个流程一眼能看懂',
            ]],
            ['h', 'f-string 的对齐小技巧'],
            ['code', 'python', `name = "餐饮"
print(f"{name:<10}|")      # 左对齐占 10 位
print(f"{45.5:>10.2f}|")   # 右对齐占 10 位，保留 2 位小数`],
            ['tip', '对齐能让文本报告看起来专业很多。ASCII 表格用 < 和 > 就够了，不用装第三方库。'],
            ['h', '下一步怎么把它变成真正可用的工具'],
            ['ol', [
              '把 DATA 换成从文件读：Path("账单.csv").read_text(encoding="utf-8")',
              '把报告写入文件而不是打印',
              '如果要读 Excel，装 openpyxl 或 pandas',
              '把常用参数（阈值、路径）提到文件顶部，方便修改',
            ]],
            ['note', '到这里，你已经具备"看懂别人代码 + 写出解决自己日常问题的小工具"的能力了。剩下的靠真实需求去练。'],
          ],
          exercise: {
            task: '改造上面脚本：新增一个统计——按分类汇总异常条数，输出每个分类有几条没达标。',
            hint: '用字典收集：{分类: 异常条数}，遍历时 if not judge(...) 就加 1。',
            starter: `# 基于上面的代码，新增这个函数：
def fail_count_by_category(records):
    """返回 {分类: 异常条数}"""
    # 补全
    pass
`,
            answer: `def fail_count_by_category(records):
    """返回 {分类: 异常条数}"""
    result = {}
    for r in records:
        if not judge(r["value"], r["limit_"], r["direction"]):
            result[r["category"]] = result.get(r["category"], 0) + 1
    return result


# 调用
for category, n in fail_count_by_category(records).items():
    print(f"{category}: 异常 {n} 条")`,
            note: 'dict.get(key, 0) 在键不存在时返回 0，省掉了"先判断键在不在"这一步。',
          },
          quiz: [
            {
              q: '为什么 parse_record 里要 return None 而不是直接报错停止？',
              options: [
                '为了省内存',
                '为了让一行脏数据不至于让整个批处理失败',
                '因为 Python 要求这样写',
                '没有区别',
              ],
              answer: 1,
              explain: '真实数据总有脏行。跳过脏数据继续处理，是批处理脚本的基本健壮性设计。',
            },
          ],
        },
      ],
    },
  ],
}

/** 展平：拿到全部小节（按 no 排序），方便"上一节/下一节"和进度统计 */
export const PY_LESSONS = PYTHON_COURSE.chapters.flatMap((c) =>
  c.lessons.map((l) => ({ ...l, chapterId: c.id, chapterTitle: c.title, track: 'python' }))
)

export function findPyLesson(id) {
  return PY_LESSONS.find((l) => l.id === id) || null
}
