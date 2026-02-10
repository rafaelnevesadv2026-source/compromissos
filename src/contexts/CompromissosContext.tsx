import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Compromisso, Categoria, Status } from '@/types/compromisso';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CompromissosContextType {
  compromissos: Compromisso[];
  loading: boolean;
  addCompromisso: (c: Omit<Compromisso, 'id' | 'dataCriacao'>) => Promise<void>;
  updateCompromisso: (id: string, c: Partial<Compromisso>) => Promise<void>;
  deleteCompromisso: (id: string) => Promise<void>;
  getByDate: (date: string) => Compromisso[];
  getByDateRange: (start: string, end: string) => Compromisso[];
  getByCategoria: (cat: Categoria) => Compromisso[];
  getByStatus: (status: Status) => Compromisso[];
  search: (query: string) => Compromisso[];
  refresh: () => Promise<void>;
}

const CompromissosContext = createContext<CompromissosContextType | null>(null);

function mapRow(row: any): Compromisso {
  return {
    id: row.id,
    titulo: row.titulo,
    data: row.data,
    hora: row.hora?.substring(0, 5) || '00:00',
    observacao: row.observacao || '',
    categoria: row.categoria as Categoria,
    prioridade: row.prioridade,
    status: row.status as Status,
    recorrencia: row.recorrencia || 'nenhuma',
    alerta: row.alerta || [],
    anexos: row.anexos || [],
    dataCriacao: row.created_at,
  };
}

export function CompromissosProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setCompromissos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('compromissos')
      .select('*')
      .order('data', { ascending: true })
      .order('hora', { ascending: true });

    if (error) {
      console.error('Error fetching compromissos:', error);
      toast.error('Erro ao carregar compromissos');
    } else {
      setCompromissos((data || []).map(mapRow));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCompromisso = useCallback(async (c: Omit<Compromisso, 'id' | 'dataCriacao'>) => {
    if (!user) return;
    const { error } = await supabase.from('compromissos').insert({
      user_id: user.id,
      titulo: c.titulo,
      data: c.data,
      hora: c.hora,
      observacao: c.observacao,
      categoria: c.categoria,
      prioridade: c.prioridade,
      status: c.status,
      recorrencia: c.recorrencia,
      alerta: c.alerta,
      anexos: c.anexos || [],
    });
    if (error) {
      toast.error('Erro ao criar compromisso');
      console.error(error);
    } else {
      await refresh();
    }
  }, [user, refresh]);

  const updateCompromisso = useCallback(async (id: string, updates: Partial<Compromisso>) => {
    const dbUpdates: any = {};
    if (updates.titulo !== undefined) dbUpdates.titulo = updates.titulo;
    if (updates.data !== undefined) dbUpdates.data = updates.data;
    if (updates.hora !== undefined) dbUpdates.hora = updates.hora;
    if (updates.observacao !== undefined) dbUpdates.observacao = updates.observacao;
    if (updates.categoria !== undefined) dbUpdates.categoria = updates.categoria;
    if (updates.prioridade !== undefined) dbUpdates.prioridade = updates.prioridade;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.recorrencia !== undefined) dbUpdates.recorrencia = updates.recorrencia;
    if (updates.alerta !== undefined) dbUpdates.alerta = updates.alerta;

    const { error } = await supabase.from('compromissos').update(dbUpdates).eq('id', id);
    if (error) {
      toast.error('Erro ao atualizar');
      console.error(error);
    } else {
      // Optimistic local update
      setCompromissos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  }, []);

  const deleteCompromisso = useCallback(async (id: string) => {
    const { error } = await supabase.from('compromissos').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir');
      console.error(error);
    } else {
      setCompromissos(prev => prev.filter(c => c.id !== id));
    }
  }, []);

  const getByDate = useCallback((date: string) => {
    return compromissos.filter(c => c.data === date);
  }, [compromissos]);

  const getByDateRange = useCallback((start: string, end: string) => {
    return compromissos.filter(c => c.data >= start && c.data <= end);
  }, [compromissos]);

  const getByCategoria = useCallback((cat: Categoria) => {
    return compromissos.filter(c => c.categoria === cat);
  }, [compromissos]);

  const getByStatus = useCallback((status: Status) => {
    return compromissos.filter(c => c.status === status);
  }, [compromissos]);

  const search = useCallback((query: string) => {
    const q = query.toLowerCase();
    return compromissos.filter(c =>
      c.titulo.toLowerCase().includes(q) ||
      c.observacao.toLowerCase().includes(q) ||
      c.categoria.toLowerCase().includes(q)
    );
  }, [compromissos]);

  return (
    <CompromissosContext.Provider value={{
      compromissos, loading, addCompromisso, updateCompromisso, deleteCompromisso,
      getByDate, getByDateRange, getByCategoria, getByStatus, search, refresh,
    }}>
      {children}
    </CompromissosContext.Provider>
  );
}

export function useCompromissos() {
  const ctx = useContext(CompromissosContext);
  if (!ctx) throw new Error('useCompromissos must be used inside CompromissosProvider');
  return ctx;
}
