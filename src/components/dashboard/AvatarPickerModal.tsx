"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { AvatarId } from "@/hooks/useUserPreferences";

interface Avatar {
  id: AvatarId;
  name: string;
  url: string;
}

const AVATARS: Avatar[] = [
  { id: "default", name: "Default", url: "/avatar.png" },
  { id: "eren", name: "Eren Yeager", url: "/avatars/eren.png" },
  { id: "mikasa", name: "Mikasa Ackerman", url: "/avatars/mikasa.png" },
  { id: "armin", name: "Armin Arlert", url: "/avatars/armin.png" },
];

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarId: AvatarId;
  onSelect: (id: AvatarId) => void;
}

export function AvatarPickerModal({ isOpen, onClose, currentAvatarId, onSelect }: AvatarPickerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl z-[101] border border-slate-100"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 font-heading">Pick Your Hero</h2>
                <p className="text-slate-500 font-medium mt-1">Choose an avatar that fits your style</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => {
                    onSelect(avatar.id);
                    onClose();
                  }}
                  className={`relative p-4 rounded-2xl border-2 transition-all group ${
                    currentAvatarId === avatar.id 
                      ? "border-primary-sky bg-primary-sky/5 shadow-inner" 
                      : "border-slate-100 bg-slate-50 hover:border-primary-sky/30 hover:bg-white shadow-sm"
                  }`}
                >
                  <div className="w-full aspect-square bg-white rounded-xl mb-3 overflow-hidden border border-slate-100 p-2">
                    <img 
                      src={avatar.url} 
                      alt={avatar.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <span className={`font-bold text-sm ${currentAvatarId === avatar.id ? "text-primary-sky" : "text-slate-600"}`}>
                    {avatar.name}
                  </span>
                  
                  {currentAvatarId === avatar.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary-sky text-white rounded-full flex items-center justify-center shadow-md scale-110">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <p className="mt-8 text-center text-xs text-slate-400 font-medium uppercase tracking-widest">
              More avatars unlock as you level up!
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
