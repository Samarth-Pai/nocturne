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
  },
  {
    id: "q3",
    question: "Who wrote the play 'Romeo and Juliet'?",
    options: [
      { id: "o1", text: "Charles Dickens" },
      { id: "o2", text: "William Shakespeare" },
      { id: "o3", text: "Mark Twain" },
      { id: "o4", text: "Jane Austen" },
    ],
    correctOptionId: "o2",
    explanation: "William Shakespeare, often called England's national poet, wrote Romeo and Juliet early in his career."
  },
  {
    id: "q4",
    question: "What is the value of Pi (to two decimal places)?",
    options: [
      { id: "o1", text: "3.12" },
      { id: "o2", text: "3.14" },
      { id: "o3", text: "3.16" },
      { id: "o4", text: "3.18" },
    ],
    correctOptionId: "o2",
    explanation: "Pi is approximately equal to 3.14159, commonly shortened to 3.14."
  },
  {
    id: "q5",
    question: "Which planet is known as the Red Planet?",
    options: [
      { id: "o1", text: "Venus" },
      { id: "o2", text: "Mars" },
      { id: "o3", text: "Jupiter" },
      { id: "o4", text: "Saturn" },
    ],
    correctOptionId: "o2",
    explanation: "Mars is often called the 'Red Planet' because iron minerals in the Martian soil oxidize, or rust, causing the soil and atmosphere to look red."
  },
  {
    id: "q6",
    question: "In which year did the French Revolution begin?",
    options: [
      { id: "o1", text: "1776" },
      { id: "o2", text: "1789" },
      { id: "o3", text: "1812" },
      { id: "o4", text: "1848" },
    ],
    correctOptionId: "o2",
    explanation: "The French Revolution began in 1789 with the Storming of the Bastille."
  },
  {
    id: "q7",
    question: "What is the largest mammal in the world?",
    options: [
      { id: "o1", text: "African Elephant" },
      { id: "o2", text: "Blue Whale" },
      { id: "o3", text: "Great White Shark" },
      { id: "o4", text: "Giraffe" },
    ],
    correctOptionId: "o2",
    explanation: "The blue whale is the largest known animal to have ever existed, reaching lengths of up to 100 feet."
  },
  {
    id: "q8",
    question: "What is the capital city of Japan?",
    options: [
      { id: "o1", text: "Seoul" },
      { id: "o2", text: "Beijing" },
      { id: "o3", text: "Tokyo" },
      { id: "o4", text: "Bangkok" },
    ],
    correctOptionId: "o3",
    explanation: "Tokyo is the capital and largest city of Japan."
  },
  {
    id: "q9",
    question: "Which gas do plants primarily absorb during photosynthesis?",
    options: [
      { id: "o1", text: "Oxygen" },
      { id: "o2", text: "Carbon Dioxide" },
      { id: "o3", text: "Nitrogen" },
      { id: "o4", text: "Hydrogen" },
    ],
    correctOptionId: "o2",
    explanation: "Plants take in carbon dioxide and water to produce oxygen and glucose through photosynthesis."
  },
  {
    id: "q10",
    question: "What is the square root of 144?",
    options: [
      { id: "o1", text: "10" },
      { id: "o2", text: "11" },
      { id: "o3", text: "12" },
      { id: "o4", text: "13" },
    ],
    correctOptionId: "o3",
    explanation: "12 multiplied by 12 equals 144."
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
      setTimeout(() => {
        handleNext();
      }, 2000); // Give them long enough to read the explanation
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

      <div className="flex-1 w-full relative h-[450px]">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <div className="w-full flex flex-col items-center">
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
                key={currentQuestion.id}
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
