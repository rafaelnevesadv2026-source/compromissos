import { useCompromissos } from '@/contexts/CompromissosContext';
import { useAuth } from '@/contexts/AuthContext';
import { Download, LogOut, Info, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfiguracoesPage() {
  const { compromissos } = useCompromissos();
  const { user, signOut } = useAuth();

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

  const handleLogout = async () => {
    await signOut();
    toast.success('Sessão encerrada');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-display text-xl font-bold text-foreground">Configurações</h2>

      {/* User info */}
      <div className="glass-card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.user_metadata?.nome || 'Usuário'}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>

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
          onClick={handleLogout}
          className="w-full glass-card p-4 flex items-center gap-3 hover:border-destructive/30 transition-all text-left"
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-sm font-medium text-foreground">Sair da Conta</p>
            <p className="text-xs text-muted-foreground">Encerrar sua sessão</p>
          </div>
        </button>
      </div>

      <div className="glass-card p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Sobre</p>
          <p className="text-xs text-muted-foreground mt-1">
            Meus Compromissos v1.0 — Agenda Compromisso Cumprido.
            Seus dados são armazenados com segurança na nuvem.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {compromissos.length} compromisso(s) cadastrado(s)
          </p>
        </div>
      </div>
    </div>
  );
}
