"use client";

import { motion } from "framer-motion";
import { User, Award, Clock, Star, Settings } from "lucide-react";
import { AvatarDisplay } from "@/components/dashboard/AvatarDisplay";

export default function ProfilePage() {
  const userData = {
    level: 12,
    xp: 3450,
    maxXp: 5000,
    streak: 14
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Info Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center"
        >
          <div className="mb-6">
            <AvatarDisplay data={userData} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 font-heading">Alex Johnson</h1>
          <p className="text-slate-500 font-medium">High School Student</p>
          
          <div className="w-full h-px bg-slate-100 my-8" />
          
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between text-sm font-bold text-slate-500">
              <span className="flex items-center gap-2"><Award size={18} /> Points</span>
              <span className="text-primary-sky">24,500</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-slate-500">
              <span className="flex items-center gap-2"><Clock size={18} /> Hours Studied</span>
              <span className="text-primary-teal">142</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-slate-500">
              <span className="flex items-center gap-2"><Star size={18} /> Achievements</span>
              <span className="text-accent-purple">18/45</span>
            </div>
          </div>
          
          <button className="mt-8 w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
            <Settings size={18} />
            Edit Profile
          </button>
        </motion.div>

        {/* Stats and Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 font-heading">Performance Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-500 block mb-1">ACCURACY</span>
                <span className="text-3xl font-black text-primary-sky">92%</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-500 block mb-1">STREAK RECORD</span>
                <span className="text-3xl font-black text-accent-orange">28 Days</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 font-heading">Recent Achievements</h2>
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                  <Award size={32} />
                </div>
              ))}
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                +13
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
