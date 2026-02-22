import { useState } from 'react';
import { Home, Calendar, Users, Mic, LogOut } from 'lucide-react';
import { HomeView } from './HomeView';
import { BattlesView } from './BattlesView';
import { MCsView } from './MCsView';
import type { Battle, MC } from '../App';

interface DashboardProps {
  battles: Battle[];
  mcs: MC[];
  onAddBattle: (battle: Battle) => void;
  onUpdateBattle: (battle: Battle) => void;
  onAddMC: (mc: MC) => void;
  onUpdateMC: (mc: MC) => void;
  onDeleteMC: (mcId: string) => void;
  onDeleteBattle: (battleId: string) => void;
  onLogout: () => void;
}

export function Dashboard({ battles, mcs, onAddBattle, onUpdateBattle, onAddMC, onUpdateMC, onDeleteMC, onDeleteBattle, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<'home' | 'battles' | 'mcs'>('home');

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
     
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-600 rounded-full blur-3xl"></div>
      </div>

  
      <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-rose-400" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Arena Cypher Management
              </h1>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-3 font-medium transition text-gray-400 hover:text-rose-400 hover:bg-rose-400/5"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

    
      <nav className="bg-zinc-900/50 backdrop-blur border-b border-zinc-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                currentView === 'home'
                  ? 'text-rose-400 border-b-2 border-rose-400 bg-rose-400/5'
                  : 'text-gray-400 hover:text-rose-400 hover:bg-rose-400/5'
              }`}
            >
              <Home className="w-5 h-5" />
              Início
            </button>
            <button
              onClick={() => setCurrentView('battles')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                currentView === 'battles'
                  ? 'text-rose-400 border-b-2 border-rose-400 bg-rose-400/5'
                  : 'text-gray-400 hover:text-rose-400 hover:bg-rose-400/5'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Batalhas
            </button>
            <button
              onClick={() => setCurrentView('mcs')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                currentView === 'mcs'
                  ? 'text-rose-400 border-b-2 border-rose-400 bg-rose-400/5'
                  : 'text-gray-400 hover:text-rose-400 hover:bg-rose-400/5'
              }`}
            >
              <Users className="w-5 h-5" />
              MCs
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {currentView === 'home' && <HomeView battles={battles} mcs={mcs} />}
        {currentView === 'battles' && (
          <BattlesView
            battles={battles}
            mcs={mcs}
            onAddBattle={onAddBattle}
            onUpdateBattle={onUpdateBattle}
            onDeleteBattle={onDeleteBattle}
          />
        )}
        {currentView === 'mcs' && <MCsView mcs={mcs} onAddMC={onAddMC} onUpdateMC={onUpdateMC} onDeleteMC={onDeleteMC} />}
      </main>
    </div>
  );
}