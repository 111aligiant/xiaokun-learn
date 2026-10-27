<template>
  <Teleport to="body">
  <div class="wiz" role="dialog" aria-modal="true">
    <header class="wiz__head">
      <div class="wiz__step">第 {{ step + 1 }} / 3 步 · {{ STEPS[step] }}</div>
      <div class="wiz__title">
        {{ edit ? '编辑学员背景' : `先认识一下，我是${form.assistantName || '小鲲'}` }}
      </div>
      <button class="wiz__skip" @click="skip">{{ edit ? '关闭' : '以后再说' }}</button>
    </header>

    <div class="wiz__bar"><i :style="{ width: `${((step + 1) / 3) * 100}%` }" /></div>

    <div class="wiz__body">
      <!-- ① 你是谁、想学什么 -->
      <template v-if="step === 0">
        <p class="wiz__lead">
          这些信息只存在这台手机上，用来决定助教怎么讲、拿什么举例。都可以留空，之后在「我的」里改。
        </p>

        <div class="field">
          <label class="field__label">怎么称呼你</label>
          <input class="input" v-model="form.name" maxlength="20" placeholder="可留空，助教会直接称呼" />
        </div>

        <div class="field">
          <label class="field__label">学习目标</label>
          <textarea
            class="textarea"
            v-model="form.goal"
            rows="2"
            placeholder="例：转行做 AI 应用 / 把报表自动化 / 面试前补 SQL"
          />
        </div>

        <div class="field">
          <label class="field__label">现在的水平</label>
          <div class="wiz__grid">
            <button
              v-for="l in LEVEL_LIST"
              :key="l.id"
              class="wiz__card"
              :class="{ 'wiz__card--on': form.level === l.id }"
              @click="form.level = l.id"
            >
              <span class="wiz__card-t">{{ l.label }}</span>
              <span class="wiz__card-s">{{ l.short }}</span>
            </button>
          </div>
        </div>

        <div class="field">
          <label class="field__label">已有基础 / 经历</label>
          <textarea
            class="textarea"
            v-model="form.background"
            rows="3"
            placeholder="例：会一点 VBA 和 MATLAB，没写过 Python；SQL 只会 SELECT"
          />
          <div class="field__hint">写过什么、学过什么、哪些完全没碰过，都可以写。</div>
        </div>
      </template>

      <!-- ② 怎么举例、什么节奏 -->
      <template v-else-if="step === 1">
        <div class="field">
          <label class="field__label">助教拿什么举例</label>
          <div class="wiz__grid wiz__grid--3">
            <button
              v-for="d in EXAMPLE_DOMAINS"
              :key="d.id"
              class="wiz__card"
              :class="{ 'wiz__card--on': form.exampleDomain === d.id && !form.exampleDomainText.trim() }"
              @click="pickDomain(d)"
            >
              <span class="wiz__card-t">{{ d.label }}</span>
              <span class="wiz__card-s">{{ d.hint }}</span>
            </button>
          </div>
          <input
            class="input"
            style="margin-top:10px"
            v-model="form.exampleDomainText"
            maxlength="40"
            placeholder="也可以直接写：通用电子、医学影像、财务审计…"
            @input="onDomainInput"
          />
          <div class="field__hint">自己写的领域优先于上面的选择；留空就用所选领域。</div>
        </div>

        <div class="field">
          <label class="field__label">每周能投入多少时间</label>
          <div class="wiz__chips">
            <button
              v-for="t in WEEKLY_TIME_OPTIONS"
              :key="t.value"
              class="chip"
              :class="{ 'chip--on': Number(form.weeklyMinutes) === t.value }"
              @click="form.weeklyMinutes = t.value"
            >{{ t.label }}</button>
          </div>
          <div class="field__hint">助教会按这个节奏安排每节课的练习量。</div>
        </div>

        <div class="field">
          <label class="field__label">学习偏好（可选）</label>
          <input class="input" v-model="form.style" placeholder="例：先看原理再看代码 / 直接给我例子" />
        </div>

        <div class="field">
          <label class="field__label">现实约束（可选）</label>
          <input class="input" v-model="form.constraints" placeholder="例：手机为主、每天只有 20 分钟" />
        </div>
      </template>

      <!-- ③ 助教是谁、怎么接模型 -->
      <template v-else>
        <div class="field">
          <label class="field__label">选一个助教风格</label>
          <div class="wiz__grid wiz__grid--3">
            <button
              v-for="p in PERSONAS"
              :key="p.id"
              class="wiz__card"
              :class="{ 'wiz__card--on': form.personaId === p.id }"
              @click="form.personaId = p.id"
            >
              <span class="wiz__card-t">{{ p.label }}</span>
              <span class="wiz__card-s">{{ p.short }}</span>
            </button>
          </div>
        </div>

        <div class="wiz__row">
          <div class="field grow">
            <label class="field__label">助教叫什么</label>
            <input class="input" v-model="form.assistantName" maxlength="12" placeholder="小鲲" />
          </div>
          <div class="field grow">
            <label class="field__label">教学方式</label>
            <div class="seg">
              <button class="seg__item" :class="{ 'seg__item--on': form.teachMode === 'guide' }" @click="form.teachMode = 'guide'">引导式</button>
              <button class="seg__item" :class="{ 'seg__item--on': form.teachMode === 'direct' }" @click="form.teachMode = 'direct'">直接讲</button>
            </div>
          </div>
        </div>
        <div class="field__hint" style="margin:-6px 0 14px">
          引导式：练习先反问思路，卡住两次才给答案。直接讲：直接给完整解法并逐行解释。
        </div>

        <div class="field">
          <label class="field__label">常用平台（可选）</label>
          <div class="wiz__chips">
            <button
              v-for="pv in PROVIDERS"
              :key="pv.id"
              class="chip"
              :class="{ 'chip--on': providerOfBaseUrl(form.baseUrl)?.id === pv.id }"
              @click="useProvider(pv)"
            >{{ pv.label }}</button>
          </div>
          <div class="field__hint">点一下自动填接口地址和模型；也可以接任意 OpenAI 兼容服务。</div>
        </div>

        <div class="field">
          <label class="field__label">模型 API Key（可稍后填）</label>
          <div class="row">
            <input
              class="input grow"
              :type="showKey ? 'text' : 'password'"
              v-model="form.apiKey"
              placeholder="sk-..."
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
            />
            <button class="btn btn--sm btn--ghost" @click="showKey = !showKey">{{ showKey ? '隐藏' : '显示' }}</button>
          </div>
          <div class="field__hint">
            任意 OpenAI 兼容平台都可以。Key 只保存在本机，不经过任何中转服务器。
          </div>

          <div class="wiz__help">
            <button type="button" class="wiz__help-head" @click="keyHelpOpen = !keyHelpOpen">
              <span class="wiz__help-title">没有 Key？3 分钟申请一个 DeepSeek Key</span>
              <span class="wiz__help-toggle">{{ keyHelpOpen ? '收起' : '展开' }}</span>
            </button>
            <div v-if="keyHelpOpen" class="wiz__help-body">
              <ol class="wiz__steps">
                <li>
                  <span class="wiz__steps-t">注册开放平台</span>
                  手机浏览器打开 <a class="wiz__link" href="https://platform.deepseek.com">platform.deepseek.com</a>，用手机号或邮箱注册登录。注意是「开放平台」，不是平时聊天的网页。
                </li>
                <li>
                  <span class="wiz__steps-t">创建 API Key</span>
                  左侧菜单点「API keys」→「创建 API key」，名字随手起（比如 xiaokun）。复制弹窗里 <code class="code--inline">sk-</code> 开头的一长串，它只显示这一次，关掉就再也看不到。
                </li>
                <li>
                  <span class="wiz__steps-t">充值一点余额</span>
                  API 按量计费、先充值后调用。左侧「充值」需先实名，支持支付宝/微信，充 10 块钱够学很久；余额为 0 时接口会直接报错。
                </li>
                <li>
                  <span class="wiz__steps-t">填回这里</span>
                  粘贴到上面的输入框，接口地址填 <code class="code--inline">https://api.deepseek.com</code>，模型填 <code class="code--inline">deepseek-flash</code>。保存后可在「我的」里点「测试连接」验证。
                </li>
              </ol>
              <p class="wiz__help-warn">
                Key 相当于你账户里余额的钥匙：别发到群里、别截图分享。万一泄露，回到同一页面删掉它、重新建一个即可。
              </p>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="field__label">接口地址 base_url</label>
          <input class="input" v-model="form.baseUrl" placeholder="https://api.deepseek.com" />
        </div>

        <div class="field">
          <label class="field__label">模型名</label>
          <input class="input" v-model="form.model" placeholder="deepseek-flash / gpt-4o-mini" />
          <div class="field__hint">填平台文档里的模型 ID；不确定就先用平台默认的便宜模型。</div>
        </div>
      </template>
    </div>

    <footer class="wiz__foot">
      <button v-if="step > 0" class="btn btn--ghost" @click="step--">上一步</button>
      <button v-if="step < 2" class="btn" :class="edit ? 'btn--ghost' : 'btn--primary grow'" @click="step++">下一步</button>
      <button v-if="step === 2 || edit" class="btn btn--primary grow" @click="finish">
        {{ edit ? '保存' : '开始学习' }}
      </button>
    </footer>
  </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { state, updateSettings, updateProfile } from '../store/app.js'
import { LEVEL_PRESETS } from '../data/prompts.js'
import { EXAMPLE_DOMAINS, WEEKLY_TIME_OPTIONS } from '../data/profile.js'
import { PROVIDERS, providerOfBaseUrl } from '../data/providers.js'
import { PERSONA_PRESETS } from '../data/persona.js'

defineProps({ edit: { type: Boolean, default: false } })
const emit = defineEmits(['close'])

const STEPS = ['认识你', '举例与节奏', '助教与模型']

const LEVEL_LIST = Object.entries(LEVEL_PRESETS).map(([id, v]) => ({ id, ...v }))
const PERSONAS = Object.values(PERSONA_PRESETS)

const step = ref(0)
const showKey = ref(false)

const st = state.settings
const form = reactive({
  name: st.profile?.name || '',
  goal: st.profile?.goal || '',
  background: st.profile?.background || '',
  exampleDomain: st.profile?.exampleDomain || 'general',
  exampleDomainText: st.profile?.exampleDomainText || '',
  weeklyMinutes: st.profile?.weeklyMinutes || 0,
  style: st.profile?.style || '',
  constraints: st.profile?.constraints || '',
  language: st.profile?.language || 'zh-CN',
  level: st.level || 'auto',
  personaId: st.personaId || 'tutor',
  assistantName: st.assistantName || '小鲲',
  teachMode: st.teachMode || 'guide',
  apiKey: st.apiKey || '',
  baseUrl: st.baseUrl || '',
  model: st.model || '',
})

const keyHelpOpen = ref(!(st.apiKey || '').trim())

function pickDomain(d) {
  form.exampleDomain = d.id
  form.exampleDomainText = ''
}

function onDomainInput() {
  if (form.exampleDomainText.trim()) form.exampleDomain = 'custom'
  else if (form.exampleDomain === 'custom') form.exampleDomain = 'general'
}

function useProvider(pv) {
  form.baseUrl = pv.baseUrl
  form.model = pv.model
}

function finish() {
  updateProfile({
    name: form.name.trim(),
    goal: form.goal.trim(),
    background: form.background.trim(),
    exampleDomain: form.exampleDomain,
    exampleDomainText: form.exampleDomainText.trim(),
    weeklyMinutes: Number(form.weeklyMinutes) || 0,
    style: form.style.trim(),
    constraints: form.constraints.trim(),
    language: form.language,
  })
  updateSettings({
    level: form.level,
    personaId: form.personaId,
    assistantName: form.assistantName.trim() || '小鲲',
    teachMode: form.teachMode,
    apiKey: form.apiKey.trim() || st.apiKey || '',
    baseUrl: form.baseUrl.trim() || st.baseUrl || 'https://api.deepseek.com',
    model: form.model.trim() || providerOfBaseUrl(form.baseUrl)?.model || st.model || 'deepseek-flash',
  })
  state.onboarded = true
  emit('close')
}

function skip() {
  if (!state.onboarded) state.onboarded = true
  emit('close')
}
</script>

<style scoped>
.wiz {
  position: fixed; inset: 0; z-index: 90;
  background: var(--bg);
  display: flex; flex-direction: column;
  padding-top: var(--safe-t);
}
.wiz__head {
  position: relative;
  padding: 18px 20px 12px;
}
.wiz__step { font-size: 11.5px; font-weight: 700; color: var(--brand); letter-spacing: .02em; }
.wiz__title { font-size: 19px; font-weight: 800; margin-top: 4px; color: var(--ink); }
.wiz__skip {
  position: absolute; top: 16px; right: 16px;
  border: 0; background: transparent; color: var(--muted);
  font-size: 12.5px; font-weight: 600; cursor: pointer; padding: 6px;
}
.wiz__bar { height: 4px; background: var(--brand-soft2); margin: 0 20px 6px; border-radius: 99px; overflow: hidden; }
.wiz__bar i { display: block; height: 100%; background: var(--brand); transition: width .28s ease; }
.wiz__body { flex: 1; overflow-y: auto; padding: 14px 20px 20px; }
.wiz__lead { font-size: 12.5px; color: var(--muted); line-height: 1.7; margin: 0 0 16px; }
.wiz__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.wiz__grid--3 { grid-template-columns: 1fr 1fr 1fr; }
.wiz__card {
  display: flex; flex-direction: column; gap: 3px; text-align: left;
  padding: 10px 11px; border-radius: var(--radius-sm);
  border: 1px solid var(--line); background: var(--surface); cursor: pointer;
}
.wiz__card--on { border-color: var(--brand); background: var(--brand-soft); }
.wiz__card-t { font-size: 13px; font-weight: 700; color: var(--ink); }
.wiz__card-s { font-size: 10.5px; color: var(--muted); line-height: 1.45; }
.wiz__card--on .wiz__card-t { color: var(--brand); }
.wiz__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.wiz__row { display: flex; gap: 10px; }

/* DeepSeek Key 申请教程 */
.wiz__help {
  margin-top: 10px;
  border: 1px solid var(--brand-soft2);
  border-radius: var(--radius-sm);
  background: var(--brand-soft);
  overflow: hidden;
}
.wiz__help-head {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 10px 12px;
  border: 0; background: transparent; cursor: pointer; text-align: left;
}
.wiz__help-title { font-size: 12.5px; font-weight: 700; color: var(--brand); line-height: 1.45; }
.wiz__help-toggle { flex: none; font-size: 11.5px; font-weight: 700; color: var(--brand-mid); }
.wiz__help-body { padding: 0 12px 12px; }
.wiz__steps {
  margin: 0; padding: 0; list-style: none;
  counter-reset: step;
  display: flex; flex-direction: column; gap: 9px;
}
.wiz__steps li {
  counter-increment: step;
  position: relative; padding-left: 25px;
  font-size: 12px; line-height: 1.65; color: var(--ink-2);
}
.wiz__steps li::before {
  content: counter(step);
  position: absolute; left: 0; top: 1px;
  width: 17px; height: 17px; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--brand); color: #fff;
  font-size: 10.5px; font-weight: 700;
}
.wiz__steps-t { display: block; font-weight: 700; color: var(--ink); }
.wiz__link { color: var(--brand-mid); font-weight: 700; text-decoration: underline; word-break: break-all; }
.wiz__help-warn {
  margin: 9px 0 0; padding-top: 8px;
  border-top: 1px dashed var(--brand-soft2);
  font-size: 11px; line-height: 1.6; color: var(--muted);
}
.wiz__foot {
  flex: none;
  display: flex; gap: 10px;
  padding: 12px 20px calc(14px + var(--safe-b));
  border-top: 1px solid var(--line);
  background: var(--surface);
}
</style>
