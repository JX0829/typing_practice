# 中英文打字与默写练习网站 — SpecKit 实施规范文档 (Agent Implementation Spec)

## 1. 项目概述与核心原则 (Project Constitution)

### 1.1 项目目标
构建一个面向小学阶段（兼容通用学习者）的**中英文打字与读写积累练习 Web 应用**（类似金山打字通的现代化轻量 Web 版）。系统通过读取 `/source/中文/` 与 `/source/英语/` 目录下的 Markdown 词汇表，支持纯随机抽词、一键生成结构化 AI 提示词、导入 AI 生成的词句数据包，并提供**上半部分词语/全默写练习 + 下半部分 3:7 长短句练习**的沉浸式打字校对与统计体验。

### 1.2 核心架构与业务原则
* **零后端 / 免 API Key 闭环**：前端不直接强依赖付费大模型 API，采用**“本地源词库抽词 $\rightarrow$ 自动组装结构化 Prompt $\rightarrow$ 用户复制给任意 AI 生成 JSON $\rightarrow$ 粘贴回网站解析练习”**的轻量工作流；同时内置基于 Fisher-Yates 算法的动态随机抽词造句引擎，确保开箱即用且每次开练题目完全随机不重复。
* **中英文差异化训练机制**：
  * **中文模式**：汉字输入为主（不练拼音键位）。上半部分展示“汉字 + 拼音提示”，用户使用中文输入法打汉字；下半部分展示包含该词的“写作优美短句/长句”，用户跟打汉字。
  * **英语模式**：单词**全默写** + 句子**直接抄写**。上半部分**默认隐藏英文原词，仅展示词性与中文释义**，考察用户看中文默写英文单词（支持按眼睛偷看提示）；含省略号短语（如 `ask... for help`）采用分段填空输入；下半部分展示英文语法例句及中文翻译，用户直接跟打英文句子。
* **句子 3:7 黄金长短比例**：下半部分句子严格遵循 **30% 长句 + 70% 短句**（例如 5 词对应 2 长+3 短，10 词对应 3 长+7 短，20 词对应 6 长+14 短），在内置动态生成引擎与 AI Prompt 模板中双重硬性约束。
* **输入法友好（IME Safe）与自动流转**：
  * 中文打字必须监听 `compositionstart` 与 `compositionend` 事件，在拼音未上屏前不触发错误标红，上屏后再做逐字比对。
  * **词语自动跳转**：当输入完一个词（输入正确，或者输入有错但字数已达到目标长度）后，光标立即平滑自动跳转到下一个词。
  * **删除键（Backspace）回退**：当当前输入框内容为空时，按下 Backspace 键可无缝跳回上一个词的输入框进行检查与修改；省略号双输入框之间同样支持前进与回退。
* **生机盎然视觉风格**：整站采用护眼、活力且生机勃勃的翡翠绿（Emerald / Mint / Teal）自然生机风格，保证对比度清晰（文字加深，避免浅白难以辨识）。
* **静态资源服务规范**：静态文件服务器（Node HTTP / Nginx）必须支持 URL 中文百分比解码（`decodeURIComponent`），确保 `/source/中文/*.md` 及 `/source/英语/*.md` 在生产环境下 100% 正确响应。

---

## 2. 目录结构与技术栈规范 (Tech Stack & Directory Layout)

### 2.1 技术栈
* **前端框架**：React 19 + TypeScript + Vite
* **样式方案**：Tailwind CSS + Lucide Icons
* **辅助工具库**：
  * `pinyin-pro`（用于动态为中文词语/句子生成标准带声调拼音）
  * `canvas-confetti`（练习完成结算时的礼花动效）
* **运行与守护**：
  * `server.mjs`（轻量 Node.js 静态文件 + SPA Fallback 服务，集成 `decodeURIComponent`）
  * `pm2`（生产守护进程，进程标识：`typing-practice-3334`，端口：`3334`）

### 2.2 标准目录结构
```text
project-root/
├── public/
│   └── source/
│       ├── 中文/
│       │   └── 语文默写.md          # 原始中文词库 Markdown (292词)
│       └── 英语/
│           └── 英语单词.md          # 原始英语词库 Markdown (158词)
├── src/
│   ├── components/
│   │   ├── SetupWizard.tsx          # 步骤1~3：科目选择、词量档位(5/10/20)、AI Prompt复制/粘贴与动态开练
│   │   ├── WordPracticeArena.tsx    # 页面上半部分：词语/全默写练习区（字数达标自动跳题，空内容按退格返回）
│   │   ├── EllipsisPhraseInput.tsx  # 英语 `ask... for help` 分段填空专用组件（支持双向跳转）
│   │   ├── SentencePracticeArena.tsx# 页面下半部分：3:7长短句跟打练习区
│   │   ├── TypingLineInput.tsx      # 通用单行打字、标点归一化、实时错误标红、IME防抖与自动跳转组件
│   │   └── ResultSummaryModal.tsx   # 结算统计弹窗（用时、准确率、CPM打字速度、错题本与一键重练）
│   ├── data/
│   │   ├── builtinDemoData.ts       # 基础精选静态样板数据集（兜底）
│   │   └── randomGenerator.ts       # 核心随机生成引擎：Fisher-Yates 算法纯随机抽词与3:7长短句自动装配
│   ├── parsers/
│   │   ├── markdownSourceParser.ts  # 解析 /source/ 下中英文 .md 文档的词条提取器与去重器
│   │   └── aiResponseParser.ts      # 校验并解析用户粘贴的 AI 生成数据（支持JSON容错提取）
│   ├── prompts/
│   │   └── promptTemplates.ts       # 内置高质量中英文 3:7 AI 提示词生成模板
│   ├── types/
│   │   └── practice.ts              # 核心 TypeScript 数据模型定义
│   ├── App.tsx                      # 核心顶层容器、吸顶状态栏、计时器与流程调度
│   ├── main.tsx
│   └── index.css
├── test-suite.ts                    # 自动化单元与端到端测试套件（验证文件解析、随机性、3:7长短句等）
├── server.mjs                       # 生产静态服务（集成中文 URL 解码与 SPA 路由兜底）
├── package.json
└── tsconfig.json
```

---

## 3. 数据源格式与解析器规范 (Source Markdown Parser Spec)

系统在页面初始化时通过 `fetch('/source/中文/语文默写.md')` 与 `fetch('/source/英语/英语单词.md')` 读取内容，由 `markdownSourceParser.ts` 解析并去重。

### 3.1 中文源文档解析规则（`语文默写.md`）
* **源文件特征**：
  * 二级标题 `## 第一单元` 表示单元名称，三级标题 `### 1. 大青树下的小学` 表示课文/小节名称。
  * 正文及列表行 `* **四字成语 / 积累**：` 中包含以顿号 `、` 分隔的中文词语（如：`山坡、学校、课文、声音`）。
* **解析与清洗规则**：
  1. 忽略 `#` 一级标题、`>` 引用说明块及 `---` 分隔线。
  2. 剥离 `* **四字成语 / 积累**：` 等前缀标签后，按中文顿号 `、`、逗号或空格切分词语。
  3. 过滤非中文字符，文本去重后生成 `RawSourceWord[]`（当前源库共提取 292 个有效词条）。

### 3.2 英语源文档解析规则（`英语单词.md`）
* **源文件特征**：
  * 二级标题 `## Unit 1` 表示单元。
  * 表格存储，结构为：`| 序号 | 英文单词 / 短语 | 词性 | 中文释义 |`。
* **解析与清洗规则**：
  1. 匹配表格数据行，剔除表头与分隔线。
  2. 提取 `word`（去除 `**` 包裹）、`pos`（词性）、`meaning`（中文释义）。
  3. **省略号短语识别**：若 `word` 包含 `...`（如 `ask... for help`），标记 `hasEllipsis: true`，并拆分目标词片段数组 `segments: ["ask", "for help"]`（当前源库共提取 158 个有效词条）。

---

## 4. 核心数据模型定义 (TypeScript Interfaces)

在 `src/types/practice.ts` 中严格定义：

```typescript
export type LanguageMode = 'zh' | 'en';

/** 从 /source/*.md 解析出的原始词条 */
export interface RawSourceWord {
  id: string;
  language: LanguageMode;
  text: string;           // 中文词语（如 "神采飞扬"）或英文单词/短语（如 "ask... for help"）
  pinyin?: string;        // 中文拼音
  pos?: string;           // 英文词性（如 "n.", "短语"）
  meaning?: string;       // 英文对应的中文释义
  unit?: string;          // 所属单元
  section?: string;       // 课文或小节
  hasEllipsis?: boolean;  // 是否包含 "..." 省略号结构
  segments?: string[];    // 拆分后的片段数组 ["ask", "for help"]
}

/** 上半部分：单个词语/单词练习项 */
export interface WordPracticeItem {
  id: string;
  targetText: string;     // 完整目标文本
  pinyin?: string;        // 中文拼音
  pos?: string;           // 英文词性
  meaning?: string;       // 英文中文释义（全默写提示源）
  hasEllipsis?: boolean;  // 英语模式：是否为省略号填空
  segments?: string[];    // 英语模式：分段输入目标 ["ask", "for help"]
  peeked?: boolean;       // 是否点击过偷看提示
}

/** 下半部分：单个句子练习项（严格遵守 30% long / 70% short） */
export interface SentencePracticeItem {
  id: string;
  sourceWord: string;     // 该句所对应的上半部分核心词
  lengthType: 'short' | 'long'; // 句子长短类型：short (70%) | long (30%)
  targetSentence: string; // 待打字的目标句子
  pinyin?: string;        // 中文句子拼音辅助
  translation?: string;   // 英文句子的中文翻译
}

/** 完整练习会话数据结构 */
export interface PracticeSessionPayload {
  language: LanguageMode;
  totalCount: number;
  words: WordPracticeItem[];
  sentences: SentencePracticeItem[];
}

/** 错题记录 */
export interface MistakeRecord {
  id: string;
  type: 'word' | 'sentence';
  prompt: string;
  target: string;
  userTyped: string;
  peeked?: boolean;
}

/** 实时统计指标 */
export interface TypingStats {
  startTime: number | null;
  endTime: number | null;
  elapsedSeconds: number;
  totalTargetChars: number;
  correctChars: number;
  errorCharCount: number;
  historicalErrorCount: number;
  accuracy: number;
  cpm: number;
  mistakeItems: MistakeRecord[];
}
```

---

## 5. 核心引擎：动态随机抽词与 3:7 黄金长短句造句

位于 `src/data/randomGenerator.ts`，彻底解决“固定词汇、重复开练”问题。

### 5.1 纯随机抽词算法
* 基于 **Fisher-Yates Shuffle** 算法对全量词池进行打乱，截取前 `N` 个词（支持 `N = 5, 10, 20` 档位）。
* 保证每次点击【立即开练】所抽取的词汇组合完全不同。

### 5.2 3:7 黄金长短句比例计算与映射
* **长短句比例**：长句数 $L = \max(1, \text{round}(N \times 0.3))$，短句数 $S = N - L$。
  * $N = 5$ 档位：3 个短句 (60%) + 2 个长句 (40%)。
  * $N = 10$ 档位：7 个短句 (70%) + 3 个长句 (30%)。
  * $N = 20$ 档位：14 个短句 (70%) + 6 个长句 (30%)。
* **例句知识库匹配**：
  * 内置高质量名师中文例句库（`ZH_SENTENCE_KNOWLEDGE`）与英文语法例句库（`EN_SENTENCE_KNOWLEDGE`），每个核心词均包含对应的长句、短句与翻译。
  * 具备智能兜底生成机制，确保词库中任意抽出的生僻词均能组装出通顺的长短句。

---

## 6. 用户交互流程与页面规范 (User Flow & UI Specification)

### 6.1 阶段一：初始配置向导 (`SetupWizard`)
1. **步骤 1 — 选择练习科目**：
   * 🇨🇳【中文读写练习】（读取 `/source/中文/`，已载入 292 词）。
   * 🇬🇧【英语默写练习】（读取 `/source/英语/`，已载入 158 词）。
2. **步骤 2 — 选择练习词量**：
   * 胶囊按钮：`5 词`、`10 词`、`20 词 (黄金推荐)`。
   * 下方动态提示当前长短句分布：如“包含 14 个短句 (70%) + 6 个长句 (30%)”。
3. **步骤 3 — 启动方式（双通道）**：
   * **通道 A（免配置 · 随机生成开练）**：
     * 点击【立即开练】按钮，系统立即调用 `generateRandomPracticeSession(lang, count, pool)`，随机抽取相应词数并组装 3:7 句子进入练习。
     * 描述文案深色高对比显示（`text-emerald-950 font-medium`）。
   * **通道 B（AI 提示词复制与粘贴）**：
     * 点击【复制 AI 提示词】将当前抽取的词填充到内置 3:7 Prompt 模板中，用户粘贴 AI 输出的 JSON 后点击【解析并开始练习】。

### 6.2 阶段二：上下分屏练习主界面 (`App.tsx`)
页面采用生机翡翠绿风格（`bg-gradient-to-b from-emerald-50 via-teal-50/40 to-emerald-50`）：

#### 顶部吸顶状态栏
* **计时器**：首键触发计时，格式 `00:00`。
* **进度指示**：翡翠绿动态进度条显示完成题数（`已完成/总数`）。
* **操作**：【重置】、【提前交卷】。

#### 上半部分：词语 / 全默写练习区 (`WordPracticeArena`)
* **中文模式**：显示带声调拼音与目标汉字，用户打汉字。
* **英语全默写模式**：
  * 默认隐藏英文原词，仅显示词性徽章与中文释义。
  * 提供小眼睛图标偷看提示（记录偷看标记）。
  * 盲打实时校验：用户输入正确显示绿色，输入错误直接标红，不剧透后续未敲字母。
* **省略号短语填空 (`EllipsisPhraseInput`)**：
  * 对 `ask... for help` 渲染为 `[段1] …… [段2]` 双输入框。
  * 第一段输入完成自动跳入第二段；段 2 为空时按 Backspace 自动退回段 1。
* **自动跳转与退格回退逻辑**：
  * 当用户输入的字符数达到当前词的目标长度时（无论正确或包含错误），延迟 40ms 自动跳转至下一个词输入框。
  * 当输入框为空时，按下 `Backspace` 键自动聚焦回退至上一个词输入框。
  * 最后一个词输入完毕后，自动聚焦至下半部分句子的第一个输入框。

#### 下半部分：3:7 长短句练习区 (`SentencePracticeArena`)
* 每张句子卡片标注 `[精炼短句 · 70%]` 或 `[进阶长句 · 30%]` 徽章，并标明核心词。
* 英文句子附带中文翻译。
* **标点智能容错**：支持中英文全角半角标点等价映射（如 `，` 与 `,`、`。` 与 `.` 等价），防止标点切换卡死。

#### 结算面板 (`ResultSummaryModal`)
* 触发礼花动画。
* 仪表盘统计：总用时、准确率百分比、打字速度（CPM）、错题总数。
* **错题回顾与重练**：列出打错或偷看过的词句清单，支持一键 **【仅重练错题】** 或 **【重新开始整套】**。

---

## 7. 生产部署与静态服务规范 (Deployment & Server Spec)

### 7.1 服务端 URL 编码容错机制
* **痛点问题**：现代浏览器请求带有中文路径的静态资源（如 `/source/中文/语文默写.md`）时会自动进行 URL 编码（转为 `%E4%B8%AD%E6%96%87`）。若服务端直接使用未解码的路径进行 `fs.readFile`，将导致 404 并回退到 `index.html`，引发前端词库解析为空并在点击开练时报错。
* **解决方案**：在 `server.mjs` 中增加安全解码：
  ```javascript
  let urlPath = req.url.split('?')[0];
  try {
    urlPath = decodeURIComponent(urlPath);
  } catch (e) {
    // 保持原样兜底
  }
  let safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);
  ```

### 7.2 生产守护配置
* **监听地址**：`http://0.0.0.0:3334`
* **PM2 服务标识**：`typing-practice-3334`
* **常用运维命令**：
  * 构建：`npm run build`
  * 重载：`pm2 reload typing-practice-3334`
  * 查看日志：`pm2 logs typing-practice-3334`

---

## 8. 自动化测试套件规范 (Test Suite Spec)

项目根目录配备 `test-suite.ts`，通过 `npx tsx test-suite.ts` 验证以下 5 类测试用例：

1. **测试用例 1：Markdown 解析完整性**
   - 验证 `语文默写.md` 解析词数 $\ge 200$（实际 292 词）。
   - 验证 `英语单词.md` 解析词数 $\ge 100$（实际 158 词）。
2. **测试用例 2：档位与长短句比例校验**
   - 验证 $N = 5$ 档位严格输出 5 词 + 5 句（3 短 + 2 长）。
   - 验证 $N = 10$ 档位严格输出 10 词 + 10 句（7 短 + 3 长）。
   - 验证 $N = 20$ 档位严格输出 20 词 + 20 句（14 短 + 6 长）。
3. **测试用例 3：抽词随机性校验**
   - 验证连续两次生成会话的词语序列不重复。
4. **测试用例 4：省略号分段校验**
   - 验证带 `...` 词条的 `hasEllipsis === true` 且 `segments.length === 2`。
5. **测试用例 5：空数据边界异常防御**
   - 验证空词池传入时正常抛出防御性异常，不产生无捕获崩溃。
