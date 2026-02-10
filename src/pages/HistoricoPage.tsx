import { useState } from 'react';
import { useCompromissos } from '@/contexts/CompromissosContext';
import { CATEGORIAS } from '@/types/compromisso';
import { getCategoriaColor, getStatusBgColor, getStatusColor, formatDate } from '@/lib/compromisso-utils';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

export default function HistoricoPage() {
  const { compromissos } = useCompromissos();
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<string | null>(null);

  const filtered = compromissos
    .filter(c => {
      if (catFilter && c.categoria !== catFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return c.titulo.toLowerCase().includes(q) || c.observacao.toLowerCase().includes(q) || c.categoria.includes(q);
      }
      return true;
    })
    .sort((a, b) => b.data.localeCompare(a.data) || b.hora.localeCompare(a.hora));

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="font-display text-xl font-bold text-foreground">Histórico</h2>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nome, categoria..."
          className="pl-9 bg-secondary border-border/50"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setCatFilter(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
            ${!catFilter ? 'bg-primary text-primary-foreground border-primary' : 'border-border/50 text-muted-foreground'}`}
        >
          Todos
        </button>
        {CATEGORIAS.map(c => (
          <button
            key={c.value}
            onClick={() => setCatFilter(catFilter === c.value ? null : c.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${catFilter === c.value ? `${c.color} text-foreground border-transparent` : 'border-border/50 text-muted-foreground'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="text-xs text-muted-foreground">{filtered.length} resultado(s)</p>

      <div className="space-y-2">
        {filtered.map((c, i) => (
          <Link
            key={c.id}
            to={`/dia/${c.data}`}
            className="glass-card p-3 flex items-center gap-3 hover:border-primary/30 transition-all animate-slide-up"
            style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
          >
            <div className={`w-1 h-10 rounded-full ${getCategoriaColor(c.categoria)}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{c.titulo}</p>
              <p className="text-xs text-muted-foreground">{formatDate(c.data)} · {c.hora} · {c.categoria}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusBgColor(c.status)} ${getStatusColor(c.status)}`}>
              {c.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
