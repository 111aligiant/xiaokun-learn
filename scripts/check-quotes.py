"""扫描数据文件中"单引号字符串里又出现单引号"的高危行。

JS 里用单引号定界字符串时，内部再出现未转义的单引号会直接语法错误。
这个脚本用状态机逐字符走，遇到字符串未正常闭合的行就报出来。
"""
import sys

FILES = [
    r"C:\Users\ymc\Desktop\手机学习python\xiaokun-learn\src\data\mysql-course.js",
    r"C:\Users\ymc\Desktop\手机学习python\xiaokun-learn\src\data\python-course.js",
    r"C:\Users\ymc\Desktop\手机学习python\xiaokun-learn\src\data\prompts.js",
]


def scan(path: str) -> int:
    src = open(path, encoding="utf-8").read()
    issues = 0
    line = 1
    i = 0
    n = len(src)
    while i < n:
        c = src[i]
        if c == "\n":
            line += 1
            i += 1
            continue
        # 单行/块注释
        if c == "/" and i + 1 < n and src[i + 1] == "/":
            while i < n and src[i] != "\n":
                i += 1
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "*":
            i += 2
            while i + 1 < n and not (src[i] == "*" and src[i + 1] == "/"):
                if src[i] == "\n":
                    line += 1
                i += 1
            i += 2
            continue
        # 模板字符串：允许跨行，几乎不会出问题，跳过
        if c == "`":
            i += 1
            while i < n and src[i] != "`":
                if src[i] == "\\":
                    i += 1
                if src[i] == "\n":
                    line += 1
                i += 1
            i += 1
            continue
        if c in "'\"":
            quote = c
            start_line = line
            buf = []
            i += 1
            closed = False
            while i < n:
                ch = src[i]
                if ch == "\\":
                    buf.append(src[i:i + 2])
                    i += 2
                    continue
                if ch == quote:
                    closed = True
                    i += 1
                    break
                if ch == "\n":
                    break
                buf.append(ch)
                i += 1
            text = "".join(buf)
            if not closed:
                # 字符串在这一行内没闭合：多半是里面混了未转义的引号
                print(f"  [line {start_line}] 字符串未闭合: {text[:90]!r}")
                issues += 1
                # 跳过这一行剩余部分，避免连环误报
                while i < n and src[i] != "\n":
                    i += 1
            continue
        i += 1
    return issues


total = 0
for p in FILES:
    print(f"--- {p.split(chr(92))[-1]}")
    n = scan(p)
    total += n
    if n == 0:
        print("  未发现未闭合字符串")
print(f"\n合计可疑行 {total} 处")
sys.exit(0)
