import React, { useState } from 'react';
import { WordPracticeItem, LanguageMode } from '../types/practice';
import { TypingLineInput } from './TypingLineInput';
import { EllipsisPhraseInput } from './EllipsisPhraseInput';
import { Eye, EyeOff, CheckCircle2, Sparkles } from 'lucide-react';

interface WordPracticeArenaProps {
  language: LanguageMode;
  words: WordPracticeItem[];
  values: Record<string, string>;
  onChange: (wordId: string, val: string) => void;
  onPeek: (wordId: string) => void;
}

export const WordPracticeArena: React.FC<WordPracticeArenaProps> = ({
  language,
  words,
  values,
  onChange,
  onPeek
}) => {
  const [peekMap, setPeekMap] = useState<Record<string, boolean>>({});

  const togglePeek = (wordId: string) => {
    setPeekMap(prev => {
      const nextVal = !prev[wordId];
      if (nextVal) {
        onPeek(wordId);
      }
      return { ...prev, [wordId]: nextVal };
    });
  };

  const isWordDone = (word: WordPracticeItem) => {
    const val = values[word.id] || '';
    if (word.hasEllipsis && word.segments) {
      const parts = val.split('...');
      return (
        parts[0]?.trim().toLowerCase() === word.segments[0]?.trim().toLowerCase() &&
        parts[1]?.trim().toLowerCase() === word.segments[1]?.trim().toLowerCase()
      );
    }
    return val.trim().toLowerCase() === word.targetText.trim().toLowerCase();
  };

  const focusInput = (index: number) => {
    if (index >= 0 && index < words.length) {
      const targetWord = words[index];
      let elemId = `word-${targetWord.id}`;
      if (targetWord.hasEllipsis && targetWord.segments) {
        elemId = `word-${targetWord.id}-p1`;
      }
      const elem = document.getElementById(elemId);
      if (elem) {
        elem.focus();
      }
    }
  };

  const handleAdvance = (currentIndex: number) => {
    if (currentIndex + 1 < words.length) {
      focusInput(currentIndex + 1);
    } else {
      // 词语全部输入完毕后，可聚焦到第一个句子的输入框
      const firstSentenceInput = document.getElementById('sentence-s1') || document.querySelector('[id^="sentence-"]') as HTMLElement;
      if (firstSentenceInput) {
        firstSentenceInput.focus();
      }
    }
  };

  const handleBackspacePrev = (currentIndex: number) => {
    if (currentIndex > 0) {
      focusInput(currentIndex - 1);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-7 shadow-lg shadow-emerald-900/5 border border-emerald-100">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
          <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </span>
          词语与默写练习区
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hidden sm:inline-block">
            {language === 'zh' ? '汉字跟打（字数达标自动跳词）' : '全默写（字数达标自动跳词，支持退格返回）'}
          </span>
        </h3>
        <div className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
          已完成 {words.filter(isWordDone).length} / {words.length}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {words.map((word, idx) => {
          const done = isWordDone(word);
          const isPeeking = !!peekMap[word.id];

          return (
            <div
              key={word.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                done
                  ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                  : 'border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              {/* 顶部提示区 */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  {language === 'zh' ? (
                    <>
                      <div className="text-xs font-mono text-emerald-700 font-semibold tracking-wider">
                        {word.pinyin || ''}
                      </div>
                      <div className="text-xl font-black text-emerald-950">
                        {word.targetText}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-200/60 text-emerald-800">
                          {word.pos || '单词'}
                        </span>
                        {isPeeking && (
                          <span className="text-xs font-mono font-bold text-amber-700">
                            {word.targetText}
                          </span>
                        )}
                      </div>
                      <div className="text-base font-black text-emerald-950">
                        {word.meaning || word.targetText}
                      </div>
                    </>
                  )}
                </div>

                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : language === 'en' ? (
                  <button
                    onClick={() => togglePeek(word.id)}
                    title="点击偷看/隐藏答案"
                    className="p-1.5 rounded-lg text-emerald-600/70 hover:text-emerald-800 hover:bg-emerald-100/50 transition-all"
                  >
                    {isPeeking ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                  </button>
                ) : null}
              </div>

              {/* 输入交互区 */}
              <div>
                {language === 'en' && word.hasEllipsis && word.segments ? (
                  <EllipsisPhraseInput
                    id={`word-${word.id}`}
                    segments={word.segments}
                    value={values[word.id] || ''}
                    onChange={(val) => onChange(word.id, val)}
                    onAdvance={() => handleAdvance(idx)}
                    onBackspacePrev={() => handleBackspacePrev(idx)}
                    autoFocus={idx === 0}
                  />
                ) : (
                  <TypingLineInput
                    id={`word-${word.id}`}
                    targetText={word.targetText}
                    value={values[word.id] || ''}
                    onChange={(val) => onChange(word.id, val)}
                    onAdvance={() => handleAdvance(idx)}
                    onBackspacePrev={() => handleBackspacePrev(idx)}
                    isBlindMode={language === 'en'}
                    placeholder={language === 'zh' ? '打汉字...' : '默写英文...'}
                    autoFocus={idx === 0}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
