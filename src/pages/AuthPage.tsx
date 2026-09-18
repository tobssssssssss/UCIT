import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nick, setNick] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'login') {
      const { error: err } = await signIn(email, password);
      if (err) setError(err);
      else navigate('/');
    } else {
      if (nick.trim().length < 2) {
        setError('Nick musí mať aspoň 2 znaky.');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, nick.trim(), fullName.trim());
      if (err) setError(err);
      else {
        setError(null);
        setMode('login');
        setEmail('');
        setPassword('');
        setNick('');
        setFullName('');
        setLoading(false);
        navigate('/');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg shadow-emerald-500/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Vzdelávacia Portál</h1>
          <p className="text-slate-400 mt-2">
            {mode === 'login' ? 'Prihlás sa svojím nickom' : 'Vytvor si účet a začni sa učiť'}
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <div className="flex gap-2 mb-6 p-1 bg-slate-900/50 rounded-xl">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Prihlásenie
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrácia
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Nick</label>
                  <input
                    type="text"
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                    required
                    placeholder="Tvoj nick"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Meno a priezvisko</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tvoje skutočné meno"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tvoj@email.sk"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Heslo</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {mode === 'login' ? 'Prihlásiť sa' : 'Vytvoriť účet'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          {mode === 'login' ? 'Nemáš účet? ' : 'Už máš účet? '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            {mode === 'login' ? 'Registruj sa' : 'Prihlás sa'}
          </button>
        </p>
      </div>
    </div>
  );
}
