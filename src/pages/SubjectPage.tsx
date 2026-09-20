import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type Subject } from '@/lib/supabase';
import { SubjectIcon } from '@/components/SubjectIcon';
import { ArrowLeft, ExternalLink, Loader2, BookOpen, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SubjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      const s = data as Subject | null;
      if (!s) {
        setError('Predmet nebol nájdený.');
        setLoading(false);
        return;
      }
      setSubject(s);

      const repoInfo = parseGitHubUrl(s.url);
      if (repoInfo) {
        try {
          const resp = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/readme`);
          if (resp.ok) {
            const json = await resp.json();
            const decoded = atob(json.content.replace(/\n/g, ''));
            setContent(decoded);
          } else {
            setContent(`# ${s.name}\n\nNepodarilo sa načítať obsah z GitHubu. Otvor odkaz priamo.`);
          }
        } catch {
          setContent(`# ${s.name}\n\nNepodarilo sa načítať obsah z GitHubu. Otvor odkaz priamo.`);
        }
      } else {
        setContent(`# ${s.name}\n\n${s.description ?? ''}\n\nOtvor externý odkaz pre viac informácií.`);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-slate-400 text-lg mb-4">{error ?? 'Predmet neexistuje.'}</p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Portál</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
                <SubjectIcon name={subject.icon} className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-lg font-bold text-white">{subject.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/contact"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Kontakt</span>
            </Link>
            <a
              href={subject.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Otvoriť na GitHube</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {subject.description && (
          <p className="text-slate-400 mb-6 text-lg">{subject.description}</p>
        )}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 sm:p-8">
          <div className="prose-content">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4 mt-6">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold text-white mb-3 mt-6">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h3>,
                p: ({ children }) => <p className="text-slate-300 leading-relaxed mb-4">{children}</p>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline">{children}</a>,
                ul: ({ children }) => <ul className="list-disc list-inside text-slate-300 mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside text-slate-300 mb-4 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  if (isBlock) {
                    return <pre className="bg-slate-900/70 rounded-lg p-4 overflow-x-auto mb-4 border border-slate-700/50"><code className="text-emerald-300 text-sm">{children}</code></pre>;
                  }
                  return <code className="bg-slate-900/70 text-emerald-300 px-1.5 py-0.5 rounded text-sm">{children}</code>;
                },
                pre: ({ children }) => <>{children}</>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-emerald-500/30 pl-4 text-slate-400 italic mb-4">{children}</blockquote>,
                img: ({ src, alt }) => <img src={src} alt={alt} className="rounded-lg max-w-full mb-4" />,
                hr: () => <hr className="border-slate-700/50 my-6" />,
                table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="w-full text-sm text-slate-300 border border-slate-700/50 rounded-lg">{children}</table></div>,
                th: ({ children }) => <th className="border border-slate-700/50 px-3 py-2 text-left font-semibold text-white bg-slate-800/50">{children}</th>,
                td: ({ children }) => <td className="border border-slate-700/50 px-3 py-2">{children}</td>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </main>
    </div>
  );
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    if (u.hostname !== 'github.com') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  } catch {
    return null;
  }
}
