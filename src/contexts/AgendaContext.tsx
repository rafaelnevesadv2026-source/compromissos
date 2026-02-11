import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Agenda {
  id: string;
  nome_agenda: string;
  dono_id: string;
  created_at: string;
}

export interface AgendaCompartilhada {
  id: string;
  agenda_id: string;
  usuario_id: string;
  permissao: 'visualizar' | 'editar';
  created_at: string;
  // joined fields
  agenda_nome?: string;
  dono_nome?: string;
  usuario_email?: string;
}

interface AgendaContextType {
  agendas: Agenda[];
  sharedWithMe: AgendaCompartilhada[];
  activeAgendaId: string | null;
  loading: boolean;
  createAgenda: (nome: string) => Promise<Agenda | null>;
  deleteAgenda: (id: string) => Promise<void>;
  shareAgenda: (agendaId: string, email: string, permissao: 'visualizar' | 'editar') => Promise<boolean>;
  removeShare: (shareId: string) => Promise<void>;
  getSharesForAgenda: (agendaId: string) => Promise<AgendaCompartilhada[]>;
  setActiveAgendaId: (id: string | null) => void;
  allAccessibleAgendaIds: string[];
  refresh: () => Promise<void>;
}

const AgendaContext = createContext<AgendaContextType | null>(null);

export function AgendaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<AgendaCompartilhada[]>([]);
  const [activeAgendaId, setActiveAgendaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setAgendas([]);
      setSharedWithMe([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // Fetch my agendas
    const { data: myAgendas } = await supabase
      .from('agendas')
      .select('*')
      .eq('dono_id', user.id)
      .order('created_at', { ascending: true });

    // Fetch agendas shared with me
    const { data: shares } = await supabase
      .from('agenda_compartilhada')
      .select('*')
      .eq('usuario_id', user.id);

    const agendasList = (myAgendas || []) as Agenda[];
    setAgendas(agendasList);
    setSharedWithMe((shares || []) as AgendaCompartilhada[]);

    // Set default active agenda
    if (!activeAgendaId && agendasList.length > 0) {
      setActiveAgendaId(agendasList[0].id);
    }

    setLoading(false);
  }, [user, activeAgendaId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const allAccessibleAgendaIds = [
    ...agendas.map(a => a.id),
    ...sharedWithMe.map(s => s.agenda_id),
  ];

  const createAgenda = useCallback(async (nome: string): Promise<Agenda | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('agendas')
      .insert({ nome_agenda: nome, dono_id: user.id })
      .select()
      .single();
    if (error) {
      toast.error('Erro ao criar agenda');
      return null;
    }
    await refresh();
    return data as Agenda;
  }, [user, refresh]);

  const deleteAgenda = useCallback(async (id: string) => {
    const { error } = await supabase.from('agendas').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir agenda');
    } else {
      await refresh();
    }
  }, [refresh]);

  const shareAgenda = useCallback(async (agendaId: string, email: string, permissao: 'visualizar' | 'editar'): Promise<boolean> => {
    // Look up user by email in profiles + auth
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nome');

    // We need to find user by email - use a different approach
    // Since we can't query auth.users, we'll use an edge function or just try to share
    // For now, let's look up via the email in a simpler way
    // We'll need to create an edge function for this
    
    // Try to find user - for MVP we use the supabase admin API via edge function
    toast.error('Informe o ID do usuário para compartilhar (funcionalidade de busca por email em breve)');
    return false;
  }, []);

  const removeShare = useCallback(async (shareId: string) => {
    const { error } = await supabase.from('agenda_compartilhada').delete().eq('id', shareId);
    if (error) {
      toast.error('Erro ao remover compartilhamento');
    } else {
      await refresh();
    }
  }, [refresh]);

  const getSharesForAgenda = useCallback(async (agendaId: string): Promise<AgendaCompartilhada[]> => {
    const { data } = await supabase
      .from('agenda_compartilhada')
      .select('*')
      .eq('agenda_id', agendaId);
    return (data || []) as AgendaCompartilhada[];
  }, []);

  return (
    <AgendaContext.Provider value={{
      agendas, sharedWithMe, activeAgendaId, loading,
      createAgenda, deleteAgenda, shareAgenda, removeShare,
      getSharesForAgenda, setActiveAgendaId, allAccessibleAgendaIds, refresh,
    }}>
      {children}
    </AgendaContext.Provider>
  );
}

export function useAgenda() {
  const ctx = useContext(AgendaContext);
  if (!ctx) throw new Error('useAgenda must be used inside AgendaProvider');
  return ctx;
}
