import { useState } from 'react';
import { Mic, Mail, Lock } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onShowSignUp: () => void;
}

export function LoginScreen({ onLogin, onShowSignUp }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleClearSession = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-rose-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-rose-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-8 border border-zinc-800">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500/20 rounded-xl mb-4">
              <Mic className="w-8 h-8 text-rose-400" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2">
              Arena Cypher
            </h1>
            <p className="text-gray-400">Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition"
                placeholder="Digite seu email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition"
                placeholder="Digite sua senha"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
            >
              Entrar no Arena
            </button>
          </form>

          {error && (
            <div className="mt-3 text-center text-red-500">
              <p>{error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Não tem uma conta?{' '}
              <button
                onClick={onShowSignUp}
                className="text-rose-400 hover:text-rose-300 font-medium transition"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}