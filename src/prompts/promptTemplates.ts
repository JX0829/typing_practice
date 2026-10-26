import { RawSourceWord } from '../types/practice';

/**
 * 生成中文练习 AI 提示词
 */
export function buildZhPrompt(words: RawSourceWord[], count: number = 20): string {
  const shortCount = Math.round(count * 0.7);
  const longCount = count - shortCount;
  const wordListText = words.slice(0, count).map((w, idx) => `${idx + 1}. ${w.text}`).join('\n');

  return `你是一位资深小学语文名师与文学编辑。请根据我提供的 ${count} 个中文词语，生成一套用于“打字与写作积累练习”的 JSON 数据。

### 待练习词语列表（共 ${count} 个）：
${wordListText}

### 严格生成要求：
1. **词语部分 (\`words\`)**：
   - 保持上述 ${count} 个词语顺序不变，为每个词语标注准确的现代汉语带声调拼音（字与字之间用空格分隔，如 \`"shān pō"\`）。
2. **优美句子部分 (\`sentences\`)**：
   - 必须围绕上述 ${count} 个词语，每个词各造 1 个适合小学生写作引用的优美句子（共 ${count} 句），句子中必须包含该词语原词。
   - **长短句 3:7 比例硬性要求**：在 ${count} 个句子中，必须严格包含 **${shortCount} 个优美短句（占比70%，字数控制在 10~18 字，凝练生动）** 和 **${longCount} 个优美长句（占比30%，字数控制在 24~42 字，包含比喻、拟人或排比修辞，画面感强）**。
   - 每个句子需准确标记 \`"lengthType": "short"\` 或 \`"lengthType": "long"\`。
3. **输出格式**：
   - 请仅输出一个合法的 JSON 代码块，不要包含任何多余的解释文字，JSON 结构严格如下：

\`\`\`json
{
  "language": "zh",
  "totalCount": ${count},
  "words": [
    {
      "id": "w1",
      "targetText": "词语名称",
      "pinyin": "cí yǔ míng chēng"
    }
  ],
  "sentences": [
    {
      "id": "s1",
      "sourceWord": "词语名称",
      "lengthType": "short",
      "targetSentence": "短句子内容。"
    },
    {
      "id": "s2",
      "sourceWord": "另一词语",
      "lengthType": "long",
      "targetSentence": "长句子内容，描绘细腻且生动。"
    }
  ]
}
\`\`\``;
}

/**
 * 生成英语练习 AI 提示词
 */
export function buildEnPrompt(words: RawSourceWord[], count: number = 20): string {
  const shortCount = Math.round(count * 0.7);
  const longCount = count - shortCount;
  const wordListText = words.slice(0, count).map((w, idx) => {
    return `${idx + 1}. ${w.text} (${w.pos || '词汇'}) - 释义: ${w.meaning || ''}`;
  }).join('\n');

  return `你是一位资深小学英语名师。请根据我提供的 ${count} 个英语单词/短语（含词性与中文释义），生成一套用于“英语单词全默写与语法例句打字练习”的 JSON 数据。

### 待练习单词/短语列表（共 ${count} 个）：
${wordListText}

### 严格生成要求：
1. **单词默写部分 (\`words\`)**：
   - 保持上述 ${count} 个单词/短语不变，保留完整的 \`targetText\`、\`pos\`（词性）和 \`meaning\`（中文释义）。
   - **重要提示**：\`meaning\` 字段将作为学生“看中文全默写英文单词”的唯一提示，请确保中文释义清晰准确，且**绝对不要在 \`meaning\` 中泄露原英文单词**（例如若原释义有 \`（复数: leaves）\`，请清理为纯中文提示 \`叶子\`）。
   - 若短语中含有 \`...\`（如 \`ask... for help\`），请设置 \`"hasEllipsis": true\`，并增加 \`"segments": ["ask", "for help"]\` 数组字段（将 \`...\` 前后的英文部分拆开）。
2. **语法例句部分 (\`sentences\`)**：
   - 用每个单词/短语各造 1 个符合小学至初中认知、语法纯正的英文例句（共 ${count} 句），并附带自然准确的中文翻译 \`translation\`。若短语含 \`...\`（如 \`ask... for help\`），在句子中请填入具体代词或名词使其成为完整可读的句子（如 \`You can ask your teacher for help.\`）。
   - **长短句 3:7 比例硬性要求**：在 ${count} 个英文句子中，必须严格包含 **${shortCount} 个基础短句（占比70%，单词数 5~8 个词，主谓宾结构清晰）** 和 **${longCount} 个进阶长句（占比30%，单词数 10~16 个词，包含并列结构、介词短语或状语从句）**。
   - 每个句子需准确标记 \`"lengthType": "short"\` 或 \`"lengthType": "long"\`。
3. **输出格式**：
   - 请仅输出一个合法的 JSON 代码块，不要包含任何多余的解释文字，JSON 结构严格如下：

\`\`\`json
{
  "language": "en",
  "totalCount": ${count},
  "words": [
    {
      "id": "w1",
      "targetText": "classmate",
      "pos": "n.",
      "meaning": "同班同学",
      "hasEllipsis": false
    },
    {
      "id": "w2",
      "targetText": "ask... for help",
      "pos": "短语",
      "meaning": "请……帮忙",
      "hasEllipsis": true,
      "segments": ["ask", "for help"]
    }
  ],
  "sentences": [
    {
      "id": "s1",
      "sourceWord": "classmate",
      "lengthType": "short",
      "targetSentence": "Tom is my new classmate.",
      "translation": "汤姆是我的新同班同学。"
    },
    {
      "id": "s2",
      "sourceWord": "ask... for help",
      "lengthType": "long",
      "targetSentence": "When you get lost in a new place, you can ask a police officer for help.",
      "translation": "当你在陌生的地方迷路时，你可以向警察寻求帮助。"
    }
  ]
}
\`\`\``;
}
