"use client";

import { useState } from "react";
import { DuelOverlay } from "./DuelOverlay";
import { QuestionCard, QuestionData } from "./QuestionCard";
import { XPParticleBurst } from "./XPParticleBurst";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const MOCK_QUESTIONS: QuestionData[] = [
  {
    id: "q1",
    question: "What is the time complexity of a purely iterative binary search?",
    options: [
      { id: "o1", text: "O(n)" },
      { id: "o2", text: "O(log n)" },
      { id: "o3", text: "O(1)" },
      { id: "o4", text: "O(n^2)" },
    ],
    correctOptionId: "o2",
    explanation: "Binary search divides the search space in half at each step, resulting in logarithmic time complexity.",
  },
  {
    id: "q2",
    question: "Which data structure operates on a Last In, First Out (LIFO) principle?",
    options: [
      { id: "o1", text: "Queue" },
      { id: "o2", text: "Linked List" },
      { id: "o3", text: "Stack" },
      { id: "o4", text: "Tree" },
    ],
    correctOptionId: "o3",
    explanation: "A Stack adds elements to the top and removes from the top, operating precisely under LIFO rules.",
  },
  {
    id: "q3",
    question: "What does 'useState' in React return?",
    options: [
      { id: "o1", text: "A class instance and a render function" },
      { id: "o2", text: "The current state value and a function to update it" },
      { id: "o3", text: "A DOM element reference" },
      { id: "o4", text: "A boolean representing component mount status" },
    ],
    correctOptionId: "o2",
    explanation: "The useState Hook returns an array containing the current state variable and a setter function to update that state.",
  }
];

export function QuizArena() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [particles, setParticles] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleAnswer = (isCorrect: boolean, e: React.MouseEvent) => {
    if (isCorrect) {
      setScore((s) => s + 10);
      
      // Trigger particles at click location
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setParticles(prev => [...prev, { x: rect.left + rect.width / 2, y: rect.top, id: Date.now() }]);

      // Move to next question automatically after a short delay
      setTimeout(() => {
        if (currentIndex < MOCK_QUESTIONS.length - 1) {
          setCurrentIndex(curr => curr + 1);
        }
      }, 1500);
    } else {
      // If incorrect, give them some time to read the red explanation before manually moving on,
      // or implement a Next button. For automation sake, we wait 3 seconds.
      setTimeout(() => {
        if (currentIndex < MOCK_QUESTIONS.length - 1) {
          setCurrentIndex((curr) => curr + 1);
        }
      }, 3500);
    }
  };

  const removeParticles = (id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  };

  const currentQuestion = MOCK_QUESTIONS[currentIndex];
  // Calculate a fake percentage for user progress (based on score)
  const userProgress = Math.min((score / (MOCK_QUESTIONS.length * 10)) * 100, 100);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-12 py-8 relative">
      
      {/* Background Ambience */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Duel Overlay */}
      <DuelOverlay userProgress={userProgress} />

      {/* Main Arena Area */}
      <div className="flex-1 w-full relative h-[400px]">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <QuestionCard 
              key={currentQuestion.id} 
              data={currentQuestion} 
              onAnswerSelected={handleAnswer} 
            />
          )}

          {!currentQuestion && (
            <motion.div 
              key="end"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center text-white p-12 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md"
            >
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 mb-4">
                Arena Conquered!
              </h2>
              <p className="text-xl text-white/70">Final Score: {score}</p>
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
