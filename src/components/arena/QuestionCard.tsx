"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

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
  onAnswerSelected: (isCorrect: boolean, event: React.MouseEvent) => void;
}

export function QuestionCard({ data, onAnswerSelected }: QuestionCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSelect = (optionId: string, e: React.MouseEvent) => {
    if (selectedOptionId !== null) return; // Prevent multiple clicks

    const correct = optionId === data.correctOptionId;
    setSelectedOptionId(optionId);
    setIsCorrect(correct);

    // Call the parent handler
    onAnswerSelected(correct, e);
  };

  // Reset state when question data changes
  useState(() => {
    setSelectedOptionId(null);
    setIsCorrect(null);
  });

  // Alternatively, the parent should use a key. But we'll add a safety reset here too.
  if (selectedOptionId !== null && data.options.every(o => o.id !== selectedOptionId)) {
    setSelectedOptionId(null);
    setIsCorrect(null);
  }

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

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden"
      variants={shakeAnimation}
      initial="hidden"
      animate={isCorrect === false ? "shake" : "idle"}
      exit={{ opacity: 0, x: 50 }}
      style={{ perspective: 1000 }}
    >
      {/* Decorative glow inside card (Light theme version) */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-sky/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Question Text */}
      <h2 className="text-2xl md:text-3xl font-heading font-black text-slate-800 mb-8 tracking-tight text-balance relative z-10">
        {data.question}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-4 relative z-10">
        {data.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isActuallyCorrect = option.id === data.correctOptionId;
          
          let buttonClass = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-primary-sky/50 shadow-sm";
          let icon = null;

          if (isSelected) {
            if (isActuallyCorrect) {
              buttonClass = "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
              icon = <CheckCircle2 className="text-emerald-500" size={20} />;
            } else {
              buttonClass = "bg-rose-50 border-rose-500 text-rose-700 shadow-[0_0_15px_rgba(244,63,94,0.2)]";
              icon = <XCircle className="text-rose-500" size={20} />;
            }
          } else if (selectedOptionId !== null && isActuallyCorrect) {
            // Show the correct answer if the user got it wrong
            buttonClass = "bg-emerald-50/50 border-emerald-300 text-emerald-600/70";
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
            className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-100 relative z-10"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <XCircle className="text-rose-500" size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">
                  Incorrect
                </span>
                <p className="text-slate-600 text-sm leading-relaxed">
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
