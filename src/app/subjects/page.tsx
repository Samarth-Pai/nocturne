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
          <h1 className="font-heading font-black text-3xl md:text-4xl text-slate-800 tracking-tight">
            Study <span className="text-primary-teal">Subjects</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Upload new materials to generate custom arena challenges.</p>
        </div>

        <Link
          href="/story"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-primary-sky hover:text-primary-sky"
        >
          Open Story Mode
        </Link>
      </div>

      <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-heading font-bold text-xl text-slate-800 mb-4">Existing Subjects</h2>

        {subjects.length === 0 && (
          <p className="text-sm text-slate-500">No subjects currently available in database.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Link
              key={subject.subjectSlug}
              href={`/arena?subjectSlug=${encodeURIComponent(subject.subjectSlug)}&subject=${encodeURIComponent(subject.subject)}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white hover:border-primary-sky/40 transition-colors"
            >
              <p className="font-bold text-slate-800">{subject.subject}</p>
              <p className="mt-1 text-xs text-slate-500">Slug: {subject.subjectSlug}</p>
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
