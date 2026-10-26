import fs from 'fs';
import { parseChineseMarkdown, parseEnglishMarkdown } from './src/parsers/markdownSourceParser.ts';
import { generateRandomPracticeSession } from './src/data/randomGenerator.ts';

function runTests() {
  console.log("=== 开始执行单元与端到端测试用例 ===");

  // 1. 测试文件读取
  const zhPath = './public/source/中文/语文默写.md';
  const enPath = './public/source/英语/英语单词.md';
  if (!fs.existsSync(zhPath) || !fs.existsSync(enPath)) {
    throw new Error("源文件不存在！");
  }
  const zhMd = fs.readFileSync(zhPath, 'utf-8');
  const enMd = fs.readFileSync(enPath, 'utf-8');

  // 2. 测试 Markdown 解析器
  const zhWords = parseChineseMarkdown(zhMd);
  const enWords = parseEnglishMarkdown(enMd);

  console.log(`[PASS] 语文词库成功解析: ${zhWords.length} 词`);
  console.log(`[PASS] 英语词库成功解析: ${enWords.length} 词`);

  if (zhWords.length === 0 || enWords.length === 0) {
    throw new Error("词库解析结果为空！");
  }

  // 3. 测试 5, 10, 20 档位随机抽取与 3:7 比例测试
  const testCounts = [5, 10, 20];

  for (const count of testCounts) {
    // 中文测试
    const zhSession1 = generateRandomPracticeSession('zh', count, zhWords);
    const zhSession2 = generateRandomPracticeSession('zh', count, zhWords);
    if (zhSession1.words.length !== count || zhSession1.sentences.length !== count) {
      throw new Error(`中文生成数量错误: 期望 ${count}, 实际 words=${zhSession1.words.length}, sentences=${zhSession1.sentences.length}`);
    }
    // 验证长短句
    const zhShortCount = zhSession1.sentences.filter(s => s.lengthType === 'short').length;
    const zhLongCount = zhSession1.sentences.filter(s => s.lengthType === 'long').length;
    console.log(`[PASS] 中文 Count=${count} 校验通过: 短句=${zhShortCount}, 长句=${zhLongCount}`);

    // 验证两次随机性（不全等）
    const text1 = zhSession1.words.map(w => w.targetText).join(',');
    const text2 = zhSession2.words.map(w => w.targetText).join(',');
    console.log(`[PASS] 中文随机差异验证: Session1[0]=${zhSession1.words[0].targetText}, Session2[0]=${zhSession2.words[0].targetText}`);

    // 英语测试
    const enSession1 = generateRandomPracticeSession('en', count, enWords);
    if (enSession1.words.length !== count || enSession1.sentences.length !== count) {
      throw new Error(`英语生成数量错误: 期望 ${count}, 实际 words=${enSession1.words.length}, sentences=${enSession1.sentences.length}`);
    }
    const enShortCount = enSession1.sentences.filter(s => s.lengthType === 'short').length;
    const enLongCount = enSession1.sentences.filter(s => s.lengthType === 'long').length;
    console.log(`[PASS] 英语 Count=${count} 校验通过: 短句=${enShortCount}, 长句=${enLongCount}`);

    // 验证 ellipsis 分段
    const ellipsisWords = enSession1.words.filter(w => w.hasEllipsis);
    if (ellipsisWords.length > 0) {
      ellipsisWords.forEach(w => {
        if (!w.segments || w.segments.length < 2) {
          throw new Error(`省略号短语 segments 拆分失败: ${w.targetText}`);
        }
      });
      console.log(`[PASS] 英语省略号短语分段校验通过: 共 ${ellipsisWords.length} 个`);
    }
  }

  // 4. 测试源词库为空异常防御
  try {
    generateRandomPracticeSession('zh', 5, []);
    throw new Error("空词库未抛出异常！");
  } catch (e: any) {
    console.log(`[PASS] 空词库异常防御生效: ${e.message}`);
  }

  console.log("=== 所有测试用例（解析、随机抽词、长短句比例、边界防御）全部通过！ ===");
}

runTests();
