"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket, BookOpen, Trophy, User } from "lucide-react";

export function TopNavBar() {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/", icon: <Rocket size={18} /> },
    { label: "Subjects", href: "/subjects", icon: <BookOpen size={18} /> },
    { label: "Leaderboard", href: "/leaderboard", icon: <Trophy size={18} /> },
    { label: "Profile", href: "/profile", icon: <User size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-neutral-gray z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-sky to-primary-teal flex items-center justify-center text-white font-bold text-lg shadow-md">
              L<span className="text-primary-coral">U</span>
            </div>
            <span className="font-heading font-black text-xl tracking-tight text-foreground">
              LevelUp<span className="text-primary-sky">.</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 font-medium transition-colors border-b-2 px-1 py-5 ${
                    isActive 
                      ? "text-primary-sky border-primary-sky" 
                      : "text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Quick Stats / Mini Profile (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-500 uppercase">Lvl. 12</span>
                <span className="text-sm font-semibold text-primary-teal">1,250 XP</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-primary-coral border-2 border-white shadow-sm" />
          </div>

          {/* Mobile Menu Button - Placeholder */}
          <div className="md:hidden flex items-center">
            <button className="text-slate-500 hover:text-slate-800 p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
        </div>
      </div>
    </nav>
  );
}
