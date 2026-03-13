"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadSystemProps {
  onUploaded?: () => void;
}

export function UploadSystem({ onUploaded }: UploadSystemProps) {
  const [dragActive, setDragActive] = useState(false);
  const [subject, setSubject] = useState("");
  const [subjectSlug, setSubjectSlug] = useState("");
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file && !textInput) return;

    setStatus("uploading");
    setError(null);

    const token = localStorage.getItem("levelup_token");
    const formData = new FormData();
    formData.append("subject", subject || "General");
    formData.append("subjectSlug", subjectSlug);
    formData.append("textInput", textInput);
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await fetch("/api/subjects/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setError(data.error ?? "Failed to process upload.");
        return;
      }

      setStatus("success");
      onUploaded?.();
    } catch {
      setStatus("error");
      setError("Unable to upload subject material.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
      
      <div className="text-center mb-8 relative z-10">
        <h2 className="font-heading font-black text-3xl text-slate-800 mb-2">Upload Study Material</h2>
        <p className="text-slate-500 font-medium">Feed your Hero knowledge. We'll generate a custom quiz!</p>
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-6 relative z-10"
          >
            {/* Drag & Drop Zone */}
            <div
              className={`relative flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-2xl p-6 transition-all ${
                dragActive 
                  ? "border-primary-sky bg-primary-sky/5 scale-[1.02]" 
                  : file 
                    ? "border-primary-teal bg-primary-teal/5" 
                    : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,.pptx,.txt"
              />
              
              {file ? (
                <div className="flex flex-col items-center text-primary-teal font-medium">
                  <FileText size={48} className="mb-4" />
                  <p className="text-lg">{file.name}</p>
                  <p className="text-sm opacity-70 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-500">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Upload size={28} className="text-primary-sky" />
                  </div>
                  <p className="font-semibold text-lg text-slate-700">Click or drag file to this area</p>
                  <p className="text-sm mt-1">Supports PDF, PPTX, TXT</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 w-full">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">OR</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Text Input */}
            <div className="w-full">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject Name (e.g. Data Structures)"
                className="w-full mb-3 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-sky/50 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
              />
              <input
                value={subjectSlug}
                onChange={(e) => setSubjectSlug(e.target.value)}
                placeholder="Subject Slug (optional, e.g. data-structures)"
                className="w-full mb-3 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-sky/50 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
              />
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your notes or text here..."
                className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-sky/50 outline-none transition-all resize-none text-slate-700 font-medium placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!file && !textInput}
              className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-primary-sky to-primary-teal shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:hover:translate-y-0"
            >
              Generate Quiz
            </button>

            {error && (
              <p className="text-sm text-rose-600 text-center">{error}</p>
            )}
          </motion.div>
        )}

        {status === "uploading" && (
          <motion.div
            key="uploading-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 relative z-10"
          >
            <Loader2 size={64} className="text-primary-sky animate-spin mb-6" />
            <h3 className="font-heading font-bold text-2xl text-slate-800">Processing Material...</h3>
            <p className="text-slate-500 font-medium mt-2 text-center max-w-sm">
              LevelUp AI is reading your notes and generating the perfect challenge for your Avatar.
            </p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 relative z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CheckCircle size={80} className="text-primary-teal mb-6" />
            </motion.div>
            <h3 className="font-heading font-bold text-2xl text-slate-800">Quiz Ready!</h3>
            <p className="text-slate-500 font-medium mt-2">Questions saved to database for this subject.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-sky/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-teal/5 rounded-full blur-3xl" />
    </div>
  );
}
