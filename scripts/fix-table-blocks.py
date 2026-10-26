"""修正课程数据里 ['table', ...] 块的多余右括号。

块结构：['table', [表头...], [行...], ...]
所以块自身的闭合只需要一个 ]，写成 ]] 会多一层。
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = [
    str(ROOT / "src" / "data" / "sql-course.js"),
    str(ROOT / "src" / "data" / "python-course.js"),
]


def strip_strings(line: str) -> str:
    """去掉单/双引号字符串内容，避免其中的括号干扰计数。"""
    out = []
    i = 0
    quote = None
    while i < len(line):
        c = line[i]
        if quote:
            if c == "\\":
                i += 2
                continue
            if c == quote:
                quote = None
            i += 1
            continue
        if c in "'\"`":
            quote = c
            i += 1
            continue
        out.append(c)
        i += 1
    return "".join(out)


def depth_delta(line: str) -> int:
    s = strip_strings(line)
    return s.count("[") - s.count("]")


def fix(path: str) -> int:
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    fixed = 0
    i = 0
    while i < len(lines):
        m = re.match(r"^(\s*)\['table',\s*$", lines[i])
        if not m:
            i += 1
            continue
        indent = m.group(1)
        depth = depth_delta(lines[i])  # 应为 +1
        j = i + 1
        while j < len(lines) and depth > 0:
            depth += depth_delta(lines[j])
            if depth <= 0:
                break
            j += 1
        if j >= len(lines):
            print(f"  [warn] 未找到 table 块闭合: line {i+1}")
            i += 1
            continue
        close = lines[j]
        if close.strip() == "]],":
            lines[j] = f"{indent}],\n"
            fixed += 1
            print(f"  修复 line {j+1}: ]], -> ],")
        i = j + 1

    if fixed:
        with open(path, "w", encoding="utf-8") as f:
            f.writelines(lines)
    print(f"{path}  修复 {fixed} 处")
    return fixed


total = 0
for p in FILES:
    print(f"--- {p}")
    total += fix(p)
print(f"\n合计修复 {total} 处")
sys.exit(0)
