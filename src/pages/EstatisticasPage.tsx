import { useCompromissos } from '@/contexts/CompromissosContext';
import { getWeekRange, todayStr } from '@/lib/compromisso-utils';
import { BarChart3, TrendingUp, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function EstatisticasPage() {
  const { compromissos, getByDateRange } = useCompromissos();
  const [weekStart, weekEnd] = getWeekRange();
  const weekItems = getByDateRange(weekStart, weekEnd);

  const today = todayStr();
  const month = today.substring(0, 7);
  const monthItems = compromissos.filter(c => c.data.startsWith(month));

  const weekCumpridos = weekItems.filter(c => c.status === 'cumprido').length;
  const weekAtrasados = weekItems.filter(c => c.status === 'atrasado').length;
  const weekPendentes = weekItems.filter(c => c.status === 'pendente' || c.status === 'andamento').length;
  const weekTotal = weekItems.length;
  const weekTaxa = weekTotal > 0 ? Math.round((weekCumpridos / weekTotal) * 100) : 0;

  const monthCumpridos = monthItems.filter(c => c.status === 'cumprido').length;
  const monthTotal = monthItems.length;
  const monthTaxa = monthTotal > 0 ? Math.round((monthCumpridos / monthTotal) * 100) : 0;

  // Category breakdown
  const catCounts = compromissos.reduce((acc, c) => {
    acc[c.categoria] = (acc[c.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const catColors: Record<string, string> = {
    audiencia: 'bg-cat-audiencia',
    trabalho: 'bg-cat-trabalho',
    igreja: 'bg-cat-igreja',
    pessoal: 'bg-cat-pessoal',
    financeiro: 'bg-cat-financeiro',
    outros: 'bg-cat-outros',
  };

  const maxCat = Math.max(...Object.values(catCounts), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-display text-xl font-bold text-foreground">Estatísticas</h2>

      {/* Week stats */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Esta Semana</h3>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xl font-bold font-display text-foreground">{weekTotal}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-xl font-bold font-display text-green-400">{weekCumpridos}</p>
            <p className="text-[10px] text-muted-foreground">Cumpridos</p>
          </div>
          <div>
            <p className="text-xl font-bold font-display text-destructive">{weekAtrasados}</p>
            <p className="text-[10px] text-muted-foreground">Atrasados</p>
          </div>
          <div>
            <p className="text-xl font-bold font-display text-accent">{weekPendentes}</p>
            <p className="text-[10px] text-muted-foreground">Pendentes</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Taxa de execução</span>
            <span className="text-sm font-bold text-primary">{weekTaxa}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${weekTaxa}%` }}
            />
          </div>
        </div>
      </div>

      {/* Month stats */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Este Mês</h3>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xl font-bold font-display text-foreground">{monthTotal}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-xl font-bold font-display text-green-400">{monthCumpridos}</p>
            <p className="text-[10px] text-muted-foreground">Cumpridos</p>
          </div>
          <div>
            <p className="text-xl font-bold font-display text-primary">{monthTaxa}%</p>
            <p className="text-[10px] text-muted-foreground">Taxa</p>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Por Categoria</h3>
        {Object.entries(catCounts).length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum dado ainda</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(catCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground capitalize w-20 truncate">{cat}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${catColors[cat] || 'bg-muted'}`}
                      style={{ width: `${(count / maxCat) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-foreground w-6 text-right">{count}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="glass-card p-4 text-center">
        <p className="text-xs text-muted-foreground">Total de compromissos</p>
        <p className="text-3xl font-bold font-display text-gradient-primary">{compromissos.length}</p>
      </div>
    </div>
  );
}
