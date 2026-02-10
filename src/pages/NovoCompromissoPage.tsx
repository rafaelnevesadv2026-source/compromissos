import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCompromissos } from '@/contexts/CompromissosContext';
import { CATEGORIAS, PRIORIDADES, STATUS_OPTIONS, ALERTAS, Categoria, Prioridade, Status, Recorrencia } from '@/types/compromisso';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function NovoCompromissoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addCompromisso } = useCompromissos();

  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState(searchParams.get('data') || new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('08:00');
  const [observacao, setObservacao] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('pessoal');
  const [prioridade, setPrioridade] = useState<Prioridade>('media');
  const [status, setStatus] = useState<Status>('pendente');
  const [recorrencia, setRecorrencia] = useState<Recorrencia>('nenhuma');
  const [alertas, setAlertas] = useState<string[]>([]);

  const toggleAlerta = (v: string) => {
    setAlertas(prev => prev.includes(v) ? prev.filter(a => a !== v) : [...prev, v]);
  };

  const handleSave = () => {
    if (!titulo.trim()) {
      toast.error('Informe o título do compromisso');
      return;
    }
    addCompromisso({ titulo: titulo.trim(), data, hora, observacao, categoria, prioridade, status, recorrencia, alerta: alertas });
    toast.success('Compromisso criado!');
    navigate(`/dia/${data}`);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <h2 className="font-display text-xl font-bold text-foreground">Novo Compromisso</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Título *</Label>
          <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Audiência criminal" className="bg-secondary border-border/50" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Data</Label>
            <Input type="date" value={data} onChange={e => setData(e.target.value)} className="bg-secondary border-border/50" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Hora</Label>
            <Input type="time" value={hora} onChange={e => setHora(e.target.value)} className="bg-secondary border-border/50" />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Observação</Label>
          <Textarea value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Detalhes..." className="bg-secondary border-border/50 min-h-[80px]" />
        </div>

        {/* Categoria */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Categoria</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map(c => (
              <button
                key={c.value}
                onClick={() => setCategoria(c.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                  ${categoria === c.value
                    ? `${c.color} text-foreground border-transparent`
                    : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prioridade */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Prioridade</Label>
          <div className="flex gap-2">
            {PRIORIDADES.map(p => (
              <button
                key={p.value}
                onClick={() => setPrioridade(p.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border
                  ${prioridade === p.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Status</Label>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-medium transition-all border
                  ${status === s.value
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'border-border/50 text-muted-foreground hover:border-accent/50'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alertas */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Alertas</Label>
          <div className="flex flex-wrap gap-2">
            {ALERTAS.map(a => (
              <button
                key={a.value}
                onClick={() => toggleAlerta(a.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                  ${alertas.includes(a.value)
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'border-border/50 text-muted-foreground hover:border-accent/50'}`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recorrência */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Repetir</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'nenhuma' as Recorrencia, label: 'Não repetir' },
              { value: 'diaria' as Recorrencia, label: 'Diário' },
              { value: 'semanal' as Recorrencia, label: 'Semanal' },
              { value: 'mensal' as Recorrencia, label: 'Mensal' },
              { value: 'anual' as Recorrencia, label: 'Anual' },
            ].map(r => (
              <button
                key={r.value}
                onClick={() => setRecorrencia(r.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                  ${recorrencia === r.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 glow-primary hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          Salvar Compromisso
        </button>
      </div>
    </div>
  );
}
