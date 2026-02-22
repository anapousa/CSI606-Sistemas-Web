import { useState } from 'react';
import { Plus, Trophy, TrendingUp, TrendingDown, Pencil, Search, Crown, Medal, Award, Trash2 } from 'lucide-react';
import { AddMCModal } from './AddMCModal';
import { EditMCModal } from './EditMCModal';
import type { MC } from '../App';

interface MCsViewProps {
  mcs: MC[];
  onAddMC: (mc: MC) => void;
  onUpdateMC: (mc: MC) => void;
  onDeleteMC: (mcId: string) => void;
}

export function MCsView({ mcs, onAddMC, onUpdateMC, onDeleteMC }: MCsViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMC, setEditingMC] = useState<MC | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const sortedMCs = [...mcs].sort((a, b) => b.wins - a.wins);

  const filteredMCs = sortedMCs.filter(mc => 
    mc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWinRate = (mc: MC) => {
    const total = mc.wins + mc.losses + mc.draws;
    if (total === 0) return 0;
    return Math.round((mc.wins / total) * 100);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">
          MCs Cadastrados
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-3 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Novo MC
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-rose-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar MC..."
            className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400"
          />
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400">
                  Ranking
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400">
                  MC
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400">
                  Vitórias
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400">
                  Derrotas
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400">
                  Win Rate
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400">
                  Pontos
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredMCs.map((mc, index) => {
                const winRate = getWinRate(mc);
                return (
                  <tr
                    key={mc.id}
                    className="hover:bg-rose-400/5 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                        {index === 1 && <Medal className="w-5 h-5 text-gray-300" />}
                        {index === 2 && <Award className="w-5 h-5 text-orange-400" />}
                        <span className="text-white font-medium">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">{mc.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                        <TrendingUp className="w-4 h-4" />
                        {mc.wins}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                        <TrendingDown className="w-4 h-4" />
                        {mc.losses}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden border border-zinc-600">
                          <div
                            className="h-full bg-rose-400 rounded-full transition-all"
                            style={{ width: `${winRate}%` }}
                          />
                        </div>
                        <span className="text-white text-sm font-medium w-12">
                          {winRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {mc.wins * 3} pts
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setEditingMC(mc)}
                        className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-500 transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteMC(mc.id)}
                        className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-500 transition ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {mcs.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum MC cadastrado ainda</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-rose-400 hover:text-rose-500 transition font-medium"
            >
              Cadastrar primeiro MC
            </button>
          </div>
        )}
      </div>

      <AddMCModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAddMC}
      />
      <EditMCModal
        isOpen={!!editingMC}
        onClose={() => setEditingMC(null)}
        onSubmit={onUpdateMC}
        mc={editingMC}
      />
    </div>
  );
}
