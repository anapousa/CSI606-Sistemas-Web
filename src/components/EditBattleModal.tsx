import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Battle, MC } from '../App';

interface EditBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (battle: Battle) => void;
  mcs: MC[];
  battle: Battle | null;
}

export function EditBattleModal({ isOpen, onClose, onSubmit, mcs, battle }: EditBattleModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [matchups, setMatchups] = useState<Array<{ mc1: string; mc2: string; winner?: string }>>([
    { mc1: '', mc2: '' },
  ]);
  const [status, setStatus] = useState<'scheduled' | 'completed'>('scheduled');

  useEffect(() => {
    if (battle) {
      setName(battle.name);
      setDate(battle.date);
      setLocation(battle.location);
      setMatchups(battle.matchups.length > 0 ? battle.matchups : [{ mc1: '', mc2: '' }]);
      setStatus(battle.status);
    }
  }, [battle]);

  if (!isOpen || !battle) return null;

  const handleAddMatchup = () => {
    setMatchups([...matchups, { mc1: '', mc2: '' }]);
  };

  const handleRemoveMatchup = (index: number) => {
    if (matchups.length > 1) {
      setMatchups(matchups.filter((_, i) => i !== index));
    }
  };

  const handleMatchupChange = (index: number, field: 'mc1' | 'mc2' | 'winner', value: string) => {
    const newMatchups = [...matchups];
    if (field === 'winner') {
      newMatchups[index].winner = value || undefined;
    } else {
      newMatchups[index][field] = value;
    }
    setMatchups(newMatchups);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validMatchups = matchups.filter(m => m.mc1 && m.mc2);
    
    if (!name || !date || !location || validMatchups.length === 0) {
      alert('Por favor, preencha todos os campos e adicione pelo menos um confronto válido');
      return;
    }

    const updatedBattle: Battle = {
      id: battle.id,
      name,
      date,
      location,
      matchups: validMatchups,
      status,
    };

    onSubmit(updatedBattle);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Editar Batalha
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-rose-400 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nome da Batalha
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400"
              placeholder="Ex: Batalha da Aldeia"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Local
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400"
                placeholder="Ex: São Paulo - SP"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'scheduled' | 'completed')}
              className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400"
            >
              <option value="scheduled">Agendada</option>
              <option value="completed">Concluída</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-400">
                Confrontos
              </label>
              <button
                type="button"
                onClick={handleAddMatchup}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-500 text-sm transition font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {matchups.map((matchup, index) => (
                <div
                  key={index}
                  className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-rose-400 font-medium">#{index + 1}</span>
                    {matchups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMatchup(index)}
                        className="ml-auto text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-medium">MC 1</label>
                      <select
                        value={matchup.mc1}
                        onChange={(e) => handleMatchupChange(index, 'mc1', e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-400"
                      >
                        <option value="">Selecione...</option>
                        {mcs.map((mc) => (
                          <option key={mc.id} value={mc.name}>
                            {mc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-medium">MC 2</label>
                      <select
                        value={matchup.mc2}
                        onChange={(e) => handleMatchupChange(index, 'mc2', e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-400"
                      >
                        <option value="">Selecione...</option>
                        {mcs.map((mc) => (
                          <option key={mc.id} value={mc.name}>
                            {mc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-medium">Vencedor (opcional)</label>
                    <select
                      value={matchup.winner || ''}
                      onChange={(e) => handleMatchupChange(index, 'winner', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-400"
                    >
                      <option value="">Nenhum</option>
                      {matchup.mc1 && <option value={matchup.mc1}>{matchup.mc1}</option>}
                      {matchup.mc2 && <option value={matchup.mc2}>{matchup.mc2}</option>}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition font-medium border border-zinc-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition font-medium"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
