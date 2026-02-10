import { useCompromissos } from '@/contexts/CompromissosContext';
import { Download, Upload, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfiguracoesPage() {
  const { compromissos } = useCompromissos();

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(compromissos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meus-compromissos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exportado!');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data)) {
            localStorage.setItem('meus-compromissos-data', JSON.stringify(data));
            toast.success('Dados restaurados! Recarregue a página.');
            setTimeout(() => window.location.reload(), 1000);
          }
        } catch {
          toast.error('Arquivo inválido');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClear = () => {
    if (confirm('Tem certeza? Todos os dados serão apagados.')) {
      localStorage.removeItem('meus-compromissos-data');
      toast.success('Dados apagados!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-display text-xl font-bold text-foreground">Configurações</h2>

      <div className="space-y-3">
        <button
          onClick={handleExport}
          className="w-full glass-card p-4 flex items-center gap-3 hover:border-primary/30 transition-all text-left"
        >
          <Download className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Exportar Backup</p>
            <p className="text-xs text-muted-foreground">Baixar todos os compromissos em JSON</p>
          </div>
        </button>

        <button
          onClick={handleImport}
          className="w-full glass-card p-4 flex items-center gap-3 hover:border-accent/30 transition-all text-left"
        >
          <Upload className="w-5 h-5 text-accent" />
          <div>
            <p className="text-sm font-medium text-foreground">Restaurar Backup</p>
            <p className="text-xs text-muted-foreground">Importar arquivo JSON de backup</p>
          </div>
        </button>

        <button
          onClick={handleClear}
          className="w-full glass-card p-4 flex items-center gap-3 hover:border-destructive/30 transition-all text-left"
        >
          <Trash2 className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-sm font-medium text-foreground">Limpar Dados</p>
            <p className="text-xs text-muted-foreground">Apagar todos os compromissos</p>
          </div>
        </button>
      </div>

      <div className="glass-card p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Sobre</p>
          <p className="text-xs text-muted-foreground mt-1">
            Meus Compromissos v1.0 — Agenda Compromisso Cumprido.
            Seus dados são armazenados localmente no seu navegador.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {compromissos.length} compromisso(s) cadastrado(s)
          </p>
        </div>
      </div>
    </div>
  );
}
