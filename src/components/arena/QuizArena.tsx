"use client";

import { useState } from "react";
import { DuelOverlay } from "./DuelOverlay";
import { QuestionCard, QuestionData } from "./QuestionCard";
import { XPParticleBurst } from "./XPParticleBurst";
import { useGameSounds } from "@/hooks/useGameSounds";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const MOCK_QUESTIONS: QuestionData[] = [
  {
    id: "q1",
    question: "What is the primary function of a mitochondria in a cell?",
    options: [
      { id: "o1", text: "Protein Synthesis" },
      { id: "o2", text: "Energy Production" },
      { id: "o3", text: "Waste Disposal" },
      { id: "o4", text: "Cell Division" },
    ],
    correctOptionId: "o2",
    explanation: "The mitochondria are known as the powerhouses of the cell. They are organelles that act like a digestive system which takes in nutrients, breaks them down, and creates energy rich molecules for the cell."
  },
  {
    id: "q2",
    question: "Which element has the chemical symbol 'O'?",
    options: [
      { id: "o1", text: "Gold" },
      { id: "o2", text: "Osmium" },
      { id: "o3", text: "Oxygen" },
      { id: "o4", text: "Oganesson" },
    ],
    correctOptionId: "o3",
    explanation: "Oxygen is the chemical element with the symbol O and atomic number 8."
  }
];

export function QuizArena() {
  const { playClick, playLevelUp } = useGameSounds();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [particles, setParticles] = useState<{ id: number, x: number, y: number }[]>([]);
  
  // Duel Progress State
  const [userProgress, setUserProgress] = useState(0);

  const currentQuestion = MOCK_QUESTIONS[currentIndex];

  const handleAnswer = (isCorrect: boolean, event: React.MouseEvent) => {
    
    if (isCorrect) {
      playLevelUp(); // Short chime for correct
      setScore(s => s + 10);
      setUserProgress(p => p + 50); // Advance duel bar
      
      // Spawn particles at click location
      const { clientX, clientY } = event;
      setParticles(prev => [...prev, { id: Date.now(), x: clientX, y: clientY }]);
      
      setTimeout(() => {
        handleNext();
      }, 1500); 
    } else {
      playClick(); // Error sound could go here, using click for now
      setTimeout(() => {
        handleNext();
      }, 3000); // Give them longer to read the explanation
    }
  };

  const handleNext = () => {
    if (currentIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentIndex(curr => curr + 1);
    } else {
      // Quiz Complete
      setCurrentIndex(MOCK_QUESTIONS.length);
    }
  };

  const removeParticles = (id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-12 py-8 relative">
      
      {/* Background Ambience (Light Theme) */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary-sky/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-primary-teal/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Duel Overlay OR Standard Progress - We'll keep Duel Overlay for now, just theme it later if needed */}
      <DuelOverlay userProgress={userProgress} />

      {/* Main Arena Area */}
      <div className="flex-1 w-full relative h-[450px]">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <div key={currentQuestion.id} className="w-full flex flex-col items-center">
              {/* Question Progress Indicator */}
              <div className="w-full max-w-2xl flex justify-between items-center mb-4 px-4">
                <span className="font-bold text-slate-500 uppercase tracking-wide text-sm">
                  Question {currentIndex + 1} of {MOCK_QUESTIONS.length}
                </span>
                <span className="font-bold text-accent-purple bg-accent-purple/10 px-3 py-1 rounded-full text-sm">
                  +10 XP
                </span>
              </div>
              <QuestionCard 
                data={currentQuestion} 
                onAnswerSelected={handleAnswer} 
              />
            </div>
          )}

          {!currentQuestion && (
            <motion.div 
              key="end"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-12 rounded-3xl border border-slate-200 bg-white/50 backdrop-blur-md shadow-sm mx-auto max-w-2xl mt-12"
            >
              <h2 className="font-heading text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-sky to-primary-teal mb-4">
                Arena Conquered!
              </h2>
              <p className="text-xl font-medium text-slate-600 mb-8">Final Score: {score}</p>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors shadow-md"
              >
                Return to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Render Particles */}
      {particles.map(p => (
        <XPParticleBurst 
          key={p.id} 
          x={p.x} 
          y={p.y} 
          onComplete={() => removeParticles(p.id)} 
        />
      ))}
    </div>
  );
}
