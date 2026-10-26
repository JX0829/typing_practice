import React from 'react';
import { SentencePracticeItem, LanguageMode } from '../types/practice';
import { TypingLineInput } from './TypingLineInput';
import { CheckCircle2, Bookmark, Feather } from 'lucide-react';

interface SentencePracticeArenaProps {
  language: LanguageMode;
  sentences: SentencePracticeItem[];
  values: Record<string, string>;
  onChange: (sentenceId: string, val: string) => void;
}

export const SentencePracticeArena: React.FC<SentencePracticeArenaProps> = ({
  language,
  sentences,
  values,
  onChange
}) => {
  const isSentenceDone = (sentence: SentencePracticeItem) => {
    const val = values[sentence.id] || '';
    return val.trim().length >= sentence.targetSentence.trim().length;
  };

  const shortCount = sentences.filter(s => s.lengthType === 'short').length;
  const longCount = sentences.filter(s => s.lengthType === 'long').length;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-7 shadow-lg shadow-emerald-900/5 border border-emerald-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <Feather className="w-4 h-4" />
            </span>
            3:7 黄金长短句跟打积累
          </h3>
          <p className="text-xs text-emerald-700/80 mt-1">
            短句 70%（{shortCount} 条）+ 长句 30%（{longCount} 条），支持中英文全半角标点智能等价比对
          </p>
        </div>
        <div className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
          已完成 {sentences.filter(isSentenceDone).length} / {sentences.length}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sentences.map((item, idx) => {
          const done = isSentenceDone(item);
          const isLong = item.lengthType === 'long';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                done
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-emerald-100/80 bg-gradient-to-r from-white to-emerald-50/20 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    #{idx + 1}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      isLong
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isLong ? '进阶长句 (30%)' : '精炼短句 (70%)'}
                  </span>
                  <span className="text-xs text-emerald-900/80 flex items-center gap-1 font-medium">
                    <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                    核心词: <strong className="text-emerald-800">{item.sourceWord}</strong>
                  </span>
                </div>

                {done && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" /> 已完成
                  </span>
                )}
              </div>

              {/* 英文句子附带中文翻译 */}
              {language === 'en' && item.translation && (
                <div className="text-xs text-emerald-700/80 mb-2 pl-1 font-medium">
                  🌿 释义：{item.translation}
                </div>
              )}

              {/* 核心打字跟打组件 */}
              <TypingLineInput
                id={`sentence-${item.id}`}
                targetText={item.targetSentence}
                value={values[item.id] || ''}
                onChange={(val) => onChange(item.id, val)}
                placeholder={language === 'zh' ? '跟打上方优美句子...' : '跟打上方英文例句...'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
