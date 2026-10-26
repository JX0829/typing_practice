import React, { useEffect } from 'react';
import { TypingStats } from '../types/practice';
import { Trophy, Clock, CheckCircle, Flame, AlertCircle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultSummaryModalProps {
  stats: TypingStats;
  onRetryAll: () => void;
  onRetryMistakes: () => void;
  onBackToHome: () => void;
}

export const ResultSummaryModal: React.FC<ResultSummaryModalProps> = ({
  stats,
  onRetryAll,
  onRetryMistakes,
  onBackToHome
}) => {
  useEffect(() => {
    // 燃放礼花动效
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // 忽略不支持的情况
    }
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}分${s < 10 ? '0' : ''}${s}秒`;
  };

  const hasMistakes = stats.mistakeItems.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* 头部荣誉 */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-100 text-amber-600 rounded-2xl mb-1 shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">🎉 本轮练习完成！</h2>
          <p className="text-xs text-slate-500">恭喜坚持完成所有练习，来看看本轮的学习表现吧！</p>
        </div>

        {/* 核心数据仪表盘 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div className="text-slate-400 text-xs mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 用时
            </div>
            <div className="font-extrabold text-slate-800 text-lg">
              {formatTime(stats.elapsedSeconds)}
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div className="text-slate-400 text-xs mb-1 flex items-center justify-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 准确率
            </div>
            <div className="font-extrabold text-emerald-600 text-lg">
              {stats.accuracy.toFixed(1)}%
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div className="text-slate-400 text-xs mb-1 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" /> 速度 (CPM)
            </div>
            <div className="font-extrabold text-orange-600 text-lg">
              {stats.cpm}
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div className="text-slate-400 text-xs mb-1 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" /> 错题数
            </div>
            <div className="font-extrabold text-red-600 text-lg">
              {stats.mistakeItems.length}
            </div>
          </div>
        </div>

        {/* 错题回顾区 */}
        {hasMistakes && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>📝</span> 错题与偷看提示清单 ({stats.mistakeItems.length} 项)
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {stats.mistakeItems.map((m, idx) => (
                <div key={idx} className="p-3 bg-red-50/70 border border-red-100 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-medium text-slate-700">
                      [{m.type === 'word' ? '词语' : '句子'}] {m.prompt}
                    </span>
                    {m.peeked && <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">偷看了一次</span>}
                  </div>
                  <div className="font-mono text-emerald-700 font-medium">目标: {m.target}</div>
                  <div className="font-mono text-red-600">输入: {m.userTyped || '(未完成)'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮组 */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {hasMistakes && (
            <button
              onClick={onRetryMistakes}
              className="w-full sm:flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> 仅重练错题
            </button>
          )}

          <button
            onClick={onRetryAll}
            className="w-full sm:flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始整套
          </button>

          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};
