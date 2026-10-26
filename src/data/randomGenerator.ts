import { PracticeSessionPayload, RawSourceWord, WordPracticeItem, SentencePracticeItem } from '../types/practice';
import { pinyin } from 'pinyin-pro';

// 预设中文高质量例句库映射（长句/短句，按词条精准覆盖）
const ZH_SENTENCE_KNOWLEDGE: Record<string, { short: string; long: string }> = {
  '山坡': {
    short: '春风轻轻吹绿了向阳的山坡。',
    long: '阳春三月，连绵起伏的山坡上开满了漫山遍野的杜鹃花，宛如大自然铺开的五彩地毯。'
  },
  '学校': {
    short: '清脆的铃声回荡在美丽的学校里。',
    long: '清晨的金色阳光洒满校园，琅琅的读书声回荡在整座学校，充满了朝气与蓬勃生机。'
  },
  '课文': {
    short: '同学们正在声情并茂地朗读课文。',
    long: '语文老师用生动动听的声音讲解着课文，把同学们带入了一个个引人入胜的童话世界。'
  },
  '声音': {
    short: '树林里传来小鸟欢快清脆的声音。',
    long: '清晨漫步在山间小溪旁，耳边回荡着泉水叮咚与林间鸟儿清脆悦耳的声音，令人神清气爽。'
  },
  '古老': {
    short: '村口矗立着一棵古老的大榕树。',
    long: '村庄尽头那棵历经数百年风霜的古老大树，依然撑着浓密的绿荫守护着一代又一代村民。'
  },
  '粗壮': {
    short: '古树粗壮的枝干撑开一把绿色大伞。',
    long: '操场角落那棵大槐树长着粗壮的树干与繁茂的绿叶，夏天成了同学们嬉戏乘凉的乐园。'
  },
  '洁白': {
    short: '天空中飘浮着几朵洁白的云彩。',
    long: '冬日雪后初晴，整座城市银装素裹，屋顶和树梢上都覆盖着一层晶莹剔透且洁白的厚雪。'
  },
  '篮球': {
    short: '操场上同学们正在热烈地打篮球。',
    long: '下课铃声一响，热爱运动的同学们便飞奔到操场上，在热烈的欢呼声中展开了一场精彩的篮球赛。'
  },
  '招呼': {
    short: '小鸟在树枝上热情地打着招呼。',
    long: '清晨走进明亮的校门，同学们都礼貌地向迎面走来的老师和身边的伙伴们微笑着打招呼。'
  },
  '飘落': {
    short: '红红的枫叶从树上缓缓飘落。',
    long: '微风轻轻拂过树梢，金黄的银杏树叶犹如一只只美丽的蝴蝶，在空中打着旋儿轻盈地飘落。'
  },
  '玩耍': {
    short: '几只活泼的小松鼠在树下快乐地玩耍。',
    long: '课间十分钟，操场上到处是同学们尽情奔跑、捉迷藏和快乐玩耍的身影，笑声此起彼伏。'
  },
  '蝴蝶': {
    short: '斑斓的蝴蝶在花丛中翩翩起舞。',
    long: '盛开的花圃上空，五彩缤纷的蝴蝶在和煦的阳光下拍打着翅膀，宛如跳动的美丽音符。'
  },
  '神采飞扬': {
    short: '少先队员们昂首挺胸神采飞扬。',
    long: '清晨的阳光洒满操场，少先队员们佩戴着鲜艳的红领巾，一个个神采飞扬地走向庄严的升旗台。'
  },
  '摇头晃脑': {
    short: '小明背诵古诗时总是摇头晃脑。',
    long: '读书角里，同学们沉浸在经典的诗篇中，摇头晃脑地大声朗诵，仿佛真成了一个个古代小书生。'
  },
  '迎风飘扬': {
    short: '鲜艳的五星红旗迎风飘扬。',
    long: '雄壮的国歌声在广场上空回荡，鲜艳夺目的五星红旗迎风飘扬，大家满怀敬意地行少先队礼。'
  },
  '湿润': {
    short: '一场蒙蒙细雨后空气格外清凉湿润。',
    long: '清晨漫步在雨后幽静的林间小道上，脚下踩着湿润松软的泥土，空气中弥漫着青草与泥土的清香。'
  },
  '狂欢': {
    short: '丰收的田野成了动物们的狂欢节。',
    long: '大雨终于停歇，林子里的小动物们纷纷探出脑袋，踩着欢快的步伐在草地上举行了一场盛大的狂欢。'
  },
  '互相': {
    short: '小伙伴们在学习中总是互相鼓励帮助。',
    long: '在遇到难题和挑战时，同学们懂得互相帮助、携手并进，友谊在真诚的关怀中变得愈发深厚。'
  },
  '跳舞': {
    short: '金黄的落叶在秋风中轻盈地跳舞。',
    long: '舞台中央的少儿舞蹈队身姿轻盈曼妙，随着欢快的乐曲如同林间欢快的小鹿一般尽情跳舞。'
  },
  '狂风暴雨': {
    short: '窗外狂风暴雨肆虐呼啸。',
    long: '虽然窗外狂风暴雨呼啸咆哮，但温馨明亮的书房里小明依然神情自若、聚精会神地品味着书香。'
  },
  '流利': {
    short: '明明用流利的普通话朗诵古诗。',
    long: '经过长时间坚持不懈的晨读练习，他终于能够在全班同学面前自信且流利地背诵整篇名家美文。'
  },
  '鸦雀无声': {
    short: '教室里顿时变得鸦雀无声。',
    long: '老师严肃地走进教室并站在讲台上那一刻，原本喧闹打闹的教室内顿时变得鸦雀无声。'
  },
  '秋风': {
    short: '凉爽的秋风吹黄了漫山遍野的树叶。',
    long: '秋风如同一位神奇的画师，悄然拂过大地，将田野染成金黄，把漫山枫叶描绘得火红灿烂。'
  },
  '明朗': {
    short: '连绵阴雨过后天空终于变得晴朗明朗。',
    long: '阳光穿透云层洒向大地，雨后的天空显得分外湛蓝明朗，让人心情也跟着畅快舒朗起来。'
  },
  '落叶': {
    short: '红红的枫树落叶像一枚枚寄来的邮票。',
    long: '深秋时节，铺满青石板小径的层层金黄落叶踩上去发出清脆的声响，是大自然奏响的动人乐章。'
  },
  '闪闪发光': {
    short: '青翠草叶上的雨露在晨光中闪闪发光。',
    long: '初升朝阳洒在青翠的草叶上，一颗颗晶莹剔透的晨露宛如无瑕珍珠般在晨光中闪闪发光。'
  },
  '秋高气爽': {
    short: '在这秋高气爽的季节里我们去秋游。',
    long: '在这秋高气爽、微风和煦的金秋十月，全校师生满怀喜悦与激情迎来了期盼已久的秋季田径运动会。'
  },
  '海阔天空': {
    short: '登上山巅视野海阔天空。',
    long: '历尽艰辛登上险峻的山顶俯瞰四野，眼前顿觉海阔天空，心胸也随之变得无比开阔宽广。'
  }
};

// 预设英语高质量例句库映射
const EN_SENTENCE_KNOWLEDGE: Record<string, { short: string; long: string; shortTrans: string; longTrans: string }> = {
  'classmate': {
    short: 'Tom is my new classmate.',
    shortTrans: '汤姆是我的新同班同学。',
    long: 'My classmate Tom always helps me solve difficult math problems after school.',
    longTrans: '放学后我的同班同学汤姆总是帮我解决有难度的数学题。'
  },
  'teacher': {
    short: 'Our English teacher is very kind.',
    shortTrans: '我们的英语老师非常和蔼。',
    long: 'Our English teacher encourages every student to speak English aloud in class.',
    longTrans: '我们的英语老师鼓励每个学生在课堂上大声讲英语。'
  },
  'school': {
    short: 'We walk to school together happily.',
    shortTrans: '我们高高兴兴一起走着去学校。',
    long: 'Every morning, hundreds of energetic students walk through the school gate with bright smiles.',
    longTrans: '每天早晨，数百名精力充沛的学生带着灿烂的笑容走进校门。'
  },
  'book': {
    short: 'I like reading this interesting book.',
    shortTrans: '我喜欢读这本有趣的书。',
    long: 'Reading an interesting science book can open up a brand new world of wonder for curious children.',
    longTrans: '阅读一本有趣的科普书能够为充满好奇心的孩子们打开一个全新的奇妙世界。'
  },
  'play sports': {
    short: 'We often play sports after school.',
    shortTrans: '我们经常在放学后做运动。',
    long: 'Playing sports with friends in the fresh air keeps our body strong and energetic throughout the day.',
    longTrans: '在清新的空气中和朋友一起运动能让我们整天保持身体强健、精力充沛。'
  },
  'study': {
    short: 'Students study hard every single day.',
    shortTrans: '学生们每天都努力学习。',
    long: 'If you study hard and never give up, you will definitely achieve your personal goals in the future.',
    longTrans: '如果你努力学习且永不言弃，未来你必定能够实现自己的人生目标。'
  },
  'be good at': {
    short: 'Lily is good at singing songs.',
    shortTrans: '莉莉擅长唱歌。',
    long: 'My sister is good at playing the piano, and she practices diligently every evening without stopping.',
    longTrans: '我姐姐擅长弹钢琴，她每天晚上都坚持不懈地认真练习。'
  },
  'draw': {
    short: 'I like to draw cute animals.',
    shortTrans: '我喜欢画可爱的小动物。',
    long: 'With colorful pencils in hand, the little artist can draw beautiful landscapes with great imagination.',
    longTrans: '手里拿着彩色铅笔，这位小画家能够凭借丰富的想象力画出美丽的风景。'
  },
  'tell a story': {
    short: 'Grandpa can tell a funny story.',
    shortTrans: '爷爷会讲一个有趣的故事。',
    long: 'My grandfather likes to tell a wonderful story about ancient heroes to inspire us before bedtime.',
    longTrans: '我的祖父喜欢在睡前讲一个关于古代英雄的精彩故事来激励我们。'
  },
  'be proud of': {
    short: 'Parents are proud of their children.',
    shortTrans: '父母为他们的孩子感到自豪。',
    long: 'The teacher and classmates are very proud of Jack because he won the first prize in the competition.',
    longTrans: '老师和同学们都为杰克感到骄傲，因为他在比赛中斩获了一等奖。'
  },
  'garden': {
    short: 'Many red flowers bloom in the garden.',
    shortTrans: '许多红色的花朵在花园里盛开。',
    long: 'My grandmother spends every weekend tending colourful roses and sweet tomatoes in her lovely garden.',
    longTrans: '我的祖母每个周末都会在她可爱的花园里照料色彩缤纷的玫瑰与清甜的番茄。'
  },
  'beautiful': {
    short: 'The autumn park is really beautiful.',
    shortTrans: '秋天的公园真是美丽。',
    long: 'When the golden leaves cover the forest ground, the whole mountain becomes remarkably beautiful.',
    longTrans: '当金黄的树叶铺满林地时，整座大山变得格外美丽迷人。'
  },
  'leaf': {
    short: 'A yellow leaf falls from the tree.',
    shortTrans: '一片黄色的树叶从树上掉落下来。',
    long: 'In late autumn, each dancing leaf falls down softly like a tiny gold feather floating in the wind.',
    longTrans: '在深秋，每片翩跹起舞的树叶都轻柔地落下，宛如风中漂浮的细小金色羽毛。'
  },
  'water vapour': {
    short: 'White water vapour rises in the air.',
    shortTrans: '白色的水蒸气在空中升起。',
    long: 'When boiling hot water in the kitchen, you can see thick white water vapour rising up quickly into the cool air.',
    longTrans: '在厨房烧开水的时候，你可以看到浓厚的白色水蒸气迅速升腾到凉爽的空气中。'
  },
  'little by little': {
    short: 'He improves his English little by little.',
    shortTrans: '他一点一点地提升自己的英语。',
    long: 'If you persist in reading English books every morning, your vocabulary will expand little by little.',
    longTrans: '如果你每天早晨坚持阅读英文书籍，你的词汇量就会一点一滴地逐步扩大。'
  },
  'busy': {
    short: 'Dad is very busy with his work.',
    shortTrans: '爸爸忙于他的工作。',
    long: 'Although the doctors and nurses are extremely busy, they always care for their patients with gentle smiles.',
    longTrans: '尽管医生和护士们极其忙碌，他们对待病人时脸上总挂着温暖温和的微笑。'
  },
  'do the dishes': {
    short: 'I help mom do the dishes tonight.',
    shortTrans: '今晚我帮妈妈洗碗碟。',
    long: 'After a delicious family dinner, the kids always volunteer to clean the table and do the dishes.',
    longTrans: '一顿丰盛的家庭晚餐后，孩子们总是主动承担清理餐桌和洗碗的任务。'
  },
  'police officer': {
    short: 'A brave police officer helped the kid.',
    shortTrans: '一位勇敢的警察帮助了那个孩子。',
    long: 'A friendly police officer guided the lost tourists patiently and helped them find the museum quickly.',
    longTrans: '一位热心的警官耐心地为迷路的游客指路，帮助他们迅速找到了博物馆。'
  },
  'ask... for help': {
    short: 'You can ask teachers for help.',
    shortTrans: '你可以请老师帮忙。',
    long: 'Whenever you find yourself lost in an unfamiliar neighborhood, you should never hesitate to ask a police officer for help.',
    longTrans: '无论何时当你在陌生的街区迷路时，你应该毫不犹豫地向警察寻求帮助。'
  },
  'get to': {
    short: 'We get to the library at nine.',
    shortTrans: '我们九点钟到达了图书馆。',
    long: 'Take this clean subway line and you will smoothly get to the city art museum in twenty minutes.',
    longTrans: '乘坐这条干净的地铁线路，你在二十分钟内就能顺利到达城市艺术博物馆。'
  },
  'get together': {
    short: 'Good friends get together on weekends.',
    shortTrans: '好朋友们周末聚在一起。',
    long: 'During the traditional Spring Festival, families from all over get together to share delicious feasts and laughter.',
    longTrans: '在传统的春节期间，各地的家人欢聚一堂，共同分享美味佳肴与欢声笑语。'
  },
  'famous': {
    short: 'Beijing is a very famous capital.',
    shortTrans: '北京是一座非常著名的首都。',
    long: 'The Great Wall of China is a world-famous wonder that attracts millions of enthusiastic travelers every year.',
    longTrans: '中国万里长城是一座举世闻名的奇迹，每年吸引数以百万计热情的旅行者前去参观。'
  }
};

// 数组随机打乱辅助函数 (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 核心：点击“立即开练”时，每次从词库中纯随机抽取 count 个词，并精准组装长短句数据包
 */
export function generateRandomPracticeSession(
  lang: 'zh' | 'en',
  count: number,
  sourcePool: RawSourceWord[]
): PracticeSessionPayload {
  if (!sourcePool || sourcePool.length === 0) {
    throw new Error('词库池为空，请检查词库加载');
  }

  // 1. 打乱源词库，随机抽取 count 个
  const shuffledSource = shuffleArray(sourcePool);
  const pickedRawWords = shuffledSource.slice(0, Math.min(count, shuffledSource.length));

  const targetCount = pickedRawWords.length;
  const longCount = Math.max(1, Math.round(targetCount * 0.3)); // 30% 长句

  // 决定哪几个索引为长句
  const indexIndices = Array.from({ length: targetCount }, (_, i) => i);
  const shuffledIndices = shuffleArray(indexIndices);
  const longIndicesSet = new Set(shuffledIndices.slice(0, longCount));

  const words: WordPracticeItem[] = [];
  const sentences: SentencePracticeItem[] = [];

  pickedRawWords.forEach((raw, idx) => {
    const isLong = longIndicesSet.has(idx);
    const lengthType: 'short' | 'long' = isLong ? 'long' : 'short';

    if (lang === 'zh') {
      const pinyinStr = raw.pinyin || pinyin(raw.text, { toneType: 'symbol', type: 'string' });
      words.push({
        id: `zh-w-${idx + 1}-${Date.now()}`,
        targetText: raw.text,
        pinyin: pinyinStr
      });

      // 句子：优先在知识库找，没有则智能合成符合规范的句子
      const matchedKnowledge = ZH_SENTENCE_KNOWLEDGE[raw.text];
      let targetSentence = '';
      if (matchedKnowledge) {
        targetSentence = isLong ? matchedKnowledge.long : matchedKnowledge.short;
      } else {
        targetSentence = isLong
          ? `清晨的阳光洒在校园的各个角落，同学们怀着美好的心情，围绕着${raw.text}展开了生动的语文朗读活动。`
          : `老师在课堂上带领大家深入理解了“${raw.text}”这个词。`;
      }

      sentences.push({
        id: `zh-s-${idx + 1}-${Date.now()}`,
        sourceWord: raw.text,
        lengthType,
        targetSentence
      });
    } else {
      // 英语模式
      const hasEllipsis = Boolean(raw.hasEllipsis || raw.text.includes('...'));
      let segments = raw.segments;
      if (hasEllipsis && (!segments || !segments.length)) {
        segments = raw.text.split(/\.{3,}/).map(s => s.trim()).filter(Boolean);
      }

      words.push({
        id: `en-w-${idx + 1}-${Date.now()}`,
        targetText: raw.text,
        pos: raw.pos || '单词',
        meaning: raw.meaning || raw.text,
        hasEllipsis,
        segments
      });

      const matchedEn = EN_SENTENCE_KNOWLEDGE[raw.text];
      let targetSentence = '';
      let translation = '';

      if (matchedEn) {
        targetSentence = isLong ? matchedEn.long : matchedEn.short;
        translation = isLong ? matchedEn.longTrans : matchedEn.shortTrans;
      } else {
        const cleanWord = raw.text.replace('...', 'someone');
        targetSentence = isLong
          ? `Every morning in the classroom, the teacher teaches us how to use "${cleanWord}" naturally in our daily English conversation.`
          : `We should remember how to use ${cleanWord} in daily life.`;
        translation = isLong
          ? `每天早晨在教室里，老师都会教我们如何在日常英语会话中自然地使用“${cleanWord}”。`
          : `我们应该记住在日常生活中如何使用“${cleanWord}”。`;
      }

      sentences.push({
        id: `en-s-${idx + 1}-${Date.now()}`,
        sourceWord: raw.text,
        lengthType,
        targetSentence,
        translation
      });
    }
  });

  return {
    language: lang,
    totalCount: targetCount,
    words,
    sentences
  };
}
