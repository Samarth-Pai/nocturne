"use client";

import { motion } from "framer-motion";
import { Home, Compass, User, Settings, Gamepad2, BarChart2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const items = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/" },
    { icon: <Compass size={20} />, label: "Explore Path", href: "/explore" },
    { icon: <Gamepad2 size={20} />, label: "Mini Games", href: "/arena" },
    { icon: <BarChart2 size={20} />, label: "Analytics", href: "/analytics" },
    { icon: <User size={20} />, label: "Profile", href: "/profile" },
    { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
  ];

  return (
    <motion.aside
      variants={{
        hidden: { opacity: 0, x: -50 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { type: "spring", stiffness: 260, damping: 20 },
        },
      }}
      className="h-full w-64 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md shadow-lg flex flex-col gap-6"
    >
      <div className="flex items-center gap-3 text-xl font-bold tracking-wider text-white">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <Gamepad2 size={18} />
        </div>
        NOCTURNE
      </div>
      
      <nav className="flex-1 mt-8 space-y-2">
        {items.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400" />
          <div>
            <div className="text-sm font-medium text-white">Player One</div>
            <div className="text-xs text-white/50">Lvl. 42 Ranger</div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
