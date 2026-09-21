import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Subject } from '@/lib/supabase';
import { SubjectIcon } from '@/components/SubjectIcon';
import { LogOut, Shield, ExternalLink, GraduationCap, LogIn } from 'lucide-react';

export default function Dashboard() {
  const { profile, nick, signOut } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setSubjects((data as Subject[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/70 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Vzdelávací Portál</h1>
              <p className="text-xs text-slate-400">
                {nick ? `Vitaj, ${nick}` : 'Prehliadaš ako hosť'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile?.is_admin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all text-sm font-medium"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Panel</span>
              </Link>
            )}
            {nick ? (
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Odhlásiť</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Prihlásiť</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Predmety</h2>
          <p className="text-slate-400">Vyber si predmet a začni sa učiť</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 animate-pulse h-48" />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">Zatiaľ nie sú pridané žiadne predmety.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <a
                key={subject.id}
                href={subject.url}
                target="_self"
                className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all">
                    <SubjectIcon name={subject.icon} className="w-7 h-7 text-emerald-400" />
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {subject.name}
                </h3>
                {subject.description && (
                  <p className="text-slate-400 text-sm leading-relaxed">{subject.description}</p>
                )}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}