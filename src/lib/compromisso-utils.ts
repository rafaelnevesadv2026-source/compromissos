import { Compromisso } from '@/types/compromisso';

export function getCategoriaColor(cat: string): string {
  const map: Record<string, string> = {
    audiencia: 'bg-cat-audiencia',
    trabalho: 'bg-cat-trabalho',
    igreja: 'bg-cat-igreja',
    pessoal: 'bg-cat-pessoal',
    financeiro: 'bg-cat-financeiro',
    outros: 'bg-cat-outros',
  };
  return map[cat] || 'bg-muted';
}

export function getCategoriaTextColor(cat: string): string {
  const map: Record<string, string> = {
    audiencia: 'text-cat-audiencia',
    trabalho: 'text-cat-trabalho',
    igreja: 'text-cat-igreja',
    pessoal: 'text-cat-pessoal',
    financeiro: 'text-cat-financeiro',
    outros: 'text-cat-outros',
  };
  return map[cat] || 'text-muted-foreground';
}

export function getPrioridadeColor(p: string): string {
  const map: Record<string, string> = {
    baixa: 'text-green-400',
    media: 'text-primary',
    alta: 'text-orange-400',
    critica: 'text-destructive',
  };
  return map[p] || 'text-muted-foreground';
}

export function getStatusColor(s: string): string {
  const map: Record<string, string> = {
    pendente: 'text-muted-foreground',
    andamento: 'text-accent',
    atrasado: 'text-destructive',
    cumprido: 'text-green-400',
  };
  return map[s] || 'text-muted-foreground';
}

export function getStatusBgColor(s: string): string {
  const map: Record<string, string> = {
    pendente: 'bg-muted-foreground/20',
    andamento: 'bg-accent/20',
    atrasado: 'bg-destructive/20',
    cumprido: 'bg-green-400/20',
  };
  return map[s] || 'bg-muted';
}

export function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export function formatDateFull(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekRange(): [string, string] {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]];
}

export function sortByTime(items: Compromisso[]): Compromisso[] {
  return [...items].sort((a, b) => a.hora.localeCompare(b.hora));
}
