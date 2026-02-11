import { useState, useEffect } from 'react';
import { useAgenda } from '@/contexts/AgendaContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Share2, Trash2, Users, Calendar, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface ShareInfo {
  id: string;
  usuario_id: string;
  permissao: string;
  usuario_nome?: string;
}

export default function AgendasPage() {
  const { agendas, sharedWithMe, createAgenda, deleteAgenda, refresh } = useAgenda();
  const { user } = useAuth();
  const [novaAgenda, setNovaAgenda] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareAgendaId, setShareAgendaId] = useState<string | null>(null);
  const [sharePermissao, setSharePermissao] = useState<'visualizar' | 'editar'>('visualizar');
  const [shares, setShares] = useState<Record<string, ShareInfo[]>>({});
  const [loadingShare, setLoadingShare] = useState(false);

  // Load shares for each agenda
  useEffect(() => {
    const loadShares = async () => {
      const allShares: Record<string, ShareInfo[]> = {};
      for (const agenda of agendas) {
        const { data } = await supabase
          .from('agenda_compartilhada')
          .select('*')
          .eq('agenda_id', agenda.id);
        allShares[agenda.id] = (data || []) as ShareInfo[];
      }
      setShares(allShares);
    };
    if (agendas.length > 0) loadShares();
  }, [agendas]);

  const handleCreate = async () => {
    if (!novaAgenda.trim()) return;
    await createAgenda(novaAgenda.trim());
    setNovaAgenda('');
    toast.success('Agenda criada!');
  };

  const handleShare = async () => {
    if (!shareEmail.trim() || !shareAgendaId) return;
    setLoadingShare(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('share-agenda', {
        body: { agenda_id: shareAgendaId, email: shareEmail.trim(), permissao: sharePermissao },
      });

      if (res.error) {
        toast.error(res.error.message || 'Erro ao compartilhar');
      } else if (res.data?.error) {
        toast.error(res.data.error);
      } else {
        toast.success(`Agenda compartilhada com ${shareEmail}!`);
        setShareEmail('');
        setShareAgendaId(null);
        await refresh();
      }
    } catch (e) {
      toast.error('Erro ao compartilhar');
    }
    setLoadingShare(false);
  };

  const handleRemoveShare = async (shareId: string) => {
    await supabase.from('agenda_compartilhada').delete().eq('id', shareId);
    toast.success('Compartilhamento removido');
    await refresh();
    // Reload shares
    const allShares: Record<string, ShareInfo[]> = {};
    for (const agenda of agendas) {
      const { data } = await supabase
        .from('agenda_compartilhada')
        .select('*')
        .eq('agenda_id', agenda.id);
      allShares[agenda.id] = (data || []) as ShareInfo[];
    }
    setShares(allShares);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <h2 className="font-display text-xl font-bold text-foreground">Minhas Agendas</h2>
      </div>

      {/* Create new agenda */}
      <div className="glass-card p-4 space-y-3">
        <Label className="text-xs text-muted-foreground">Nova Agenda</Label>
        <div className="flex gap-2">
          <Input
            value={novaAgenda}
            onChange={e => setNovaAgenda(e.target.value)}
            placeholder="Nome da agenda..."
            className="bg-secondary border-border/50"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* My agendas */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Suas Agendas</h3>
        {agendas.map(agenda => (
          <div key={agenda.id} className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{agenda.nome_agenda}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setShareAgendaId(shareAgendaId === agenda.id ? null : agenda.id)}
                  className="p-1.5 hover:bg-secondary rounded transition-colors"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4 text-accent" />
                </button>
                {agendas.length > 1 && (
                  <button
                    onClick={() => deleteAgenda(agenda.id)}
                    className="p-1.5 hover:bg-destructive/20 rounded transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Share form */}
            {shareAgendaId === agenda.id && (
              <div className="border-t border-border/50 pt-3 space-y-2 animate-fade-in">
                <Label className="text-xs text-muted-foreground">Compartilhar com</Label>
                <Input
                  value={shareEmail}
                  onChange={e => setShareEmail(e.target.value)}
                  placeholder="Email do usuário..."
                  className="bg-secondary border-border/50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setSharePermissao('visualizar')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      sharePermissao === 'visualizar'
                        ? 'bg-accent text-accent-foreground border-accent'
                        : 'border-border/50 text-muted-foreground'
                    }`}
                  >
                    Visualizar
                  </button>
                  <button
                    onClick={() => setSharePermissao('editar')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      sharePermissao === 'editar'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border/50 text-muted-foreground'
                    }`}
                  >
                    Editar
                  </button>
                </div>
                <button
                  onClick={handleShare}
                  disabled={loadingShare}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {loadingShare ? 'Compartilhando...' : 'Compartilhar'}
                </button>
              </div>
            )}

            {/* Existing shares */}
            {shares[agenda.id]?.length > 0 && (
              <div className="border-t border-border/50 pt-2 space-y-1">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> Compartilhada com:
                </p>
                {shares[agenda.id].map(s => (
                  <div key={s.id} className="flex items-center justify-between py-1">
                    <span className="text-xs text-foreground">{s.usuario_id.substring(0, 8)}... ({s.permissao})</span>
                    <button
                      onClick={() => handleRemoveShare(s.id)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Shared with me */}
      {sharedWithMe.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Compartilhadas Comigo</h3>
          {sharedWithMe.map(s => (
            <div key={s.id} className="glass-card p-4 flex items-center gap-3">
              <Users className="w-4 h-4 text-accent" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Agenda {s.agenda_id.substring(0, 8)}...</p>
                <p className="text-xs text-muted-foreground">Permissão: {s.permissao}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
