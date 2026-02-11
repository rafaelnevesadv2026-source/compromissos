import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Clock, Plus, BarChart3, History, Settings, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useCompromissos } from '@/contexts/CompromissosContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Início' },
  { path: '/calendario', icon: Calendar, label: 'Calendário' },
  { path: '/novo', icon: Plus, label: 'Novo', highlight: true },
  { path: '/historico', icon: History, label: 'Histórico' },
  { path: '/estatisticas', icon: BarChart3, label: 'Stats' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { search } = useCompromissos();
  const navigate = useNavigate();
  const results = searchQuery.length > 1 ? search(searchQuery) : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold text-gradient-primary leading-tight">
              MEUS COMPROMISSOS
            </h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
              Agenda Compromisso Cumprido
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <Link
              to="/agendas"
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Users className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link
              to="/configuracoes"
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="max-w-2xl mx-auto mt-3 relative animate-fade-in">
            <Input
              placeholder="Buscar compromissos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-secondary border-border/50"
              autoFocus
            />
            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                {results.slice(0, 8).map(r => (
                  <button
                    key={r.id}
                    className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border/30 last:border-0"
                    onClick={() => {
                      navigate(`/dia/${r.data}`);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <p className="text-sm font-medium text-foreground">{r.titulo}</p>
                    <p className="text-xs text-muted-foreground">{r.data} · {r.hora} · {r.categoria}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50">
        <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                  item.highlight
                    ? 'bg-primary text-primary-foreground -mt-5 p-3 rounded-full shadow-lg glow-primary'
                    : isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={item.highlight ? 'w-6 h-6' : 'w-5 h-5'} />
                {!item.highlight && (
                  <span className="text-[10px] font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
