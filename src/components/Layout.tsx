import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans selection:bg-fuchsia-200 selection:text-fuchsia-900">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-neutral-50 to-rose-100 opacity-50"></div>
      
      <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-b border-white/20 z-50 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-gradient-to-br from-fuchsia-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-fuchsia-500/20 group-hover:scale-110 transition-transform duration-300">
              <Zap size={24} strokeWidth={2.5} fill="currentColor" className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-indigo-600">
              StyleNova
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-neutral-600">
            <a href="#" className="hover:text-fuchsia-600 transition-colors">Discover</a>
            <a href="#" className="hover:text-fuchsia-600 transition-colors">Wardrobe</a>
            <a href="#" className="hover:text-fuchsia-600 transition-colors">Community</a>
          </nav>

          <button className="bg-neutral-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-neutral-800 transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 active:scale-95">
            <Sparkles size={16} className="text-yellow-300" />
            <span>Get Styled</span>
          </button>
        </div>
      </header>
      
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
