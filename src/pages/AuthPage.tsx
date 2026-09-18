import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Loader2, User, UserPlus, LogIn } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [nick, setNick] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(nick);
    if (err) setError(err);
    else navigate('/');
    setLoading(false);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signUp(nick);
    if (err) setError(err);
    else navigate('/');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg shadow-emerald-500/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Vzdelávací Portál</h1>
          <p className="text-slate-400 mt-2 text-sm">Zadaj svoj nick a poď dovnútra</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nick</label>
              <input
                type="text"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                required
                minLength={2}
                placeholder="Tvoj nick"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !nick.trim()}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              Prihlásiť sa
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-800 px-3 text-slate-500">alebo</span>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading || !nick.trim()}
              className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Registrovať nový nick
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6 flex items-center justify-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          Stačí zadať nick — žiadny email ani heslo
        </p>
      </div>
    </div>
  );
}
