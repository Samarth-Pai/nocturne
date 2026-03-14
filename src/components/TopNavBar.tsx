"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket, BookOpen, Trophy, User, Swords, Sparkles } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useEffect, useState } from "react";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export function TopNavBar() {
  const pathname = usePathname();
  const { avatarUrl } = useUserPreferences();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("levelup_token");

    fetch("/api/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        if (!res.ok) {
          setAuthUser(null);
          return;
        }

        const data = (await res.json()) as { user: AuthUser };
        setAuthUser(data.user);
      })
      .catch(() => setAuthUser(null));
  }, [pathname]);

  async function handleLogout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("levelup_token");
    setAuthUser(null);
    window.location.href = "/auth";
  }

  const links = [
    { label: "Dashboard", href: "/", icon: <Rocket size={18} /> },
    { label: "Subjects", href: "/subjects", icon: <BookOpen size={18} /> },
    { label: "Story", href: "/story", icon: <Sparkles size={18} /> },
    { label: "Duel", href: "/duel", icon: <Swords size={18} /> },
    { label: "Leaderboard", href: "/leaderboard", icon: <Trophy size={18} /> },
    { label: "Profile", href: "/profile", icon: <User size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-900/40 backdrop-blur-md border-b border-slate-800/50 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary-sky to-primary-teal flex items-center justify-center text-white font-bold text-lg shadow-[0_0_10px_rgba(56,189,248,0.5)]">
              L<span className="text-accent-pink drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]">U</span>
            </div>
            <span className="font-heading font-black text-xl tracking-tight text-white drop-shadow-md">
              LevelUp<span className="text-primary-sky drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]">.</span>
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
                      ? "text-primary-sky border-primary-sky drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]" 
                      : "text-slate-400 border-transparent hover:text-white hover:border-slate-500"
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
            {authUser ? (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase">{authUser.name}</span>
                  <span className="text-sm font-semibold text-primary-teal drop-shadow-[0_0_3px_rgba(45,212,191,0.5)]">Signed In</span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-600 shadow-sm overflow-hidden bg-slate-800">
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="rounded-lg bg-primary-sky px-4 py-2 text-sm font-bold text-slate-900 shadow-[0_0_10px_rgba(56,189,248,0.4)] hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button - Placeholder */}
          <div className="md:hidden flex items-center">
            <button className="text-slate-400 hover:text-white p-2">
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
