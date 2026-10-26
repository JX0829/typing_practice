import React, { useRef, useState, useEffect } from 'react';

interface TypingLineInputProps {
  id: string;
  targetText: string;
  value: string;
  onChange: (val: string) => void;
  onAdvance?: () => void;      // 字数达到目标长度时直接跳下一个词
  onBackspacePrev?: () => void;// 在空输入时按删除键跳回上一个词
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  isBlindMode?: boolean;       // 英语全默写模式
  className?: string;
}

const PUNCTUATION_MAP: Record<string, string> = {
  '，': ',',
  '。': '.',
  '！': '!',
  '？': '?',
  '：': ':',
  '；': ';',
  '“': '"',
  '”': '"',
  '‘': "'",
  '’': "'",
  '（': '(',
  '）': ')',
  '【': '[',
  '】': ']',
  '—': '-',
  '、': ',',
};

function normalizeChar(ch: string): string {
  return PUNCTUATION_MAP[ch] || ch;
}

export const TypingLineInput: React.FC<TypingLineInputProps> = ({
  id,
  targetText,
  value,
  onChange,
  onAdvance,
  onBackspacePrev,
  placeholder = '开始输入...',
  disabled = false,
  autoFocus = false,
  isBlindMode = false,
  className = ''
}) => {
  const isComposingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalVal, setInternalVal] = useState(value);

  useEffect(() => {
    setInternalVal(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    const val = (e.target as HTMLInputElement).value;
    setInternalVal(val);
    onChange(val);

    // 中文输入法上屏后，若字数达到目标长度，自动跳转下一题
    if (val.length >= targetText.length && onAdvance) {
      setTimeout(() => onAdvance(), 40);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalVal(val);
    if (!isComposingRef.current) {
      onChange(val);
      // 非中文输入法（如英文直接敲入），若字数达到目标长度直接跳转
      if (val.length >= targetText.length && onAdvance) {
        setTimeout(() => onAdvance(), 40);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && (!internalVal || internalVal.length === 0)) {
      if (onBackspacePrev) {
        e.preventDefault();
        onBackspacePrev();
      }
    }
  };

  const targetChars = Array.from(targetText);
  const userChars = Array.from(internalVal);
  const isDone = internalVal.length >= targetText.length && 
    targetChars.every((c, idx) => normalizeChar(c) === normalizeChar(userChars[idx]));

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* 对照文本展示层 */}
      {!isBlindMode ? (
        <div className="font-mono text-base tracking-wide flex flex-wrap items-center select-none py-1">
          {targetChars.map((tChar, idx) => {
            const uChar = userChars[idx];
            let statusClass = 'text-emerald-950/70 bg-transparent';

            if (idx < userChars.length) {
              if (normalizeChar(uChar) === normalizeChar(tChar)) {
                statusClass = 'text-emerald-700 bg-emerald-100 font-semibold rounded px-0.5';
              } else {
                statusClass = 'text-rose-600 bg-rose-100 font-bold underline decoration-rose-500 rounded px-0.5';
              }
            } else if (idx === userChars.length) {
              statusClass = 'text-emerald-900 bg-emerald-50 border-b-2 border-emerald-500';
            }

            return (
              <span key={idx} className={`transition-colors duration-150 inline-block ${statusClass}`}>
                {tChar === ' ' ? '\u00A0' : tChar}
              </span>
            );
          })}
        </div>
      ) : null}

      {/* 实时输入框 */}
      <div className="relative w-full">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={internalVal}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className={`w-full px-3 py-2 border rounded-xl font-mono text-base transition-all outline-none ${
            isDone
              ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-300'
              : 'border-emerald-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 bg-white text-emerald-950'
          }`}
        />
      </div>

      {/* 盲打模式或输入反馈层：标红错误字符 */}
      {isBlindMode && internalVal.length > 0 && (
        <div className="flex flex-wrap items-center gap-0.5 font-mono text-sm py-0.5">
          {userChars.map((uChar, idx) => {
            const tChar = targetChars[idx];
            const isMatch = tChar && normalizeChar(uChar) === normalizeChar(tChar);
            return (
              <span
                key={idx}
                className={`px-1 rounded ${
                  isMatch
                    ? 'text-emerald-800 bg-emerald-100 font-medium'
                    : 'text-white bg-rose-500 font-bold'
                }`}
              >
                {uChar === ' ' ? '␣' : uChar}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
