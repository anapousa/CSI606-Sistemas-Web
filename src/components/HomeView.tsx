import { Calendar, MapPin, Trophy, Zap, Users, Mic } from 'lucide-react';
import type { Battle, MC } from '../App';

interface HomeViewProps {
  battles: Battle[];
  mcs: MC[];
}

export function HomeView({ battles, mcs }: HomeViewProps) {
  const upcomingBattles = battles
    .filter(b => b.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const topMCs = [...mcs]
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-rose-500/10 to-red-500/5 rounded-xl p-8 border border-rose-400/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-500/20 rounded-lg flex items-center justify-center">
            <Mic className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-white mb-1">Bem-vindo ao Arena Cypher</h2>
            <p className="text-gray-400">Gerencie batalhas de rima e acompanhe rankings</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:border-rose-400/30 transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Próximo Evento</p>
              <p className="text-2xl font-semibold text-white">
                {upcomingBattles.length > 0 
                  ? new Date(upcomingBattles[0].date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:border-rose-400/30 transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">MCs Cadastrados</p>
              <p className="text-2xl font-semibold text-white">{mcs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:border-rose-400/30 transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Batalhas Agendadas</p>
              <p className="text-2xl font-semibold text-white">
                {battles.filter(b => b.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Battles */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-rose-400" />
            <h3 className="text-xl font-semibold text-white">Próximas Batalhas</h3>
          </div>

          <div className="space-y-4">
            {upcomingBattles.length === 0 ? (
              <p className="text-gray-500 text-center py-12">Nenhuma batalha agendada</p>
            ) : (
              upcomingBattles.map((battle) => (
                <div
                  key={battle.id}
                  className="bg-zinc-800/40 rounded-lg p-5 border border-zinc-700/50 hover:border-rose-400/30 transition"
                >
                  <h4 className="font-medium text-white mb-3 text-lg">{battle.name}</h4>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 text-rose-400" />
                      <span>{formatDate(battle.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span>{battle.location}</span>
                    </div>
                  </div>
                  <div className="border-t border-zinc-700/50 pt-3">
                    <p className="text-xs text-rose-400 mb-2 font-medium">Confrontos:</p>
                    <div className="space-y-2">
                      {battle.matchups.map((matchup, idx) => (
                        <div key={idx} className="text-sm text-gray-300 bg-zinc-900/50 rounded-lg p-2">
                          {matchup.mc1} <span className="text-rose-400 font-medium">vs</span> {matchup.mc2}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top 3 MCs */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-semibold text-white">Top 3 MCs</h3>
          </div>

          <div className="space-y-4 mb-6">
            {topMCs.length === 0 ? (
              <p className="text-gray-500 text-center py-12">Nenhum MC cadastrado</p>
            ) : (
              topMCs.map((mc, index) => (
                <div
                  key={mc.id}
                  className="bg-zinc-800/40 rounded-lg p-5 border border-zinc-700/50 hover:border-rose-400/30 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-medium text-sm">#{index + 1}</span>
                      <div>
                        <h4 className="font-medium text-white text-lg">{mc.name}</h4>
                        <span className="text-rose-400 text-sm">{mc.wins} vitórias</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}