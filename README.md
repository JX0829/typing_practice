# LinguaType (中英文打字与默写练习)

> [English](#english) | [中文](#chinese)

---

<a name="chinese"></a>
## 🇨🇳 中文说明

**LinguaType** 是一款专为小学及语言初学者设计的现代化、轻量级中英文打字与默写练习 Web 应用。

采用**纯客户端零后端 / 免 API Key 闭环架构**，内置基于 Fisher-Yates 算法的纯随机抽词引擎，支持**词语全默写**与**3:7 黄金比例长短句跟打**，全方位提升打字速度、拼写准确率与写作积累。

### ✨ 核心特性

1. **中英差异化训练机制**：
   - **中文读写**：汉字输入为主，配备拼音辅助；支持输入法（IME）安全输入，拼音未上屏不误判，上屏后逐字校验；
   - **英语全默写**：默认隐藏英文单词，仅展示词性与中文释义（支持按键偷看提示）；遇到如 `ask... for help` 等省略号短语自动渲染为双框分段填空。
2. **极速交互流转**：
   - **自动跳题**：单词或词语字数输入达标后自动平滑跳转下一个词；
   - **退格回退**：输入框为空时按下 `Backspace` 键自动退回上一个词，检查修改流畅顺手。
3. **3:7 黄金长短句积累**：
   - 下半部分句子严格按照 **70% 精炼短句 + 30% 进阶长句** 比例构建；
   - 全半角中英文标点智能容错等价匹配（如 `，` 与 `,`），避免因标点切换卡死。
4. **开箱即用与双通道模式**：
   - 内置高质量中英文例句库，支持 5 / 10 / 20 词量档位一键随机开练；
   - 支持一键导出 AI Prompt，用户将大模型生成的 JSON 粘贴回网站即可自定义任意练习题。
5. **生机护眼 UI**：
   - 采用翡翠绿（Emerald / Mint）清新高对比自然风格，保护视力。

### 🚀 快速上手

#### 本地开发
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

#### 生产构建与运行
```bash
# 构建静态资源
npm run build

# 运行生产轻量服务器
node server.mjs
```

#### 运行测试套件
```bash
npx tsx test-suite.ts
```

---

<a name="english"></a>
## 🇬🇧 English Description

**LinguaType** is a modern, responsive web application tailored for language learners and primary school students to practice typing, spelling, and dictation in both English and Chinese.

Designed with a **zero-backend / API-key-free** architecture, it features a Fisher-Yates randomized word picker, full blind-dictation mode, and a **3:7 ratio of long-to-short sentence practice**.

### ✨ Key Features

1. **Differentiated Learning Paths**:
   - **Chinese Typing**: Character typing with Pinyin tone guidance. Fully IME-safe (no false-positive error triggers during composition).
   - **English Blind Dictation**: Target English words are hidden by default—only part of speech and Chinese definitions are displayed. Special ellipsis phrases like `ask... for help` are automatically split into two-segment inputs.
2. **Smooth Interaction Flow**:
   - **Auto-advance**: Focus automatically transitions to the next word once the target character count is reached.
   - **Backspace Navigation**: Hitting `Backspace` inside an empty input seamlessly navigates back to the previous word.
3. **3:7 Gold Long-to-Short Sentence Ratio**:
   - Sentences strictly follow **70% short sentences + 30% long/advanced sentences**.
   - Full-width / half-width punctuation fault tolerance (e.g., `,` matches `，`).
4. **Instant Offline Practice & AI Prompt Pipeline**:
   - Pre-packaged with hundreds of curated words/sentences for 5 / 10 / 20 count sessions.
   - Built-in AI prompt generator allowing users to generate custom sessions via any LLM.
5. **Fresh Emerald Theme**:
   - Eye-friendly, accessible emerald green palette.

### 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
node server.mjs

# Run automated tests
npx tsx test-suite.ts
```

### 📄 License

MIT License.
