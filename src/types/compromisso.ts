export type Categoria = 'audiencia' | 'trabalho' | 'igreja' | 'pessoal' | 'financeiro' | 'outros';
export type Prioridade = 'baixa' | 'media' | 'alta' | 'critica';
export type Status = 'pendente' | 'andamento' | 'atrasado' | 'cumprido';
export type Recorrencia = 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'anual';

export interface Compromisso {
  id: string;
  titulo: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  observacao: string;
  categoria: Categoria;
  prioridade: Prioridade;
  status: Status;
  recorrencia: Recorrencia;
  alerta: string[]; // e.g. ['1d', '1h', '30m', '10m']
  anexos: string[]; // file paths in storage
  dataCriacao: string;
  agenda_id?: string;
  criado_por?: string;
}

export const CATEGORIAS: { value: Categoria; label: string; color: string }[] = [
  { value: 'audiencia', label: 'Audiência', color: 'bg-cat-audiencia' },
  { value: 'trabalho', label: 'Trabalho', color: 'bg-cat-trabalho' },
  { value: 'igreja', label: 'Igreja', color: 'bg-cat-igreja' },
  { value: 'pessoal', label: 'Pessoal', color: 'bg-cat-pessoal' },
  { value: 'financeiro', label: 'Financeiro', color: 'bg-cat-financeiro' },
  { value: 'outros', label: 'Outros', color: 'bg-cat-outros' },
];

export const PRIORIDADES: { value: Prioridade; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'andamento', label: 'Em andamento' },
  { value: 'atrasado', label: 'Atrasado' },
  { value: 'cumprido', label: 'Cumprido' },
];

export const ALERTAS = [
  { value: '1d', label: '1 dia antes' },
  { value: '1h', label: '1 hora antes' },
  { value: '30m', label: '30 minutos antes' },
  { value: '10m', label: '10 minutos antes' },
];
