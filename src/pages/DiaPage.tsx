import { useParams, Link } from 'react-router-dom';
import { useCompromissos } from '@/contexts/CompromissosContext';
import { sortByTime, getCategoriaColor, getStatusColor, getStatusBgColor, formatDateFull, getPrioridadeColor } from '@/lib/compromisso-utils';
import { ChevronLeft, Plus, CheckCircle2, Circle, Clock, Trash2, Focus } from 'lucide-react';
import { Status } from '@/types/compromisso';

export default function DiaPage() {
  const { data } = useParams<{ data: string }>();
  const { getByDate, updateCompromisso, deleteCompromisso } = useCompromissos();
  const items = sortByTime(getByDate(data || ''));

  const toggleStatus = (id: string, current: Status) => {
    const next: Status = current === 'cumprido' ? 'pendente' : 'cumprido';
    updateCompromisso(id, { status: next });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/calendario" className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-foreground capitalize">
            {data ? formatDateFull(data) : 'Dia'}
          </h2>
          <p className="text-xs text-muted-foreground">{items.length} compromisso(s)</p>
        </div>
        <Link
          to={`/novo?data=${data}`}
          className="p-2 bg-primary rounded-full text-primary-foreground"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      {/* Timeline */}
      {items.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum compromisso neste dia</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {items.map((c, i) => (
              <div
                key={c.id}
                className="flex gap-3 relative animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Time */}
                <div className="w-12 shrink-0 text-right pt-3">
                  <span className="text-xs font-mono text-muted-foreground">{c.hora}</span>
                </div>

                {/* Dot */}
                <div className="relative z-10 mt-3">
                  <div className={`w-3 h-3 rounded-full border-2 border-background ${getCategoriaColor(c.categoria)}`} />
                </div>

                {/* Card */}
                <div className={`flex-1 glass-card p-3 space-y-2 ${c.status === 'cumprido' ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${c.status === 'cumprido' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {c.titulo}
                      </p>
                      {c.observacao && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.observacao}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => toggleStatus(c.id, c.status)}
                        className="p-1 hover:bg-secondary rounded transition-colors"
                      >
                        {c.status === 'cumprido' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteCompromisso(c.id)}
                        className="p-1 hover:bg-destructive/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <Link
                        to={`/foco/${c.id}`}
                        className="p-1 hover:bg-primary/20 rounded transition-colors"
                      >
                        <Focus className="w-4 h-4 text-primary" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusBgColor(c.status)} ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                    <span className={`text-[10px] ${getPrioridadeColor(c.prioridade)}`}>
                      ● {c.prioridade}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {c.categoria}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
