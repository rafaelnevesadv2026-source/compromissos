import { useState } from 'react';
import { useCompromissos } from '@/contexts/CompromissosContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoriaColor } from '@/lib/compromisso-utils';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function CalendarioPage() {
  const [current, setCurrent] = useState(new Date());
  const { compromissos } = useCompromissos();
  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prev} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="font-display text-xl font-bold text-foreground">
          {MONTHS[month]} {year}
        </h2>
        <button onClick={next} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateStr = getDateStr(day);
          const isToday = dateStr === todayStr;
          const dayComps = compromissos.filter(c => c.data === dateStr);
          const cats = [...new Set(dayComps.map(c => c.categoria))];

          return (
            <Link
              key={i}
              to={`/dia/${dateStr}`}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative
                ${isToday ? 'bg-primary text-primary-foreground font-bold glow-primary' : 'hover:bg-secondary text-foreground'}
                ${dayComps.length > 0 && !isToday ? 'bg-secondary/50' : ''}`}
            >
              {day}
              {cats.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {cats.slice(0, 3).map((cat, j) => (
                    <div key={j} className={`w-1 h-1 rounded-full ${getCategoriaColor(cat)}`} />
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Today's summary */}
      <div className="glass-card p-4">
        <p className="text-xs text-muted-foreground mb-2">Resumo do mês</p>
        <div className="flex gap-4 text-center">
          <div className="flex-1">
            <p className="text-xl font-bold font-display text-foreground">
              {compromissos.filter(c => c.data.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}
            </p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold font-display text-green-400">
              {compromissos.filter(c => c.data.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`) && c.status === 'cumprido').length}
            </p>
            <p className="text-[10px] text-muted-foreground">Cumpridos</p>
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold font-display text-destructive">
              {compromissos.filter(c => c.data.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`) && c.status === 'atrasado').length}
            </p>
            <p className="text-[10px] text-muted-foreground">Atrasados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
