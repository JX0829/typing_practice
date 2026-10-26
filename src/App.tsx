import React, { useState, useEffect, useRef } from 'react';
import { RawSourceWord, PracticeSessionPayload, TypingStats, MistakeRecord } from './types/practice';
import { parseChineseMarkdown, parseEnglishMarkdown } from './parsers/markdownSourceParser';
import { SetupWizard } from './components/SetupWizard';
import { WordPracticeArena } from './components/WordPracticeArena';
import { SentencePracticeArena } from './components/SentencePracticeArena';
import { ResultSummaryModal } from './components/ResultSummaryModal';
import { Clock, CheckCircle2, RotateCcw, ArrowLeft, Send, Sprout } from 'lucide-react';

export const App: React.FC = () => {
  const [zhWords, setZhWords] = useState<RawSourceWord[]>([]);
  const [enWords, setEnWords] = useState<RawSourceWord[]>([]);
  const [sessionData, setSessionData] = useState<PracticeSessionPayload | null>(null);

  // 输入记录状态
  const [wordValues, setWordValues] = useState<Record<string, string>>({});
  const [sentenceValues, setSentenceValues] = useState<Record<string, string>>({});
  const [peekedWords, setPeekedWords] = useState<Set<string>>(new Set());

  // 计时与统计状态
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [stats, setStats] = useState<TypingStats | null>(null);

  const timerRef = useRef<any>(null);

  // 加载原始 Markdown 源词库
  useEffect(() => {
    fetch('/source/中文/语文默写.md')
      .then(r => r.text())
      .then(text => {
        const parsed = parseChineseMarkdown(text);
        setZhWords(parsed);
      })
      .catch(err => console.error('读取语文默写源文档失败:', err));

    fetch('/source/英语/英语单词.md')
      .then(r => r.text())
      .then(text => {
        const parsed = parseEnglishMarkdown(text);
        setEnWords(parsed);
      })
      .catch(err => console.error('读取英语单词源文档失败:', err));
  }, []);

  // 计时器触发与步进
  useEffect(() => {
    if (startTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isCompleted]);

  // 任意键敲击自动启动计时器
  const triggerTimer = () => {
    if (!startTime && !isCompleted) {
      setStartTime(Date.now());
    }
  };

  const handleWordChange = (wordId: string, val: string) => {
    triggerTimer();
    setWordValues(prev => ({ ...prev, [wordId]: val }));
  };

  const handleSentenceChange = (sentenceId: string, val: string) => {
    triggerTimer();
    setSentenceValues(prev => ({ ...prev, [sentenceId]: val }));
  };

  const handlePeekWord = (wordId: string) => {
    setPeekedWords(prev => new Set(prev).add(wordId));
  };

  // 开始新练习
  const handleStartPractice = (payload: PracticeSessionPayload) => {
    setSessionData(payload);
    setWordValues({});
    setSentenceValues({});
    setPeekedWords(new Set());
    setStartTime(null);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setStats(null);
  };

  // 计算结算统计
  const handleFinish = () => {
    if (!sessionData) return;
    const finalElapsed = Math.max(elapsedSeconds, 1);
    const mistakes: MistakeRecord[] = [];

    let totalTargetChars = 0;
    let correctChars = 0;

    // 检查词语
    for (const w of sessionData.words) {
      const userVal = wordValues[w.id] || '';
      const isPeeked = peekedWords.has(w.id);
      let isWordCorrect = false;

      if (w.hasEllipsis && w.segments) {
        const parts = userVal.split('...');
        const p1 = (parts[0] || '').trim().toLowerCase();
        const p2 = (parts[1] || '').trim().toLowerCase();
        isWordCorrect = p1 === w.segments[0].trim().toLowerCase() && p2 === w.segments[1].trim().toLowerCase();
      } else {
        isWordCorrect = userVal.trim().toLowerCase() === w.targetText.trim().toLowerCase();
      }

      totalTargetChars += w.targetText.length;
      if (isWordCorrect && !isPeeked) {
        correctChars += w.targetText.length;
      } else {
        mistakes.push({
          id: w.id,
          type: 'word',
          prompt: sessionData.language === 'zh' ? (w.pinyin || w.targetText) : (w.meaning || w.targetText),
          target: w.targetText,
          userTyped: userVal,
          peeked: isPeeked
        });
      }
    }

    // 检查句子
    for (const s of sessionData.sentences) {
      const userVal = sentenceValues[s.id] || '';
      totalTargetChars += s.targetSentence.length;

      let matchedChars = 0;
      for (let i = 0; i < s.targetSentence.length; i++) {
        if (userVal[i] && userVal[i].toLowerCase() === s.targetSentence[i].toLowerCase()) {
          matchedChars++;
        }
      }
      correctChars += matchedChars;

      if (matchedChars < s.targetSentence.length) {
        mistakes.push({
          id: s.id,
          type: 'sentence',
          prompt: s.sourceWord,
          target: s.targetSentence,
          userTyped: userVal
        });
      }
    }

    const accuracy = totalTargetChars > 0 ? (correctChars / totalTargetChars) * 100 : 100;
    const cpm = Math.round((correctChars / finalElapsed) * 60);

    const resultStats: TypingStats = {
      startTime,
      endTime: Date.now(),
      elapsedSeconds: finalElapsed,
      totalTargetChars,
      correctChars,
      errorCharCount: totalTargetChars - correctChars,
      historicalErrorCount: mistakes.length,
      accuracy,
      cpm,
      mistakeItems: mistakes
    };

    setStats(resultStats);
    setIsCompleted(true);
  };

  // 重练错题
  const handleRetryMistakes = () => {
    if (!sessionData || !stats) return;
    const mistakeIds = new Set(stats.mistakeItems.map(m => m.id));

    const filteredWords = sessionData.words.filter(w => mistakeIds.has(w.id));
    const filteredSentences = sessionData.sentences.filter(s => mistakeIds.has(s.id));

    setSessionData({
      ...sessionData,
      totalCount: filteredWords.length,
      words: filteredWords,
      sentences: filteredSentences
    });

    setWordValues({});
    setSentenceValues({});
    setPeekedWords(new Set());
    setStartTime(null);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setStats(null);
  };

  const handleRetryAll = () => {
    if (!sessionData) return;
    handleStartPractice(sessionData);
  };

  const handleBackToHome = () => {
    setSessionData(null);
    setIsCompleted(false);
    setStats(null);
  };

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const totalItems = sessionData ? sessionData.words.length + sessionData.sentences.length : 0;
  const finishedWords = sessionData ? sessionData.words.filter(w => {
    const v = wordValues[w.id] || '';
    return v.trim().length >= w.targetText.trim().length;
  }).length : 0;
  const finishedSentences = sessionData ? sessionData.sentences.filter(s => {
    const v = sentenceValues[s.id] || '';
    return v.trim().length >= s.targetSentence.trim().length;
  }).length : 0;
  const completedCount = finishedWords + finishedSentences;
  const progressPercent = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50/40 to-emerald-50 flex flex-col font-sans text-emerald-950">
      {!sessionData ? (
        <main className="flex-1 py-8">
          <SetupWizard
            zhWords={zhWords}
            enWords={enWords}
            onStartPractice={handleStartPractice}
          />
        </main>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* 吸顶状态栏 */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-emerald-100 px-6 py-3 shadow-sm">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              {/* 返回与科目 */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToHome}
                  className="p-2 rounded-xl text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/60 transition-all"
                  title="返回选择页面"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="font-black text-emerald-950 text-sm flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    {sessionData.language === 'zh' ? '中文读写与写作积累' : '英语单词全默写与例句'}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium">
                    {sessionData.language === 'zh' ? '汉字跟打 + 优美句子' : '单词默写 + 语法例句'}
                  </div>
                </div>
              </div>

              {/* 核心指标展示 */}
              <div className="flex items-center gap-6">
                {/* 计时器 */}
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl">
                  <Clock className={`w-4 h-4 ${startTime ? 'text-emerald-600 animate-pulse' : 'text-emerald-400'}`} />
                  <span className="font-mono font-bold text-emerald-900 text-sm">
                    {formatTimer(elapsedSeconds)}
                  </span>
                </div>

                {/* 进度 */}
                <div className="hidden sm:flex flex-col gap-1 w-36">
                  <div className="flex justify-between text-[11px] font-bold text-emerald-700">
                    <span>进度</span>
                    <span>{completedCount}/{totalItems}</span>
                  </div>
                  <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetryAll}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/60 hover:bg-emerald-100 rounded-xl transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> 重置
                </button>
                <button
                  onClick={handleFinish}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> 提前交卷
                </button>
              </div>
            </div>
          </header>

          {/* 主体练习区域（上下分屏） */}
          <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
            <WordPracticeArena
              language={sessionData.language}
              words={sessionData.words}
              values={wordValues}
              onChange={handleWordChange}
              onPeek={handlePeekWord}
            />

            <SentencePracticeArena
              language={sessionData.language}
              sentences={sessionData.sentences}
              values={sentenceValues}
              onChange={handleSentenceChange}
            />

            <div className="py-6 flex justify-center">
              <button
                onClick={handleFinish}
                className="px-10 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-700/20 hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-base"
              >
                <CheckCircle2 className="w-5 h-5" />
                完成所有练习，查看成绩与错题本
              </button>
            </div>
          </main>
        </div>
      )}

      {/* 结算面板 */}
      {isCompleted && stats && (
        <ResultSummaryModal
          stats={stats}
          onRetryAll={handleRetryAll}
          onRetryMistakes={handleRetryMistakes}
          onBackToHome={handleBackToHome}
        />
      )}
    </div>
  );
};
export default App;
