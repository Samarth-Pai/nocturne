"use client";

import { useEffect, useState } from "react";
import { UploadSystem } from "@/components/upload/UploadSystem";
import Link from "next/link";

interface SubjectItem {
  subject: string;
  subjectSlug: string;
  totalQuestions: number;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  const loadSubjects = () => {
    fetch("/api/subjects")
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { subjects: SubjectItem[] };
        setSubjects(data.subjects ?? []);
      })
      .catch(() => {
        setSubjects([]);
      });
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center gap-8">
      <div className="w-full flex justify-between items-center mb-2">
        <div>
          <h1 className="cyber-text-subtle text-3xl md:text-4xl text-white tracking-tight drop-shadow-md">
            STUDY <span className="text-primary-teal drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">SUBJECTS</span>
          </h1>
          <p className="text-slate-300 font-medium mt-1">Upload new materials to generate custom arena challenges.</p>
        </div>

        <Link
          href="/story"
          className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-md px-4 py-2 text-sm font-bold text-slate-200 hover:border-primary-sky hover:text-primary-sky hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
        >
          Open Story Mode
        </Link>
      </div>

      <section className="w-full glass-panel p-6">
        <h2 className="cyber-text-subtle text-xl text-accent-purple mb-4">EXISTING SUBJECTS</h2>

        {subjects.length === 0 && (
          <p className="text-sm text-slate-400">No subjects currently available in database.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Link
              key={subject.subjectSlug}
              href={`/arena?subjectSlug=${encodeURIComponent(subject.subjectSlug)}&subject=${encodeURIComponent(subject.subject)}`}
              className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 hover:bg-slate-800/80 hover:border-primary-sky/60 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all"
            >
              <p className="font-bold text-slate-100">{subject.subject}</p>
              <p className="mt-1 text-xs text-slate-400">Slug: {subject.subjectSlug}</p>
              <p className="mt-2 text-sm font-semibold text-primary-sky">{subject.totalQuestions} questions</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Click to attempt topic</p>
            </Link>
          ))}
        </div>
      </section>

      <UploadSystem onUploaded={loadSubjects} />
    </div>
  );
}
