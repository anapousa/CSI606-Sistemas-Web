import { useState } from 'react';
import { Calendar, MapPin, Mic, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { CreateBattleModal } from './CreateBattleModal';
import { EditBattleModal } from './EditBattleModal';
import type { Battle, MC } from '../App';

interface BattlesViewProps {
  battles: Battle[];
  mcs: MC[];
  onAddBattle: (battle: Battle) => void;
  onUpdateBattle: (battle: Battle) => void;
  onDeleteBattle: (battleId: string) => void;
}

export function BattlesView({ battles, mcs, onAddBattle, onUpdateBattle, onDeleteBattle }: BattlesViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBattle, setEditingBattle] = useState<Battle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredBattles = battles.filter(battle =>
    battle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    battle.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">
          Batalhas
        </h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-3 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Nova Batalha
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-rose-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar batalha por nome ou local..."
            className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBattles.map((battle) => (
          <div
            key={battle.id}
            className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:border-rose-400/30 transition"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-medium text-white">{battle.name}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  battle.status === 'scheduled'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}
              >
                {battle.status === 'scheduled' ? 'Agendada' : 'Concluída'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Calendar className="w-4 h-4 text-rose-400" />
                <span>{formatDate(battle.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>{battle.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Mic className="w-4 h-4 text-rose-400" />
                <span>{battle.matchups.length} confrontos</span>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <p className="text-xs font-medium text-rose-400 mb-3">Confrontos</p>
              <div className="space-y-2">
                {battle.matchups.map((matchup, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-800/40 rounded-lg p-3 text-sm border border-zinc-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">{matchup.mc1}</span>
                      <span className="text-rose-400 font-medium text-xs">vs</span>
                      <span className="text-gray-300">{matchup.mc2}</span>
                    </div>
                    {matchup.winner && (
                      <div className="mt-2 pt-2 border-t border-zinc-700">
                        <span className="text-xs text-green-400 font-medium">
                          Vencedor: {matchup.winner}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setEditingBattle(battle)}
                className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => onDeleteBattle(battle.id)}
                className="w-full flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded-lg transition text-sm mt-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {battles.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Nenhuma batalha cadastrada ainda</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-rose-400 hover:text-rose-500 transition font-medium"
          >
            Criar primeira batalha
          </button>
        </div>
      )}

      <CreateBattleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={onAddBattle}
        mcs={mcs}
      />

      {editingBattle && (
        <EditBattleModal
          isOpen={true}
          onClose={() => setEditingBattle(null)}
          onSubmit={onUpdateBattle}
          mcs={mcs}
          battle={editingBattle}
        />
      )}
    </div>
  );
}
