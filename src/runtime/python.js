/* ============================================================
   Python 运行时（Pyodide / CPython → WebAssembly）
   真机在本机执行，代码不上传任何服务器。
   ============================================================ */

/* 本地内置源：运行时文件已打包进 App（public/pyodide/），APK 内完全离线、秒加载。
   网页版若本地缺失（404）会自动落到后续 CDN。npmmirror 的 pyodide 包缺 stdlib(zip 返回 451)，勿用。 */
const LOCAL_BASE =
  typeof location !== 'undefined' ? location.origin + '/pyodide/' : '/pyodide/'

const CDN_LIST = [
  LOCAL_BASE,
  'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
  'https://fastly.jsdelivr.net/pyodide/v0.26.2/full/',
  'https://unpkg.com/pyodide@0.26.2/',
]

let pyodide = null
let loading = null
let currentIndexURL = null

/** 加载状态：idle | loading | ready | error */
export const pyState = {
  status: 'idle',
  progress: '',
  indexURL: null,
  error: null,
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('脚本加载失败: ' + src))
    document.head.appendChild(s)
  })
}

/** 预加载 Pyodide（首次约 6~10MB，之后走 WebView 缓存） */
export function ensurePyodide(onProgress) {
  if (pyodide) return Promise.resolve(pyodide)
  if (loading) return loading

  pyState.status = 'loading'
  pyState.error = null
  const report = (m) => {
    pyState.progress = m
    if (onProgress) onProgress(m)
  }

  loading = (async () => {
    let lastErr = null
    for (const base of CDN_LIST) {
      try {
        report('正在连接运行时…')
        await loadScript(base + 'pyodide.js')
        if (typeof window.loadPyodide !== 'function') throw new Error('loadPyodide 未就绪')
        report('正在下载 Python 解释器（约 10MB，首次稍慢）…')
        const inst = await window.loadPyodide({ indexURL: base })
        pyodide = inst
        currentIndexURL = base
        pyState.status = 'ready'
        pyState.indexURL = base
        report('就绪')
        // 预热：打印版本
        try {
          inst.runPython('import sys')
        } catch (_) {}
        return inst
      } catch (e) {
        lastErr = e
        report(`该源不可用，换下一个…`)
        console.warn('[pyodide] 源失败:', base, e)
      }
    }
    pyState.status = 'error'
    pyState.error = lastErr?.message || '无法加载 Python 运行时'
    loading = null
    throw new Error('Python 运行时加载失败（网络问题）。可以先用「AI 讲解」模式，联网正常后重试。')
  })()

  return loading
}

export function isReady() {
  return !!pyodide
}

/** 检测代码里 input() 的调用次数（用于提示用户准备输入） */
export function countInputs(code) {
  const noComment = code
    .split('\n')
    .filter((l) => !l.trim().startsWith('#'))
    .join('\n')
  const m = noComment.match(/(?<![\w.])input\s*\(/g)
  return m ? m.length : 0
}

/**
 * 执行 Python 代码
 * @param {string} code
 * @param {object} opts { stdinLines: string[], onOutput: (text, kind)=>void }
 * @returns {Promise<{ok:boolean, stdout:string, error:string, results:any[]}>}
 */
export async function runPython(code, opts = {}) {
  const inst = await ensurePyodide()
  const { stdinLines = [] } = opts

  let out = ''
  const emit = (text, kind = 'out') => {
    out += text
    if (opts.onOutput) opts.onOutput(text, kind)
  }

  // 标准输出
  inst.setStdout({ batched: (s) => emit(s + '\n', 'out') })
  inst.setStderr({ batched: (s) => emit(s + '\n', 'err') })

  // 标准输入：按行喂给 input()
  let idx = 0
  try {
    inst.setStdin({
      stdin: () => {
        if (idx < stdinLines.length) {
          const v = String(stdinLines[idx++])
          emit(v + '\n', 'in')
          return v + '\n'
        }
        emit('<没有更多输入了>\n', 'err')
        return '\n'
      },
      isatty: false,
    })
  } catch (_) {
    // 老版本没有 setStdin，忽略
  }

  try {
    // 自动加载 import 的包（需联网）
    try {
      await inst.loadPackagesFromImports(code)
    } catch (e) {
      console.warn('[pyodide] 自动装包跳过:', e?.message)
    }

    const result = await inst.runPythonAsync(code)
    let reprLine = ''
    if (result !== undefined && result !== null) {
      try {
        const repr = inst.runPython('lambda v: repr(v)')
        reprLine = repr(result)
      } catch (_) {
        reprLine = String(result)
      }
      emit(reprLine + '\n', 'ret')
    }
    inst.setStdout({})
    inst.setStderr({})
    return { ok: true, stdout: out, error: '', result: reprLine }
  } catch (e) {
    const msg = String(e?.message || e)
    emit(msg + '\n', 'err')
    inst.setStdout({})
    inst.setStderr({})
    return { ok: false, stdout: out, error: msg }
  }
}

/** 重启解释器（清掉所有变量），用于"重来一次" */
export async function restartPython() {
  if (!pyodide) return
  try {
    pyodide.runPython('import sys; sys.modules.clear()')
  } catch (_) {}
  pyodide = null
  loading = null
  try {
    await ensurePyodide()
  } catch (_) {}
}

export function pythonVersion() {
  if (!pyodide) return ''
  try {
    return pyodide.runPython('import sys; sys.version.split()[0]')
  } catch (_) {
    return ''
  }
}
