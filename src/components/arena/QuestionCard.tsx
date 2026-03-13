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

  // 3D Tilt Shake animation variants
  const shakeAnimation: any = {
    shake: {
      opacity: 1, x: 0,
      rotateX: [0, -10, 10, -10, 10, 0],
      rotateY: [0, 10, -10, 10, -10, 0],
      transition: { duration: 0.5, type: "spring", stiffness: 300 },
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
      className="w-full max-w-2xl mx-auto rounded-3xl border border-indigo-500/30 bg-[#0a0a0c] p-8 shadow-[0_0_20px_rgba(99,102,241,0.25)] relative overflow-hidden"
      variants={shakeAnimation}
      initial="hidden"
      animate={isCorrect === false ? "shake" : "idle"}
      exit={{ opacity: 0, x: 50 }}
      style={{ perspective: 1000 }}
    >
      {/* Decorative glow inside card */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Question Text */}
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 tracking-tight text-balance relative z-10">
        {data.question}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-4 relative z-10">
        {data.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isActuallyCorrect = option.id === data.correctOptionId;
          
          let buttonClass = "bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:border-indigo-500/50";
          let icon = null;

          if (isSelected) {
            if (isActuallyCorrect) {
              buttonClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
              icon = <CheckCircle2 className="text-emerald-400" size={20} />;
            } else {
              buttonClass = "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]";
              icon = <XCircle className="text-rose-400" size={20} />;
            }
          } else if (selectedOptionId !== null && isActuallyCorrect) {
            // Show the correct answer if the user got it wrong
            buttonClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-200/50";
          }

          return (
            <motion.button
              key={option.id}
              onClick={(e) => handleSelect(option.id, e)}
              disabled={selectedOptionId !== null}
              whileHover={selectedOptionId === null ? { scale: 1.02 } : { scale: 1 }}
              whileTap={selectedOptionId === null ? { scale: 0.98 } : { scale: 1 }}
              className={`relative flex items-center justify-between p-4 rounded-xl border transition-all text-left text-lg font-medium ${buttonClass}`}
            >
              {option.text}
              {icon}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation Box (Shows only on wrong answer) */}
      <AnimatePresence>
        {isCorrect === false && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="rounded-xl bg-rose-950/40 border border-rose-500/20 p-4 relative z-10 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <XCircle className="text-rose-500" size={20} />
              </div>
              <div>
                <h4 className="text-rose-400 font-bold mb-1 tracking-wide text-sm">INCORRECT</h4>
                <p className="text-white/80 text-sm leading-relaxed">
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
