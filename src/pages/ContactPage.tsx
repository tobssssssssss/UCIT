import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Subject } from '@/lib/supabase';
import { ArrowLeft, Loader2, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { nick, profile } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState(nick ?? '');
  const [subjectId, setSubjectId] = useState('');
  const [content, setContent] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from('subjects')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => setSubjects((data as Subject[]) ?? []));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (name.trim().length < 2) {
      setError('Nick musí mať aspoň 2 znaky.');
      setLoading(false);
      return;
    }
    if (content.trim().length < 5) {
      setError('Správa musí mať aspoň 5 znakov.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('messages').insert({
      nick: name.trim(),
      full_name: profile?.full_name ?? name.trim(),
      subject_id: subjectId || null,
      content: content.trim(),
      suggested_price: suggestedPrice ? parseFloat(suggestedPrice) : null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    try {
      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-discord`;
      await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'message',
          data: {
            nick: name.trim(),
            full_name: profile?.full_name ?? name.trim(),
            content: content.trim(),
            suggested_price: suggestedPrice || null,
            subject: subjects.find((s) => s.id === subjectId)?.name ?? null,
          },
        }),
      });
    } catch {
      // best-effort
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Správa odoslaná!</h2>
          <p className="text-slate-400 mb-8">Ďakujeme za tvoju správu. Admin ju čo najskôr zistí.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
          >
            Späť na portál
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/70 border-b border-slate-700/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Späť
          </Link>
          <h1 className="text-lg font-bold text-white">Kontakt</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Napíš nám</h2>
          <p className="text-slate-400 mb-6">
            Vyplň formulár — môžeš navrhnúť aj cenu. Nepotrebuješ sa prihlásiť.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nick *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Tvoj nick"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Predmet (voliteľné)</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              >
                <option value="">— Žiadny konkrétny predmet —</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Správa *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                placeholder="Napíš tvoju správu..."
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Navrhovaná cena (voliteľné)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={suggestedPrice}
                onChange={(e) => setSuggestedPrice(e.target.value)}
                placeholder="0.00"
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Odoslať správu
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
