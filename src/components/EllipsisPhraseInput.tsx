import React, { useRef, useState, useEffect } from 'react';

interface EllipsisPhraseInputProps {
  id: string;
  segments: string[]; // 例如 ["ask", "for help"]
  value: string;      // 例如 "ask... for help" 或拼接结果
  onChange: (val: string) => void;
  onAdvance?: () => void;
  onBackspacePrev?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const EllipsisPhraseInput: React.FC<EllipsisPhraseInputProps> = ({
  id,
  segments,
  value,
  onChange,
  onAdvance,
  onBackspacePrev,
  disabled = false,
  autoFocus = false
}) => {
  const seg1Target = segments[0] || '';
  const seg2Target = segments[1] || '';

  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');

  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setPart1('');
      setPart2('');
      return;
    }
    const parts = value.split('...');
    setPart1(parts[0] || '');
    setPart2(parts[1] || '');
  }, [value]);

  useEffect(() => {
    if (autoFocus && input1Ref.current) {
      input1Ref.current.focus();
    }
  }, [autoFocus]);

  const updateParent = (p1: string, p2: string) => {
    const combined = `${p1}...${p2}`;
    onChange(combined);

    if (p1.length >= seg1Target.length && p2.length >= seg2Target.length && onAdvance) {
      setTimeout(() => onAdvance(), 40);
    }
  };

  const handlePart1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPart1(val);
    updateParent(val, part2);

    if (val.length >= seg1Target.length) {
      input2Ref.current?.focus();
    }
  };

  const handlePart2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPart2(val);
    updateParent(part1, val);
  };

  const handleKeyDown1 = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      input2Ref.current?.focus();
    } else if (e.key === 'Backspace' && (!part1 || part1.length === 0)) {
      if (onBackspacePrev) {
        e.preventDefault();
        onBackspacePrev();
      }
    }
  };

  const handleKeyDown2 = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && (!part2 || part2.length === 0)) {
      e.preventDefault();
      input1Ref.current?.focus();
    }
  };

  const isSeg1Done = part1.trim().toLowerCase() === seg1Target.trim().toLowerCase();
  const isSeg2Done = part2.trim().toLowerCase() === seg2Target.trim().toLowerCase();

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-2">
        {/* 输入框 1 */}
        <input
          ref={input1Ref}
          id={`${id}-p1`}
          type="text"
          value={part1}
          onChange={handlePart1Change}
          onKeyDown={handleKeyDown1}
          disabled={disabled}
          placeholder={seg1Target ? `(${seg1Target.length}字)` : '段1'}
          autoComplete="off"
          spellCheck="false"
          className={`flex-1 min-w-[70px] px-2.5 py-1.5 border rounded-lg font-mono text-sm outline-none transition-all ${
            isSeg1Done
              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-300'
              : 'border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 bg-white'
          }`}
        />

        {/* 省略号指示 */}
        <span className="font-bold text-emerald-600/70 select-none tracking-widest">……</span>

        {/* 输入框 2 */}
        <input
          ref={input2Ref}
          id={`${id}-p2`}
          type="text"
          value={part2}
          onChange={handlePart2Change}
          onKeyDown={handleKeyDown2}
          disabled={disabled}
          placeholder={seg2Target ? `(${seg2Target.length}字)` : '段2'}
          autoComplete="off"
          spellCheck="false"
          className={`flex-1 min-w-[90px] px-2.5 py-1.5 border rounded-lg font-mono text-sm outline-none transition-all ${
            isSeg2Done
              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-300'
              : 'border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 bg-white'
          }`}
        />
      </div>

      {/* 实时标红指示 */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <div className="flex gap-0.5">
          {Array.from(part1).map((c, i) => (
            <span
              key={i}
              className={`px-1 rounded ${
                seg1Target[i] && c.toLowerCase() === seg1Target[i].toLowerCase()
                  ? 'text-emerald-800 bg-emerald-100'
                  : 'text-white bg-rose-500'
              }`}
            >
              {c}
            </span>
          ))}
        </div>
        <span className="text-emerald-300">|</span>
        <div className="flex gap-0.5">
          {Array.from(part2).map((c, i) => (
            <span
              key={i}
              className={`px-1 rounded ${
                seg2Target[i] && c.toLowerCase() === seg2Target[i].toLowerCase()
                  ? 'text-emerald-800 bg-emerald-100'
                  : 'text-white bg-rose-500'
              }`}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
