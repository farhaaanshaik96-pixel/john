/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Ghost } from 'lucide-react';

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-6 overflow-hidden flex flex-col gap-6 selection:bg-fuchsia-500/30">
      {/* Header */}
      <header className="flex justify-between items-center h-16 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-fuchsia-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(192,38,211,0.5)]">
            <Ghost className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-fuchsia-500 hidden sm:block">
            Synth-Slither
          </h1>
        </div>
        
        <div className="flex gap-8 text-sm font-mono">
          <div className="flex flex-col items-end">
            <span className="text-zinc-500 uppercase text-[10px]">Current Score</span>
            <span className="text-2xl text-cyan-400 font-bold shadow-cyan-500/20 drop-shadow-md">
              {score.toString().padStart(5, '0')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Game Container (Center/Left) */}
        <section className="lg:col-span-8 bg-black rounded-3xl border-2 border-zinc-800 relative overflow-hidden flex items-center justify-center shadow-inner min-h-[400px]">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <SnakeGame onScoreChange={setScore} />
        </section>

        {/* Right Sidebar: Music Stats & Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto">
          <MusicPlayer />
        </div>
      </main>
    </div>
  );
}
