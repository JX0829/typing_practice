export type LanguageMode = 'zh' | 'en';

/** 从 /source/*.md 解析出的原始词条 */
export interface RawSourceWord {
  id: string;
  language: LanguageMode;
  text: string;           // 中文词语（如 "神采飞扬"）或英文单词/短语（如 "ask... for help"）
  pinyin?: string;        // 中文拼音（可由 AI 生成或由 pinyin-pro 兜底生成）
  pos?: string;           // 英文词性（如 "n.", "短语"）
  meaning?: string;       // 英文对应的中文释义（如 "请……帮忙"）
  unit?: string;          // 所属单元（如 "第一单元" / "Unit 8"）
  section?: string;       // 课文或小节
  hasEllipsis?: boolean;  // 是否包含 "..." 省略号结构
  segments?: string[];    // 若 hasEllipsis 为 true，按 "..." 拆分后的非空英文片段数组，如 ["ask", "for help"]
}

/** 上半部分：单个词语/单词练习项 */
export interface WordPracticeItem {
  id: string;
  targetText: string;     // 完整目标文本
  pinyin?: string;        // 中文模式展示：带声调拼音
  pos?: string;           // 英语模式展示：词性
  meaning?: string;       // 英语模式展示：中文释义（全默写提示源）
  hasEllipsis?: boolean;  // 英语模式：是否为 "..." 填空短语
  segments?: string[];    // 英语模式：分段输入目标 ["ask", "for help"]
  peeked?: boolean;       // 是否点击过偷看提示
}

/** 下半部分：单个句子练习项（严格遵守 30% long / 70% short） */
export interface SentencePracticeItem {
  id: string;
  sourceWord: string;     // 该句所对应的上半部分核心词
  lengthType: 'short' | 'long'; // 句子长短类型：short (70%) | long (30%)
  targetSentence: string; // 待打字的目标句子（中文优美句 / 英文语法句）
  pinyin?: string;        // 中文句子可选拼音辅助
  translation?: string;   // 英文句子的中文翻译
}

/** 一次完整练习会话的数据包结构（也是 AI 生成 JSON 的标准结构） */
export interface PracticeSessionPayload {
  language: LanguageMode;
  totalCount: number;
  words: WordPracticeItem[];
  sentences: SentencePracticeItem[];
}

/** 错题项目记录 */
export interface MistakeRecord {
  id: string;
  type: 'word' | 'sentence';
  prompt: string;         // 释义或拼音/翻译
  target: string;         // 正确目标
  userTyped: string;      // 用户最终输入内容
  peeked?: boolean;
}

/** 实时打字统计指标 */
export interface TypingStats {
  startTime: number | null;
  endTime: number | null;
  elapsedSeconds: number;
  totalTargetChars: number;
  correctChars: number;
  errorCharCount: number;      // 当前未修正的错误字符数
  historicalErrorCount: number;// 累计曾经打错过的字符次数
  accuracy: number;            // 准确率百分比 (0 ~ 100)
  cpm: number;                 // 每分钟正确字符数 (Characters Per Minute)
  mistakeItems: MistakeRecord[];
}
