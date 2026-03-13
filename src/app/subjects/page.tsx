import { UploadSystem } from "@/components/upload/UploadSystem";

export default function SubjectsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      
      {/* Header section */}
      <div className="w-full flex justify-between items-center mb-8">
        <div>
          <h1 className="font-heading font-black text-3xl md:text-4xl text-slate-800 tracking-tight">
            Study <span className="text-primary-teal">Subjects</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Upload new materials to generate custom arena challenges.</p>
        </div>
      </div>

      <UploadSystem />

    </div>
  );
}
