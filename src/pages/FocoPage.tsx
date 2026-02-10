import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompromissos } from '@/contexts/CompromissosContext';
import { getCategoriaColor, getPrioridadeColor } from '@/lib/compromisso-utils';
import { ChevronLeft, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function FocoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { compromissos, updateCompromisso } = useCompromissos();
  const compromisso = compromissos.find(c => c.id === id);

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Time remaining until the commitment
  const getTimeRemaining = useCallback(() => {
    if (!compromisso) return null;
    const target = new Date(`${compromisso.data}T${compromisso.hora}:00`);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}min`;
  }, [compromisso]);

  const [remaining, setRemaining] = useState(getTimeRemaining());

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getTimeRemaining()), 30000);
    setRemaining(getTimeRemaining());
    return () => clearInterval(interval);
  }, [getTimeRemaining]);

  const handleComplete = async () => {
    if (!id) return;
    await updateCompromisso(id, { status: 'cumprido' });
    navigate(-1);
  };

  if (!compromisso) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Compromisso não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in px-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-20 left-4 p-2 rounded-lg hover:bg-secondary transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Category indicator */}
      <div className={`w-4 h-4 rounded-full ${getCategoriaColor(compromisso.categoria)}`} />

      {/* Title */}
      <h1 className="font-display text-2xl font-bold text-foreground max-w-xs">
        {compromisso.titulo}
      </h1>

      {/* Time remaining */}
      {remaining && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Tempo restante</p>
          <p className="text-lg font-display font-semibold text-accent">{remaining}</p>
        </div>
      )}

      {/* Timer */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {running ? 'Em andamento' : 'Cronômetro'}
        </p>
        <p className={`text-5xl font-mono font-bold ${running ? 'text-primary animate-pulse-glow' : 'text-foreground'}`}>
          {formatTime(elapsed)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setElapsed(0)}
          className="p-3 rounded-full bg-secondary hover:bg-muted transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-muted-foreground" />
        </button>

        <button
          onClick={() => setRunning(!running)}
          className={`p-5 rounded-full transition-all ${
            running
              ? 'bg-destructive/20 hover:bg-destructive/30'
              : 'bg-primary glow-primary hover:opacity-90'
          }`}
        >
          {running ? (
            <Pause className="w-8 h-8 text-destructive" />
          ) : (
            <Play className="w-8 h-8 text-primary-foreground" />
          )}
        </button>

        <button
          onClick={handleComplete}
          className="p-3 rounded-full bg-green-400/20 hover:bg-green-400/30 transition-colors"
        >
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">
          {compromisso.data} · {compromisso.hora}
        </p>
        <p className={`text-xs ${getPrioridadeColor(compromisso.prioridade)}`}>
          Prioridade: {compromisso.prioridade}
        </p>
      </div>
    </div>
  );
}
