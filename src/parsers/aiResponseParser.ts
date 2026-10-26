import { PracticeSessionPayload, WordPracticeItem, SentencePracticeItem } from '../types/practice';
import { pinyin } from 'pinyin-pro';

/**
 * 校验并容错解析用户粘贴的 AI 输出 JSON
 */
export function parseAiResponse(rawInput: string): PracticeSessionPayload {
  let cleaned = rawInput.trim();

  // 1. 去除 Markdown 代码块标记（如 ```json ... ``` 或 ``` ... ```）
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonMatch) {
    cleaned = jsonMatch[1].trim();
  } else {
    // 寻找最外层的 { ... }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('JSON 解析失败，请确认 AI 输出内容符合标准的 JSON 格式！');
  }

  if (!parsed || !Array.isArray(parsed.words) || !Array.isArray(parsed.sentences)) {
    throw new Error('数据结构不符合要求：必须包含 words 与 sentences 数组');
  }

  const language = parsed.language === 'en' ? 'en' : 'zh';
  const words: WordPracticeItem[] = [];
  const sentences: SentencePracticeItem[] = [];

  // 清洗 words
  for (let i = 0; i < parsed.words.length; i++) {
    const item = parsed.words[i];
    const targetText = String(item.targetText || item.word || '').trim();
    if (!targetText) continue;

    let pinyinStr = item.pinyin;
    if (language === 'zh' && !pinyinStr) {
      // 使用 pinyin-pro 自动兜底生成
      pinyinStr = pinyin(targetText, { toneType: 'symbol', type: 'string' });
    }

    const hasEllipsis = Boolean(item.hasEllipsis || targetText.includes('...'));
    let segments = item.segments;
    if (hasEllipsis && (!segments || !segments.length)) {
      segments = targetText.split(/\.{3,}/).map((s: string) => s.trim()).filter(Boolean);
    }

    words.push({
      id: item.id || `w${i + 1}`,
      targetText,
      pinyin: pinyinStr,
      pos: item.pos,
      meaning: item.meaning,
      hasEllipsis,
      segments
    });
  }

  // 清洗 sentences
  for (let i = 0; i < parsed.sentences.length; i++) {
    const item = parsed.sentences[i];
    const targetSentence = String(item.targetSentence || item.sentence || '').trim();
    if (!targetSentence) continue;

    sentences.push({
      id: item.id || `s${i + 1}`,
      sourceWord: String(item.sourceWord || item.word || '').trim(),
      lengthType: item.lengthType === 'long' ? 'long' : 'short',
      targetSentence,
      pinyin: item.pinyin,
      translation: item.translation
    });
  }

  return {
    language,
    totalCount: words.length,
    words,
    sentences
  };
}
