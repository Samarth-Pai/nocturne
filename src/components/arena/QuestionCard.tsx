"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { CheckCircle2, XCircle, Zap, FastForward, SplitSquareVertical } from "lucide-react";

export interface Option {
  id: string;
  text: string;
}

export interface QuestionData {
  id: string;
  question: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
}

interface QuestionCardProps {
  data: QuestionData;
  isBoss?: boolean;
  onAnswerSelected: (isCorrect: boolean, event: React.MouseEvent) => void;
  onNext?: () => void;
  onUseHint?: () => void;
  onUseFiftyFifty?: () => void;
  onUseSkip?: () => void;
  onUseDoubleXP?: () => void;
  isDoubleXPActive?: boolean;
}

export function QuestionCard({ data, isBoss = false, onAnswerSelected, onNext, onUseHint, onUseFiftyFifty, onUseSkip, onUseDoubleXP, isDoubleXPActive }: QuestionCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hiddenOptionIds, setHiddenOptionIds] = useState<string[]>([]);

  const handleSelect = (optionId: string, e: React.MouseEvent) => {
    if (selectedOptionId !== null) return; // Prevent multiple clicks

    const correct = optionId === data.correctOptionId;
    setSelectedOptionId(optionId);
    setIsCorrect(correct);

    // Call the parent handler
    onAnswerSelected(correct, e);
  };

  // Reset local selection when question changes.
  useEffect(() => {
    setSelectedOptionId(null);
    setIsCorrect(null);
    setHiddenOptionIds([]);
  }, [data.id]);

  // Alternatively, the parent should use a key. But we'll add a safety reset here too.
  if (selectedOptionId !== null && data.options.every(o => o.id !== selectedOptionId)) {
    setSelectedOptionId(null);
    setIsCorrect(null);
    setHiddenOptionIds([]);
  }

  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (selectedOptionId !== null) {
      timeout = setTimeout(() => {
        if (onNextRef.current) {
          onNextRef.current();
        }
      }, 1500); // Wait 1.5 seconds before loading next question
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [selectedOptionId]);

  // 3D Tilt Shake animation variants
  const shakeAnimation: any = {
    shake: {
      opacity: 1, x: 0,
      rotateX: [0, -10, 10, -10, 10, 0],
      rotateY: [0, 10, -10, 10, -10, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    idle: {
      opacity: 1, x: 0,
      rotateX: 0,
      rotateY: 0,
      transition: { duration: 0.5 }
    },
    hidden: {
      opacity: 0, x: -50,
      rotateX: 0,
      rotateY: 0
    }
  };

  const handleHintClick = () => {
    if (!onUseHint) return;
    
    // Find an incorrect option to hide
    const incorrectOptions = data.options.filter(o => o.id !== data.correctOptionId);
    if (incorrectOptions.length > 0) {
      // Pick a random incorrect option we haven't hidden yet
      const availableToHide = incorrectOptions.filter(o => !hiddenOptionIds.includes(o.id));
      if (availableToHide.length > 0) {
        const toHide = availableToHide[Math.floor(Math.random() * availableToHide.length)];
        setHiddenOptionIds(prev => [...prev, toHide.id]);
      }
    }
    
    // Notify parent to consume the hint
    onUseHint();
  };

  const handleFiftyFiftyClick = () => {
    if (!onUseFiftyFifty) return;
    
    // Find all incorrect options not currently hidden
    const incorrectOptions = data.options.filter(o => o.id !== data.correctOptionId && !hiddenOptionIds.includes(o.id));
    
    // Shuffle and pick up to 2
    const shuffled = incorrectOptions.sort(() => 0.5 - Math.random());
    const toHide = shuffled.slice(0, 2).map(o => o.id);
    
    if (toHide.length > 0) {
      setHiddenOptionIds(prev => [...prev, ...toHide]);
    }
    
    onUseFiftyFifty();
  };

  return (
    <motion.div
      className={`w-full max-w-2xl mx-auto glass-panel p-8 relative overflow-hidden z-10 ${
        isBoss ? "border-accent-orange shadow-[0_0_30px_rgba(245,158,11,0.3)]" : "border-slate-700 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-shadow duration-500"
      }`}
      variants={shakeAnimation}
      initial="hidden"
      animate={isCorrect === false ? "shake" : "idle"}
      exit={{ opacity: 0, x: 50 }}
      style={{ perspective: 1000 }}
    >
      {/* Decorative glow inside card */}
      <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] pointer-events-none ${
        isBoss ? "bg-accent-orange/20" : "bg-accent-purple/10"
      }`} />

      {/* Conditional Boss Label */}
      {isBoss && (
        <div className="mb-4 inline-block rounded-full bg-accent-orange/20 border border-accent-orange px-3 py-1 text-xs font-black uppercase tracking-widest text-accent-orange relative z-10 shadow-[0_0_10px_rgba(245,158,11,0.4)]">
          BOSS QUESTION
        </div>
      )}

      {/* Question Text & Armin Hint */}
      <div className="flex justify-between items-start gap-4 mb-8 relative z-10">
        <h2 className={`text-2xl md:text-3xl font-heading font-black tracking-tight text-balance ${
          isBoss ? "cyber-text-subtle text-accent-orange" : "text-slate-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        }`}>
          {data.question}
        </h2>
        <div className="flex flex-col items-end shrink-0 gap-2">
          {selectedOptionId === null && (
            <div className="flex flex-wrap justify-end gap-2">
              {onUseDoubleXP && (
                <button 
                  onClick={onUseDoubleXP}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-purple-200 shadow-sm"
                >
                  <Zap size={14} /> 2x XP
                </button>
              )}
              {onUseFiftyFifty && (
                <button 
                  onClick={handleFiftyFiftyClick}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-emerald-200 shadow-sm"
                >
                  <SplitSquareVertical size={14} /> 50/50
                </button>
              )}
              {onUseSkip && (
                <button 
                  onClick={() => onUseSkip()}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-blue-200 shadow-sm"
                >
                  <FastForward size={14} /> Skip
                </button>
              )}
              {onUseHint && (
                <button 
                  onClick={handleHintClick}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-indigo-200 shadow-sm"
                >
                  ✨ Hint
                </button>
              )}
            </div>
          )}
          {isDoubleXPActive && (
            <div className="bg-purple-600 text-white text-[10px] uppercase tracking-wider font-black px-2 py-1 rounded animate-pulse shadow-sm">
              2x XP Active
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-4 relative z-10">
        {data.options.map((option) => {
          if (hiddenOptionIds.includes(option.id)) return null;

          const isSelected = selectedOptionId === option.id;
          const isActuallyCorrect = option.id === data.correctOptionId;

          let buttonClass = "bg-slate-900/40 border-slate-700/50 text-slate-300 hover:bg-slate-800/80 hover:border-accent-purple/50 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]";
          let icon = null;

          if (isSelected) {
            if (isActuallyCorrect) {
              buttonClass = "bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]";
              icon = <CheckCircle2 className="text-emerald-400 filter drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" size={20} />;
            } else {
              buttonClass = "bg-rose-950/60 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]";
              icon = <XCircle className="text-rose-400 filter drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]" size={20} />;
            }
          } else if (selectedOptionId !== null && isActuallyCorrect) {
            // Show the correct answer if the user got it wrong
            buttonClass = "bg-emerald-950/30 border-emerald-500/50 text-emerald-400/80";
            icon = <CheckCircle2 className="text-emerald-500/50" size={20} />;
          }

          return (
            <motion.button
              key={option.id}
              onClick={(e) => handleSelect(option.id, e)}
              disabled={selectedOptionId !== null}
              whileHover={selectedOptionId === null ? { scale: 1.02, y: -2 } : { scale: 1 }}
              whileTap={selectedOptionId === null ? { scale: 0.98 } : { scale: 1 }}
              className={`relative flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left text-lg font-medium ${buttonClass}`}
            >
              {option.text}
              {icon}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation Box (Redesigned as a subtle comment box) */}
      <AnimatePresence>
        {isCorrect === false && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 backdrop-blur-md relative z-10 shadow-[inner_0_0_20px_rgba(244,63,94,0.05)]"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-900/50 border border-rose-500/50 flex items-center justify-center shrink-0">
                <XCircle className="text-rose-400" size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">
                  INCORRECT
                </span>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {data.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
