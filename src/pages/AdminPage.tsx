import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Subject, type Message, type Nick } from '@/lib/supabase';
import { SubjectIcon } from '@/components/SubjectIcon';
import {
  ArrowLeft, Shield, Plus, Trash2, Edit2, X, Mail, Check, Users,
  Settings as SettingsIcon, Loader2, Save, Webhook, CheckCircle2, Ban,
} from 'lucide-react';

type Tab = 'subjects' | 'messages' | 'admins' | 'settings';

export default function AdminPage() {
  const { nick, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('subjects');
  const [noAdminClaimed, setNoAdminClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [checkedAdmin, setCheckedAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && nick && !profile?.is_admin && !checkedAdmin) {
      supabase.rpc('claim_first_admin_nick', { p_nick: nick }).then(({ data }) => {
        if (data === true) {
          refreshProfile();
          setNoAdminClaimed(false);
        } else {
          setNoAdminClaimed(true);
        }
        setCheckedAdmin(true);
      });
    }
  }, [authLoading, nick, profile, refreshProfile, checkedAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!nick) {
    navigate('/login');
    return null;
  }

  if (!profile?.is_admin && noAdminClaimed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
            <Shield className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Žiadny admin neexistuje</h2>
          <p className="text-slate-400 mb-8">
            Tento projekt ešte nemá admina. Môžeš prevziať rolu admina.
          </p>
          <button
            onClick={async () => {
              setClaiming(true);
              const { data } = await supabase.rpc('claim_first_admin_nick', { p_nick: nick });
              if (data === true) {
                await refreshProfile();
                setNoAdminClaimed(false);
              }
              setClaiming(false);
            }}
            disabled={claiming}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {claiming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
            Prevziať admina
          </button>
          <div className="mt-6">
            <Link to="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 justify-center">
              <ArrowLeft className="w-4 h-4" /> Späť na portál
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Ban className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Prístup zamietnutý</h2>
          <p className="text-slate-400 mb-6">Nemáš admin práva.</p>
          <Link to="/" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Späť na portál
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/70 border-b border-slate-700/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Portál</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl mb-8 overflow-x-auto">
          {([
            ['subjects', 'Predmety', Plus],
            ['messages', 'Správy', Mail],
            ['admins', 'Admins', Users],
            ['settings', 'Nastavenia', SettingsIcon],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === key
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'subjects' && <SubjectsTab adminNick={nick!} />}
        {tab === 'messages' && <MessagesTab adminNick={nick!} />}
        {tab === 'admins' && <AdminsTab adminNick={nick!} />}
        {tab === 'settings' && <SettingsTab adminNick={nick!} />}
      </main>
    </div>
  );
}

function SubjectsTab({ adminNick }: { adminNick: string }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchSubjects = async () => {
    const { data } = await supabase.from('subjects').select('*').order('sort_order', { ascending: true });
    setSubjects((data as Subject[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Naozaj chceš zmazať tento predmet?')) return;
    await supabase.rpc('admin_delete_subject_nick', { p_nick: adminNick, p_id: id });
    fetchSubjects();
  };

  const toggleActive = async (s: Subject) => {
    await supabase.rpc('admin_toggle_subject_active_nick', { p_nick: adminNick, p_id: s.id });
    fetchSubjects();
  };

  if (loading) return <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Predmety ({subjects.length})</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Pridať predmet
        </button>
      </div>

      {showForm && (
        <SubjectForm
          adminNick={adminNick}
          subject={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchSubjects(); }}
        />
      )}

      <div className="space-y-3">
        {subjects.map((s) => (
          <div key={s.id} className="flex items-center gap-4 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <SubjectIcon name={s.icon} className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white">{s.name}</h3>
              <p className="text-sm text-slate-400 truncate">{s.url}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-600/20 text-slate-500 border border-slate-600/30'}`}>
              {s.is_active ? 'Aktívny' : 'Skrytý'}
            </span>
            <div className="flex gap-2">
              <button onClick={() => toggleActive(s)} className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all" title={s.is_active ? 'Skryť' : 'Zobraziť'}>
                {s.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              </button>
              <button onClick={() => { setEditing(s); setShowForm(true); }} className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-amber-400 hover:bg-slate-700 transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubjectForm({ adminNick, subject, onClose, onSaved }: {
  adminNick: string;
  subject: Subject | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(subject?.name ?? '');
  const [slug, setSlug] = useState(subject?.slug ?? '');
  const [description, setDescription] = useState(subject?.description ?? '');
  const [url, setUrl] = useState(subject?.url ?? '');
  const [icon, setIcon] = useState(subject?.icon ?? 'BookOpen');
  const [sortOrder, setSortOrder] = useState(subject?.sort_order ?? 0);
  const [isActive, setIsActive] = useState(subject?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (subject) {
      const { error: err } = await supabase.rpc('admin_update_subject_nick', {
        p_nick: adminNick, p_id: subject.id,
        p_name: name, p_slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        p_desc: description, p_url: url, p_icon: icon, p_sort: sortOrder, p_active: isActive,
      });
      if (err) setError(err.message);
      else onSaved();
    } else {
      const { error: err } = await supabase.rpc('admin_add_subject_nick', {
        p_nick: adminNick, p_name: name, p_slug: slug, p_desc: description,
        p_url: url, p_icon: icon, p_sort: sortOrder,
      });
      if (err) setError(err.message);
      else onSaved();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">{subject ? 'Upraviť predmet' : 'Nový predmet'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Názov *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Slug (URL identifikátor)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-ak prázdne"
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Popis</label>
            <input value={description ?? ''} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">URL *</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} required type="url" placeholder="https://..."
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Ikona</label>
              <select value={icon} onChange={(e) => setIcon(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                {['BookOpen', 'Leaf', 'ShoppingBag', 'Calculator', 'Globe', 'FlaskConical', 'Palette', 'Music', 'Code', 'Brain', 'Clock', 'Map', 'FileText', 'Languages', 'History', 'Landmark', 'Microscope', 'Ruler', 'PenTool'].map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Poradie</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>
          </div>
          {subject && (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500" />
              Aktívny (viditeľný na portáli)
            </label>
          )}

          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-sm text-red-400">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {subject ? 'Uložiť' : 'Vytvoriť'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all">
              Zrušiť
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MessagesTab({ adminNick }: { adminNick: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const { data } = await supabase.rpc('admin_get_messages_nick', { p_nick: adminNick });
    setMessages((data as Message[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id: string, isRead: boolean) => {
    await supabase.rpc('admin_mark_message_read_nick', { p_nick: adminNick, p_id: id, p_read: !isRead });
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Naozaj zmazať túto správu?')) return;
    await supabase.rpc('admin_delete_message_nick', { p_nick: adminNick, p_id: id });
    fetchMessages();
  };

  if (loading) return <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto" />;

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-2">Správy ({messages.length})</h2>
      <p className="text-slate-400 text-sm mb-6">{unreadCount} neprečítaných</p>

      {messages.length === 0 ? (
        <p className="text-slate-400 text-center py-12">Zatiaľ žiadne správy.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`bg-slate-800/50 rounded-xl border p-4 transition-all ${m.is_read ? 'border-slate-700/50' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{m.full_name}</span>
                    <span className="text-sm text-slate-500">@{m.nick}</span>
                    {m.suggested_price != null && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {m.suggested_price} €
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(m.created_at).toLocaleString('sk-SK')}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => markRead(m.id, m.is_read)} className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition-all" title={m.is_read ? 'Označiť ako neprečítané' : 'Označiť ako prečítané'}>
                    {m.is_read ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminsTab({ adminNick }: { adminNick: string }) {
  const { refreshProfile } = useAuth();
  const [profiles, setProfiles] = useState<Nick[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    const { data } = await supabase.rpc('admin_get_profiles_nick', { p_nick: adminNick });
    setProfiles((data as Nick[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const toggleAdmin = async (p: Nick) => {
    if (p.nick === adminNick && p.is_admin) {
      if (!confirm('Naozaj chceš zmazať svoje admin práva?')) return;
    }
    const { error } = await supabase.rpc('admin_set_admin_nick', {
      p_caller: adminNick, p_target: p.nick, p_val: !p.is_admin,
    });
    if (error) {
      alert('Chyba: ' + error.message);
    } else {
      fetchProfiles();
      if (p.nick === adminNick) refreshProfile();
    }
  };

  if (loading) return <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto" />;

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-2">Používatelia ({profiles.length})</h2>
      <p className="text-slate-400 text-sm mb-6">Klikni na shield pre pridanie/odobranie admin práv.</p>

      <div className="space-y-3">
        {profiles.map((p) => (
          <div key={p.nick} className="flex items-center gap-4 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold flex-shrink-0">
              {p.nick.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{p.nick}</span>
                {p.is_admin && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 truncate">
                {p.full_name ?? '—'} · {new Date(p.created_at).toLocaleDateString('sk-SK')}
              </p>
            </div>
            <button
              onClick={() => toggleAdmin(p)}
              className={`p-2.5 rounded-lg transition-all ${p.is_admin ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20' : 'bg-slate-700/50 text-slate-500 border border-slate-600/30 hover:text-amber-400 hover:border-amber-500/20'}`}
              title={p.is_admin ? 'Odobrat admin' : 'Pridať admin'}
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ adminNick }: { adminNick: string }) {
  const { refreshProfile } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [fullName, setFullName] = useState('');
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savedWebhook, setSavedWebhook] = useState(false);
  const [savedName, setSavedName] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: wh } = await supabase.rpc('admin_get_setting_nick', { p_nick: adminNick, p_key: 'discord_webhook_url' });
      setWebhookUrl((wh as string) ?? '');
      const { data: profile } = await supabase.from('nicks').select('full_name').eq('nick', adminNick).maybeSingle();
      setFullName((profile as { full_name: string | null })?.full_name ?? '');
      setLoading(false);
    })();
  }, [adminNick]);

  const handleSaveWebhook = async (e: FormEvent) => {
    e.preventDefault();
    setSavingWebhook(true);
    setSavedWebhook(false);
    await supabase.rpc('admin_set_setting_nick', {
      p_nick: adminNick, p_key: 'discord_webhook_url', p_value: webhookUrl || null,
    });
    setSavingWebhook(false);
    setSavedWebhook(true);
    setTimeout(() => setSavedWebhook(false), 3000);
  };

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    setSavedName(false);
    await supabase.rpc('admin_set_full_name_nick', { p_nick: adminNick, p_full_name: fullName });
    await refreshProfile();
    setSavingName(false);
    setSavedName(true);
    setTimeout(() => setSavedName(false), 3000);
  };

  if (loading) return <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto" />;

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Nastavenia</h2>

      <form onSubmit={handleSaveName} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 max-w-lg mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Admin meno</h3>
            <p className="text-sm text-slate-400">Tvoje celé meno — zobrazí sa na GitHube a v Discord notifikáciách.</p>
          </div>
        </div>

        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tvoje meno"
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        />

        {savedName && (
          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2.5 text-sm text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Uložené!
          </div>
        )}

        <button
          type="submit"
          disabled={savingName}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all disabled:opacity-50"
        >
          {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Uložiť meno
        </button>
      </form>

      <form onSubmit={handleSaveWebhook} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Webhook className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Discord Webhook URL</h3>
            <p className="text-sm text-slate-400">Sem zadaj Discord webhook URL — budú chodiť notifikácie o prihláseniach a správach.</p>
          </div>
        </div>

        <input
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        />

        {savedWebhook && (
          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2.5 text-sm text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Uložené!
          </div>
        )}

        <button
          type="submit"
          disabled={savingWebhook}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all disabled:opacity-50"
        >
          {savingWebhook ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Uložiť webhook
        </button>
      </form>
    </div>
  );
}
