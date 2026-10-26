import { RawSourceWord } from '../types/practice';

/**
 * 解析语文默写 Markdown
 */
export function parseChineseMarkdown(mdContent: string): RawSourceWord[] {
  const lines = mdContent.split(/\r?\n/);
  const words: RawSourceWord[] = [];
  const seenTexts = new Set<string>();

  let currentUnit = '第一单元';
  let currentSection = '大青树下的小学';

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('# ') || line.startsWith('>') || line.startsWith('---')) {
      continue;
    }

    if (line.startsWith('## ')) {
      currentUnit = line.replace('## ', '').trim();
      continue;
    }

    if (line.startsWith('### ')) {
      currentSection = line.replace('### ', '').trim();
      continue;
    }

    // 剥离可能存在的标签前缀，如 `* **四字成语 / 积累**：` 或 `* **词语积累**：`
    let cleanLine = line;
    cleanLine = cleanLine.replace(/^\*\s*\*\*.*?\*\*[:：]?\s*/, '');
    cleanLine = cleanLine.replace(/^[-*]\s*/, '');

    // 按顿号、逗号、空格拆分
    const parts = cleanLine.split(/[、,，\s]+/).map(w => w.trim()).filter(Boolean);
    for (const part of parts) {
      // 过滤非中文或说明符号
      const text = part.replace(/[^\u4e00-\u9fa5]/g, '').trim();
      if (text.length >= 1 && !seenTexts.has(text)) {
        seenTexts.add(text);
        words.push({
          id: `zh-${words.length + 1}`,
          language: 'zh',
          text,
          unit: currentUnit,
          section: currentSection
        });
      }
    }
  }

  return words;
}

/**
 * 解析英语单词 Markdown
 */
export function parseEnglishMarkdown(mdContent: string): RawSourceWord[] {
  const lines = mdContent.split(/\r?\n/);
  const words: RawSourceWord[] = [];
  const seenTexts = new Set<string>();

  let currentUnit = 'Unit 1';

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('# ') || line.startsWith('>') || line.startsWith('---')) {
      continue;
    }

    if (line.startsWith('## ')) {
      currentUnit = line.replace('## ', '').trim();
      continue;
    }

    // 表格行匹配：| 序号 | **word** | *pos* | meaning |
    // 允许宽松格式：| 1 | **new** | *adj.* | 新的 |
    if (line.startsWith('|') && line.endsWith('|')) {
      const cols = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cols.length >= 4) {
        const rawSeq = cols[0];
        const rawWord = cols[1];
        const rawPos = cols[2];
        const rawMeaning = cols[3];

        if (rawSeq === '序号' || rawSeq.includes('---')) {
          continue;
        }

        const wordText = rawWord.replace(/\*\*/g, '').trim();
        const posText = rawPos.replace(/\*/g, '').trim();
        // 清理中文释义（避免包含英文原词剧透）
        const meaningText = rawMeaning.trim();

        if (wordText && !seenTexts.has(wordText.toLowerCase())) {
          seenTexts.add(wordText.toLowerCase());

          const hasEllipsis = wordText.includes('...');
          let segments: string[] | undefined = undefined;
          if (hasEllipsis) {
            segments = wordText.split(/\.{3,}/).map(s => s.trim()).filter(Boolean);
          }

          words.push({
            id: `en-${words.length + 1}`,
            language: 'en',
            text: wordText,
            pos: posText,
            meaning: meaningText,
            unit: currentUnit,
            hasEllipsis,
            segments
          });
        }
      }
    }
  }

  return words;
}
