import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { MC } from '../App';

interface EditMCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mc: MC) => void;
  mc: MC | null;
}

export function EditMCModal({ isOpen, onClose, onSubmit, mc }: EditMCModalProps) {
  const [name, setName] = useState('');
  const [wins, setWins] = useState('0');
  const [losses, setLosses] = useState('0');
  const [draws, setDraws] = useState('0');

  useEffect(() => {
    if (mc) {
      setName(mc.name);
      setWins(mc.wins.toString());
      setLosses(mc.losses.toString());
      setDraws(mc.draws.toString());
    }
  }, [mc]);

  if (!isOpen || !mc) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert('Por favor, insira o nome do MC');
      return;
    }

    const winsNum = parseInt(wins) || 0;
    const lossesNum = parseInt(losses) || 0;
    const drawsNum = parseInt(draws) || 0;

    const updatedMC: MC = {
      id: mc.id,
      name,
      wins: winsNum,
      losses: lossesNum,
      draws: drawsNum,
      totalBattles: winsNum + lossesNum + drawsNum,
    };

    onSubmit(updatedMC);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-md w-full">
        <div className="border-b border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Editar MC
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-rose-400 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nome do MC
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400"
              placeholder="Ex: Xamuel"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Vitórias
              </label>
              <input
                type="number"
                min="0"
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Derrotas
              </label>
              <input
                type="number"
                min="0"
                value={losses}
                onChange={(e) => setLosses(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Empates
              </label>
              <input
                type="number"
                min="0"
                value={draws}
                onChange={(e) => setDraws(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400"
              />
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