import { useState } from 'react';
import { Mic, ArrowLeft } from 'lucide-react';

interface SignUpScreenProps {
  onSignUp: (username: string, email: string, password: string) => Promise<void>;
  onBackToLogin: () => void;
}

export function SignUpScreen({ onSignUp, onBackToLogin }: SignUpScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await onSignUp(username, email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-rose-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-rose-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-8 border border-zinc-800">
          <button
            onClick={onBackToLogin}
            className="flex items-center gap-2 text-gray-400 hover:text-rose-400 transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar para login</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500/20 rounded-xl mb-4">
              <Mic className="w-8 h-8 text-rose-400" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2">
              Criar Conta
            </h1>
            <p className="text-gray-400">Junte-se ao Arena Cypher</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition"
                placeholder="Escolha um usuário"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition"
                placeholder="seu@email.com"
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
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-2">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition"
                placeholder="Digite a senha novamente"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Já tem uma conta?{' '}
              <button
                onClick={onBackToLogin}
                className="text-rose-400 hover:text-rose-300 font-medium transition"
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}