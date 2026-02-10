import { useCompromissos } from '@/contexts/CompromissosContext';
import { todayStr, getWeekRange, sortByTime, getCategoriaColor, getStatusColor, getStatusBgColor, formatDate } from '@/lib/compromisso-utils';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, CalendarDays } from 'lucide-react';

export default function Dashboard() {
  const { compromissos, getByDate, getByDateRange } = useCompromissos();
  const today = todayStr();
  const todayItems = sortByTime(getByDate(today));
  const [weekStart, weekEnd] = getWeekRange();
  const weekItems = getByDateRange(weekStart, weekEnd);

  const cumpridos = todayItems.filter(c => c.status === 'cumprido');
  const atrasados = todayItems.filter(c => c.status === 'atrasado');
  const pendentes = todayItems.filter(c => c.status === 'pendente' || c.status === 'andamento');
  const weekCumpridos = weekItems.filter(c => c.status === 'cumprido');
  const weekPendentes = weekItems.filter(c => c.status !== 'cumprido');

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">{greeting}! 👋</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Hoje</span>
          </div>
          <p className="text-2xl font-bold font-display text-foreground">{todayItems.length}</p>
          <p className="text-[10px] text-muted-foreground">compromissos</p>
        </div>
        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-xs text-muted-foreground">Cumpridos</span>
          </div>
          <p className="text-2xl font-bold font-display text-green-400">{cumpridos.length}</p>
          <p className="text-[10px] text-muted-foreground">hoje</p>
        </div>
        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Atrasados</span>
          </div>
          <p className="text-2xl font-bold font-display text-destructive">{atrasados.length}</p>
          <p className="text-[10px] text-muted-foreground">atenção</p>
        </div>
        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Semana</span>
          </div>
          <p className="text-2xl font-bold font-display text-accent">{weekItems.length}</p>
          <p className="text-[10px] text-muted-foreground">{weekCumpridos.length} cumpridos</p>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['audiencia', 'trabalho', 'igreja', 'pessoal', 'financeiro'].map(cat => (
          <Link
            key={cat}
            to={`/historico?categoria=${cat}`}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
              border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground capitalize`}
          >
            {cat === 'audiencia' ? 'Audiência' : cat}
          </Link>
        ))}
      </div>

      {/* Today's timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-semibold text-foreground">Hoje</h3>
          <Link to={`/dia/${today}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {todayItems.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum compromisso hoje</p>
            <Link to="/novo" className="text-xs text-primary hover:underline mt-1 inline-block">
              Adicionar compromisso
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {todayItems.slice(0, 5).map((c, i) => (
              <Link
                key={c.id}
                to={`/dia/${c.data}`}
                className="glass-card p-3 flex items-center gap-3 hover:border-primary/30 transition-all animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-1 h-10 rounded-full ${getCategoriaColor(c.categoria)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.titulo}</p>
                  <p className="text-xs text-muted-foreground">{c.hora} · {c.categoria}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusBgColor(c.status)} ${getStatusColor(c.status)}`}>
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming */}
      {pendentes.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">Próximos</h3>
          <div className="space-y-2">
            {compromissos
              .filter(c => c.data > today && c.status !== 'cumprido')
              .sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora))
              .slice(0, 4)
              .map((c, i) => (
                <Link
                  key={c.id}
                  to={`/dia/${c.data}`}
                  className="glass-card p-3 flex items-center gap-3 hover:border-primary/30 transition-all"
                >
                  <div className={`w-1 h-10 rounded-full ${getCategoriaColor(c.categoria)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.titulo}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(c.data)} · {c.hora}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
