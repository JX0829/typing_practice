import React, { useState } from 'react';
import { RawSourceWord, LanguageMode, PracticeSessionPayload } from '../types/practice';
import { buildZhPrompt, buildEnPrompt } from '../prompts/promptTemplates';
import { parseAiResponse } from '../parsers/aiResponseParser';
import { generateRandomPracticeSession } from '../data/randomGenerator';
import { BookOpen, Sparkles, Copy, Check, FileText, Play, Sprout } from 'lucide-react';

interface SetupWizardProps {
  zhWords: RawSourceWord[];
  enWords: RawSourceWord[];
  onStartPractice: (payload: PracticeSessionPayload) => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({
  zhWords,
  enWords,
  onStartPractice
}) => {
  const [lang, setLang] = useState<LanguageMode>('zh');
  const [count, setCount] = useState<number>(20);
  const [copied, setCopied] = useState<boolean>(false);
  const [aiJsonInput, setAiJsonInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const currentPool = lang === 'zh' ? zhWords : enWords;

  const getSelectedWords = () => {
    if (!currentPool.length) return [];
    return currentPool.slice(0, count);
  };

  const handleCopyPrompt = () => {
    const selected = getSelectedWords();
    const prompt = lang === 'zh' ? buildZhPrompt(selected, count) : buildEnPrompt(selected, count);
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleParseAndStart = () => {
    setErrorMsg('');
    try {
      const payload = parseAiResponse(aiJsonInput);
      onStartPractice(payload);
    } catch (err: any) {
      setErrorMsg(err.message || 'JSON 解析异常，请检查格式');
    }
  };

  const handleLoadDemo = () => {
    try {
      const payload = generateRandomPracticeSession(lang, count, currentPool);
      onStartPractice(payload);
    } catch (e: any) {
      setErrorMsg(e.message || '生成随机题目失败');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* 头部标题与清新徽章 */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          春意盎然 · 高效打字与默写系统
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight">
          中英文打字与默写练习
        </h1>
        <p className="text-emerald-700/80 text-sm max-w-lg mx-auto">
          生机绿意护眼风格：词语全默写自动流转 + 3:7 黄金长短句读写积累
        </p>
      </div>

      {/* 步骤 1：语言选择 */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-emerald-900/5 border border-emerald-100">
        <h2 className="text-sm font-bold text-emerald-950 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">1</span>
          选择练习科目
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => { setLang('zh'); setErrorMsg(''); }}
            className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${
              lang === 'zh'
                ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-200'
                : 'border-emerald-100 hover:border-emerald-200 bg-white'
            }`}
          >
            <div className="text-3xl">🇨🇳</div>
            <div>
              <div className="font-extrabold text-emerald-950 text-lg">中文读写练习</div>
              <div className="text-emerald-700/80 text-xs mt-1">拼音辅助汉字输入 + 优美写作句子跟打（已载入 {zhWords.length} 词）</div>
            </div>
          </button>

          <button
            onClick={() => { setLang('en'); setErrorMsg(''); }}
            className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${
              lang === 'en'
                ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-200'
                : 'border-emerald-100 hover:border-emerald-200 bg-white'
            }`}
          >
            <div className="text-3xl">🇬🇧</div>
            <div>
              <div className="font-extrabold text-emerald-950 text-lg">英语默写练习</div>
              <div className="text-emerald-700/80 text-xs mt-1">中文释义盲打全默写 + 核心语法长短句抄写（已载入 {enWords.length} 词）</div>
            </div>
          </button>
        </div>
      </div>

      {/* 步骤 2：练习数量设置 */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-emerald-900/5 border border-emerald-100">
        <h2 className="text-sm font-bold text-emerald-950 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
          选择练习词量
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {[5, 10, 20].map(n => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                count === n
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              {n} 词 {n === 20 && '(黄金推荐)'}
            </button>
          ))}
          <div className="text-emerald-700/70 text-xs ml-2">
            包含 {Math.round(count * 0.7)} 个短句 (70%) + {count - Math.round(count * 0.7)} 个长句 (30%)
          </div>
        </div>
      </div>

      {/* 步骤 3：获取数据与开始 */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-emerald-900/5 border border-emerald-100 space-y-6">
        <h2 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">3</span>
          启动方式（二选一）
        </h2>

        {/* 方式 A：内置样板直接开始 */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-emerald-700/10">
          <div>
            <div className="font-extrabold text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              免配置：直接加载三年级精选样板词库
            </div>
            <div className="text-emerald-950 font-medium text-xs mt-1">
              内置 {count} 个高频核心词汇（包含 {Math.round(count * 0.7)} 个短句 + {count - Math.round(count * 0.7)} 个长句），点击即可开练。
            </div>
          </div>
          <button
            onClick={handleLoadDemo}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-800 font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 text-sm"
          >
            <Play className="w-4 h-4 fill-emerald-800" />
            立即开练
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-emerald-200/60"></div>
          <span className="flex-shrink mx-4 text-emerald-700/60 text-xs font-semibold">或者自定义 AI 提示词</span>
          <div className="flex-grow border-t border-emerald-200/60"></div>
        </div>

        {/* 方式 B：AI 提示词复制与粘贴 */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              一键复制当前抽取的 {count} 个词并生成 AI 提示词：
            </span>
            <button
              onClick={handleCopyPrompt}
              className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-200"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              {copied ? '提示词已复制到剪贴板！' : '复制 AI 提示词'}
            </button>
          </div>

          <textarea
            value={aiJsonInput}
            onChange={(e) => setAiJsonInput(e.target.value)}
            placeholder="请把大模型生成的 JSON 数据块（包含 ```json）粘贴到这里..."
            rows={4}
            className="w-full p-3.5 border border-emerald-200 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none bg-emerald-50/20"
          />

          {errorMsg && (
            <div className="text-rose-700 bg-rose-50 p-3 rounded-xl text-xs font-medium border border-rose-200">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleParseAndStart}
            disabled={!aiJsonInput.trim()}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <FileText className="w-4 h-4" />
            解析并开始练习
          </button>
        </div>
      </div>
    </div>
  );
};
